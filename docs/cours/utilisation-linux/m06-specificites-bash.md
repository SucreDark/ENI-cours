---
tags:
  - Utilisation d'une distribution GNU/Linux
---

# Module 6 – Spécificités du shell Bash

!!! abstract "En bref"
    - Le **pipe** `|` envoie le résultat d'une commande à la suivante : `ls | grep .txt | wc -l`.
    - `grep` cherche du texte (`-i -e -v -n -r -l -s`) · `find` cherche des fichiers, **nativement récursif** (`-type -name -user -group -size -mtime`).
    - Actions de `find` : `-print`, `-printf`, `-exec … {} \;`, `-ok`.
    - `locate` : recherche rapide dans les noms et chemins des fichiers (pas le contenu).
    - **Regex** : modèle de recherche avec règles et caractères spéciaux (`^`, `[A-Z]`, `\d`, `\w`…), utilisé par grep, sed, awk, vi.

## 1. Effectuer des recherches

```bash
ls | grep .txt
```

- La commande `ls` **envoie son résultat** à la commande `grep`, qui **trie les `.txt`** : on a directement le résultat de la recherche au lieu de faire plusieurs commandes pour un seul résultat. D'où l'utilité du **pipe** `|`.
- Le pipe peut être **utilisé plusieurs fois** : en ajoutant `| wc -l`, on obtient au final le **nombre de lignes** du résultat de `grep`.

```bash
ls | grep .txt | wc -l
```

**Options de `grep` :**

| Commande | Rôle |
|---|---|
| `grep -i` | Ignorer la casse (majuscule ou minuscule) |
| `grep -e hello -e coucou` | Rechercher tel ou tel mot quand on en met plusieurs à la suite |
| `grep -v` | Afficher les lignes qui **ne correspondent pas** |
| `grep -n` | Afficher les numéros de ligne |
| `grep -r` | Recherche récursive (cherche aussi dans les sous-dossiers) |
| `grep -l` | Afficher seulement les noms des fichiers qui contiennent le motif |
| `grep -s` | Enlever du visuel les messages d'erreur, identique à `2>/dev/null` |

## 2. Recherches avancées (`find`)

```bash
find <chemin> [critères de recherche] (action sur le résultat)
find . -name "[Tt]el*"
```

- `find` est **nativement récursif** et permet une recherche plus poussée.
- Les critères sont **cumulables**.

**`-type` suivi de :**

| Type | Signification |
|---|---|
| `f` | Fichier standard |
| `d` | Fichier de type *directory* (dossier) |
| `l` | Lien symbolique |
| `c` | *Character device* : périphérique caractère (clavier, terminal) |
| `b` | *Block device* : périphérique bloc (disque dur) |
| `p` | *Named pipe* : tube nommé, permet à des processus de communiquer |

**Divers critères pour `find` :**

| Critère | Rôle |
|---|---|
| `find -type` | Recherche par type |
| `find -name` | Recherche par nom |
| `find -user` | Recherche des fichiers d'un propriétaire choisi |
| `find -group` | Recherche des fichiers appartenant à tel groupe |
| `find -size` | Recherche en fonction de la taille du fichier |
| `find -mtime` | Recherche par date de modification (`1` = il y a un jour) |

**Actions de `find` :**

| Action | Rôle |
|---|---|
| `find -print` | Affiche le chemin des éléments trouvés |
| `find -printf` | Personnaliser les informations affichées |
| `find -exec` | Exécution automatique de la commande qui suit |
| `find -ok` | Même principe, mais avec une **confirmation** avant |

**Formats de `-printf` :**

| Format | Affiche |
|---|---|
| `%f` | Nom du fichier |
| `%p` | Chemin complet |
| `%s` | Taille en octets |
| `%u` | Propriétaire |
| `%m` | Permissions |

```bash
find /home -type f -printf "%f\n"
find /home -type f -exec ls -l {} \;
```

- `\n` : retour à la ligne, pour éviter que le résultat soit illisible.
- `{}` : représente le **fichier trouvé** · `\;` : indique la **fin de la commande** à exécuter.
- La commande `ls -l` sera donc exécutée **pour chaque fichier trouvé**.

## 3. Introduction aux expressions régulières

**Regex** : modèle de recherche permettant de retrouver du texte grâce à des **règles** et des **caractères spéciaux**.

**Caractères d'échappement :**

