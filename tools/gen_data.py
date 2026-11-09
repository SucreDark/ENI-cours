"""
Génère automatiquement, à partir de tes pages de cours :
  - docs/javascripts/donnees.js  : exercices, commandes, sigles, pages, calendrier
                                   (utilisé par le quiz, l'examen, les flashcards,
                                   la page Commandes, le glossaire, le terminal…)
  - docs/fiches/<cours>.md       : une fiche mémo par cours (les « En bref » + les commandes)
  - includes/abreviations.md     : infobulles des sigles dans toutes les pages

Lancé automatiquement à chaque `mkdocs build` / `mkdocs serve` (voir tools/hooks.py).
Tu n'as rien à faire : écris tes cours normalement.
"""
import os, re, json, yaml, unicodedata
import markdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")

MD_EXT = ["tables", "attr_list", "md_in_html", "pymdownx.keys", "pymdownx.mark",
          "pymdownx.inlinehilite", "pymdownx.superfences", "pymdownx.emoji"]
try:
    from material.extensions.emoji import twemoji, to_svg
    MD_CFG = {"pymdownx.emoji": {"emoji_index": twemoji, "emoji_generator": to_svg}}
except Exception:  # pragma: no cover
    MD_EXT.remove("pymdownx.emoji"); MD_CFG = {}

def md2html(txt):
    return markdown.markdown(txt, extensions=MD_EXT, extension_configs=MD_CFG).strip()

def md_inline(txt):
    h = md2html(txt)
    return re.sub(r"^<p>(.*)</p>$", r"\1", h, flags=re.S)

