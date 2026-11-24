---
tags:
  - Administration d'une distribution GNU/Linux
---

# Module 11 – Droits sur les fichiers et répertoires

!!! abstract "En bref"
    - 3 catégories : **u** (propriétaire), **g** (groupe), **o** (autres), **a** (tous) · 3 droits : **r** = 4, **w** = 2, **x** = 1.
    - Octal : on additionne → `rwxr-x---` = **750** · voir les droits : `ls -ld`.
    - `chmod` (droits), `chown user:group` (propriétaires), `-R` = récursif.
    - **umask** (0022 sur Debian) : fichiers 666 − 022 = **644**, répertoires 777 − 022 = **755**.
    - Droits spéciaux : **setUID** (4, `s`), **setGID** (2, `s`), **sticky bit** (1, `t`) · ex. `chmod 2770 dossier`.

## 1. Les 3 catégories de droits (3 groupes de 3)

| Lettre | Catégorie |
|---|---|
| `u` (user) | Utilisateur propriétaire |
| `g` (group) | Groupe propriétaire |
| `o` (other) | Les autres utilisateurs |
| `a` (all) | Tout le monde |

## 2. Les 3 droits

| Droit | Valeur | Sur un fichier | Sur un dossier |
|---|---|---|---|
| `r` (read) | 4 | Lire le fichier (`cat`) | Lister le contenu (`ls`) |
| `w` (write) | 2 | Modifier le fichier | Créer, supprimer, renommer |
| `x` (execute) | 1 | Exécuter un programme | Traverser / accéder au dossier (`cd`) |

### Calcul en octal

On additionne les valeurs des droits :

| Droits | Calcul | Valeur |
|---|---|---|
| `rwx` | 4 + 2 + 1 | 7 |
| `rw-` | 4 + 2 | 6 |
| `r-x` | 4 + 1 | 5 |
| `r--` | 4 | 4 |
| `---` | 0 | 0 |

Exemple : `rwxr-x---` → **750** (user : 7, group : 5, other : 0).

### Afficher les droits

`ls -ld` : afficher les droits (fichiers et répertoires).

```
drwxr-xr-x user30 user30 dossier
```

| Partie | Signification |
|---|---|
| `d` | Répertoire |
| `rwx` | Droits du propriétaire |
| `r-x` | Droits du groupe |
| `r-x` | Droits des autres |

Autres types : `-` fichier classique · `d` répertoire · `l` lien symbolique.

---

## 3. Modifier les droits : chmod

```
chmod [-R] [ugoa][+-=][rwxX] fichier ou dossier
```

| Symbole | Rôle |
|---|---|
| `+` | Ajouter des droits |
| `-` | Retirer des droits |
| `=` | Remplacer les droits |
| `-R` | Récursif (dossier + contenu) |

Exemple : `chmod g+w,o-rx /data/commun`

- `g+w` : ajoute l'écriture au groupe
- `o-rx` : retire lecture et exécution aux autres

| Méthode | Exemple | Résultat |
|---|---|---|
| Octale | `chmod 770 /data/commun` | `rwxrwx---` |
| Récursive | `chmod -R g+w,o-rw /data/commun` | Sur le dossier et tout son contenu |

!!! warning "Attention"
    `-R` modifie aussi **tous les fichiers et sous-dossiers** à l'intérieur.

---

## 4. Modifier les propriétaires : chown

Permet de modifier l'utilisateur propriétaire et/ou le groupe propriétaire.

```
chown [-R] [user]:[group] fichier ou dossier
```

| Exemple | Rôle |
|---|---|
| `chown penthium:users /data` | Le propriétaire devient `penthium` et le groupe devient `users` |
| `chown -R :users /data/commun` | Change uniquement le groupe en `users`, sur le dossier et son contenu |

| Élément | Rôle |
|---|---|
| `-R` | Récursif |
| `user:group` | Modifie utilisateur + groupe |
| `:group` | Modifie uniquement le groupe |

---

## 5. Le masque de droits : umask

L'umask détermine les droits attribués lors de la **création** des fichiers et dossiers.

| Type | Droits maximum à la création |
|---|---|
| Fichier | 666 (`rw-rw-rw-`) |
| Répertoire | 777 (`rwxrwxrwx`) |

Sur Debian, l'umask par défaut est généralement **0022**. Donc avec un umask 0022 :

- fichiers : 666 − 022 = **644**
- répertoires : 777 − 022 = **755**

| Commande | Rôle |
|---|---|
| `umask` | Afficher l'umask |
| `umask 0007` | Modifier l'umask |

**La rendre permanente pour bash** : ajouter la commande `umask` dans **`~/.bashrc`**.

!!! note "À retenir"
    L'umask de root et des utilisateurs de service (UID inférieur à 1000) doit rester à **0022**.

---

## 6. Les droits spéciaux

Il existe 3 droits spéciaux :

| Droit | Valeur octale | Fonction |
|---|---|---|
| **setUID** | 4--- | Exécuter un fichier avec les droits de son propriétaire |
| **setGID** | 2--- | Exécuter avec les droits du groupe propriétaire |
| **sticky bit** | 1--- | Empêche de supprimer les fichiers des autres dans un dossier |

### setUID (s/S)

Sur un fichier exécutable, permet d'exécuter celui-ci avec les droits de son propriétaire.

Exemple : `/usr/bin/passwd` s'exécute avec les droits de root pour pouvoir modifier les fichiers des mots de passe.

