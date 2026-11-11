# ============================================================
#  Hooks MkDocs (déclarés dans mkdocs.yml, section hooks:)
#  1. Avant chaque build : régénère les données des outils de révision
#     (quiz, flashcards, commandes, glossaire, fiches mémo) -> tools/gen_data.py
#  2. Sur chaque page :
#     - remplace le script iframe-worker chargé depuis internet par la copie
#       locale -> la recherche marche hors ligne
#     - ajoute ?v=<empreinte> aux scripts et styles du site : après une mise à
#       jour, le navigateur recharge la nouvelle version (pas de vieux cache)
#     - ajoute ce qu'il faut pour l'appli téléphone (PWA) : manifeste, icônes,
#       couleur de barre, enregistrement du service worker
#  3. Après le build : élargit les séparateurs de mots de la recherche
#     (parenthèses, virgules, points, apostrophes…) -> « casse » est trouvé
#     aussi dans « (casse, taille) » ou « l'héritage » -> « héritage »
#  4. Après le build : écrit site/sw.js (service worker) avec la liste de tous
#     les fichiers du site -> l'appli installée marche sans réseau
# ============================================================
import hashlib, json, os, re, sys

sys.path.insert(0, os.path.dirname(__file__))
import gen_data  # noqa: E402

SHIM_WEB = "https://unpkg.com/iframe-worker/shim"
_empreintes = {}


def on_pre_build(config, **kwargs):
    gen_data.generer()
    _empreintes.clear()


def _empreinte(config, chemin):
    if chemin not in _empreintes:
        f = os.path.join(config["docs_dir"], chemin)
        try:
            with open(f, "rb") as fh:
                _empreintes[chemin] = hashlib.md5(fh.read()).hexdigest()[:8]
        except OSError:
            _empreintes[chemin] = ""
    return _empreintes[chemin]


def _tete_appli(racine):
    # balises PWA ; le service worker n'est enregistré qu'en http(s) (pas en double-clic file://)
    return (
        '<link rel="manifest" href="' + racine + 'manifest.webmanifest">'
        '<meta name="theme-color" content="#0a0e14">'
        '<meta name="mobile-web-app-capable" content="yes">'
        '<meta name="apple-mobile-web-app-capable" content="yes">'
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
        '<meta name="apple-mobile-web-app-title" content="Cours ENI">'
        '<link rel="apple-touch-icon" href="' + racine + 'assets/appli/apple-touch-icon.png">'
        '<script>if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol))'
        'addEventListener("load",function(){navigator.serviceWorker.register("' + racine + 'sw.js")});</script>'
    )


def on_post_page(output, page, config, **kwargs):
    profondeur = page.file.dest_uri.count("/")
    racine = "../" * profondeur
    if SHIM_WEB in output:
        output = output.replace(SHIM_WEB, racine + "javascripts/iframe-worker-shim.js")
    if "</head>" in output:
        output = output.replace("</head>", _tete_appli(racine) + "</head>", 1)

    def versionner(m):
        chemin = m.group(2)
        v = _empreinte(config, chemin)
        return m.group(1) + chemin + ("?v=" + v if v else "") + m.group(3)

    return re.sub(r'((?:src|href)="(?:\.\./)*)((?:javascripts|stylesheets)/[\w.-]+\.(?:js|css))(")', versionner, output)


SW = r"""// Service worker généré par tools/hooks.py — ne pas modifier à la main
const VERSION = "__VERSION__";
const FICHIERS = __FICHIERS__;
const CACHE = "eni-" + VERSION;
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n.startsWith("eni-") && n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
// Réseau d'abord (toujours la dernière version), sinon copie hors ligne
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(rep => {
      if (rep.ok && rep.type === "basic") { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(r, copie)); }
      return rep;
    }).catch(() => caches.match(r, { ignoreSearch: true })
      .then(m => m || (r.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
"""


SEPARATEUR = r"""[\s\-,:;!?=\[\]()"'/«»|.`*<>{}]+"""


def _recherche(site):
    # le plugin search écrit search_index.json (et offline : search_index.js) ;
    # on remplace juste le séparateur de mots dans leur config
    for nom, prefixe in (("search_index.json", ""), ("search_index.js", "var __index = ")):
        p = os.path.join(site, "search", nom)
        if not os.path.exists(p):
            continue
        with open(p, encoding="utf-8") as fh:
            txt = fh.read()
        if not txt.startswith(prefixe):
            continue
        d = json.loads(txt[len(prefixe):].rstrip().rstrip(";"))
        d["config"]["separator"] = SEPARATEUR
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(prefixe + json.dumps(d, ensure_ascii=False, separators=(",", ":")))


def on_post_build(config, **kwargs):
    site = config["site_dir"]
    _recherche(site)
    fichiers, h = [], hashlib.md5()
    for dossier, _, noms in os.walk(site):
        for n in sorted(noms):
            p = os.path.join(dossier, n)
            rel = os.path.relpath(p, site).replace(os.sep, "/")
            if rel == "sw.js" or rel.endswith((".zip", ".map")) or os.path.getsize(p) > 5_000_000:
                continue
            fichiers.append(rel)
            with open(p, "rb") as fh:
                h.update(rel.encode() + fh.read())
    fichiers.sort()
    if "index.html" in fichiers:  # la page d'accueil en premier
        fichiers.remove("index.html"); fichiers.insert(0, "index.html")
    sw = SW.replace("__VERSION__", h.hexdigest()[:10]).replace("__FICHIERS__", json.dumps(fichiers, ensure_ascii=False))
    with open(os.path.join(site, "sw.js"), "w", encoding="utf-8") as fh:
        fh.write(sw)
