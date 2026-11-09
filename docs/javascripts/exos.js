/* ============================================================
   Site "Mes cours ENI"
   1. Couleur + logo du cours (attribut data-cours sur <body>)
   2. Exercices interactifs : réponse, vérification, score
   3. Cases à cocher des TP cliquables et mémorisées
   Les pages Markdown ne changent pas : on garde le format
     **Exercice N** : question
     ??? success "Correction"
         réponse
   ============================================================ */
(function () {
  "use strict";

  // Stockage local protégé (peut être indisponible en navigation privée)
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var pageKey = location.pathname.replace(/^.*\/cours\//, "cours/");

  // ---------- 1. Couleur du cours ----------
  function marquerCours() {
    var m = location.pathname.match(/\/cours\/([^\/]+)\//) || location.pathname.match(/\/fiches\/((?!index)[^\/]+)\.html$/);
    if (m) document.body.setAttribute("data-cours", m[1]);
    if (/\/fiches\//.test(location.pathname)) document.body.setAttribute("data-fiche", "");
  }

  // ---------- 2. Exercices ----------
  // Normalise une réponse : minuscules, sans accents, sans espaces superflus
  function norm(t) {
    return (t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[«»"'`*]/g, "").replace(/\s+/g, " ").replace(/^[\s:=→-]+|[\s.!]+$/g, "").trim();
  }

  function reponsesAttendues(details) {
    var cands = [];
    details.querySelectorAll("strong, code").forEach(function (el) { cands.push(norm(el.textContent)); });
    var corps = details.cloneNode(true);
    var s = corps.querySelector("summary"); if (s) s.remove();
    cands.push(norm(corps.textContent));
    return cands.filter(function (c) { return c.length > 0; });
  }

  function exercices() {
    var content = document.querySelector(".md-content article") || document.querySelector(".md-content");
    if (!content) return;
    var h2 = content.querySelector("h2#exercices");
    if (!h2) return;

    var cartes = [];
    var paras = content.querySelectorAll("p");
    paras.forEach(function (p) {
      var st = p.firstElementChild;
      if (!st || st.tagName !== "STRONG" || !/^Exercice\b/i.test(st.textContent.trim())) return;
      if (p.firstChild !== st && p.firstChild.textContent.trim() !== "") return;
      // éléments entre la question et la correction
      var suite = [], el = p.nextElementSibling;
      while (el && !(el.tagName === "DETAILS" && el.classList.contains("success"))) {
        if (/^H[1-6]$/.test(el.tagName) || (el.tagName === "P" && el.querySelector(":scope > strong:first-child") && /^Exercice\b/i.test(el.textContent.trim()))) { el = null; break; }
        suite.push(el); el = el.nextElementSibling;
      }
      if (!el) return;
      var details = el;
      var carte = document.createElement("div");
      carte.className = "exo-card";
      p.parentNode.insertBefore(carte, p);
      carte.appendChild(p);
      suite.forEach(function (x) { carte.appendChild(x); });

      var zone = document.createElement("textarea");
      zone.placeholder = "Écris ta réponse ici…";
      zone.rows = 1;
      var actions = document.createElement("div"); actions.className = "exo-actions";
      var bVerif = bouton("Vérifier", "");
      var bVoir = bouton("Voir la correction", "sec");
      var msg = document.createElement("span"); msg.className = "exo-msg";
      var bOk = bouton("✔ J'avais juste", "ok exo-hidden");
      var bKo = bouton("✘ À revoir", "ko exo-hidden");
      var bRe = bouton("↺ Refaire", "sec exo-hidden");
      [bVerif, bVoir, msg, bOk, bKo, bRe].forEach(function (b) { actions.appendChild(b); });
      carte.appendChild(zone); carte.appendChild(actions); carte.appendChild(details);
      details.open = false; details.classList.add("exo-hidden");

      var idx = cartes.length;
      var c = { carte: carte, zone: zone, details: details, attendu: reponsesAttendues(details) };
      cartes.push(c);

      function montrer() {
        details.classList.remove("exo-hidden"); details.open = true;
        bVerif.classList.add("exo-hidden"); bVoir.classList.add("exo-hidden");
      }
      function noter(etat, auto) {
        carte.classList.remove("ok", "ko");
        if (etat) carte.classList.add(etat);
        bOk.classList.add("exo-hidden"); bKo.classList.add("exo-hidden");
        bRe.classList.remove("exo-hidden");
        msg.textContent = etat === "ok" ? (auto ? "✔ Bonne réponse !" : "✔ Réussi") : "✘ À revoir";
        var etatPage = store.get("exos:" + pageKey) || {};
        etatPage[idx] = { e: etat, r: zone.value };
        store.set("exos:" + pageKey, etatPage);
        majScore();
        document.dispatchEvent(new CustomEvent("eni:exo"));
      }
      bVerif.onclick = function () {
        var r = norm(zone.value);
        montrer();
        if (r && c.attendu.indexOf(r) !== -1) { noter("ok", true); return; }
        msg.textContent = r ? "Compare avec la correction :" : "Voici la correction :";
        bOk.classList.remove("exo-hidden"); bKo.classList.remove("exo-hidden");
      };
      bVoir.onclick = function () { bVerif.onclick(); };
      bOk.onclick = function () { noter("ok", false); };
      bKo.onclick = function () { noter("ko", false); };
      bRe.onclick = function () {
        carte.classList.remove("ok", "ko"); details.classList.add("exo-hidden"); details.open = false;
        [bOk, bKo, bRe].forEach(function (b) { b.classList.add("exo-hidden"); });
        bVerif.classList.remove("exo-hidden"); bVoir.classList.remove("exo-hidden");
        msg.textContent = ""; zone.value = ""; zone.focus();
        var etatPage = store.get("exos:" + pageKey) || {}; delete etatPage[idx]; store.set("exos:" + pageKey, etatPage);
        majScore();
      };
      zone.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); if (!bVerif.classList.contains("exo-hidden")) bVerif.onclick(); }
      });
      // restauration de l'état mémorisé
      var mem = (store.get("exos:" + pageKey) || {})[idx];
      if (mem) { zone.value = mem.r || ""; montrer(); noter(mem.e, false); }
    });
    if (!cartes.length) return;

    // Tableau de score
    var score = document.createElement("div"); score.className = "exo-score";
    score.innerHTML = '<span>$ score</span><span class="ascii">[----------]</span><span><b class="n">0</b> / ' + cartes.length + '</span><span class="barre"><span></span></span>';
    var bReset = bouton("Tout recommencer", "sec");
    bReset.onclick = function () { store.del("exos:" + pageKey); location.reload(); };
    score.appendChild(bReset);
    h2.parentNode.insertBefore(score, h2.nextSibling);

    function majScore() {
      var ok = 0;
      cartes.forEach(function (c) { if (c.carte.classList.contains("ok")) ok++; });
      score.querySelector(".n").textContent = ok;
      score.querySelector(".barre > span").style.width = (100 * ok / cartes.length) + "%";
      var plein = Math.round(10 * ok / cartes.length);
      score.querySelector(".ascii").textContent = "[" + "#".repeat(plein) + "-".repeat(10 - plein) + "]";
    }
    window.__majScore = majScore;
    majScore();
  }
  function majScore() { if (window.__majScore) window.__majScore(); }

  function bouton(txt, cls) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = txt; b.className = "exo-btn " + (cls || "");
    return b;
  }

  // ---------- 3. Cases à cocher des TP ----------
  function casesTP() {
    var cases = document.querySelectorAll(".md-content .task-list-control input[type=checkbox]");
    if (!cases.length) return;
    var etat = store.get("tp:" + pageKey) || {};
    cases.forEach(function (cb, i) {
      cb.disabled = false;
      if (etat[i] !== undefined) cb.checked = etat[i];
      cb.addEventListener("change", function () { etat[i] = cb.checked; store.set("tp:" + pageKey, etat); });
    });
  }

  // ---------- 4. Touches "terminal" ----------
  function prompts() {
    var h1 = document.querySelector(".md-content .md-typeset h1");
    if (h1 && !h1.querySelector(".titre")) {
      var titre = document.createElement("span"); titre.className = "titre";
      Array.prototype.slice.call(h1.childNodes).forEach(function (n) {
        if (!(n.nodeType === 1 && n.classList.contains("headerlink"))) titre.appendChild(n);
      });
      h1.insertBefore(titre, h1.firstChild);
    }
    document.querySelectorAll(".md-typeset .admonition.abstract > .admonition-title").forEach(function (t) {
      if (/^\s*En bref\s*$/.test(t.textContent)) t.innerHTML = '<span class="cmd">$ cat</span> EN_BREF.md';
    });
  }

  // Accueil : titre tapé comme dans une console
  function machineAEcrire() {
    var el = document.querySelector(".hero .typed");
    if (!el) return;
    var txt = el.getAttribute("data-text") || el.textContent, i = 0;
    var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduit) { el.textContent = txt; return; }
    el.textContent = "";
    (function tape() { el.textContent = txt.slice(0, ++i); if (i < txt.length) setTimeout(tape, 70 + Math.random() * 60); })();
  }

  function init() { marquerCours(); prompts(); exercices(); casesTP(); machineAEcrire(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
