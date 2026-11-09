# ============================================================
#  Hooks MkDocs (déclarés dans mkdocs.yml, section hooks:)
#  1. Avant chaque build : régénère les données des outils de révision
#     (quiz, flashcards, commandes, glossaire, fiches mémo) -> tools/gen_data.py
#  2. Sur chaque page :
#     - remplace le script iframe-worker chargé depuis internet par la copie
#       locale -> la recherche marche hors ligne
#     - ajoute ?v=<empreinte> aux scripts et styles du site : après une mise à
#       jour, le navigateur recharge la nouvelle version (pas de vieux cache)
# ============================================================
import hashlib, os, re, sys

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


def on_post_page(output, page, config, **kwargs):
    profondeur = page.file.dest_uri.count("/")
    if SHIM_WEB in output:
        output = output.replace(SHIM_WEB, "../" * profondeur + "javascripts/iframe-worker-shim.js")

    def versionner(m):
        chemin = m.group(2)
        v = _empreinte(config, chemin)
        return m.group(1) + chemin + ("?v=" + v if v else "") + m.group(3)

    return re.sub(r'((?:src|href)="(?:\.\./)*)((?:javascripts|stylesheets)/[\w.-]+\.(?:js|css))(")', versionner, output)
