# Mes cours ENI — mode d'emploi

Site fait avec **MkDocs Material** : tu écris tes cours en Markdown (`.md`, du texte simple),
le site (accueil, menus, recherche) se construit tout seul.

## Consulter le site sans rien installer

Ouvre `site/index.html` (double-clic). Tout marche hors ligne : schémas, recherche, quiz, simulateur…

## Installer l'outil (une seule fois)

1. Installer Python : https://www.python.org/downloads/ (cocher **"Add Python to PATH"**)
2. Dans un terminal (PowerShell) :
   ```powershell
   pip install mkdocs-material
   ```

## Écrire / modifier en voyant le résultat en direct

```powershell
cd chemin\vers\site-cours-eni
mkdocs serve
```
Puis ouvre http://127.0.0.1:8000 : la page se recharge à chaque enregistrement.

## Ajouter un module à un cours

1. Copier `MODELE-COURS.md` dans `docs/cours/<cours>/` (ex. `docs/cours/utilisation-linux/m04-arborescence.md`)
2. Le remplir (titre, contenu, schémas, exercices en bas)
3. L'ajouter dans le tableau de `docs/cours/<cours>/index.md`
4. L'ajouter dans le menu : section `nav:` en bas de `mkdocs.yml`, sous son cours :
   ```yaml
   - Utilisation d'une distribution GNU/Linux:
     - cours/utilisation-linux/index.md
     - Module 4 – Arborescence: cours/utilisation-linux/m04-arborescence.md
   ```

## Changer le statut d'un cours (À venir → En cours → Terminé)

- En haut de `docs/cours/<cours>/index.md` : la ligne `tags:` et le badge `<span class="statut ...">`
- Sur l'accueil `docs/index.md` : la carte du cours, la ligne du calendrier et l'encadré « Cette semaine »
- Classes des badges : `en-cours`, `a-venir`, `termine`

## Ajouter une image

Mets l'image dans `docs/assets/images/` puis, depuis une page de module :
`![Légende](../../assets/images/mon-image.png)`

## Mémo Markdown

| Je veux | J'écris |
|---|---|
| Titre / sous-titre | `# Titre` / `## Sous-titre` |
| Gras | `**texte**` |
| Liste | `- élément` |
| Commande | bloc entre trois accents graves ``` |
| Image | `![légende](../../assets/images/fichier.png)` |
| Encadré | `!!! tip "Titre"` puis texte indenté de 4 espaces |
| Correction cachée | `??? success "Correction"` puis texte indenté |
| Case à cocher | `- [ ] à faire` |

## Régénérer la version "double-clic"

```powershell
mkdocs build
```
Ça met à jour le dossier `site/`.

## Mettre en ligne sur GitHub Pages (optionnel)

Le fichier `.github/workflows/deploy.yml` publie le site tout seul à chaque envoi sur GitHub.

1. Crée un dépôt sur https://github.com/new (ex. `cours-eni`). **Attention** : avec un compte gratuit, GitHub Pages ne marche qu'avec un dépôt **public** → tout le monde pourra lire tes cours (n'y mets rien de confidentiel).
2. Envoie le dossier dedans (avec GitHub Desktop, ou en ligne de commande) :
   ```powershell
   cd chemin\vers\site-cours-eni
   git init -b main
   git add .
   git commit -m "Mes cours ENI"
   git remote add origin https://github.com/<ton-pseudo>/cours-eni.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings > Pages > Source = « GitHub Actions »**.
4. Après 1-2 minutes : `https://<ton-pseudo>.github.io/cours-eni/`. Ensuite, chaque `git push` met le site à jour.

La progression (quiz, badges, carnet…) reste enregistrée dans chaque navigateur : celle du site en ligne est séparée de celle de la version double-clic.

## Outils de révision (ajoutés le 09/11/2026)

Tout est généré **automatiquement à partir de tes pages** à chaque `mkdocs build` / `mkdocs serve` (script `tools/gen_data.py`, lancé par `tools/hooks.py`) : tu n'as rien à remplir à la main.

| Outil | Où | D'où viennent les données |
|---|---|---|
| Quiz, examen blanc, liste « à revoir » | Réviser | les exercices en bas des pages |
| Flashcards (répétition espacée) | Réviser | sigles, commandes, exercices |
| Fiches mémo imprimables | Réviser > Fiches mémo | les encadrés « En bref » + les tableaux de commandes |
| Commandes | Réviser > Commandes | les lignes de tableau qui commencent par `` `commande` `` |
| Glossaire + infobulles des sigles | Réviser > Glossaire | les sigles écrits **SIGLE** (*Définition en entier*) ou SIGLE (Définition…) |
| Simulateur, calculatrice IPv4, convertisseur | Réviser | — |
| Tableau de progression, frise, comptes à rebours | Accueil | le calendrier de l'accueil |
| Carnet de TP | en bas de chaque module | ce que tu écris (exportable en .md) |
| Badges | Réviser > Badges | ta progression |

- **Thèmes** : bouton palette en haut (néon, ambre, cyberpunk, matrix).
- **Terminal caché** : touche `²` (au-dessus de Tab). `help` pour les commandes. Il y a aussi un secret (indice : Konami).
- **Nouvelle fiche mémo** : quand un nouveau cours a des « En bref », sa fiche est créée dans `docs/fiches/` ; ajoute-la dans le menu (`nav:` de `mkdocs.yml`, section Fiches mémo).
- **Schémas interactifs** dans une page : `<div class="app-osi" markdown="0"></div>`, `app-encap`, `app-dora`.
- Toute ta progression est dans le navigateur (localStorage) : vider les données du navigateur l'efface. Pense à exporter ton carnet.

## Mise en forme (ajoutée le 09/11/2026)

- **Couleur et logo par cours** : automatiques, selon le dossier `docs/cours/<cours>/`. Pour changer une couleur ou un logo, modifie la liste en haut de `tools/gen_css.py` (ou directement `docs/stylesheets/cours.css`).
- **Commandes** : écris-les entre accents graves, comme sur Discord : `` `ipconfig /all` ``. Bloc de plusieurs lignes : trois accents graves avant et après (` ```bash ` … ` ``` `).
- **Surligner** : `==texte important==`.
- **Logos dans le texte** : `:fontawesome-brands-linux:`, `:simple-debian:`, `:material-powershell:`… (liste : https://squidfunk.github.io/mkdocs-material/reference/icons-emojis/). Couleur : `:simple-debian:{ style="color:#A81D33" }`.
- **Exercices interactifs** : rien à changer, garde juste le format
  `**Exercice N** : question` puis `??? success "Correction"` avec la réponse en dessous (indentée).
  Si la réponse tapée correspond à un mot en **gras** ou en `code` de la correction, elle est validée automatiquement ; sinon tu compares et tu cliques « J'avais juste » / « À revoir ». Le score est mémorisé dans ton navigateur.
- **Cases à cocher des TP** (`- [ ]`) : cliquables, mémorisées dans ton navigateur.
