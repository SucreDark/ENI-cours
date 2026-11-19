---
tags:
  - Administration d'une distribution GNU/Linux
---

# Module 6 – Gestion des paquets logiciels

!!! abstract "En bref"
    - Branches : stable, testing, unstable (**Sid**), oldstable (R-1), oldoldstable (R-2), experimental.
    - Dépôts configurés dans **`/etc/apt/sources.list`** (+ dossier `/etc/apt/sources.list.d`).
    - Ligne de dépôt : `deb http://ftp.fr.debian.org/debian/ bookworm main contrib` → type, adresse, branche, sections.
    - APT : `apt update`, `upgrade`, `full-upgrade`, `install`, `remove`, `purge`, `clean`, `search`, `show`.
    - `dpkg -l` / `-L` / `-S` · logs : `/var/log/apt/history.log` et `/var/log/dpkg.log`.
    - Depuis les sources : `./configure` → `make` → `make install` (seule la dernière étape en root).

## 1. Les branches Debian

| Branche | Rôle |
|---|---|
| **stable** | Version recommandée pour la production |
| **testing** | Future version stable |
| **unstable** | Version en constante évolution, appelée **Sid** |
| **oldstable** | Ancienne version stable (R-1) |
| **oldoldstable** | Version stable encore antérieure (R-2) |
| **experimental** | Paquets en cours de développement |

---

## 2. Les dépôts logiciels

Un **dépôt** (*repository*) est un emplacement sur Internet qui contient des paquets logiciels et leurs sources.

Ils permettent de :

- mettre à jour Debian
- installer de nouveaux logiciels sans chercher manuellement les fichiers sur Internet

Le fichier qui contient la configuration des dépôts est **`/etc/apt/sources.list`**. Pour le modifier, on utilise `vim`.

Il existe également le dossier **`/etc/apt/sources.list.d`** : il permet d'ajouter des fichiers de dépôts indépendants.

### Comprendre une ligne de dépôt

```
deb http://ftp.fr.debian.org/debian/ bookworm main contrib
```

| Élément | Signification |
|---|---|
| `deb` | Paquet binaire |
| `deb-src` | Paquet source |
| `http://...` | Adresse du dépôt |
| `bookworm` | Branche ou version Debian |
| `main` | Paquets libres standards |
| `contrib` | Paquets libres dépendant de paquets non libres |
| `non-free` | Paquets sous licence non libre |

Autres sources possibles : `ftp://`, `file://` et `cdrom:[...]`.

---

## 3. Gestion courante des paquets avec APT

Les commandes principales sont **`apt`**, **`apt-get`** et **`apt-cache`**.

Les recherches et consultations peuvent être réalisées avec un utilisateur standard. Les opérations qui modifient le système nécessitent les **privilèges root**.

| Commande | Rôle |
|---|---|
| `apt update` | Actualiser la liste des paquets disponibles |
| `apt upgrade` | Mettre à jour les paquets **sans suppression** |
| `apt full-upgrade` | Mise à jour complète, **avec suppression éventuelle** |
| `apt install paquet` | Installer un paquet |
| `apt remove paquet` | Désinstaller un paquet |
| `apt purge paquet` | Désinstaller avec suppression de la configuration |
| `apt clean` | Nettoyer les fichiers téléchargés |
| `apt search expression` | Rechercher un paquet |
| `apt show paquet` | Afficher les informations d'un paquet |

---

## 4. La commande dpkg

`dpkg` est la **base du système de gestion des paquets Debian**. C'est l'équivalent de `rpm` pour les distributions Red Hat.

Elle permet notamment d'installer, mettre à jour, supprimer et obtenir des informations sur les paquets.

| Commande | Rôle |
|---|---|
| `dpkg -l "*ftp*"` | Lister les paquets contenant « ftp » |
| `dpkg -L telnet` | Lister les fichiers installés par un paquet |
| `dpkg -S /usr/bin/scp` | Trouver le paquet à l'origine d'un fichier |

---

## 5. Les fichiers journaux (logs)

Ils permettent de consulter l'**historique des installations et des mises à jour**.

| Outil | Fichier journal |
|---|---|
| `apt` ou `apt-get` | `/var/log/apt/history.log` |
| `dpkg` | `/var/log/dpkg.log` |

APT et `apt-get` s'appuient sur `dpkg` pour effectuer les installations. On retrouve donc les interventions sur les paquets dans les logs de `dpkg`.

---