def ecrire_si_change(path, contenu):
    """N'écrit que si le contenu change (évite les boucles avec `mkdocs serve`)."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path) and open(path, encoding="utf-8").read() == contenu:
        return False
    open(path, "w", encoding="utf-8").write(contenu)
    return True

def lire_nav():
    """Liste ordonnée (cours_id, titre_cours, [(fichier, titre_module)]) depuis mkdocs.yml."""
    class L(yaml.SafeLoader): pass
    L.add_multi_constructor("!", lambda loader, suffix, node: None)
    L.add_multi_constructor("tag:yaml.org,2002:python/", lambda loader, suffix, node: None)
    cfg = yaml.load(open(os.path.join(ROOT, "mkdocs.yml"), encoding="utf-8"), Loader=L)
    res = []
    for item in cfg.get("nav", []):
        if isinstance(item, dict) and "Cours" in item:
            for c in item["Cours"]:
                (titre, sous), = c.items()
                mods, cid = [], None
                for s in sous:
                    if isinstance(s, str):
                        cid = s.split("/")[1]
                    else:
                        (mt, f), = s.items()
                        cid = f.split("/")[1]
                        mods.append((f, mt))
                res.append((cid, titre, mods))
    return res

def sans_front_matter(txt):
    return re.sub(r"\A---\n.*?\n---\n", "", txt, flags=re.S)

def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")

# ---------------------------------------------------------------- exercices
def extraire_exos(txt):
    lignes = sans_front_matter(txt).split("\n")
    exos, i, fence = [], 0, False
    while i < len(lignes):
        l = lignes[i]
        if l.strip().startswith("```"): fence = not fence
        m = None if fence else re.match(r"^\*\*(Exercice[^*]*)\*\*\s*:?\s*(.*)$", l)
        if not m:
            i += 1; continue
        q = [m.group(2)]; j = i + 1
        while j < len(lignes) and not lignes[j].startswith("??? success") and not re.match(r"^(#|\*\*Exercice)", lignes[j]):
            q.append(lignes[j]); j += 1
        if j >= len(lignes) or not lignes[j].startswith("??? success"):
            i = j; continue
        r, k = [], j + 1
        while k < len(lignes) and (lignes[k].startswith("    ") or lignes[k].strip() == ""):
            r.append(lignes[k][4:] if lignes[k].startswith("    ") else ""); k += 1
        exos.append({"titre": m.group(1).strip(), "q": md2html("\n".join(q).strip()), "r": md2html("\n".join(r).strip())})
        i = k
    return exos

# ---------------------------------------------------------------- commandes
def extraire_commandes(txt):
    cmds, fence = [], False
    for l in sans_front_matter(txt).split("\n"):
        if l.strip().startswith("```"): fence = not fence
        if fence or not l.startswith("|"): continue
        cells = [c.strip() for c in re.split(r"(?<!\\)\|", l.strip().strip("|"))]
        if len(cells) < 2 or not cells[0].startswith("`") or set(cells[0]) <= set("-: "): continue
        role = next((c for c in cells[1:] if c and not c.startswith("`")), "")
        if not role: continue
        cmds.append({"cmd": md_inline(cells[0].replace("\\|", "|")), "texte": re.sub(r"`", "", cells[0]).replace("\\|", "|"), "role": md_inline(role.replace("\\|", "|"))})
    return cmds

# ---------------------------------------------------------------- sigles
SIG = [re.compile(r"\*\*(\.?[A-Za-z][A-Za-z0-9]{1,6})\*\*\s*\(\*?([A-Z][^()*]{3,80}?)\*?\)"),
       re.compile(r"(?<![\w*`.])([A-Z][A-Z0-9]{1,6})\s+\(\*?([A-Z][^()*]{3,80}?)\*?\)")]
def extraire_sigles(txt):
    res, fence = [], False
    for l in sans_front_matter(txt).split("\n"):
        if l.strip().startswith("```"): fence = not fence
        if fence: continue
        for rx in SIG:
            for s, d in rx.findall(l):
                base = s.lstrip(".")
                if not (base.isupper() or base.lower() == "saas" or s.startswith(".")): continue
                mots = d.split()
                if len(mots) < 2 or "=" in d or len(set(base)) < 2 or norm(d[0]) != norm(base[0]): continue
                res.append((s, d.strip()))
    return res

# ---------------------------------------------------------------- en bref
def extraire_en_bref(txt):
    m = re.search(r'^!!! abstract "En bref"\n((?:    .*\n|\n)+)', sans_front_matter(txt), flags=re.M)
    if not m: return ""
    corps = "\n".join(l[4:] for l in m.group(1).rstrip().split("\n"))
    return "" if "À remplir" in corps else corps.strip()

def lire_index_cours(cid):
    p = os.path.join(DOCS, "cours", cid, "index.md")
    txt = open(p, encoding="utf-8").read() if os.path.exists(p) else ""
    st = re.search(r'class="statut ([\w-]+)"', txt)
    dates = re.search(r":material-calendar:\s*(.+)", txt)
    return (st.group(1) if st else "a-venir"), (dates.group(1).strip() if dates else "")

# ---------------------------------------------------------------- calendrier
def parse_date(s, annee_defaut=None):
    m = re.match(r"(\d{2})/(\d{2})(?:/(\d{4}))?", s.strip())
    if not m: return None
    return f"{m.group(3) or annee_defaut}-{m.group(2)}-{m.group(1)}"

def lire_calendrier():
    txt = open(os.path.join(DOCS, "index.md"), encoding="utf-8").read()
    cal = []
    for l in txt.split("\n"):
        m = re.match(r"^\| ([^|]+) \| (.+?) \| <span class=\"statut ([\w-]+)\">", l)
        if not m: continue
        dates, cours, st = m.groups()
        lien = re.match(r"\[(.+?)\]\((.+?)\)", cours)
        titre = lien.group(1) if lien else cours.strip()
        url = lien.group(2).replace(".md", ".html") if lien else ""
        debut = fin = None
        if "→" in dates:
            a, b = [x.strip() for x in dates.split("→")]
            fin = parse_date(b); debut = parse_date(a, fin[:4] if fin else None)
        cal.append({"dates": dates.strip(), "titre": titre, "statut": st, "url": url, "debut": debut, "fin": fin})
    return cal

# ---------------------------------------------------------------- main
def generer():
    nav = lire_nav()
    from importlib import util
    spec = util.spec_from_file_location("gen_css", os.path.join(ROOT, "tools", "gen_css.py"))
    src = open(spec.origin, encoding="utf-8").read().split("def uri")[0]
    ns = {}; exec(src.replace("import os, re, base64, material, sys", "import os, re, base64, material, sys"), ns)
    couleurs = ns["COURS"]

    data = {"cours": [], "pages": [], "exos": [], "commandes": [], "glossaire": [], "calendrier": lire_calendrier()}
    sigles = {}
    fiches = {}
    for cid, ctitre, mods in nav:
        st, dates = lire_index_cours(cid)
        coul, icone = couleurs.get(cid, ("#3f51b5", "material/school"))
        data["cours"].append({"id": cid, "titre": ctitre, "statut": st, "dates": dates, "couleur": coul,
                              "url": f"cours/{cid}/index.html", "nbModules": len(mods)})
        data["pages"].append({"cours": cid, "titre": ctitre, "url": f"cours/{cid}/index.html", "fichier": "index"})
        for f, mt in mods:
            p = os.path.join(DOCS, f)
            if not os.path.exists(p): continue
            txt = open(p, encoding="utf-8").read()
            url = f.replace(".md", ".html"); fichier = os.path.basename(f)[:-3]
            data["pages"].append({"cours": cid, "titre": mt, "url": url, "fichier": fichier})
            for i, e in enumerate(extraire_exos(txt)):
                e.update({"id": f"{url}#{i}", "cours": cid, "module": mt, "url": url, "idx": i})
                data["exos"].append(e)
            cmds = extraire_commandes(txt)
            for c in cmds:
                c.update({"cours": cid, "module": mt, "url": url})
                data["commandes"].append(c)
            for s, d in extraire_sigles(txt):
                sigles.setdefault(s, {"sigle": s, "def": d, "cours": cid, "module": mt, "url": url})
            eb = extraire_en_bref(txt)
            if eb or cmds:
                fiches.setdefault(cid, (ctitre, []))[1].append((mt, url, eb, cmds))
    data["glossaire"] = sorted(sigles.values(), key=lambda x: norm(x["sigle"].lstrip(".")))

    js = ("/* Généré automatiquement par tools/gen_data.py : ne pas modifier à la main */\n"
          "window.SITE_ROOT = (function(){ var s = document.currentScript && document.currentScript.src || '';"
          " return s.replace(/javascripts\\/donnees\\.js.*$/, ''); })();\n"
          "window.SITE_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
    ecrire_si_change(os.path.join(DOCS, "javascripts", "donnees.js"), js)

    # Fiches mémo
    liste = []
    for cid, (ctitre, mods) in fiches.items():
        out = [f"---\ntags:\n  - Fiche mémo\n---\n", f"# Fiche mémo – {ctitre}\n",
               '<div class="fiche-actions" markdown="0"><button class="exo-btn" onclick="window.print()">🖨 Imprimer / PDF</button></div>\n',
               "!!! info \"Fiche générée automatiquement\"\n    Les « En bref » et les commandes de chaque module de ce cours, rien de plus.\n"]
        for mt, url, eb, cmds in mods:
            out.append(f"## {mt}\n")
            if eb: out.append(eb + "\n")
            if cmds:
                out.append("| Commande | Rôle |\n|---|---|")
                for c in cmds:
                    out.append(f"| {html_to_md_cell(c['cmd'])} | {html_to_md_cell(c['role'])} |")
                out.append("")
            out.append(f"[:octicons-arrow-right-24: Voir le module](../{url.replace('.html', '.md')})\n")
        ecrire_si_change(os.path.join(DOCS, "fiches", f"{cid}.md"), "\n".join(out))
        liste.append((cid, ctitre))
    idx = ["# Fiches mémo\n", "Une fiche d'une page par cours, imprimable en PDF (bouton *Imprimer* ou ++ctrl+p++).\n", "| Cours | |", "|---|---|"]
    for cid, ct in liste:
        idx.append(f"| [{ct}]({cid}.md) | [:material-printer: Fiche]({cid}.md) |")
    ecrire_si_change(os.path.join(DOCS, "fiches", "index.md"), "\n".join(idx) + "\n")

    # Infobulles des sigles
    ab = "\n".join(f"*[{g['sigle']}]: {g['def']}" for g in data["glossaire"] if not g["sigle"].startswith("."))
    ecrire_si_change(os.path.join(ROOT, "includes", "abreviations.md"), ab + "\n")
    return data, [c for c, _ in liste]

def html_to_md_cell(h):
    """Petit convertisseur HTML → Markdown pour les cellules (code, gras, italique)."""
    h = re.sub(r"<code>(.*?)</code>", lambda m: "`" + m.group(1).replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&") + "`", h)
    h = re.sub(r"</?strong>", "**", h); h = re.sub(r"</?em>", "*", h)
    h = re.sub(r"<[^>]+>", "", h)
    return h.replace("|", "\\|")

if __name__ == "__main__":
    d, f = generer()
    print(f"{len(d['exos'])} exos, {len(d['commandes'])} commandes, {len(d['glossaire'])} sigles, fiches : {f}")
