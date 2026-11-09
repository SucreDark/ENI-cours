# ============================================================
#  Hooks MkDocs (déclarés dans mkdocs.yml, section hooks:)
#  1. Avant chaque build : régénère les données des outils de révision
#     (quiz, flashcards, commandes, glossaire, fiches mémo) -> tools/gen_data.py
#  2. Sur chaque page : remplace le script iframe-worker chargé depuis
#     internet par la copie locale -> la recherche marche hors ligne
# ============================================================
import os, sys

sys.path.insert(0, os.path.dirname(__file__))
import gen_data  # noqa: E402

SHIM_WEB = "https://unpkg.com/iframe-worker/shim"


def on_pre_build(config, **kwargs):
    gen_data.generer()


def on_post_page(output, page, config, **kwargs):
    if SHIM_WEB not in output:
        return output
    profondeur = page.file.dest_uri.count("/")
    local = "../" * profondeur + "javascripts/iframe-worker-shim.js"
    return output.replace(SHIM_WEB, local)