## 6. Installer un logiciel à partir des sources

C'est une autre méthode d'installation, **native sur Unix/Linux**. Elle est plus complexe et nécessite plusieurs étapes.

1. **Préparer l'environnement** : créer un espace de compilation avec un utilisateur **qui n'est pas root**.
2. **Lire la documentation** : consulter les fichiers `README` ou `INSTALL` pour connaître les étapes et les dépendances nécessaires.
3. **Préparer et compiler** :

    | Commande | Rôle |
    |---|---|
    | `./configure` | Vérifie les dépendances et génère le fichier `Makefile` |
    | `make` | Compile l'application à partir des sources |

    À ce stade, l'application est fonctionnelle, mais pas encore installée dans le système.

4. **Installer** : `make install`. Cette dernière étape se réalise avec les **privilèges root** : elle copie l'application dans les répertoires système.

!!! tip "Mémo"
    `./configure` → `make` → `make install` : **seule la dernière étape nécessite root**.

---

## Exercices

**Exercice 1** : quelle branche Debian est appelée Sid ? Laquelle utiliser en production ?

??? success "Correction"
    - Sid = **unstable**.
    - En production : **stable**.

**Exercice 2** : dans quel fichier sont configurés les dépôts ? Et où ajouter des fichiers de dépôts indépendants ?

??? success "Correction"
    - `/etc/apt/sources.list`
    - Dossier `/etc/apt/sources.list.d`

**Exercice 3** : explique chaque élément de la ligne `deb http://ftp.fr.debian.org/debian/ bookworm main contrib`.

??? success "Correction"
    - `deb` : paquet binaire
    - `http://ftp.fr.debian.org/debian/` : adresse du dépôt
    - `bookworm` : branche ou version Debian
    - `main` : paquets libres standards
    - `contrib` : paquets libres dépendant de paquets non libres

**Exercice 4** : quelle est la différence entre `main`, `contrib` et `non-free` ?

??? success "Correction"
    - `main` : paquets libres standards
    - `contrib` : paquets libres mais dépendant de paquets non libres
    - `non-free` : paquets sous licence non libre

**Exercice 5** : actualise la liste des paquets, puis mets à jour le système sans rien supprimer.

??? success "Correction"
    ```bash
    apt update
    apt upgrade
    ```

**Exercice 6** : quelle est la différence entre `apt upgrade` et `apt full-upgrade` ?

??? success "Correction"
    - `upgrade` : mise à jour **sans suppression** de paquets.
    - `full-upgrade` : mise à jour complète, **avec suppression éventuelle**.

**Exercice 7** : cherche un paquet contenant « ftp », affiche ses informations, puis installe le paquet `telnet`.

??? success "Correction"
    ```bash
    apt search ftp
    apt show paquet
    apt install telnet
    ```

**Exercice 8** : désinstalle `telnet` en supprimant aussi sa configuration, puis nettoie les fichiers téléchargés.

??? success "Correction"
    ```bash
    apt purge telnet
    apt clean
    ```

**Exercice 9** : quelles commandes peut-on lancer avec un utilisateur standard, et lesquelles demandent root ?

??? success "Correction"
    - Utilisateur standard : les recherches et consultations (`apt search`, `apt show`…).
    - Root : tout ce qui modifie le système (`update`, `upgrade`, `install`, `remove`, `purge`, `clean`…).

**Exercice 10** : liste les fichiers installés par `telnet`, puis trouve à quel paquet appartient `/usr/bin/scp`.

??? success "Correction"
    ```bash
    dpkg -L telnet
    dpkg -S /usr/bin/scp
    ```

**Exercice 11** : où consulter l'historique des installations faites avec `apt` ? Et avec `dpkg` ? Pourquoi retrouve-t-on aussi les installations APT dans les logs de `dpkg` ?

??? success "Correction"
    - `apt` / `apt-get` : `/var/log/apt/history.log`
    - `dpkg` : `/var/log/dpkg.log`
    - Parce qu'APT s'appuie sur `dpkg` pour effectuer les installations.

**Exercice 12** : donne les étapes pour installer un logiciel depuis ses sources. Quelle étape nécessite root ?

??? success "Correction"
    1. Préparer un espace de compilation avec un utilisateur non root.
    2. Lire `README` ou `INSTALL`.
    3. `./configure` (vérifie les dépendances, génère le `Makefile`), puis `make` (compile).
    4. `make install` (copie dans les répertoires système) : **seule étape en root**.
