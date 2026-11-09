/* ============================================================
   Site "Mes cours ENI" : applications de révision
   Chaque appli se monte dans un bloc de la page Markdown :
     <div id="app-quiz"></div>       quiz / révision
     <div id="app-examen"></div>     examen blanc chronométré
     <div id="app-flash"></div>      flashcards (répétition espacée)
     <div id="app-commandes"></div>  toutes les commandes, filtrables
     <div id="app-glossaire"></div>  glossaire des sigles
     <div id="app-ipcalc"></div>     calculatrice IPv4
     <div id="app-conv"></div>       convertisseur binaire / décimal / hexa
     <div id="app-badges"></div>     badges
     <div id="app-carnet"></div>     toutes les notes de TP
     <div id="app-dashboard"></div>  progression (accueil)
     <div id="app-frise"></div>      frise de la formation (accueil)
     <div class="app-osi"></div> · <div class="app-encap"></div> · <div class="app-dora"></div>  schémas
   ============================================================ */
(function () {
  "use strict";
  var E = window.ENI; if (!E) return;
  var D = E.data, h = E.h, esc = E.esc, store = E.store;

  function $(id) { return document.getElementById(id); }
  function coursAvecExos() {
    var ids = {}; D.exos.forEach(function (e) { ids[e.cours] = 1; });
    return D.cours.filter(function (c) { return ids[c.id]; });
  }
  function puce(cid) { var c = E.cours(cid); return '<span class="eni-puce" style="--pc:' + c.couleur + '">' + esc(c.titre) + "</span>"; }
  function selectCours(tous) {
    return '<select class="eni-select" data-r="cours"><option value="">' + (tous || "Tous les cours") + "</option>" +
      coursAvecExos().map(function (c) { return '<option value="' + c.id + '">' + esc(c.titre) + "</option>"; }).join("") + "</select>";
  }
  function barre(ok, total, coul) {
    var p = total ? Math.round(100 * ok / total) : 0;
    return '<span class="eni-barre"><span style="width:' + p + "%;" + (coul ? "background:" + coul : "") + '"></span></span>';
  }
  function ascii(ok, total, n) { n = n || 10; var p = total ? Math.round(n * ok / total) : 0; return "[" + "#".repeat(p) + "-".repeat(n - p) + "]"; }
  function mmss(s) { s = Math.max(0, Math.round(s)); return ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + s % 60).slice(-2); }

  // ============================================================
  //  Carte question (commune quiz / examen)
  // ============================================================
  function carteQuestion(e, n, total) {
    return '<div class="eni-q-tete"><span>' + puce(e.cours) + '</span><span class="eni-q-num">' + n + " / " + total + "</span></div>" +
      '<div class="eni-q-module"><a href="' + E.lien(e.url) + '" target="_blank">' + esc(e.module) + "</a> · " + esc(e.titre) + "</div>" +
      '<div class="eni-q-texte">' + e.q + "</div>";
  }

  // ============================================================
  //  1. QUIZ
  // ============================================================
  function appQuiz(root) {
    function accueil() {
      var revoir = E.aRevoir(), hist = store.get("quiz:hist", []);
      root.innerHTML =
        '<div class="eni-panneau"><h3>$ ./quiz --config</h3>' +
        '<div class="eni-form">' +
        "<label>Cours " + selectCours() + "</label>" +
        '<label>Questions <select class="eni-select" data-r="n"><option>10</option><option>20</option><option value="0">Toutes</option></select></label>' +
        '<label>Mode <select class="eni-select" data-r="mode"><option value="hasard">Au hasard</option><option value="nouvelles">Jamais réussies d\'abord</option><option value="revoir">À revoir uniquement (' + revoir.length + ")</option></select></label>" +
        '<label class="eni-check"><input type="checkbox" data-r="chrono" checked> Chrono</label>' +
        '</div><button type="button" class="exo-btn eni-go">▶ Lancer le quiz</button></div>' +
        '<div class="eni-panneau"><h3>$ cat a_revoir.txt <small>(' + revoir.length + ")</small></h3>" +
        (revoir.length ? '<ul class="eni-liste">' + revoir.map(function (e) {
          return '<li>' + puce(e.cours) + ' <a href="' + E.lien(e.url) + '">' + esc(e.module) + "</a> · " + esc(e.titre) + ' <span class="eni-mini">' + esc(E.texte(e.q)).slice(0, 90) + "</span></li>";
        }).join("") + "</ul>" : "<p>Rien à revoir pour l'instant. Les exercices ratés (ici, dans l'examen ou en bas des pages) arrivent ici automatiquement.</p>") + "</div>" +
        (hist.length ? '<div class="eni-panneau"><h3>$ tail scores.log</h3><table class="eni-table"><tr><th>Date</th><th>Cours</th><th>Score</th><th>Temps</th></tr>' +
          hist.slice(-8).reverse().map(function (x) { return "<tr><td>" + esc(x.d) + "</td><td>" + esc(x.c) + "</td><td>" + x.ok + " / " + x.n + " " + ascii(x.ok, x.n) + "</td><td>" + (x.t ? mmss(x.t) : "–") + "</td></tr>"; }).join("") + "</table></div>" : "");
      root.querySelector(".eni-go").onclick = function () {
        var cid = root.querySelector('[data-r="cours"]').value, n = +root.querySelector('[data-r="n"]').value,
          mode = root.querySelector('[data-r="mode"]').value, chrono = root.querySelector('[data-r="chrono"]').checked;
        var l = D.exos.filter(function (e) { return !cid || e.cours === cid; });
        if (mode === "revoir") l = l.filter(function (e) { return E.etatExo(e) === "ko"; });
        l = E.melanger(l);
        if (mode === "nouvelles") l.sort(function (a, b) { return (E.etatExo(a) === "ok") - (E.etatExo(b) === "ok"); });
        if (n) l = l.slice(0, n);
        if (!l.length) { E.toast("Aucune question avec ces réglages."); return; }
        jouer(l, chrono, cid ? E.cours(cid).titre : "Tous");
      };
    }
    function jouer(liste, chrono, nomCours) {
      var i = 0, res = [], t0 = Date.now(), timer;
      root.innerHTML = '<div class="eni-panneau eni-quiz"><div class="eni-quiz-haut"><span class="eni-ascii"></span><span class="eni-chrono"></span><button type="button" class="exo-btn sec eni-stop">Arrêter</button></div><div class="eni-q"></div></div>';
      var q = root.querySelector(".eni-q"), ch = root.querySelector(".eni-chrono"), as = root.querySelector(".eni-ascii");
      if (chrono) timer = setInterval(function () { ch.textContent = "⏱ " + mmss((Date.now() - t0) / 1000); }, 500);
      root.querySelector(".eni-stop").onclick = function () { fin(); };
      function maj() { var ok = res.filter(function (r) { return r.ok; }).length; as.textContent = "$ score " + ascii(ok, liste.length) + " " + ok + "/" + liste.length; }
      function question() {
        maj();
        if (i >= liste.length) { fin(); return; }
        var e = liste[i];
        q.innerHTML = carteQuestion(e, i + 1, liste.length) +
          '<textarea rows="2" placeholder="Ta réponse… (Entrée pour valider)"></textarea>' +
          '<div class="exo-actions"><button type="button" class="exo-btn b-verif">Vérifier</button><button type="button" class="exo-btn sec b-voir">Je ne sais pas</button><span class="exo-msg"></span>' +
          '<button type="button" class="exo-btn ok exo-hidden b-ok">✔ J\'avais juste</button><button type="button" class="exo-btn ko exo-hidden b-ko">✘ Raté</button><button type="button" class="exo-btn exo-hidden b-suiv">Suivant ➜</button></div>' +
          '<div class="eni-corr exo-hidden"><b>Correction</b>' + e.r + "</div>";
        var ta = q.querySelector("textarea"), msg = q.querySelector(".exo-msg");
        function b(c) { return q.querySelector(".b-" + c); }
        ta.focus();
        function noter(ok, auto) {
          res.push({ e: e, ok: ok }); E.noterExo(e, ok ? "ok" : "ko", ta.value); E.stat("quiz");
          msg.textContent = ok ? (auto ? "✔ Bonne réponse !" : "✔ Noté juste") : "✘ Ajouté à « à revoir »";
          msg.className = "exo-msg " + (ok ? "vert" : "rouge");
          ["ok", "ko"].forEach(function (c) { b(c).classList.add("exo-hidden"); });
          b("suiv").classList.remove("exo-hidden"); b("suiv").focus(); maj();
        }
        function verifier(sansReponse) {
          q.querySelector(".eni-corr").classList.remove("exo-hidden");
          b("verif").classList.add("exo-hidden"); b("voir").classList.add("exo-hidden"); ta.readOnly = true;
          if (!sansReponse && E.juste(ta.value, e.r)) { noter(true, true); return; }
          if (sansReponse || !ta.value.trim()) { noter(false); return; }
          msg.textContent = "Compare avec la correction :"; b("ok").classList.remove("exo-hidden"); b("ko").classList.remove("exo-hidden");
        }
        b("verif").onclick = function () { verifier(false); };
        b("voir").onclick = function () { verifier(true); };
        b("ok").onclick = function () { noter(true); };
        b("ko").onclick = function () { noter(false); };
        b("suiv").onclick = function () { i++; question(); };
        ta.addEventListener("keydown", function (ev) { if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); if (!b("verif").classList.contains("exo-hidden")) verifier(false); } });
      }
      function fin() {
        clearInterval(timer);
        var ok = res.filter(function (r) { return r.ok; }).length, t = (Date.now() - t0) / 1000;
        if (res.length) { var hist = store.get("quiz:hist", []); hist.push({ d: new Date().toLocaleDateString("fr-FR"), c: nomCours, n: res.length, ok: ok, t: chrono ? Math.round(t) : 0 }); store.set("quiz:hist", hist.slice(-50)); }
        var par = {}; res.forEach(function (r) { var p = par[r.e.cours] || (par[r.e.cours] = { ok: 0, n: 0 }); p.n++; if (r.ok) p.ok++; });
        root.innerHTML = '<div class="eni-panneau"><h3>$ ./quiz --resultat</h3><p class="eni-gros">' + ok + " / " + res.length + ' <span class="eni-ascii">' + ascii(ok, res.length, 20) + "</span></p>" +
          (chrono ? "<p>⏱ " + mmss(t) + "</p>" : "") +
          '<table class="eni-table"><tr><th>Cours</th><th>Score</th><th></th></tr>' + Object.keys(par).map(function (c) {
            return "<tr><td>" + puce(c) + "</td><td>" + par[c].ok + " / " + par[c].n + "</td><td>" + barre(par[c].ok, par[c].n, E.cours(c).couleur) + "</td></tr>";
          }).join("") + "</table>" +
          (res.some(function (r) { return !r.ok; }) ? "<h4>À revoir</h4><ul class=\"eni-liste\">" + res.filter(function (r) { return !r.ok; }).map(function (r) {
            return '<li><a href="' + E.lien(r.e.url) + '">' + esc(r.e.module) + "</a> · " + esc(r.e.titre) + "</li>";
          }).join("") + "</ul>" : "<p>🎉 Sans-faute !</p>") +
          '<div class="exo-actions"><button type="button" class="exo-btn eni-re">↺ Nouveau quiz</button></div></div>';
        root.querySelector(".eni-re").onclick = accueil;
      }
      question();
    }
    accueil();
  }

  // ============================================================
  //  2. EXAMEN BLANC
  // ============================================================
  function appExamen(root) {
    var NB = 20, DUREE = 30 * 60;
    function accueil() {
      var hist = store.get("exam:hist", []);
      var cases = coursAvecExos().map(function (c) {
        var coche = c.statut === "termine" || c.statut === "en-cours";
        return '<label class="eni-check"><input type="checkbox" value="' + c.id + '"' + (coche ? " checked" : "") + "> " + esc(c.titre) + " <small>(" + D.exos.filter(function (e) { return e.cours === c.id; }).length + " q.)</small></label>";
      }).join("");
      root.innerHTML = '<div class="eni-panneau"><h3>$ ./examen --blanc</h3>' +
        "<p><b>" + NB + " questions</b> tirées au hasard dans les cours cochés, <b>" + (DUREE / 60) + " minutes</b>. Aucune correction avant la fin. À la fin : correction, note sur 20 et détail par cours.</p>" +
        '<div class="eni-form eni-col">' + cases + "</div>" +
        '<button type="button" class="exo-btn eni-go">▶ Commencer l\'examen</button></div>' +
        (hist.length ? '<div class="eni-panneau"><h3>$ cat notes.log</h3><table class="eni-table"><tr><th>Date</th><th>Note</th><th>Réussies</th></tr>' +
          hist.slice(-10).reverse().map(function (x) { return "<tr><td>" + esc(x.d) + "</td><td><b>" + String(x.note).replace(".", ",") + " / 20</b></td><td>" + x.ok + " / " + x.n + "</td></tr>"; }).join("") + "</table></div>" : "");
      root.querySelector(".eni-go").onclick = function () {
        var ids = [].map.call(root.querySelectorAll("input:checked"), function (x) { return x.value; });
        var l = E.melanger(D.exos.filter(function (e) { return ids.indexOf(e.cours) !== -1; })).slice(0, NB);
        if (!l.length) { E.toast("Coche au moins un cours."); return; }
        passer(l);
      };
    }
    function passer(liste) {
      var rep = liste.map(function () { return ""; }), i = 0, fin = Date.now() + DUREE * 1000, timer;
      root.innerHTML = '<div class="eni-panneau eni-quiz"><div class="eni-quiz-haut"><span class="eni-chrono gros"></span><span class="eni-grille"></span><button type="button" class="exo-btn ko eni-rendre">Rendre la copie</button></div><div class="eni-q"></div>' +
        '<div class="exo-actions"><button type="button" class="exo-btn sec b-prec">◀ Précédente</button><button type="button" class="exo-btn b-suiv">Suivante ▶</button></div></div>';
      var q = root.querySelector(".eni-q"), ch = root.querySelector(".eni-chrono"), gr = root.querySelector(".eni-grille");
      function tic() {
        var r = (fin - Date.now()) / 1000; ch.textContent = "⏳ " + mmss(r);
        ch.classList.toggle("urgent", r < 300);
        if (r <= 0) { E.toast("⏰ Temps écoulé : copie rendue."); corriger(); }
      }
      timer = setInterval(tic, 500); tic();
      function grille() {
        gr.innerHTML = liste.map(function (_, k) { return '<button type="button" class="' + (k === i ? "cur " : "") + (rep[k].trim() ? "rep" : "") + '">' + (k + 1) + "</button>"; }).join("");
        [].forEach.call(gr.children, function (b, k) { b.onclick = function () { sauver(); i = k; afficher(); }; });
      }
      function sauver() { var ta = q.querySelector("textarea"); if (ta) rep[i] = ta.value; }
      function afficher() {
        var e = liste[i];
        q.innerHTML = carteQuestion(e, i + 1, liste.length).replace(/<a [^>]+>(.*?)<\/a>/, "$1") + '<textarea rows="3" placeholder="Ta réponse…"></textarea>';
        var ta = q.querySelector("textarea"); ta.value = rep[i]; ta.focus();
        ta.addEventListener("input", function () { rep[i] = ta.value; grille(); });
        root.querySelector(".b-prec").disabled = i === 0;
        root.querySelector(".b-suiv").textContent = i === liste.length - 1 ? "Terminer ✔" : "Suivante ▶";
        grille();
      }
      root.querySelector(".b-prec").onclick = function () { sauver(); if (i > 0) { i--; afficher(); } };
      root.querySelector(".b-suiv").onclick = function () { sauver(); if (i < liste.length - 1) { i++; afficher(); } else if (confirm("Rendre la copie ?")) corriger(); };
      root.querySelector(".eni-rendre").onclick = function () { sauver(); var vides = rep.filter(function (r) { return !r.trim(); }).length; if (confirm("Rendre la copie ?" + (vides ? " (" + vides + " sans réponse)" : ""))) corriger(); };
      afficher();
      var corrige = false;
      function corriger() {
        if (corrige) return; corrige = true; clearInterval(timer); sauver();
        var verdict = liste.map(function (e, k) { return E.juste(rep[k], e.r) ? true : (rep[k].trim() ? null : false); });
        root.innerHTML = '<div class="eni-panneau"><h3>$ ./examen --correction</h3><p>Les réponses reconnues automatiquement sont validées. Pour les autres, compare avec la correction et indique honnêtement si c\'était juste.</p><div class="eni-corrections"></div>' +
          '<div class="exo-actions"><button type="button" class="exo-btn eni-note">Calculer ma note</button><span class="exo-msg"></span></div></div>';
        var zone = root.querySelector(".eni-corrections");
        liste.forEach(function (e, k) {
          var c = h("div", "exo-card", '<div class="eni-q-tete"><span>' + puce(e.cours) + '</span><span class="eni-q-num">Q' + (k + 1) + "</span></div>" +
            '<div class="eni-q-texte">' + e.q + '</div><div class="eni-ta-rep"><b>Ta réponse :</b> ' + (rep[k].trim() ? esc(rep[k]) : "<i>(vide)</i>") + "</div>" +
            '<div class="eni-corr"><b>Correction</b>' + e.r + '</div><div class="exo-actions"><span class="exo-msg"></span><button type="button" class="exo-btn ok">✔ Juste</button><button type="button" class="exo-btn ko">✘ Faux</button></div>');
          zone.appendChild(c);
          var msg = c.querySelector(".exo-msg"), bok = c.querySelector(".ok"), bko = c.querySelector(".ko");
          function maj() {
            c.classList.toggle("ok", verdict[k] === true); c.classList.toggle("ko", verdict[k] === false);
            msg.textContent = verdict[k] === null ? "À toi de juger :" : (verdict[k] ? "✔ Juste" : "✘ Faux");
            if (verdict[k] !== null && E.juste(rep[k], e.r)) { bok.remove(); bko.remove(); }
          }
          bok.onclick = function () { verdict[k] = true; maj(); }; bko.onclick = function () { verdict[k] = false; maj(); };
          maj();
        });
        root.querySelector(".eni-note").onclick = function () {
          var manque = verdict.filter(function (v) { return v === null; }).length;
          if (manque) { root.querySelector(".exo-actions > .exo-msg").textContent = "Il reste " + manque + " question(s) à juger."; return; }
          var ok = verdict.filter(Boolean).length, note = Math.round(ok / liste.length * 40) / 2;
          liste.forEach(function (e, k) { E.noterExo(e, verdict[k] ? "ok" : "ko", rep[k]); });
          var hist = store.get("exam:hist", []); hist.push({ d: new Date().toLocaleDateString("fr-FR"), note: note, ok: ok, n: liste.length }); store.set("exam:hist", hist.slice(-50));
          E.verifierBadges();
          var par = {}; liste.forEach(function (e, k) { var p = par[e.cours] || (par[e.cours] = { ok: 0, n: 0 }); p.n++; if (verdict[k]) p.ok++; });
          root.innerHTML = '<div class="eni-panneau"><h3>$ ./examen --note</h3><p class="eni-gros">' + String(note).replace(".", ",") + ' / 20</p><p class="eni-ascii">' + ascii(ok, liste.length, 20) + " " + ok + " / " + liste.length + " questions</p>" +
            "<p>" + (note >= 16 ? "🏆 Excellent !" : note >= 12 ? "👍 Bien joué." : note >= 10 ? "😅 Juste la moyenne, continue." : "📚 À retravailler : les questions ratées sont dans « à revoir » du quiz.") + "</p>" +
            '<h4>Détail par cours</h4><table class="eni-table"><tr><th>Cours</th><th>Réussies</th><th>Sur 20</th><th></th></tr>' + Object.keys(par).map(function (c) {
              return "<tr><td>" + puce(c) + "</td><td>" + par[c].ok + " / " + par[c].n + "</td><td>" + String(Math.round(par[c].ok / par[c].n * 40) / 2).replace(".", ",") + "</td><td>" + barre(par[c].ok, par[c].n, E.cours(c).couleur) + "</td></tr>";
            }).join("") + '</table><div class="exo-actions"><button type="button" class="exo-btn eni-re">↺ Nouvel examen</button><a class="exo-btn sec" href="quiz.html">Réviser les erreurs</a></div></div>';
          root.querySelector(".eni-re").onclick = accueil;
          window.scrollTo(0, root.offsetTop - 80);
        };
      }
    }
    accueil();
  }

  // ============================================================
  //  3. FLASHCARDS (boîtes de Leitner)
  // ============================================================
  var INTERVALLE = [0, 0, 1, 3, 7, 15]; // jours avant de revoir, selon la boîte 1..5
  function cartes(deck, cid) {
    var l = [];
    if (deck === "glossaire" || deck === "tout") D.glossaire.forEach(function (g) { if (!cid || g.cours === cid) l.push({ id: "g:" + g.sigle, recto: "<span class=\"eni-big\">" + esc(g.sigle) + "</span>", verso: esc(g.def), c: g.cours, u: g.url }); });
    if (deck === "commandes" || deck === "tout") D.commandes.forEach(function (c) {
      if (cid && c.cours !== cid) return;
      if (!/[a-z]/.test(c.texte) || c.texte.length < 2) return; // garde les vraies commandes
      l.push({ id: "c:" + c.cours + ":" + c.texte, recto: "<small>Quelle commande / quel élément ?</small><br>" + c.role, verso: c.cmd, c: c.cours, u: c.url });
    });
    if (deck === "exos" || deck === "tout") D.exos.forEach(function (e) { if (!cid || e.cours === cid) l.push({ id: "e:" + e.id, recto: e.q, verso: e.r, c: e.cours, u: e.url }); });
    return l;
  }
  function appFlash(root) {
    var boxes = store.get("flash:boxes", {});
    function accueil() {
      root.innerHTML = '<div class="eni-panneau"><h3>$ ./flashcards</h3><p>Chaque carte réussie passe dans la boîte suivante et revient plus tard (boîte 1 : aujourd\'hui → boîte 5 : dans 15 jours). Une carte ratée retourne en boîte 1.</p>' +
        '<div class="eni-form"><label>Paquet <select class="eni-select" data-r="deck"><option value="glossaire">Sigles</option><option value="commandes">Commandes</option><option value="exos">Exercices</option><option value="tout">Tout</option></select></label>' +
        "<label>Cours " + selectCours() + '</label><label>Cartes <select class="eni-select" data-r="n"><option>20</option><option>40</option><option value="0">Toutes les dues</option></select></label></div>' +
        '<div class="eni-boites"></div><button type="button" class="exo-btn eni-go">▶ Réviser</button></div>';
      var sd = root.querySelector('[data-r="deck"]'), sc = root.querySelector('[data-r="cours"]');
      sd.value = store.get("flash:deck", "glossaire");
      function maj() {
        var l = cartes(sd.value, sc.value), compte = [0, 0, 0, 0, 0, 0], dues = 0, auj = E.jour();
        l.forEach(function (c) { var b = boxes[c.id]; compte[b ? b.b : 0]++; if (!b || b.due <= auj) dues++; });
        var max = Math.max.apply(null, compte.concat([1]));
        root.querySelector(".eni-boites").innerHTML = ["Nouvelles", "Boîte 1", "Boîte 2", "Boîte 3", "Boîte 4", "Boîte 5"].map(function (n, k) {
          return '<div class="eni-boite"><span class="col" style="height:' + Math.max(4, 60 * compte[k] / max) + 'px"></span><b>' + compte[k] + "</b><small>" + n + "</small></div>";
        }).join("") + '<div class="eni-boite dues"><b>' + dues + "</b><small>à réviser<br>aujourd'hui</small></div>";
      }
      sd.onchange = function () { store.set("flash:deck", sd.value); maj(); }; sc.onchange = maj; maj();
      root.querySelector(".eni-go").onclick = function () {
        var auj = E.jour(), n = +root.querySelector('[data-r="n"]').value;
        var l = cartes(sd.value, sc.value).filter(function (c) { return !boxes[c.id] || boxes[c.id].due <= auj; });
        l = E.melanger(l).sort(function (a, b) { return (boxes[a.id] ? boxes[a.id].b : 0) - (boxes[b.id] ? boxes[b.id].b : 0); });
        if (n) l = l.slice(0, n);
        if (!l.length) { E.toast("✔ Rien à réviser dans ce paquet aujourd'hui."); return; }
        session(l);
      };
    }
    function session(file) {
      var vus = 0, ok = 0, total = file.length;
      root.innerHTML = '<div class="eni-panneau"><div class="eni-quiz-haut"><span class="eni-ascii"></span><button type="button" class="exo-btn sec eni-stop">Terminer</button></div>' +
        '<div class="eni-flash" tabindex="0"><div class="eni-flash-in"><div class="face recto"></div><div class="face verso"></div></div></div>' +
        '<p class="eni-mini eni-centre">Clic ou Espace pour retourner · ✔ = <kbd>→</kbd> · ✘ = <kbd>←</kbd></p>' +
        '<div class="exo-actions eni-centre"><button type="button" class="exo-btn ko b-ko">✘ Pas su</button><button type="button" class="exo-btn ok b-ok">✔ Je savais</button></div></div>';
      var carte = root.querySelector(".eni-flash"), as = root.querySelector(".eni-ascii");
      root.querySelector(".eni-stop").onclick = fin;
      function montrer() {
        if (!file.length) { fin(); return; }
        var c = file[0];
        carte.classList.remove("retourne");
        root.querySelector(".recto").innerHTML = '<div class="eni-flash-tag">' + puce(c.c) + "</div>" + c.recto;
        root.querySelector(".verso").innerHTML = '<div class="eni-flash-tag"><a href="' + E.lien(c.u) + '" target="_blank">voir le module</a></div>' + c.verso;
        as.textContent = "$ cartes " + ascii(vus, total + (vus - ok)) + " " + file.length + " restante(s)";
        carte.focus();
      }
      function repondre(su) {
        var c = file.shift(), b = boxes[c.id] || { b: 0 }; vus++;
        if (su) { ok++; b.b = Math.min(5, (b.b || 0) + 1); } else { b.b = 1; file.push(c); }
        b.due = E.jour() + INTERVALLE[b.b]; boxes[c.id] = b; store.set("flash:boxes", boxes); E.stat("flash");
        montrer();
      }
      carte.onclick = function () { carte.classList.toggle("retourne"); };
      root.querySelector(".b-ok").onclick = function () { repondre(true); };
      root.querySelector(".b-ko").onclick = function () { repondre(false); };
      carte.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); carte.classList.toggle("retourne"); }
        else if (e.key === "ArrowRight") repondre(true); else if (e.key === "ArrowLeft") repondre(false);
      });
      function fin() {
        root.innerHTML = '<div class="eni-panneau"><h3>$ ./flashcards --bilan</h3><p class="eni-gros">' + ok + " cartes sues</p><p>" + vus + " réponses données.</p><button type=\"button\" class=\"exo-btn eni-re\">↺ Retour</button></div>";
        root.querySelector(".eni-re").onclick = accueil;
      }
      montrer();
    }
    accueil();
  }

  // ============================================================
  //  4. COMMANDES
  // ============================================================
  function appCommandes(root) {
    var ids = {}; D.commandes.forEach(function (c) { ids[c.cours] = 1; });
    root.innerHTML = '<div class="eni-form eni-filtres"><input type="search" class="eni-input" placeholder="🔍 Filtrer : ping, dns, cache, utilisateur…" data-r="q">' +
      '<select class="eni-select" data-r="cours"><option value="">Tous les cours</option>' + D.cours.filter(function (c) { return ids[c.id]; }).map(function (c) { return '<option value="' + c.id + '">' + esc(c.titre) + "</option>"; }).join("") + "</select>" +
      '<select class="eni-select" data-r="os"><option value="">Tous les systèmes</option><option value="lin">🐧 Linux (bash)</option><option value="win">🪟 Windows (cmd)</option><option value="ps">🪟 Windows (PowerShell)</option></select><span class="eni-compte"></span></div>' +
      '<div class="eni-table-wrap"><table class="eni-table eni-cmds"><thead><tr><th>Commande</th><th>Rôle</th><th>Module</th></tr></thead><tbody></tbody></table></div>';
    var q = root.querySelector('[data-r="q"]'), sc = root.querySelector('[data-r="cours"]'), so = root.querySelector('[data-r="os"]'), tb = root.querySelector("tbody");
    function os(c) {
      var r = E.texte(c.role);
      if (/^(Get|Set|New|Remove|Add|Update|Format|Select|Where|Test|Enable|Disable)-[A-Z]/.test(c.texte) || /^(cmdlet|\$|Help |<cmdlet>)/.test(c.texte) || /^(FL|FT|FW)\b/.test(c.texte)) return "ps";
      if (/\(Windows\)/.test(r)) return "win"; if (/\(Linux\)/.test(r)) return "lin";
      if (c.cours === "utilisation-linux" || c.cours === "administration-linux" || c.cours === "scripting-bash") return "lin";
      if (c.cours === "powershell") return "ps";
      if (c.cours === "systemes-clients-microsoft" || c.cours === "microsoft-365") return "win";
      return "";
    }
    function maj() {
      var m = E.norm(q.value), l = D.commandes.filter(function (c) {
        return (!sc.value || c.cours === sc.value) && (!so.value || !os(c) || os(c) === so.value) && (!m || E.norm(c.texte + " " + E.texte(c.role) + " " + c.module).indexOf(m) !== -1);
      });
      root.querySelector(".eni-compte").textContent = l.length + " résultat(s)";
      tb.innerHTML = l.map(function (c, k) {
        return '<tr><td class="cmd" data-k="' + k + '" title="Cliquer pour copier">' + c.cmd + "</td><td>" + c.role + '</td><td><a href="' + E.lien(c.url) + '" style="color:' + E.cours(c.cours).couleur + '">' + esc(c.module.replace(/ – .*/, "")) + "</a> <small>" + esc(E.cours(c.cours).titre) + "</small></td></tr>";
      }).join("");
      [].forEach.call(tb.querySelectorAll("td.cmd"), function (td) { td.onclick = function () { E.copier(l[+td.getAttribute("data-k")].texte); E.toast("📋 Copié : <code>" + esc(l[+td.getAttribute("data-k")].texte) + "</code>"); }; });
    }
    q.oninput = maj; sc.onchange = maj; so.onchange = maj; maj();
  }

  // ============================================================
  //  5. GLOSSAIRE
  // ============================================================
  function appGlossaire(root) {
    root.innerHTML = '<div class="eni-form eni-filtres"><input type="search" class="eni-input" placeholder="🔍 Chercher un sigle ou un mot…"><span class="eni-compte"></span></div><div class="eni-gloss"></div>';
    var q = root.querySelector("input"), zone = root.querySelector(".eni-gloss");
    function maj() {
      var m = E.norm(q.value), l = D.glossaire.filter(function (g) { return !m || E.norm(g.sigle + " " + g.def).indexOf(m) !== -1; }), lettre = "";
      root.querySelector(".eni-compte").textContent = l.length + " sigle(s)";
      zone.innerHTML = l.map(function (g) {
        var L = g.sigle.replace(/^\./, "")[0].toUpperCase(), t = "";
        if (L !== lettre) { lettre = L; t = '<div class="eni-lettre">' + L + "</div>"; }
        return t + '<div class="eni-terme"><b>' + esc(g.sigle) + "</b><span>" + esc(g.def) + '</span><a href="' + E.lien(g.url) + '">' + puce(g.cours) + "</a></div>";
      }).join("") || "<p>Aucun résultat.</p>";
    }
    q.oninput = maj; maj();
  }

  // ============================================================
  //  6. OUTILS : calculatrice IPv4 + convertisseur
  // ============================================================
  function ip2n(s) { var p = s.trim().split("."); if (p.length !== 4) return null; var n = 0; for (var i = 0; i < 4; i++) { if (!/^\d{1,3}$/.test(p[i]) || +p[i] > 255) return null; n = n * 256 + (+p[i]); } return n; }
  function n2ip(n) { return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join("."); }
  function bin32(n, cidr) {
    var b = (n >>> 0).toString(2); b = "00000000000000000000000000000000".slice(b.length) + b;
    var out = ""; for (var i = 0; i < 32; i++) { if (i && i % 8 === 0) out += '<span class="pt">.</span>'; out += '<span class="' + (cidr !== undefined ? (i < cidr ? "res" : "hote") : "") + '">' + b[i] + "</span>"; }
    return out;
  }
  function appIpcalc(root) {
    root.innerHTML = '<div class="eni-panneau"><h3>$ ipcalc</h3><div class="eni-form"><label>Adresse IP <input class="eni-input" data-r="ip" value="192.168.1.10" placeholder="192.168.1.10"></label>' +
      '<label>Masque ou /CIDR <input class="eni-input" data-r="m" value="/24" placeholder="/24 ou 255.255.255.0"></label><button type="button" class="exo-btn eni-go">Calculer</button></div><div class="eni-res"></div></div>';
    var ri = root.querySelector('[data-r="ip"]'), rm = root.querySelector('[data-r="m"]'), res = root.querySelector(".eni-res");
    function calc(compter) {
      var ip = ip2n(ri.value), m = rm.value.trim(), cidr;
      if (/^\/?\d{1,2}$/.test(m)) cidr = +m.replace("/", "");
      else { var mn = ip2n(m); if (mn !== null) { var b = (mn >>> 0).toString(2); b = ("0".repeat(32 - b.length)) + b; if (/^1*0*$/.test(b)) cidr = b.indexOf("0") === -1 ? 32 : b.indexOf("0"); } }
      if (ip === null) { res.innerHTML = '<p class="rouge">Adresse IP invalide (4 nombres de 0 à 255).</p>'; return; }
      if (cidr === undefined || cidr > 32) { res.innerHTML = '<p class="rouge">Masque invalide : /0 à /32, ou masque continu (255.255.255.0…).</p>'; return; }
      var masque = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0, reseau = (ip & masque) >>> 0, diff = (reseau | (~masque >>> 0)) >>> 0, hb = 32 - cidr;
      var nb = hb >= 2 ? Math.pow(2, hb) - 2 : 0;
      res.innerHTML = '<table class="eni-table"><tr><th></th><th>Décimal</th><th>Binaire <small>(<span class="res">réseau</span> · <span class="hote">hôte</span>)</small></th></tr>' +
        "<tr><td>Adresse</td><td><code>" + n2ip(ip) + "</code></td><td class=\"bin\">" + bin32(ip, cidr) + "</td></tr>" +
        "<tr><td>Masque</td><td><code>" + n2ip(masque) + "</code> = /" + cidr + "</td><td class=\"bin\">" + bin32(masque, cidr) + "</td></tr>" +
        "<tr><td>@ réseau</td><td><code>" + n2ip(reseau) + "/" + cidr + "</code></td><td class=\"bin\">" + bin32(reseau, cidr) + "</td></tr>" +
        "<tr><td>@ diffusion</td><td><code>" + n2ip(diff) + "</code></td><td class=\"bin\">" + bin32(diff, cidr) + "</td></tr>" +
        (nb ? "<tr><td>1<sup>re</sup> hôte</td><td><code>" + n2ip(reseau + 1) + "</code></td><td></td></tr><tr><td>Dernière hôte</td><td><code>" + n2ip(diff - 1) + "</code></td><td></td></tr>" : "") +
        "<tr><td>Nb d'hôtes</td><td><b>2<sup>" + hb + "</sup> − 2 = " + nb.toLocaleString("fr-FR") + "</b></td><td><small>" + hb + " bits hôte</small></td></tr></table>" +
        '<p class="eni-mini">@réseau = bits hôte à 0 · @diffusion = bits hôte à 1 · nb d\'hôtes = 2ⁿ − 2</p>';
      if (compter) E.stat("ipcalc");
    }
    root.querySelector(".eni-go").onclick = function () { calc(true); };
    [ri, rm].forEach(function (x) { x.addEventListener("keydown", function (e) { if (e.key === "Enter") calc(true); }); x.addEventListener("input", function () { calc(false); }); });
    calc(false);
  }
  function appConv(root) {
    root.innerHTML = '<div class="eni-panneau"><h3>$ conv --octet</h3><p class="eni-mini">Clique sur les bits pour les allumer : le décimal = la somme des valeurs des bits à 1.</p>' +
      '<div class="eni-bits">' + [128, 64, 32, 16, 8, 4, 2, 1].map(function (v) { return '<button type="button" data-v="' + v + '"><small>' + v + "</small><b>0</b></button>"; }).join("") + "</div>" +
      '<div class="eni-form"><label>Décimal <input class="eni-input" data-b="10" value="0"></label><label>Binaire <input class="eni-input" data-b="2" value="0"></label><label>Hexadécimal <input class="eni-input" data-b="16" value="0"></label></div><p class="eni-detail eni-mini"></p></div>';
    var ins = root.querySelectorAll("input"), bits = root.querySelectorAll(".eni-bits button"), detail = root.querySelector(".eni-detail");
    function poser(n, source) {
      ins.forEach(function (x) { if (x !== source) { var b = +x.getAttribute("data-b"); x.value = b === 2 ? n.toString(2) : b === 16 ? n.toString(16).toUpperCase() : String(n); } });
      bits.forEach(function (bt) { var v = +bt.getAttribute("data-v"), on = n <= 255 && (n & v); bt.classList.toggle("on", !!on); bt.querySelector("b").textContent = on ? 1 : 0; });
      var somme = [128, 64, 32, 16, 8, 4, 2, 1].filter(function (v) { return n <= 255 && (n & v); });
      detail.textContent = n > 255 ? "(plus grand qu'un octet : " + n.toString(2).length + " bits)" : (somme.length ? somme.join(" + ") + " = " + n : "0");
    }
    ins.forEach(function (x) {
      x.addEventListener("input", function () {
        var b = +x.getAttribute("data-b"), v = x.value.trim().replace(/\s/g, ""), ok = { 2: /^[01]+$/, 10: /^\d+$/, 16: /^[0-9a-f]+$/i }[b];
        if (!v) return; if (!ok.test(v)) { x.classList.add("err"); return; } x.classList.remove("err");
        var n = parseInt(v, b); if (n > 0xFFFFFFFF) { x.classList.add("err"); return; } poser(n, x);
      });
    });
    bits.forEach(function (bt) { bt.onclick = function () { var n = parseInt(ins[0].value, 10) || 0; if (n > 255) n = 0; poser(n ^ +bt.getAttribute("data-v")); }; });
    poser(0);
  }

  // ============================================================
  //  7. BADGES
  // ============================================================
  function appBadges(root) {
    function rendu() {
      var got = E.verifierBadges(true), n = Object.keys(got).length;
      root.innerHTML = '<p class="eni-ascii">$ badges ' + ascii(n, E.badges.length, 20) + " " + n + " / " + E.badges.length + '</p><div class="eni-badges">' + E.badges.map(function (b) {
        var g = got[b.id];
        return '<div class="eni-badge ' + (g ? "on" : "") + '"><span class="ico">' + (g ? b.ico : "🔒") + "</span><b>" + esc(b.nom) + "</b><small>" + esc(b.desc) + "</small>" + (g ? '<em>' + g.split("-").reverse().join("/") + "</em>" : "") + "</div>";
      }).join("") + "</div>";
    }
    rendu(); document.addEventListener("eni:progres", rendu);
  }

  // ============================================================
  //  8. CARNET (toutes les notes)
  // ============================================================
  function appCarnet(root) {
    function titrePage(k) { var u = k.replace(/^carnet:/, ""), p = D.pages.filter(function (x) { return x.url === u; })[0]; return p ? p : { titre: u, url: u, cours: "" }; }
    function rendu() {
      var cles = store.keys("carnet:").sort();
      if (!cles.length) { root.innerHTML = "<p>Pas encore de notes. En bas de chaque module, ouvre <b>📓 Mon carnet de TP</b> pour écrire tes notes : elles apparaîtront ici.</p>"; return; }
      root.innerHTML = '<div class="exo-actions"><button type="button" class="exo-btn eni-exp">⬇ Tout exporter (.md)</button><span class="eni-mini">' + cles.length + " note(s), enregistrées dans ce navigateur : exporte-les de temps en temps pour les garder.</span></div>" +
        cles.map(function (k) {
          var n = store.get(k, {}), p = titrePage(k);
          return '<div class="exo-card"><div class="eni-q-tete"><span>' + (p.cours ? puce(p.cours) : "") + ' <a href="' + E.lien(p.url) + '">' + esc(p.titre) + '</a></span><span class="eni-mini">' + (n.d ? new Date(n.d).toLocaleString("fr-FR") : "") + '</span></div><pre class="eni-note">' + esc(n.t || "") + "</pre></div>";
        }).join("");
      root.querySelector(".eni-exp").onclick = function () {
        var md = "# Mon carnet de TP\n\n" + cles.map(function (k) { var n = store.get(k, {}), p = titrePage(k); return "## " + p.titre + "\n\n" + (n.t || "") + "\n"; }).join("\n");
        E.telecharger("mon-carnet-de-tp.md", md);
      };
    }
    rendu();
  }

  // ============================================================
  //  9. ACCUEIL : tableau de bord + frise
  // ============================================================
  var STAGE = "2027-04-05", EXAMS = "2027-06-14";
  function jours(iso) { var d = new Date(iso + "T00:00:00"); return Math.ceil((d - new Date(new Date().toDateString())) / 86400000); }
  function appDashboard(root) {
    function rendu() {
      var p = E.progression(), got = Object.keys(store.get("badges:got", {})).length, hist = store.get("exam:hist", []);
      var best = hist.reduce(function (m, x) { return Math.max(m, x.note); }, -1);
      var auj = new Date().toISOString().slice(0, 10), actuel = D.calendrier.filter(function (c) { return c.debut && c.debut <= auj && auj <= c.fin; })[0];
      var boxes = store.get("flash:boxes", {}), dues = 0, j = E.jour(); Object.keys(boxes).forEach(function (k) { if (boxes[k].due <= j) dues++; });
      var js = jours(STAGE), je = jours(EXAMS);
      root.innerHTML =
        '<div class="eni-tuiles">' +
        '<div class="eni-tuile"><small>exercices réussis</small><b>' + p.ok + "<span>/" + p.total + "</span></b>" + barre(p.ok, p.total) + "</div>" +
        '<a class="eni-tuile" href="reviser/quiz.html"><small>à revoir</small><b>' + p.ko + "</b><span class=\"eni-mini\">→ lancer le quiz</span></a>" +
        '<a class="eni-tuile" href="reviser/badges.html"><small>badges</small><b>' + got + "<span>/" + E.badges.length + '</span></b><span class="eni-mini">→ voir</span></a>' +
        '<a class="eni-tuile" href="reviser/examen.html"><small>meilleure note</small><b>' + (best >= 0 ? String(best).replace(".", ",") + "<span>/20</span>" : "–") + '</b><span class="eni-mini">→ examen blanc</span></a>' +
        '<div class="eni-tuile cd"><small>stage dans</small><b>' + (js > 0 ? js + "<span> j</span>" : "en cours") + '</b><span class="eni-mini">05/04/2027</span></div>' +
        '<div class="eni-tuile cd"><small>évaluations finales dans</small><b>' + (je > 0 ? je + "<span> j</span>" : "🎓") + '</b><span class="eni-mini">14/06/2027</span></div>' +
        "</div>" +
        (actuel ? '<p class="eni-actuel">▶ En ce moment : <a href="' + actuel.url + '"><b>' + esc(actuel.titre) + "</b></a> (" + esc(actuel.dates) + ")" + (dues ? ' · <a href="reviser/flashcards.html">' + dues + " flashcard(s) à réviser</a>" : "") + "</p>" : "") +
        '<div class="eni-progs">' + D.cours.filter(function (c) { return p.parCours[c.id]; }).map(function (c) {
          var x = p.parCours[c.id];
          return '<a class="eni-prog" href="' + c.url + '"><span class="nom" style="color:' + c.couleur + '">' + esc(c.titre) + '</span><span class="eni-ascii">' + ascii(x.ok, x.total, 20) + "</span><span>" + x.ok + "/" + x.total + (x.ko ? ' <small class="rouge">(' + x.ko + " à revoir)</small>" : "") + "</span></a>";
        }).join("") + "</div>";
    }
    rendu(); document.addEventListener("eni:progres", rendu);
  }
  function appFrise(root) {
    var dates = D.calendrier.filter(function (c) { return c.debut; });
    if (!dates.length) return;
    var d0 = new Date(dates[0].debut + "T00:00:00"), d1 = new Date(dates[dates.length - 1].fin + "T00:00:00");
    d0.setDate(d0.getDate() - 3); d1.setDate(d1.getDate() + 3);
    var tot = d1 - d0; function pos(iso) { return 100 * (new Date(iso + "T00:00:00") - d0) / tot; }
    function couleur(c) { if (/stage/i.test(c.titre)) return "#8e24aa"; if (/valuation/i.test(c.titre)) return "#e53935"; var m = c.url.match(/cours\/([^\/]+)\//); return m ? E.cours(m[1]).couleur : "#607d8b"; }
    var COURT = { "utilisation-linux": "Linux", "administration-linux": "Admin Linux", "msp-systemes-clients": "MSP clients", "itil-gestion-de-parc": "ITIL / parc",
      "infrastructures-reseaux": "Infra réseaux", "services-reseau-microsoft": "Services réseau MS", "msp-services-reseau": "MSP réseau", "scripting-bash": "Bash",
      "powershell": "PowerShell", "automatisation-ia-mco": "IA / MCO", "virtualisation-serveurs": "Virtualisation", "services-cloud": "Cloud",
      "sauvegarde-restauration": "Sauvegarde", "reseau-et-securite": "Réseau & sécu", "supervision": "Supervision" };
    function court(c) { if (/stage/i.test(c.titre)) return "Stage"; if (/valuation/i.test(c.titre)) return "Évaluations"; var m = c.url.match(/cours\/([^\/]+)\//); return m && COURT[m[1]] || c.titre; }
    var avant = D.calendrier.filter(function (c) { return !c.debut; });
    var mois = [], m = new Date(d0.getFullYear(), d0.getMonth() + 1, 1);
    while (m < d1) { mois.push('<span class="mois" style="left:' + pos(m.toISOString().slice(0, 10)) + '%">' + m.toLocaleDateString("fr-FR", { month: "short" }) + (m.getMonth() === 0 ? " " + m.getFullYear() : "") + "</span>"); m.setMonth(m.getMonth() + 1); }
    var auj = new Date(), pAuj = 100 * (auj - d0) / tot;
    root.innerHTML = '<div class="eni-frise-avant">' + avant.map(function (c) { return '<a href="' + c.url + '" style="--pc:' + couleur(c) + '" class="eni-puce">✔ ' + esc(c.titre) + "</a>"; }).join("") + "</div>" +
      '<div class="eni-frise-wrap"><div class="eni-frise">' + mois.join("") +
      dates.map(function (c, k) {
        var a = pos(c.debut), b = pos(c.fin), fini = c.fin < auj.toISOString().slice(0, 10);
        var tag = c.url ? "a" : "span";
        return "<" + tag + (c.url ? ' href="' + c.url + '"' : "") + ' class="seg' + (fini ? " fini" : "") + (k % 2 ? " bas" : "") + '" style="left:' + a + "%;width:" + Math.max(.8, b - a) + "%;--pc:" + couleur(c) + '" title="' + esc(c.titre + " · " + c.dates) + '"><span>' + esc(court(c)) + "</span></" + tag + ">";
      }).join("") +
      (pAuj >= 0 && pAuj <= 100 ? '<span class="auj" style="left:' + pAuj + '%"><em>aujourd\'hui</em></span>' : "") + "</div></div>";
  }

  // ============================================================
  //  10. SCHÉMAS INTERACTIFS (contenu des cours)
  // ============================================================
  var OSI = [
    [7, "Application", "Là où les applications discutent avec le réseau", "Navigateur web (HTTP/HTTPS), mail (SMTP, IMAP), SSH, FTP", "Application"],
    [6, "Présentation", "Convertit les données pour qu'elles soient compréhensibles", "Chiffrement (SSL/TLS), compression, conversion de formats", "Application"],
    [5, "Session", "Gère les connexions entre appareils : ouverture, maintien, fermeture", "Authentification SSH, session web", "Application"],
    [4, "Transport", "TCP et UDP", "TCP : fiable, vérifie que tout est reçu (web, mail) · UDP : rapide mais pas fiable (jeux, streaming)", "Transport"],
    [3, "Réseau", "Adresses IP, routage, passerelles", "IP, ICMP (ping), routeurs", "Internet"],
    [2, "Liaison", "Ce qui touche aux équipements locaux", "Adresse MAC, VLAN, commutation (switch)", "Accès réseau"],
    [1, "Physique", "Câbles, Wi-Fi, signaux électriques", "RJ45, fibre, ondes Wi-Fi", "Accès réseau"]
  ];
  function appOsi(root) {
    root.innerHTML = '<div class="eni-schema"><div class="eni-osi"></div><div class="eni-osi-info"><p>👈 Clique sur une couche.</p></div></div>' +
      '<div class="exo-actions"><button type="button" class="exo-btn b-env">▶ Envoi (7 → 1)</button><button type="button" class="exo-btn sec b-rec">▶ Réception (1 → 7)</button></div>';
    var col = root.querySelector(".eni-osi"), info = root.querySelector(".eni-osi-info"), anim;
    OSI.forEach(function (c, k) {
      var b = h("button", "", "<b>" + c[0] + "</b> " + c[1]); b.type = "button"; b.style.setProperty("--i", k);
      b.onclick = function () { choisir(k); }; col.appendChild(b);
    });
    function choisir(k) {
      var c = OSI[k];
      [].forEach.call(col.children, function (b, j) { b.classList.toggle("on", j === k); });
      info.innerHTML = '<h4>Couche ' + c[0] + " – " + c[1] + "</h4><p><b>Rôle :</b> " + c[2] + "</p><p><b>Exemples :</b> " + c[3] + "</p><p><b>Modèle TCP/IP :</b> couche « " + c[4] + " »</p>";
    }
    function jouer(ordre, sens) {
      clearInterval(anim); var i = 0;
      info.innerHTML = "<p>" + (sens ? "<b>Envoi</b> : chaque couche <b>encapsule</b> (SDU + PCI = PDU) et passe à la couche du dessous." : "<b>Réception</b> : chaque couche retire ses informations (<b>désencapsulation</b>) et remonte.") + "</p>";
      anim = setInterval(function () {
        [].forEach.call(col.children, function (b, j) { b.classList.toggle("on", j === ordre[i]); });
        if (++i >= ordre.length) clearInterval(anim);
      }, 600);
    }
    root.querySelector(".b-env").onclick = function () { jouer([0, 1, 2, 3, 4, 5, 6], true); };
    root.querySelector(".b-rec").onclick = function () { jouer([6, 5, 4, 3, 2, 1, 0], false); };
  }
  var ENCAP = [
    ["Application", "Firefox → HTTP/HTTPS", [["Données HTTP", "d"]]],
    ["Transport", "TCP, port 443 (HTTPS)", [["TCP :443", "t"], ["Données HTTP", "d"]]],
    ["Réseau", "IP source → IP destination, recherche du chemin (routage)", [["IP src → dst", "i"], ["TCP :443", "t"], ["Données HTTP", "d"]]],
    ["Liaison", "MAC source → MAC destination locale (switch)", [["MAC src → dst", "m"], ["IP src → dst", "i"], ["TCP :443", "t"], ["Données HTTP", "d"]]],
    ["Physique", "Signal sur RJ45 / Wi-Fi", [["0110 1001 0011 1010 1100 0101…", "p"]]]
  ];
  function appEncap(root) {
    var i = 0, anim;
    root.innerHTML = '<div class="eni-encap"><div class="eni-encap-titre"></div><div class="eni-encap-pdu"></div><div class="eni-encap-txt"></div></div>' +
      '<div class="exo-actions"><button type="button" class="exo-btn sec b-p">◀</button><button type="button" class="exo-btn b-play">▶ Lecture</button><button type="button" class="exo-btn sec b-s">▶</button><span class="exo-msg"></span></div>';
    function aff() {
      var e = ENCAP[i];
      root.querySelector(".eni-encap-titre").innerHTML = "Étape " + (i + 1) + "/5 · couche <b>" + e[0] + "</b>";
      root.querySelector(".eni-encap-pdu").innerHTML = e[2].map(function (x, k) { return '<span class="blk ' + x[1] + (k === 0 && i ? " neuf" : "") + '">' + x[0] + "</span>"; }).join("");
      root.querySelector(".eni-encap-txt").textContent = e[1];
    }
    root.querySelector(".b-p").onclick = function () { clearInterval(anim); i = Math.max(0, i - 1); aff(); };
    root.querySelector(".b-s").onclick = function () { clearInterval(anim); i = Math.min(4, i + 1); aff(); };
    root.querySelector(".b-play").onclick = function () { clearInterval(anim); i = 0; aff(); anim = setInterval(function () { if (i >= 4) { clearInterval(anim); return; } i++; aff(); }, 1600); };
    aff();
  }
  var DORA = [
    ["DISCOVER", "« qui peut me donner une IP ? »", 1], ["OFFER", "« je te propose x.y.z.a »", -1],
    ["REQUEST", "« ok, je veux cette IP »", 1], ["ACK", "validation de la configuration", -1]
  ];
  function appDora(root) {
    root.innerHTML = '<div class="eni-dora"><div class="poste">💻<b>PC</b><small class="ip">IP : ?</small></div><div class="piste"><span class="paquet"></span></div><div class="poste">🖥️<b>Serveur DHCP</b></div></div>' +
      '<ol class="eni-dora-etapes">' + DORA.map(function (d) { return "<li><b>" + d[0] + "</b> : " + d[1] + "</li>"; }).join("") + "</ol>" +
      '<div class="exo-actions"><button type="button" class="exo-btn b-play">▶ Lancer DORA</button></div>';
    var paquet = root.querySelector(".paquet"), lis = root.querySelectorAll("li"), ip = root.querySelector(".ip"), t = [];
    root.querySelector(".b-play").onclick = function () {
      t.forEach(clearTimeout); t = []; ip.textContent = "IP : ?"; [].forEach.call(lis, function (l) { l.classList.remove("on", "fait"); });
      DORA.forEach(function (d, k) {
        t.push(setTimeout(function () {
          [].forEach.call(lis, function (l, j) { l.classList.toggle("on", j === k); if (j < k) l.classList.add("fait"); });
          paquet.textContent = d[0]; paquet.className = "paquet " + (d[2] > 0 ? "aller" : "retour");
          void paquet.offsetWidth; paquet.classList.add("go");
        }, k * 1900));
      });
      t.push(setTimeout(function () { lis[3].classList.add("fait"); lis[3].classList.remove("on"); paquet.className = "paquet"; ip.textContent = "IP : x.y.z.a ✔"; }, 4 * 1900));
    };
  }

  // ============================================================
  var APPS = { "app-quiz": appQuiz, "app-examen": appExamen, "app-flash": appFlash, "app-commandes": appCommandes, "app-glossaire": appGlossaire,
    "app-ipcalc": appIpcalc, "app-conv": appConv, "app-badges": appBadges, "app-carnet": appCarnet, "app-dashboard": appDashboard, "app-frise": appFrise };
  var SCHEMAS = { "app-osi": appOsi, "app-encap": appEncap, "app-dora": appDora };
  function init() {
    Object.keys(APPS).forEach(function (id) { var el = $(id); if (el) { el.classList.add("eni-app"); try { APPS[id](el); } catch (e) { el.innerHTML = '<p class="rouge">Erreur : ' + esc(e.message) + "</p>"; console.error(e); } } });
    Object.keys(SCHEMAS).forEach(function (c) { document.querySelectorAll("." + c).forEach(function (el) { el.classList.add("eni-app"); SCHEMAS[c](el); }); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
