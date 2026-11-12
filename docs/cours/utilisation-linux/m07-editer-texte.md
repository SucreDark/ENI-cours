---
tags:
  - Utilisation d'une distribution GNU/Linux
---

# Module 7 – Éditer du texte sous Linux

!!! abstract "En bref"
    - **Vim** = éditeur natif de Linux (issu de **vi**), 2 modes : **commande** et **insertion** (`a i o A I O` pour entrer, **Échap** pour sortir).
    - `:w` enregistrer · `:wq` / `:x` enregistrer et quitter · `:q!` quitter sans enregistrer.
    - Supprimer/couper `x dw dd D` · copier `yw yy` · coller `p P` · annuler `u` · refaire `Ctrl+r`.
    - Le pouvoir de **G** : `:g/regex/commande` (`s//nouveau/g`, `m n`, `d`).
    - Fins de ligne : Linux `\n`, Windows `\r\n` → `dos2unix`, `:set ff=unix`.

## 1. Éditeurs de textes sous Linux

| Éditeur | Description |
|---|---|
| **Emacs** | Famille d'éditeurs, ouvert, extensible, riche de bibliothèques. Destiné aux programmeurs |
| **Jed** | Éditeur de texte **semi-graphique** avec coloration syntaxique. Émulation Emacs |
| **Jedit** | Éditeur de texte **graphique** avec coloration syntaxique, utilisant de multiples plugins |
| **Joe** | (*Joe's Own Editor*) Éditeur en mode shell, basé sur Emacs |
| **Nano** | Éditeur **léger** avec coloration syntaxique, apprécié des débutants, moins puissant que Vim ou Emacs |
| **Geany, Gedit, Kate, Xed…** | Éditeurs en mode **graphique** avec coloration syntaxique, en général intégrés aux distributions et/ou environnements graphiques. Équivalent d'un Notepad++ |
| **Vim** | Éditeur **natif de Linux**, issu de son ancêtre Unix **vi**. Puissant, utilisé autant par les admins systèmes que par les programmeurs. Implémente nativement les commandes **ex** |

## 2. Découverte de Vim et premières manipulations

Pour lancer Vim : `vim` ou `vi`. On peut aussi ouvrir directement un fichier : `vi Edition`.

| Commande | Rôle |
|---|---|
| `vi -R <fichier>` | Ouvrir en lecture seule |
| `vi +n <fichier>` | Positionner le curseur à la ligne `n` |
| `vi +/mot <fichier>` | Positionner le curseur au mot choisi |

**Vim utilise deux modes principaux :**

- **Mode commande** : déplacement du curseur, utiliser le presse-papier, appel à la ligne de commande.
- **Mode insertion** : saisie du texte par l'utilisateur.

### Déplacer le curseur

| Touche | Rôle |
|---|---|
| `←` ou `h` · `↓` ou `j` · `↑` ou `k` · `→` ou `l` | Gauche · bas · haut · droite |
| `w` | Début du prochain mot ou ponctuation |
| `b` | Début du mot précédent ou ponctuation |
| `e` | Fin du prochain mot ou ponctuation |
| `:n` | Se déplacer à la ligne `n` |
| `gg` ou `:0` | Début du fichier |
| `G` ou `:$` | Fin du fichier |
| `0` | Premier caractère de la ligne |
| `^` | Premier caractère du premier mot de la ligne |
| `$` | Dernier caractère de la ligne |
| `%` | Va à la prochaine accolade ou parenthèse |

### Rechercher un mot dans le texte

| Touche | Rôle |
|---|---|
| `/mot` | Recherche le terme « mot » |
| `n` | Se déplacer vers la prochaine occurrence |
| `N` | Se déplacer vers l'occurrence précédente |

### Utiliser la ligne de commande

Le caractère **`:`** place le focus sur la ligne de commande de Vim.

| Commande | Rôle |
|---|---|
| `:w` | Enregistrer les modifications |
| `:wq` | Enregistrer et quitter Vim |
| `:x` | Autre manière d'enregistrer et quitter |
| `:q` | Quitter un fichier sans modification |
| `:q!` | Quitter en ignorant les modifications |

### Passer en mode insertion (et en sortir avec Échap)

| Touche | Insertion… |
|---|---|
| `a` | Après le caractère courant |
| `i` | Avant le caractère courant |
| `o` | Au début d'une nouvelle ligne **suivant** l'actuelle |
| `A` | À la fin de la ligne courante |
| `I` | Au début de la ligne courante |
| `O` | Au début d'une nouvelle ligne **précédant** l'actuelle |

Pour **sortir** du mode insertion : touche **Échap**.

### Diverses commandes

| Commande | Rôle |
|---|---|
| `u` | Annuler la dernière action |
| `Ctrl+r` | Refaire la dernière action annulée |
| `:n` | Passer au prochain fichier ouvert |
| `:N` | Passer au fichier ouvert précédent |
| `:w fichier` | Enregistrer le contenu de l'espace de travail dans « fichier » |
| `:!cmd` | Exécuter la commande du shell `cmd` sans quitter Vim |

## 3. Copier, coller, remplacer et supprimer du texte

« `n` » est à remplacer par un **chiffre**.

### Supprimer / couper du texte

| Commande | Rôle |
|---|---|
| `nx` | Supprimer (couper) le ou les `n` caractères suivants |
| `nX` | Supprimer (couper) le ou les `n` caractères précédents |
| `D` (`nD`) | Supprimer (couper) le reste de la ligne à droite du curseur |
| `ndw` | Supprimer (couper) `n` mots |
| `ndd` | Supprimer (couper) `n` lignes à partir de la ligne courante |

### Copier-coller du texte

| Commande | Rôle |
|---|---|
| `np` | Coller `n` fois le contenu du tampon **après** le curseur |
| `nP` | Coller `n` fois le contenu du tampon **avant** le curseur |
| `nyw` | Copier les `n` mots suivant le curseur |
| `nyy` | Copier les `n` lignes suivantes |

### Gérer les tampons

On peut utiliser des **tampons de `a` à `z`**, précédés de `"`. À la fermeture de Vim, ces mémoires sont vidées.

| Commande | Rôle |
|---|---|
| `"lyy` | Copier la ligne courante dans le tampon `l` |
| `"lp` | Coller le contenu du tampon `l` |

### Changer / remplacer du texte

| Commande | Rôle |
|---|---|
| `ncl` | Couper `n` lettres et passer en mode insertion |
| `ncw` | Couper `n` mots et passer en mode insertion |
| `rc` | Remplace le caractère sous le curseur par le caractère `c` |
| `ncc` | Couper `n` lignes et passer en mode insertion |
| `R` | Mode insertion où le texte saisi remplace le texte actuel |

## 4. Le pouvoir de G

**Rechercher et remplacer :**

```
:lignes g/regex de recherche/commande de modif
```

La partie **commande de modif** a différentes formes :

| Forme | Commande |
|---|---|
| Substitution | `s/regex/regex/g` |
| Déplacement | `m n` (vers la ligne `n`) |
| Suppression | `d` |

| Exemple | Rôle |
|---|---|
| `:g/mot/d` | Supprimer les lignes contenant « mot » |
| `:15,17 g/mot/d` | Même chose, mais de la ligne 15 à 17 |
| `:g/mot/m 10` | Déplacer les lignes trouvées à la ligne 10 |
| `:30,45 g/recherche ligne/s/recherche modif/nouveau/g` | Syntaxe complète de la substitution |
| `:g/recherche/s//nouveau/g` | Version courte (le `//` reprend la recherche) |

## 5. Personnaliser l'environnement de Vim

| Commande | Rôle |
|---|---|
| `:set` | Afficher les options personnalisées |
| `:set all` | Afficher toutes les options disponibles |
| `:set option` | Activer une option |
| `:set option?` | Afficher le statut d'une option |
| `:set nooption` | Désactiver une option |
| `:syntax on` · `:syntax off` | Activer · désactiver la coloration syntaxique |

**Quelques options communes de Vim :**

| Option | Rôle |
|---|---|
| `compatible` | Activer le mode compatible vi pour Vim |
| `showmode` | Afficher le mode de travail sur la ligne de commande |
| `autoindent` | Indentation automatique (équivaut à un Tab, multi-espace), utile en programmation / scripting |
| `number` | Afficher les numéros de lignes |
| `ignorecase` | Majuscule ou minuscule ne change pas le résultat |
| `tabstop` | Définir le nombre de caractères d'un Tab (défaut 8) |

- **Fichier de paramètres** : `~/.vimrc` (les options s'y écrivent **sans** le `:`).
- **Aide interne** : `:help` (court : `:h`) ouvre l'aide de Vim. Lancée seule, elle amène sur la page « VIM - main help file ». En général on l'utilise avec un terme à rechercher : `:help insert`. Pour sortir, comme dans Vim : `:q`.

## 6. Les fins de ligne dans les fichiers textes

| Système | Fin de ligne |
|---|---|
| Linux | `\n` |
| Windows | `\r\n` |

| Commande | Rôle |
|---|---|
| `dos2unix` · `todos` | Commandes pour convertir des fichiers |
| `ffs=unix` (dans `~/.vimrc`) | Visualiser le caractère `^M` |
| `:set ff=unix` | Passer un fichier au format Unix/Linux |

---

## Exercices

**Exercice 1** : ouvre `notes.txt` en lecture seule, puis ouvre-le directement à la ligne 20.

??? success "Correction"
    `vi -R notes.txt` · `vi +20 notes.txt`

**Exercice 2** : quels sont les deux modes principaux de Vim ? Comment passer de l'un à l'autre ?

??? success "Correction"
    **Commande** (déplacements, copier/coller, `:`) et **insertion** (saisie). On entre en insertion avec `a`, `i`, `o`, `A`, `I` ou `O`, on en sort avec **Échap**.

**Exercice 3** : va au début du fichier, à la fin, puis à la ligne 12.

??? success "Correction"
    `gg` (ou `:0`) · `G` (ou `:$`) · `:12`

**Exercice 4** : différence entre `o` et `O` ? entre `a` et `A` ?

??? success "Correction"
    `o` : nouvelle ligne **après** l'actuelle · `O` : nouvelle ligne **avant**. `a` : après le caractère courant · `A` : à la fin de la ligne.

**Exercice 5** : tu as modifié un fichier par erreur et tu veux quitter sans enregistrer. Et pour enregistrer et quitter ?

??? success "Correction"
    `:q!` · `:wq` (ou `:x`)

**Exercice 6** : supprime 3 lignes, puis colle-les sous une autre ligne. Annule, puis refais.

??? success "Correction"
    `3dd`, se placer sur la ligne, `p`. `u` pour annuler, `Ctrl+r` pour refaire.

**Exercice 7** : copie 2 mots, puis copie la ligne courante dans le tampon `a` et colle-la.

??? success "Correction"
    `2yw` · `"ayy` puis `"ap`

**Exercice 8** : remplace le mot sous le curseur par « test ». Et une seule lettre par `x` ?

??? success "Correction"
    `cw` puis taper `test` (puis Échap) · `rx`

**Exercice 9** : remplace tous les « chat » par « chien » dans tout le fichier avec G. Puis supprime les lignes contenant « brouillon ».

??? success "Correction"
    `:g/chat/s//chien/g` · `:g/brouillon/d`

**Exercice 10** : affiche les numéros de ligne et des tabulations de 4 caractères, pour cette session puis de façon permanente.

??? success "Correction"
    `:set number` et `:set tabstop=4` · permanent : écrire `set number` et `set tabstop=4` dans `~/.vimrc` (sans `:`).

**Exercice 11** : un script écrit sous Windows affiche des `^M`. Pourquoi ? Comment le corriger ?

??? success "Correction"
    Windows termine les lignes par `\r\n` (Linux : `\n`). `dos2unix script.sh`, ou dans Vim `:set ff=unix` puis `:w`.

**Exercice 12** : sans quitter Vim, affiche la liste des fichiers du dossier courant.

??? success "Correction"
    `:!ls`

---

## TP – Utilisation de Vi

**Exercice TP 1** : ouvre le fichier `Edition` de ton répertoire d'accueil avec vi.

??? success "Correction"
    `vi Edition`

**Exercice TP 2** : le premier Dupont Jean se prénomme en fait Jean-Jacques. Recherche la première occurrence de `Dupont Jean`.

??? success "Correction"
    `/Dupont Jean`

**Exercice TP 3** : déplace-toi sur le `n` de Jean puis insère `-Jacques`.

??? success "Correction"
    `2e` (fin du 2e mot), `a`, puis taper `-Jacques`

**Exercice TP 4** : de la même manière, recherche `Dupont Pierre` et insère `Jean-` après t'être placé sur le P de Pierre.

??? success "Correction"
    `/Dupont Pierre`, `w`, `i`, puis taper `Jean-`

**Exercice TP 5** : replace-toi en début de fichier.

??? success "Correction"
    Échap puis `gg`

**Exercice TP 6** : cherche le premier Dupont et insère, sur la ligne précédente, ton nom et prénom.

??? success "Correction"
    `/Dupont`, `O`, puis taper son nom et prénom

**Exercice TP 7** : entre le nom et le prénom de ton voisin après la ligne du dernier Dupont. Déplace-toi sur les différentes occurrences avec `n` et `N`.

??? success "Correction"
    `G`, `?Dupont` (recherche vers le haut), `o`, puis taper le nom du voisin

**Exercice TP 8** : enregistre les modifications et sors de l'éditeur.

??? success "Correction"
    `:wq`

**Exercice TP 9** : Dupont Jean s'appelle en fait Merlin-Duval Jean. Recherche `Dupont Jean` et change Dupont par Merlin-Duval.

??? success "Correction"
    `vi Edition`, `/Dupont Jean`, `n`, puis `cw` et taper `Merlin-Duval`

**Exercice TP 10** : supprime la ligne `Couteau Jean` après l'avoir retrouvée.

??? success "Correction"
    `/Couteau Jean` puis `dd`

**Exercice TP 11** : change tous les Dupont en Durand.

??? success "Correction"
    `:g/Dupont/s//Durand/g`

**Exercice TP 12** : déplace toutes les lignes contenant Durand en fin de fichier.

??? success "Correction"
    `:g/Durand/m$`

**Exercice TP 13** : ajoute un second Ben Raf en dupliquant la ligne existante.

??? success "Correction"
    `/Ben Raf`, `yy`, `p`

**Exercice TP 14** : sans sortir de vi, affiche la date et l'heure.

??? success "Correction"
    `:!date`

**Exercice TP 15** : crée un fichier `.vimrc` dans `$HOME` qui affiche les numéros de lignes, met les tabulations tous les 5 caractères et passe en mode non compatible.

??? success "Correction"
    `vi ~/.vimrc`, `i`, puis :

    ```
    set number
    set tabstop=5
    set nocompatible
    ```

**Exercice TP 16** : recherche et remplace tous les Durand en Dupont.

??? success "Correction"
    `vi Edition` puis `:g/Durand/s//Dupont/`

**Exercice TP 17** : substitue Jean en Jean-Paul.

??? success "Correction"
    `:g/Jean /s/Jean/&-Paul` (attention à l'**espace** après Jean ; `&` reprend le texte trouvé)

**Exercice TP 18** : substitue Jean en JEAN, sans écrire JEAN dans l'expression régulière.

??? success "Correction"
    `:g/\(Jean\)/s//\U\1/` (`\U` passe en majuscules, `\1` reprend ce qui est entre `\(` `\)`)

**Exercice TP 19** : substitue JEAN en Jean en modifiant le séparateur de l'expression régulière.

??? success "Correction"
    Solution du corrigé : `:g/JEAN/s//Jean/`. Avec un autre séparateur que `/`, par exemple `#` : `:g#JEAN#s##Jean#`

**Exercice TP 20** : substitue Jean en Jean-Jean sur tout le texte.

??? success "Correction"
    `:%s/Jean/Jean-Jean/` (`%` = tout le fichier)

**Exercice TP 21** : ajoute `(033)` devant chaque numéro (en fin de ligne) commençant par 1, 2 ou 3. Exemple : `Frederic Thouin (033)124666`.

??? success "Correction"
    `:%s/\<[1-3]/(033)&/` (`\<` = début de mot)

**Exercice TP 22** : ajoute `0` à la fin de toutes les lignes qui commencent par F.

??? success "Correction"
    `:g/^F/s/$/0/` (`^` début de ligne, `$` fin de ligne)