- `s` : setUID + droit d'exécution présent
- `S` : setUID présent, mais droit d'exécution absent

### setGID (s/S)

- **Sur un fichier** : exécution avec les droits du groupe propriétaire.
- **Sur un répertoire** : les fichiers créés héritent du groupe du répertoire parent, et les sous-répertoires héritent du setGID.

Exemple : `/usr/bin/crontab`

- `s` : setGID + exécution
- `S` : setGID sans exécution

### Sticky bit (t/T)

Sur un répertoire, les fichiers créés ne peuvent être supprimés que par **leur propriétaire** et **root**.

Exemple : `/tmp`

- `t` : sticky bit + exécution
- `T` : sticky bit sans exécution

### Modifier les droits spéciaux avec chmod

```
chmod [-R] [ugoa][+-=][st] fichier ou dossier
```

| Commande | Rôle |
|---|---|
| `chmod u+s fichier` | Ajouter setUID |
| `chmod g+s dossier` | Ajouter setGID |
| `chmod o+t dossier` | Ajouter sticky bit |
| `chmod u-s fichier` | Retirer setUID |
| `chmod g-s dossier` | Retirer setGID |
| `chmod o-t dossier` | Retirer sticky bit |

### En octal

Le **premier chiffre** correspond aux droits spéciaux :

| Chiffre | Droit spécial |
|---|---|
| 4 | setUID |
| 2 | setGID |
| 1 | Sticky bit |
| 0 | Aucun |

Exemple : `chmod 2770 dossier` → setGID + `rwxrwx---`

---

## Exercices

**Exercice 1** : que signifient `u`, `g`, `o` et `a` ? Quelle est la valeur de `r`, `w` et `x` ?

??? success "Correction"
    - `u` : propriétaire · `g` : groupe propriétaire · `o` : autres · `a` : tout le monde.
    - `r` = 4 · `w` = 2 · `x` = 1.

**Exercice 2** : que permet le droit `x` sur un fichier ? Et sur un dossier ? Même question pour `w`.

??? success "Correction"
    - `x` : exécuter un programme · sur un dossier : le traverser / y accéder (`cd`).
    - `w` : modifier le fichier · sur un dossier : créer, supprimer, renommer.

**Exercice 3** : convertis en octal : `rwxr-x---`, `rw-r--r--`, `rwxrwx---`.

??? success "Correction"
    - `rwxr-x---` = **750**
    - `rw-r--r--` = **644**
    - `rwxrwx---` = **770**

**Exercice 4** : lis la ligne `drwxr-xr-x user30 user30 dossier`.

??? success "Correction"
    `d` : répertoire · `rwx` : droits du propriétaire · `r-x` : droits du groupe · `r-x` : droits des autres. Propriétaire `user30`, groupe `user30`.

**Exercice 5** : sur `/data/commun`, ajoute l'écriture au groupe et retire lecture et exécution aux autres (méthode symbolique).

??? success "Correction"
    ```bash
    chmod g+w,o-rx /data/commun
    ```

**Exercice 6** : donne à `/data/commun` les droits `rwxrwx---` en octal, sur le dossier et tout son contenu.

??? success "Correction"
    ```bash
    chmod -R 770 /data/commun
    ```

**Exercice 7** : le propriétaire de `/data` doit devenir `penthium` et le groupe `users`. Puis change uniquement le groupe de `/data/commun` (et son contenu) en `users`.

??? success "Correction"
    ```bash
    chown penthium:users /data
    chown -R :users /data/commun
    ```

**Exercice 8** : avec un umask de 0022, quels droits reçoivent un nouveau fichier et un nouveau répertoire ?

??? success "Correction"
    - Fichier : 666 − 022 = **644** (`rw-r--r--`)
    - Répertoire : 777 − 022 = **755** (`rwxr-xr-x`)

**Exercice 9** : affiche l'umask, passe-le à 0007, et rends-le permanent pour bash. Quels comptes doivent garder 0022 ?

??? success "Correction"
    ```bash
    umask
    umask 0007
    ```

    Ajouter `umask 0007` dans `~/.bashrc`. Root et les utilisateurs de service (UID < 1000) doivent rester à 0022.

**Exercice 10** : pourquoi `/usr/bin/passwd` a-t-il le setUID ? Que signifie un `S` majuscule ?

??? success "Correction"
    - Il s'exécute avec les droits de **root** pour pouvoir modifier les fichiers des mots de passe.
    - `S` : setUID présent, mais droit d'exécution absent.

**Exercice 11** : tu veux que tous les fichiers créés dans `/data/commun` appartiennent automatiquement au groupe du dossier. Quel droit spécial, et quelle commande ?

??? success "Correction"
    Le **setGID** sur le répertoire :

    ```bash
    chmod g+s /data/commun
    ```

**Exercice 12** : dans `/data/partage`, chacun doit pouvoir créer des fichiers, mais personne ne doit supprimer ceux des autres. Quel droit spécial ? Quel dossier système l'utilise ?

??? success "Correction"
    Le **sticky bit** : `chmod o+t /data/partage`. Exemple système : `/tmp`.

**Exercice 13** : que fait `chmod 2770 dossier` ? Et `chmod 1777 dossier` ?

??? success "Correction"
    - `2770` : setGID + `rwxrwx---`
    - `1777` : sticky bit + `rwxrwxrwx`
