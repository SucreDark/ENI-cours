/* ============================================================
   Site "Mes cours ENI" : socle commun (chargé sur toutes les pages)
   - window.ENI : données, stockage, vérification des réponses
   - thèmes (néon / ambre / cyberpunk / matrix)
   - badges + notifications
   - carnet de TP en bas de chaque module
   - terminal caché (touche ²) + easter egg Matrix (commande ou Konami)
   Données : javascripts/donnees.js (généré par tools/gen_data.py)
   ============================================================ */
(function () {
  "use strict";

  var D = window.SITE_DATA || { cours: [], pages: [], exos: [], commandes: [], glossaire: [], calendrier: [] };
  var ROOT = window.SITE_ROOT || "";

  // ---------- Stockage (protégé : peut être indisponible) ----------
  var store = {
    get: function (k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v === null ? def : v; } catch (e) { return def; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} },
    keys: function (prefixe) {
      var r = []; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf(prefixe) === 0) r.push(k); } } catch (e) {}
      return r;
    }
  };
  var pageKey = location.pathname.replace(/^.*\/cours\//, "cours/");

  // ---------- Outils ----------
  function norm(t) {
    return (t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[«»"'`*]/g, "").replace(/\s+/g, " ").replace(/^[\s:=→-]+|[\s.!]+$/g, "").trim();
  }
  function texte(html) { var d = document.createElement("div"); d.innerHTML = html || ""; return d.textContent; }
  function attendus(html) {
    var d = document.createElement("div"); d.innerHTML = html || ""; var c = [];
    d.querySelectorAll("strong, code").forEach(function (el) { c.push(norm(el.textContent)); });
    c.push(norm(d.textContent));
    return c.filter(function (x) { return x.length > 0; });
  }
  function juste(reponse, html) { var r = norm(reponse); return !!r && attendus(html).indexOf(r) !== -1; }
  function melanger(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function lien(url) { return ROOT + url; }
  function cours(id) { for (var i = 0; i < D.cours.length; i++) if (D.cours[i].id === id) return D.cours[i]; return { id: id, titre: id, couleur: "#3f51b5" }; }
  function jour(d) { d = d || new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
  function telecharger(nom, contenu) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([contenu], { type: "text/markdown;charset=utf-8" }));
    a.download = nom; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function copier(txt) {
    try { navigator.clipboard.writeText(txt); return; } catch (e) {}
    var t = document.createElement("textarea"); t.value = txt; document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); } catch (e) {} t.remove();
  }

  // ---------- État des exercices (une seule source : la même que les pages) ----------
  function etatExo(e) { var s = store.get("exos:" + e.url, {}); return s[e.idx] ? s[e.idx].e : null; }
  function noterExo(e, etat, rep) {
    var s = store.get("exos:" + e.url, {}); s[e.idx] = { e: etat, r: rep || "" }; store.set("exos:" + e.url, s);
    signaler();
  }
  function progression() {
    var par = {}, ok = 0, ko = 0;
    D.exos.forEach(function (e) {
      var p = par[e.cours] || (par[e.cours] = { total: 0, ok: 0, ko: 0 });
      var st = etatExo(e); p.total++;
      if (st === "ok") { p.ok++; ok++; } else if (st === "ko") { p.ko++; ko++; }
    });
    return { parCours: par, ok: ok, ko: ko, total: D.exos.length };
  }
  function aRevoir() { return D.exos.filter(function (e) { return etatExo(e) === "ko"; }); }
  function stat(nom, n) { var s = store.get("stats", {}); s[nom] = (s[nom] || 0) + (n === undefined ? 1 : n); store.set("stats", s); signaler(); }

  // ---------- Notifications ----------
  var zoneToasts;
  function toast(html, cls) {
    if (!zoneToasts) { zoneToasts = h("div", "eni-toasts"); document.body.appendChild(zoneToasts); }
    var t = h("div", "eni-toast " + (cls || ""), html); zoneToasts.appendChild(t);
    while (zoneToasts.children.length > 3) zoneToasts.firstChild.remove();
    setTimeout(function () { t.classList.add("on"); }, 20);
    setTimeout(function () { t.classList.remove("on"); setTimeout(function () { t.remove(); }, 400); }, 4500);
  }

  // ---------- Badges ----------
  function pageComplete() {
    var parPage = {};
    D.exos.forEach(function (e) { (parPage[e.url] = parPage[e.url] || []).push(e); });
    return Object.keys(parPage).some(function (u) { return parPage[u].length >= 3 && parPage[u].every(function (e) { return etatExo(e) === "ok"; }); });
  }
  function coursComplet(id, filtre) {
    var l = D.exos.filter(function (e) { return e.cours === id && (!filtre || filtre(e)); });
    return l.length > 0 && l.every(function (e) { return etatExo(e) === "ok"; });
  }
  var BADGES = [
    { id: "premier", ico: "🚀", nom: "Premier pas", desc: "Réussir un premier exercice", test: function (c) { return c.p.ok >= 1; } },
    { id: "dix", ico: "🔟", nom: "Échauffement", desc: "10 exercices réussis", test: function (c) { return c.p.ok >= 10; } },
    { id: "cinquante", ico: "💪", nom: "Machine à réviser", desc: "50 exercices réussis", test: function (c) { return c.p.ok >= 50; } },
    { id: "sansfaute", ico: "🎯", nom: "Sans-faute", desc: "Tous les exercices d'un module réussis", test: function () { return pageComplete(); } },
    { id: "reseau", ico: "🌐", nom: "Root du réseau", desc: "100 % des exercices de Base des réseaux", test: function () { return coursComplet("base-des-reseaux"); } },
    { id: "subnet", ico: "🧮", nom: "Maître du subnetting", desc: "Exercices du module IPv4 réussis + 10 calculs avec la calculatrice", test: function (c) { return coursComplet("base-des-reseaux", function (e) { return /ipv4/i.test(e.url); }) && (c.s.ipcalc || 0) >= 10; } },
    { id: "linux", ico: "🐧", nom: "100 % Linux", desc: "Tous les exercices de Linux réussis", test: function () { return coursComplet("utilisation-linux"); } },
    { id: "windows", ico: "🪟", nom: "Windows Master", desc: "Tous les exercices de Systèmes clients réussis", test: function () { return coursComplet("systemes-clients-microsoft"); } },
    { id: "m365", ico: "☁️", nom: "Office Ninja", desc: "Tous les exercices de Microsoft 365 réussis", test: function () { return coursComplet("microsoft-365"); } },
    { id: "quiz", ico: "❓", nom: "Quizzeur", desc: "Répondre à 50 questions de quiz", test: function (c) { return (c.s.quiz || 0) >= 50; } },
    { id: "exam10", ico: "📝", nom: "Admissible", desc: "Au moins 10/20 à un examen blanc", test: function (c) { return c.best >= 10; } },
    { id: "exam16", ico: "🏆", nom: "Mention très bien", desc: "Au moins 16/20 à un examen blanc", test: function (c) { return c.best >= 16; } },
    { id: "flash", ico: "🧠", nom: "Mémoire d'éléphant", desc: "20 flashcards dans la boîte 5", test: function (c) { return c.box5 >= 20; } },
    { id: "simu", ico: "💻", nom: "Doigts de fée", desc: "Toutes les missions du simulateur (bash, cmd et PowerShell)", test: function (c) { return c.simu; } },
    { id: "carnet", ico: "📓", nom: "Prise de notes", desc: "Écrire dans 3 carnets de TP", test: function () { return store.keys("carnet:").length >= 3; } },
    { id: "assidu", ico: "📅", nom: "Assidu", desc: "Réviser 7 jours différents", test: function (c) { return c.jours >= 7; } },
    { id: "nuit", ico: "🌙", nom: "Noctambule", desc: "Réviser entre minuit et 5 h", test: function (c) { return !!c.s.nuit; } },
    { id: "hacker", ico: "🕶️", nom: "Hacker", desc: "Trouver le terminal caché", test: function (c) { return !!c.s.terminal; } },
    { id: "neo", ico: "🐇", nom: "Suis le lapin blanc", desc: "Entrer dans la Matrice", test: function (c) { return !!c.s.matrix; } }
  ];
  function contexte() {
    var hist = store.get("exam:hist", []), boxes = store.get("flash:boxes", {}), box5 = 0;
    Object.keys(boxes).forEach(function (k) { if (boxes[k].b >= 5) box5++; });
    var sl = store.get("simu:linux", {}), sw = store.get("simu:windows", {});
    var M = window.ENI_SIMU_MISSIONS || {}, sp = store.get("simu:powershell", {});
    var simu = store.get("simu:fini2", false) || (M.linux && M.windows && Object.keys(sl).length >= M.linux && Object.keys(sw).length >= M.windows && (!M.powershell || Object.keys(sp).length >= M.powershell));
    if (simu) store.set("simu:fini2", true);
    return {
      p: progression(), s: store.get("stats", {}), box5: box5, simu: !!simu,
      best: hist.reduce(function (m, x) { return Math.max(m, x.note); }, -1),
      jours: (store.get("visites", [])).length
    };
  }
  function verifierBadges(silencieux) {
    var got = store.get("badges:got", {}), c = contexte(), nouveaux = [];
    BADGES.forEach(function (b) {
      if (got[b.id]) return;
      var ok = false; try { ok = b.test(c); } catch (e) {}
      if (ok) { got[b.id] = new Date().toISOString().slice(0, 10); nouveaux.push(b); }
    });
    if (nouveaux.length) {
      store.set("badges:got", got);
      if (!silencieux) nouveaux.forEach(function (b, i) {
        setTimeout(function () { toast('<span class="ico">' + b.ico + '</span><span><b>Badge débloqué !</b><br>' + esc(b.nom) + '</span>', "badge"); }, i * 700);
      });
    }
    return got;
  }
  var tempoSignal;
  function signaler() { clearTimeout(tempoSignal); tempoSignal = setTimeout(function () { verifierBadges(); document.dispatchEvent(new CustomEvent("eni:progres")); }, 150); }
  document.addEventListener("eni:exo", signaler);

  // Jours de révision + noctambule
  (function () {
    var j = new Date().toISOString().slice(0, 10), v = store.get("visites", []);
    if (v.indexOf(j) === -1) { v.push(j); if (v.length > 400) v = v.slice(-400); store.set("visites", v); }
    var hNow = new Date().getHours(); if (hNow < 5) { var s = store.get("stats", {}); s.nuit = 1; store.set("stats", s); }
  })();

  // ---------- Thèmes ----------
  var THEMES = [
    { id: "neon", nom: "Néon vert" }, { id: "ambre", nom: "Ambre rétro" },
    { id: "cyber", nom: "Cyberpunk bleu" }, { id: "matrix", nom: "Matrix" }
  ];
  function nomTheme(id) { for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i].nom; return id; }
  function appliquerTheme(id, annoncer) {
    if (!THEMES.some(function (t) { return t.id === id; })) id = "neon";
    document.documentElement.setAttribute("data-theme", id); store.set("theme", id);
    var b = document.querySelector(".eni-theme-btn"); if (b) b.title = "Thème : " + nomTheme(id) + " (cliquer pour changer)";
    if (annoncer) toast("🎨 Thème : <b>" + nomTheme(id) + "</b>");
  }
  appliquerTheme(store.get("theme", "neon"));
  function boutonTheme() {
    var cible = document.querySelector(".md-header__option") || document.querySelector(".md-header__inner .md-header__button.md-icon[for='__search']");
    if (!cible || document.querySelector(".eni-theme-btn")) return;
    var b = h("button", "md-header__button md-icon eni-theme-btn",
      '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8m-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12m3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8m5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8m3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5"/></svg>');
    b.type = "button"; b.setAttribute("aria-label", "Changer de thème");
    b.onclick = function () {
      var cur = document.documentElement.getAttribute("data-theme"), i = 0;
      THEMES.forEach(function (t, k) { if (t.id === cur) i = k; });
      appliquerTheme(THEMES[(i + 1) % THEMES.length].id, true);
    };
    cible.parentNode.insertBefore(b, cible);
    appliquerTheme(store.get("theme", "neon"));
  }


  // ---------- Appli téléphone (PWA) : bouton « Installer » + aide ----------
  var invite = null;
  var installee = function () { return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; };
  var estIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function lancerInstall() {
    if (invite) {
      invite.prompt();
      invite.userChoice.then(function (c) { if (c.outcome === "accepted") toast("📲 Appli installée !"); invite = null; majInstall(); });
    } else if (estIOS) {
      toast("📲 Sur iPhone : touche <b>Partager</b> ⬆️ puis <b>Sur l'écran d'accueil</b>");
    } else {
      toast("📲 Menu du navigateur <b>⋮</b> → <b>Installer l'application</b> (ou « Ajouter à l'écran d'accueil »)");
    }
  }
  function majInstall() {
    var b = document.querySelector(".eni-install-btn");
    if (b) b.hidden = installee() || !(invite || estIOS);
    var z = document.getElementById("app-installer"); if (!z) return;
    if (!/^https?:$/.test(location.protocol)) {
      z.innerHTML = '<p class="aide">L\'appli s\'installe depuis le site en ligne (pas depuis le fichier ouvert en double-clic).</p>'; return;
    }
    if (installee()) { z.innerHTML = '<p>✅ Tu es dans l\'appli. Elle marche aussi <b>sans réseau</b> ; elle se met à jour toute seule quand tu as internet.</p>'; return; }
    z.innerHTML = '<div class="exo-actions"><button type="button" class="md-button md-button--primary">📲 Installer l\'appli</button></div>' +
      '<ul><li><b>Android (Chrome, Edge, Samsung)</b> : bouton ci-dessus, ou menu <b>⋮</b> → <b>Installer l\'application</b>.</li>' +
      '<li><b>iPhone / iPad (Safari)</b> : bouton <b>Partager</b> ⬆️ → <b>Sur l\'écran d\'accueil</b>.</li>' +
      '<li><b>PC (Chrome, Edge)</b> : icône d\'installation à droite de la barre d\'adresse.</li></ul>';
    z.querySelector("button").onclick = lancerInstall;
  }
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); invite = e; majInstall(); });
  window.addEventListener("appinstalled", function () { invite = null; majInstall(); });
  function boutonInstall() {
    var cible = document.querySelector(".eni-theme-btn"); if (!cible || document.querySelector(".eni-install-btn")) return;
    var b = h("button", "md-header__button md-icon eni-install-btn",
      '<svg viewBox="0 0 24 24"><path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2m0 18H7V5h10zm-1-6h-3V8h-2v5H8l4 4z"/></svg>');
    b.type = "button"; b.title = "Installer l'appli sur ce téléphone / PC"; b.setAttribute("aria-label", b.title);
    b.onclick = lancerInstall; b.hidden = true;
    cible.parentNode.insertBefore(b, cible);
    majInstall();
  }

  // ---------- Carnet de TP (en bas de chaque module) ----------
  function carnet() {
    if (!/\/cours\/[^\/]+\/(?!index\.html)[^\/]+\.html$/.test(location.pathname)) return;
    var art = document.querySelector(".md-content article"); if (!art) return;
    var cle = "carnet:" + pageKey, mem = store.get(cle, null);
    var titre = (document.querySelector(".md-content h1 .titre") || document.querySelector(".md-content h1") || {}).textContent || document.title;
    titre = titre.replace(/[¶▌]/g, "").trim();
    var d = h("details", "eni-carnet");
    if (mem && mem.t) d.open = true;
    d.innerHTML = '<summary>📓 Mon carnet de TP <span class="etat"></span></summary>' +
      '<p class="aide">Tes notes pour ce module (commandes tapées, problèmes rencontrés, solutions…). Enregistrées dans ce navigateur. Toutes tes notes : <a href="' + lien("reviser/carnet.html") + '">Mon carnet</a>.</p>' +
      '<textarea rows="6" placeholder="$ ma note…"></textarea>' +
      '<div class="exo-actions"><button type="button" class="exo-btn">⬇ Exporter (.md)</button><button type="button" class="exo-btn sec">Effacer</button></div>';
    art.appendChild(d);
    var ta = d.querySelector("textarea"), etat = d.querySelector(".etat"), bts = d.querySelectorAll("button"), tempo;
    ta.value = mem ? mem.t : "";
    ta.addEventListener("input", function () {
      etat.textContent = "…"; clearTimeout(tempo);
      tempo = setTimeout(function () {
        if (ta.value.trim()) store.set(cle, { t: ta.value, d: new Date().toISOString(), titre: titre }); else store.del(cle);
        etat.textContent = "✓ enregistré"; signaler();
      }, 400);
    });
    bts[0].onclick = function () { telecharger("carnet-" + pageKey.replace(/[\/.]/g, "-").replace(/-html$/, "") + ".md", "# " + titre + "\n\n" + ta.value + "\n"); };
    bts[1].onclick = function () { if (confirm("Effacer la note de ce module ?")) { ta.value = ""; store.del(cle); etat.textContent = ""; } };
  }

  // ---------- Matrix ----------
  function matrix() {
    if (document.querySelector(".eni-matrix")) return;
    stat("matrix");
    var cv = h("canvas", "eni-matrix"), ctx = cv.getContext("2d"), fin = false;
    document.body.appendChild(cv);
    var msg = h("div", "eni-matrix-msg", "Wake up, Neo…<small>Échap ou clic pour sortir</small>"); document.body.appendChild(msg);
    function taille() { cv.width = innerWidth; cv.height = innerHeight; }
    taille(); addEventListener("resize", taille);
    var fs = 16, cols = Math.ceil(innerWidth / fs), y = [], car = "アカサタナハマヤラワ0123456789ABCDEFｦｱｳｴｵｶｷｸｹｺ$#@%&<>/\\|".split("");
    for (var i = 0; i < cols; i++) y[i] = Math.random() * -50;
    var couleur = getComputedStyle(document.documentElement).getPropertyValue("--neon").trim() || "#39ff14";
    function frame() {
      if (fin) return;
      ctx.fillStyle = "rgba(0,0,0,.08)"; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.font = fs + "px monospace";
      for (var i = 0; i < y.length; i++) {
        ctx.fillStyle = Math.random() < .03 ? "#fff" : couleur;
        ctx.fillText(car[Math.floor(Math.random() * car.length)], i * fs, y[i] * fs);
        if (y[i] * fs > cv.height && Math.random() > .975) y[i] = 0; y[i]++;
      }
      requestAnimationFrame(frame);
    }
    frame();
    function stop() { fin = true; cv.remove(); msg.remove(); removeEventListener("keydown", clav, true); removeEventListener("resize", taille); }
    function clav(e) { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); stop(); } }
    setTimeout(function () { addEventListener("keydown", clav, true); cv.onclick = stop; msg.onclick = stop; }, 300);
  }
  // Konami : ↑ ↑ ↓ ↓ ← → ← → b a
  (function () {
    var seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"], pos = 0;
    addEventListener("keydown", function (e) {
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === seq[pos] ? pos + 1 : (k === seq[0] ? 1 : 0);
      if (pos === seq.length) { pos = 0; matrix(); }
    });
  })();

  // ---------- Terminal caché (touche ²) ----------
  var PAGES_REVISER = [
    ["quiz", "reviser/quiz.html", "Quiz de révision"], ["examen", "reviser/examen.html", "Examen blanc chronométré"],
    ["flashcards", "reviser/flashcards.html", "Flashcards"], ["fiches", "fiches/index.html", "Fiches mémo"],
    ["commandes", "reviser/commandes.html", "Toutes les commandes"], ["glossaire", "reviser/glossaire.html", "Glossaire des sigles"],
    ["simulateur", "reviser/simulateur.html", "Simulateur de terminal"], ["outils", "reviser/outils.html", "Calculatrice IPv4 + convertisseur"],
    ["carnet", "reviser/carnet.html", "Mon carnet de TP"], ["badges", "reviser/badges.html", "Mes badges"]
  ];
  var term = null;
  function terminal() {
    if (term) { term.basculer(); return; }
    stat("terminal");
    var box = h("div", "eni-term");
    box.innerHTML = '<div class="eni-term-barre"><i></i><i></i><i></i><span>user@eni — bash</span><button type="button" title="Fermer (²)">✕</button></div>' +
      '<div class="eni-term-sortie" aria-live="polite"></div><div class="eni-term-ligne"><span class="ps"></span><input type="text" spellcheck="false" autocomplete="off" aria-label="Commande"></div>';
    document.body.appendChild(box);
    var sortie = box.querySelector(".eni-term-sortie"), inp = box.querySelector("input"), ps = box.querySelector(".ps");
    var cwd = [], hist = store.get("term:hist", []), hpos = hist.length;
    // cwd initial = cours de la page courante
    var mc = location.pathname.match(/\/cours\/([^\/]+)\//); if (mc) cwd = ["cours", mc[1]];
    else if (/\/reviser\/|\/fiches\//.test(location.pathname)) cwd = ["reviser"];
    function chemin() { return "~/formation-eni" + (cwd.length ? "/" + cwd.join("/") : ""); }
    function majPs() { ps.innerHTML = '<b>user@eni</b>:<span class="cwd">' + esc(chemin()) + '</span>$&nbsp;'; }
    function ecrire(html, cls) { var l = h("div", cls || "", html); sortie.appendChild(l); sortie.scrollTop = sortie.scrollHeight; }
    function contenu(c) {
      if (!c.length) return [{ n: "cours", d: 1 }, { n: "reviser", d: 1 }, { n: "LISEZ-MOI.txt", d: 0 }];
      if (c[0] === "cours" && c.length === 1) return D.cours.map(function (x) { return { n: x.id, d: 1 }; });
      if (c[0] === "cours" && c.length === 2) return D.pages.filter(function (p) { return p.cours === c[1] && p.fichier !== "index"; }).map(function (p) { return { n: p.fichier, d: 0, p: p }; });
      if (c[0] === "reviser" && c.length === 1) return PAGES_REVISER.map(function (p) { return { n: p[0], d: 0, u: p[1] }; });
      return null;
    }
    function resoudre(arg) {
      var c = arg.indexOf("~") === 0 || arg.indexOf("/") === 0 ? [] : cwd.slice();
      arg.replace(/^~\/?(formation-eni)?\/?/, "").replace(/^\//, "").split("/").forEach(function (s) {
        if (!s || s === ".") return; if (s === "..") { c.pop(); return; } c.push(s);
      });
      return c;
    }
    function trouver(c) { // renvoie {dir:bool, url}
      if (!c.length) return { dir: true };
      var parent = contenu(c.slice(0, -1)); if (!parent) return null;
      var nom = c[c.length - 1];
      for (var i = 0; i < parent.length; i++) if (parent[i].n === nom) {
        var e = parent[i];
        if (e.d) return { dir: true, url: c[0] === "cours" && c.length === 2 ? lien("cours/" + nom + "/index.html") : null };
        if (e.p) return { dir: false, url: lien(e.p.url), titre: e.p.titre };
        if (e.u) return { dir: false, url: lien(e.u) };
        return { dir: false, txt: true };
      }
      return null;
    }
    var CMDS = {
      help: function () {
        ecrire([
          "<b>Commandes disponibles</b>",
          "  ls [dossier]       lister            cd &lt;dossier&gt;   se déplacer (cd .. / cd ~)",
          "  pwd                où suis-je ?      open &lt;nom&gt;      ouvrir une page (ou un cours)",
          "  cat LISEZ-MOI.txt  lire              tree             arborescence des cours",
          "  quiz · examen · flashcards · commandes · glossaire · simulateur · outils · carnet · badges · fiches",
          "  stats              ma progression    grep &lt;mot&gt;      chercher une commande du cours",
          "  theme [nom]        néon | ambre | cyber | matrix",
          "  whoami · date · clear · history · exit",
          "  …et peut-être une commande secrète 🐇"
        ].join("\n"), "pre");
      },
      ls: function (a) {
        var c = a[0] ? resoudre(a[0]) : cwd, l = contenu(c);
        if (!l) { var t = trouver(c); ecrire(t && !t.dir ? esc(a[0]) : "ls: impossible d'accéder à '" + esc(a[0] || "") + "': Aucun fichier ou dossier de ce type", t ? "" : "err"); return; }
        ecrire(l.map(function (e) { return e.d ? '<span class="dir">' + esc(e.n) + '/</span>' : esc(e.n); }).join("  "));
      },
      cd: function (a) {
        if (!a[0] || a[0] === "~") { cwd = []; majPs(); return; }
        var c = resoudre(a[0]), t = trouver(c);
        if (!t) { ecrire("bash: cd: " + esc(a[0]) + ": Aucun fichier ou dossier de ce type", "err"); return; }
        if (!t.dir) { ecrire("bash: cd: " + esc(a[0]) + ": N'est pas un dossier (essaie <b>open " + esc(a[0]) + "</b>)", "err"); return; }
        cwd = c; majPs();
      },
      pwd: function () { ecrire("/home/user/formation-eni" + (cwd.length ? "/" + cwd.join("/") : "")); },
      open: function (a) {
        if (!a[0]) { ecrire("open: nom manquant (ex. <b>open quiz</b>, <b>open m03-adressage-ipv4</b>)", "err"); return; }
        var t = trouver(resoudre(a[0]));
        if (!t) { // recherche dans tout le site
          var p = D.pages.filter(function (x) { return x.fichier === a[0] || x.cours === a[0]; })[0];
          if (p) t = { url: lien(p.url) };
          PAGES_REVISER.forEach(function (r) { if (r[0] === a[0]) t = { url: lien(r[1]) }; });
        }
        if (t && t.url) { ecrire("Ouverture de " + esc(a[0]) + "…", "ok"); location.href = t.url; }
        else if (t && t.txt) CMDS.cat(["LISEZ-MOI.txt"]);
        else ecrire("open: " + esc(a[0]) + " : introuvable", "err");
      },
      cat: function (a) {
        if (a[0] && /lisez-moi/i.test(a[0])) ecrire("Bienvenue dans ~/formation-eni.\n18 cours, des exercices corrigés, des outils de révision.\nTape <b>help</b> pour la liste des commandes. Bon courage pour les évaluations du 14/06/2027 !", "pre");
        else ecrire("cat: " + esc(a[0] || "") + ": Aucun fichier ou dossier de ce type", "err");
      },
      tree: function () {
        var l = ["~/formation-eni", "├── cours/"];
        D.cours.forEach(function (c, i) {
          var der = i === D.cours.length - 1, mods = D.pages.filter(function (p) { return p.cours === c.id && p.fichier !== "index"; });
          l.push("│   " + (der ? "└── " : "├── ") + '<span class="dir">' + esc(c.id) + "/</span>" + (mods.length ? "" : "  (à venir)"));
          mods.forEach(function (m, k) { l.push("│   " + (der ? "    " : "│   ") + (k === mods.length - 1 ? "└── " : "├── ") + esc(m.fichier)); });
        });
        l.push("└── reviser/"); ecrire(l.join("\n"), "pre");
      },
      whoami: function () { ecrire("user"); },
      date: function () { ecrire(new Date().toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })); },
      clear: function () { sortie.innerHTML = ""; },
      history: function () { ecrire(hist.map(function (c, i) { return ("    " + (i + 1)).slice(-5) + "  " + esc(c); }).join("\n"), "pre"); },
      exit: function () { term.basculer(); },
      theme: function (a) {
        if (!a[0]) { ecrire("Thèmes : " + THEMES.map(function (t) { return t.id; }).join(" | ") + "   (actuel : " + document.documentElement.getAttribute("data-theme") + ")"); return; }
        var id = norm(a[0]).replace("neon", "neon");
        if (!THEMES.some(function (t) { return t.id === id; })) { ecrire("theme: thème inconnu : " + esc(a[0]), "err"); return; }
        appliquerTheme(id); ecrire("Thème appliqué : " + nomTheme(id), "ok");
      },
      stats: function () {
        var p = progression(), l = ["Exercices réussis : " + p.ok + " / " + p.total + "   à revoir : " + p.ko];
        D.cours.forEach(function (c) {
          var x = p.parCours[c.id]; if (!x) return;
          var n = Math.round(20 * x.ok / x.total);
          l.push(("  " + c.titre + "                                        ").slice(0, 42) + "[" + "#".repeat(n) + "-".repeat(20 - n) + "] " + x.ok + "/" + x.total);
        });
        l.push("Badges : " + Object.keys(store.get("badges:got", {})).length + " / " + BADGES.length);
        ecrire(esc(l.join("\n")), "pre");
      },
      grep: function (a) {
        if (!a.length) { ecrire("grep: motif manquant", "err"); return; }
        var m = norm(a.join(" ")), r = D.commandes.filter(function (c) { return norm(c.texte + " " + texte(c.role)).indexOf(m) !== -1; }).slice(0, 15);
        if (!r.length) { ecrire("(aucun résultat)"); return; }
        ecrire(r.map(function (c) { return '<span class="ok">' + esc(c.texte) + "</span>  " + esc(texte(c.role)); }).join("\n"), "pre");
      },
      matrix: function () { term.basculer(); matrix(); },
      sudo: function (a) { ecrire(a.length ? "user n'est pas dans le fichier sudoers. Cet incident sera signalé. 😏" : "usage: sudo commande", "err"); },
      rm: function (a) { ecrire(a.join(" ").indexOf("-rf") !== -1 ? "Bien essayé. 🙃 Tes cours sont en sécurité." : "rm: opération refusée sur ce terminal", "err"); },
      echo: function (a) { ecrire(esc(a.join(" ").replace(/\$USER|\$LOGNAME/g, "user").replace(/\$HOME/g, "/home/user").replace(/\$SHELL/g, "/bin/bash"))); }
    };
    PAGES_REVISER.forEach(function (p) { if (!CMDS[p[0]]) CMDS[p[0]] = function () { ecrire("Ouverture : " + p[2] + "…", "ok"); location.href = lien(p[1]); }; });
    CMDS.flash = CMDS.flashcards; CMDS.exam = CMDS.examen; CMDS.cmd = CMDS.commandes; CMDS.ll = CMDS.ls; CMDS.dir = CMDS.ls; CMDS.cls = CMDS.clear; CMDS.logout = CMDS.exit;

    function executer(ligne) {
      ecrire(ps.innerHTML + esc(ligne), "cmd");
      ligne = ligne.trim(); if (!ligne) return;
      hist.push(ligne); if (hist.length > 100) hist = hist.slice(-100); store.set("term:hist", hist); hpos = hist.length;
      var parts = ligne.split(/\s+/), c = parts[0].toLowerCase(), args = parts.slice(1);
      if (c === "follow" && norm(args.join(" ")) === "the white rabbit") c = "matrix";
      if (CMDS[c]) CMDS[c](args);
      else ecrire(esc(c) + " : commande introuvable. Tape <b>help</b>.", "err");
    }
    function completer() {
      var v = inp.value, parts = v.split(/\s+/), dernier = parts[parts.length - 1];
      var options;
      if (parts.length === 1) options = Object.keys(CMDS);
      else {
        var base = dernier.lastIndexOf("/") !== -1 ? dernier.slice(0, dernier.lastIndexOf("/") + 1) : "";
        var l = contenu(resoudre(base || ".")) || [];
        options = l.map(function (e) { return base + e.n + (e.d ? "/" : ""); });
      }
      var m = options.filter(function (o) { return o.indexOf(dernier) === 0; });
      if (m.length === 1) { parts[parts.length - 1] = m[0]; inp.value = parts.join(" ") + (/\/$/.test(m[0]) ? "" : " "); }
      else if (m.length > 1) {
        ecrire(ps.innerHTML + esc(v), "cmd"); ecrire(m.map(esc).join("  "));
        var pre = m.reduce(function (a, b) { var i = 0; while (i < a.length && a[i] === b[i]) i++; return a.slice(0, i); });
        parts[parts.length - 1] = pre; inp.value = parts.join(" ");
      }
    }
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { executer(inp.value); inp.value = ""; }
      else if (e.key === "ArrowUp") { if (hpos > 0) inp.value = hist[--hpos]; e.preventDefault(); }
      else if (e.key === "ArrowDown") { hpos = Math.min(hist.length, hpos + 1); inp.value = hist[hpos] || ""; e.preventDefault(); }
      else if (e.key === "Tab") { e.preventDefault(); completer(); }
      else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); CMDS.clear(); }
      else if (e.key === "Escape" || e.key === "²") { e.preventDefault(); term.basculer(); }
      e.stopPropagation();
    });
    box.querySelector(".eni-term-barre button").onclick = function () { term.basculer(); };
    sortie.onclick = function () { inp.focus(); };
    majPs();
    ecrire('<span class="ok">Bienvenue sur le terminal caché 🕶️</span>  Tape <b>help</b> (Tab pour compléter, ↑ pour l\'historique, ² ou Échap pour fermer).');
    term = { basculer: function () { var on = box.classList.toggle("on"); if (on) setTimeout(function () { inp.focus(); }, 50); } };
    term.basculer();
  }
  addEventListener("keydown", function (e) {
    var t = e.target, champ = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if (champ) return;
    if (e.key === "²" || (e.code === "Backquote" && !e.ctrlKey && !e.altKey && !e.metaKey && e.key !== "`")) { e.preventDefault(); terminal(); }
  });

  // ---------- API commune ----------
  window.ENI = {
    data: D, root: ROOT, store: store, norm: norm, texte: texte, juste: juste, melanger: melanger, esc: esc, h: h,
    lien: lien, cours: cours, jour: jour, telecharger: telecharger, copier: copier, toast: toast,
    etatExo: etatExo, noterExo: noterExo, progression: progression, aRevoir: aRevoir, stat: stat,
    badges: BADGES, verifierBadges: verifierBadges, themes: THEMES, appliquerTheme: appliquerTheme, matrix: matrix
  };

  function init() { boutonTheme(); boutonInstall(); carnet(); verifierBadges(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
