---
tags:
  - Utilisation d'une distribution GNU/Linux
---

# Module 5 – Utiliser des fichiers sous Linux

!!! abstract "En bref"
    - Le 1er caractère de `ls -l` donne le **type** : `-` fichier, `d` répertoire, `l` lien symbolique…
    - Un fichier = **nom** + **inode** (métadonnées) + **données**.
    - Lire : `cat`, `more`, `less`, `head`, `tail`, `wc`.
    - Liens : `ln -s` = **symbolique** (raccourci) · `ln` = **physique** (autre nom du même fichier).

## 1. Types de fichiers et de données

| Type | Signification |
|---|---|
| `-` | Fichier standard |
| `d` | Répertoire |
| `l` | Lien symbolique |
| `b` | Périphérique de type bloc |
| `c` | Périphérique de type caractère |
| `p` | Tube nommé (*pipe*) |
| `s` | Socket Unix |

| Commande | Rôle |
|---|---|
| `file <fichier>` | Connaître le type de données d'un fichier |
| `ls -i` | Voir le numéro d'**inode** d'un fichier (en début de résultat) |

Un fichier sous Linux est généralement composé de **trois parties** :

1. le **nom** du fichier ;
2. l'**inode** / les métadonnées ;
3. les **données**.

L'**inode** contient des informations telles que :

- le type de fichier ;
- les identifiants de l'utilisateur et du groupe propriétaires du fichier ;
- les permissions ;
- les dates et heures de dernière modification et d'accès ;
- la taille du fichier ;
- les pointeurs vers les données du fichier.

## 2. Lire du texte avec Linux

| Commande | Rôle |
|---|---|
| `cat <fichier>` | Lecture ou interaction avec un document (peut lire plusieurs documents à la suite) |
| `more <fichier>` | Lecture d'un fichier page par page |
| `less <fichier>` | Lecture page par page, permet aussi des recherches |
| `head <fichier>` | Affiche les **10 premières lignes** du document |
| `head -n 4 <fichier>` | Choisir le nombre de lignes (ici 4) |
| `tail <fichier>` | Pareil, mais lit **la fin** du document |
| `wc <fichier>` | Compter les lignes dans un fichier texte |

**Commandes internes de `less` :**

| Touche | Rôle |
|---|---|
| `Espace` | Faire défiler une page |
| `e` · `y` | Défiler d'une ligne vers le bas · vers le haut |
| `h` | Accéder à l'aide interne |
| `g` / `gg` · `G` | Aller au début · à la fin du fichier |
| `/mot` | Rechercher « mot » dans le texte affiché |
| `n` | Aller à l'occurrence suivante |
| `q` | Quitter |

## 3. Les liens sous Unix/Linux : liens symboliques

| Commande | Rôle |
|---|---|
| `ln [-s] <source> <cible>` | Créer un lien : la cible pointe vers le fichier ou dossier source |
| `ln -s <source> <cible>` | Créer un **lien symbolique** : en gros, la création d'un **raccourci** |
| `ls -l` | Permet ici de voir les liens |

- Il existe **deux types** de liens : **symboliques** et **physiques**.
- Les liens jouent sur les composantes des fichiers : **inodes** et **noms**.

## 4. Les liens sous Unix/Linux : liens physiques

| Commande | Rôle |
|---|---|
| `ln <source> <cible>` | Sans le `-s` : crée un **lien physique** |

- Les modifications faites sur l'un se font aussi sur l'autre.
- Différence avec le lien symbolique : si on **supprime l'un**, on a **toujours accès à l'autre**. Ce sont deux **noms différents pour le même fichier**.

---

## Exercices

**Exercice 1** : dans un `ls -l`, que signifient les lettres `d`, `l` et `-` en début de ligne ? Et `b` et `c` ?

??? success "Correction"
    `d` : répertoire · `l` : lien symbolique · `-` : fichier standard · `b` : périphérique bloc · `c` : périphérique caractère.

**Exercice 2** : quelle commande donne le type de données de `photo.jpg` ? Laquelle affiche son numéro d'inode ?

??? success "Correction"
    `file photo.jpg` · `ls -i photo.jpg`

**Exercice 3** : quelles sont les trois parties d'un fichier sous Linux ? Cite 3 informations contenues dans l'inode.

??? success "Correction"
    Nom · inode (métadonnées) · données. L'inode contient le type, les propriétaires (utilisateur et groupe), les permissions, les dates, la taille, les pointeurs vers les données.

**Exercice 4** : affiche les 4 premières lignes de `/etc/passwd`, puis les 10 dernières.

??? success "Correction"
    `head -n 4 /etc/passwd` · `tail /etc/passwd`

**Exercice 5** : différence entre `more` et `less` ? Dans `less`, comment chercher « root » puis passer au résultat suivant ? Comment quitter ?

??? success "Correction"
    Les deux lisent page par page, `less` permet aussi des recherches. `/root` puis `n`. `q` pour quitter.

**Exercice 6** : compte les lignes du fichier `notes.txt`.

??? success "Correction"
    `wc notes.txt`

**Exercice 7** : crée un raccourci `docs` vers `/home/user/Documents`. Comment le voir ?

??? success "Correction"
    `ln -s /home/user/Documents docs` puis `ls -l` (la ligne commence par `l` et montre `docs -> /home/user/Documents`).

**Exercice 8** : tu crées un lien physique `copie.txt` de `original.txt`, puis tu supprimes `original.txt`. Peux-tu encore lire le contenu ? Et si `copie.txt` était un lien symbolique ?

??? success "Correction"
    Lien physique : **oui**, c'est un autre nom pour le même fichier. Lien symbolique : **non**, le raccourci pointe vers un fichier qui n'existe plus.