| Regex | Signification |
|---|---|
| `\n` | Nouvelle ligne |
| `\r` | Retour chariot |
| `\t` | Tabulation |
| `\d` | Des chiffres |
| `\D` | Tout sauf des chiffres |
| `\s` | Séparateurs (espace, tabulation) |
| `\S` | Tout sauf des séparateurs |
| `\w` | Tous les caractères alphanumériques et `_` |
| `\W` | Tout sauf alphanumériques et `_` |
| `\` | Seul : banalise les caractères spéciaux |
| `\u` | Change le caractère suivant en majuscule |
| `\U` | Tous les caractères sont changés en majuscules jusqu'à `\E` |
| `\l` | Transforme le caractère en minuscule |
| `\L` | Change en minuscules jusqu'à `\E` |
| `\E` | Termine les séquences `\L` et `\U` |
| `\|` | « Ou » logique |

**Outils qui utilisent les regex :**

| Outil | Rôle |
|---|---|
| `vi` | Éditeur de texte dans le terminal |
| `grep` | Recherche du texte dans des fichiers |
| `sed` | Recherche et remplace du texte automatiquement |
| `awk` | Analyse et traite du texte sous forme de colonnes et de lignes |
| `ed` | Éditeur de texte en ligne de commande, ancien et minimaliste |
| `ex` | Éditeur de texte en mode ligne, lié à vi |

| Exemple | Résultat |
|---|---|
| `sed 's/chat/chien/g' fichier.txt` | Remplace tous les mots « chat » par « chien » |
| `awk '/erreur/ {print $0}' fichier.txt` | Affiche les lignes contenant le mot « erreur » |
| `grep '^[A-Z]'` | `^` sélectionne le **début** : seules les lignes dont la **première lettre** est en majuscule (sinon, une majuscule n'importe où dans le mot serait aussi affichée) |
| `grep '[[:upper:]]'` | Fait la même chose que `[A-Z]` mais fonctionne dans plus de shells |

## 4. La commande locate

| Commande | Rôle |
|---|---|
| `locate <mot>` | Recherche **rapide** par mot clé dans les **noms et chemins** des fichiers, mais **pas dans leur contenu** |

---

## Exercices

**Exercice 1** : compte le nombre de fichiers `.txt` du dossier courant en une seule ligne.

??? success "Correction"
    `ls | grep .txt | wc -l`

**Exercice 2** : dans `notes.txt`, affiche les lignes contenant « linux » (majuscules ou minuscules) avec leur numéro de ligne.

??? success "Correction"
    `grep -i -n linux notes.txt`

**Exercice 3** : affiche les lignes de `notes.txt` qui contiennent « hello » **ou** « coucou ». Puis celles qui ne contiennent pas « hello ».

??? success "Correction"
    `grep -e hello -e coucou notes.txt` · `grep -v hello notes.txt`

**Exercice 4** : différence entre `grep` et `find` ?

??? success "Correction"
    `grep` cherche du **texte dans des fichiers** · `find` cherche des **fichiers** (par nom, type, propriétaire, taille, date…), nativement récursif.

**Exercice 5** : trouve tous les dossiers de `/home` appartenant à l'utilisateur `user`.

??? success "Correction"
    `find /home -type d -user user`

**Exercice 6** : affiche seulement le nom et la taille en octets de chaque fichier de `/home`, un par ligne.

??? success "Correction"
    `find /home -type f -printf "%f %s\n"`

**Exercice 7** : que représentent `{}` et `\;` dans `find /home -type f -exec ls -l {} \;` ? Quelle option demande une confirmation avant chaque exécution ?

??? success "Correction"
    `{}` : le fichier trouvé · `\;` : la fin de la commande à exécuter. `-ok` au lieu de `-exec`.

**Exercice 8** : remplace « chat » par « chien » dans tout `fichier.txt`, puis affiche les lignes contenant « erreur » avec awk.

??? success "Correction"
    `sed 's/chat/chien/g' fichier.txt` · `awk '/erreur/ {print $0}' fichier.txt`

**Exercice 9** : que trouvent `\d`, `\s` et `\w` ? Et leurs majuscules ?

??? success "Correction"
    `\d` chiffres · `\s` séparateurs (espace, tab) · `\w` alphanumériques et `_`. En majuscule (`\D`, `\S`, `\W`) : **tout sauf** ça.

**Exercice 10** : affiche les lignes de `noms.txt` qui commencent par une majuscule, de deux façons.

??? success "Correction"
    `grep '^[A-Z]' noms.txt` · `grep '^[[:upper:]]' noms.txt`

**Exercice 11** : tu cherches un fichier dont le nom contient « passwd », puis les fichiers dont le **contenu** contient « root ». Quelle commande pour chaque cas ?

??? success "Correction"
    `locate passwd` (noms et chemins, rapide) · `grep -r root <dossier>` (contenu ; `locate` ne cherche pas dans le contenu)

---

## TP 1 – Recherches et regex

**Exercice TP 1** : recherche toutes les lignes contenant `Dupont` dans le fichier `Edition`.

??? success "Correction"
    `grep Dupont Edition`

**Exercice TP 2** : même chose pour `dupont`, quelle que soit la casse.

??? success "Correction"
    `grep -i dupont Edition`

**Exercice TP 3** : affiche toutes les lignes **non vides** du fichier `Edition`.

??? success "Correction"
    `grep -v '^$' Edition` (`^$` = une ligne qui commence et finit tout de suite, donc vide ; `-v` inverse)

**Exercice TP 4** : liste les fichiers de `/etc` contenant `localhost`, sans inclure les sous-répertoires.

??? success "Correction"
    `grep -sl localhost /etc/*` (`-l` : seulement les noms des fichiers · `-s` : sans les messages d'erreur)

**Exercice TP 5** : recherche tous les fichiers standards commençant par `ho` à partir de `/etc`.

??? success "Correction"
    `find /etc -type f -name "ho*"`

**Exercice TP 6** : recherche tous les répertoires depuis ton répertoire personnel.

??? success "Correction"
    `find ~ -type d`

**Exercice TP 7** : recherche tous les fichiers standards de ton répertoire personnel se terminant par `txt` et fais-en une copie avec l'extension `.save`.

??? success "Correction"
    `find ~ -type f -name "*txt" -exec cp {} {}.save \;`
