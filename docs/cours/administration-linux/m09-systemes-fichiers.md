---
tags:
  - Administration d'une distribution GNU/Linux
---

# Module 9 – Gestion des espaces de stockage – File System

!!! abstract "En bref"
    - Un système de fichiers (FS) organise les données en **blocs de 4 Ko** par défaut : superbloc, inodes, blocs de données…
    - L'**inode** contient les infos d'un fichier (type, droits, UID/GID, taille, dates…) mais **pas son nom**.
    - Famille EXT : ext2 (sans journal), ext3 (journalisation), **ext4** (défaut sur Debian 10).
    - Créer : `mkfs.ext4` · modifier : `tune2fs`, `resize2fs` · vérifier : `fsck.ext4`.
    - Infos : `blkid`, `lsblk -f`, `findmnt` · monter : `mount -t ext4 /dev/sdc1 /mnt` · démonter : `umount` · auto : `/etc/fstab` (tester avec `mount /srv/data`).
    - Espace disque : `df -h` (systèmes de fichiers montés), `du -hs /etc` (taille d'un répertoire).

## 1. Fonctionnement d'un système de fichiers

Un **système de fichiers** (FS) permet d'organiser et de stocker les données sur un périphérique (partition, volume logique LVM…).

Sous Linux, les systèmes de fichiers sont organisés en **blocs de données de 4 Ko** par défaut.

### Les principaux éléments

| Élément | Rôle |
|---|---|
| **Superbloc** | Contient les infos vitales du système de fichiers |
| **Inode** | Contient les infos propres à un fichier |
| **Bloc d'indirection** | Redirige vers d'autres blocs |
| **Bloc de données** | Contient les données réelles du fichier |
| **Table des inodes** | Liste des blocs d'inodes |
| **Table des inodes libres** | Liste des inodes disponibles |
| **Table des blocs libres** | Liste des blocs de données disponibles |

### Le superbloc

Il contient notamment :

- la taille des blocs et du système de fichiers
- le nombre de montages effectués
- le nombre maximum de montages avant vérification
- la date du dernier montage
- un pointeur vers l'inode racine

Il est **dupliqué à différents endroits** pour des questions de sécurité.

### Les inodes

Un inode contient les informations d'un fichier :

- type de fichier : `-`, `d`, `b`, `c`, `l`, `p`, `s`
- droits d'accès : exemple `0644` (`rw-r--r--`)
- nombre de liens physiques
- UID : propriétaire
- GID : groupe propriétaire
- taille du fichier
- dates : `atime`, `ctime`, `mtime`
- 15 adresses pointant vers les blocs de données

!!! tip "À retenir"
    **L'inode ne contient pas le nom du fichier !** Le nom est renseigné dans le répertoire qui contient le fichier.

| Date | Signification |
|---|---|
| `atime` | Dernier accès au fichier |
| `ctime` | Dernière modification des informations de l'inode |
| `mtime` | Dernière modification des données du fichier |

---

## 2. Les systèmes de fichiers Linux

### La famille EXT

| FS | Caractéristique |
|---|---|
| **ext2** | Pas de journalisation |
| **ext3** | Ajout de la journalisation |
| **ext4** | Amélioration d'ext3, réécrit de zéro |

La **journalisation** améliore la récupération du système de fichiers après un crash (extinction brutale, par exemple).

Le cours indique qu'**ext4** est le système par défaut sur **Debian 10**. Son avantage : il est **peu sujet à la fragmentation** grâce à la préallocation de blocs de données contigus.

Autres systèmes de fichiers cités : **NTFS**, **FAT**, **XFS**, **Btrfs**.

---

## 3. Création d'un système de fichiers

Le **formatage** installe un système de fichiers sur un périphérique de stockage. Sans système de fichiers, le périphérique ne peut pas être utilisé normalement pour stocker des fichiers.

Cela peut être :

- une partition : `/dev/sdc1`
- un volume logique : `/dev/vggroup1/lv1`

Commande : **`mkfs`**

```
mkfs.[fstype] <options> [périphérique]
```

`mkfs` simplifie la création des systèmes de fichiers : il fait appel à une véritable commande de création.

| Exemple | Rôle |
|---|---|
| `mkfs.ext4 /dev/sda2` | Crée un système de fichiers ext4 sur `/dev/sda2` |
| `mkfs.ext4 /dev/vggroup1/lv1` | Crée un système de fichiers ext4 sur un volume logique |
| `mkfs.ntfs /dev/sde1` | Crée un système de fichiers NTFS (nécessite le paquet `ntfs-3g`) |

!!! note "À savoir"
    `mkfs.ext4` utilise la commande **`mke2fs`** avec des options préconfigurées. Pour connaître la commande utilisée : `man mkfs.ext4`.

---

## 4. Modification d'un système de fichiers

### tune2fs

Permet de **modifier les options** d'un système de fichiers de type EXT et de **récupérer les informations du superbloc**.

```
tune2fs <options> [périphérique]
```

| Option | Rôle |
|---|---|
| `-L` | Modifier l'étiquette du système de fichiers |
| `-l` | Afficher les informations du superbloc |
| `-i` | Modifier l'intervalle entre deux vérifications |
| `-c` | Modifier le nombre maximum de montages avant vérification |

### resize2fs

Permet de **changer la taille** d'un système de fichiers.

```
resize2fs <options> [périphérique]
```

!!! warning "Deux opérations différentes"
    Modifier la taille du système de fichiers et modifier la taille du volume logique sont **deux opérations différentes**.

---

## 5. Vérification d'un système de fichiers

Commande : **`fsck`**. Elle permet de vérifier l'intégrité des données présentes sur un système de fichiers.

```
fsck.<fstype> <options> [périphérique]
```

La vérification peut être effectuée manuellement ou automatisée au démarrage du système.

Exemple : `fsck.ext4 /dev/sde2`

---

## 6. Récupérer des informations sur le stockage

| Commande | Rôle |
|---|---|
| `blkid` | Affiche les informations des périphériques formatés |
| `lsblk` | Affiche les périphériques sous forme d'arborescence |
| `findmnt` | Affiche les systèmes de fichiers montés |

On peut notamment retrouver : **UUID**, **LABEL**, **TYPE**, **PARTUUID**.

| Exemple | Rôle |
|---|---|
| `lsblk -f` | Affiche les disques, partitions et volumes logiques sous forme d'arborescence |
| `findmnt /dev/sdc1` | Cibler un périphérique |

---

## 7. Monter un système de fichiers

Sous Linux, pour accéder aux données d'un système de fichiers, on doit le **monter dans un répertoire**. Ce répertoire est appelé **point de montage**. Pour les montages temporaires, il est conseillé d'utiliser **`/mnt`**.

```
mount <options> [périphérique source] [point/de/montage]
```

Exemple : `mount -t ext4 /dev/sdc1 /mnt` monte la partition `/dev/sdc1` dans le répertoire `/mnt`.

### Les options de montage

| Option | Rôle |
|---|---|
| `-t` | Définir le type de système de fichiers |
| `-o` | Définir des options de montage |
| `sync` / `async` | Désactiver / activer la mise en tampon en RAM |
| `exec` / `noexec` | Autoriser / interdire l'exécution de fichiers |
| `ro` / `rw` | Lecture seule / lecture-écriture |
| `suid` / `nosuid` | Activer / désactiver l'interprétation du SUID |
| `remount` | Modifier les options sans démonter |

Options par défaut : `async`, `exec`, `rw`, `suid`.

### Démonter un volume : umount

Pour retirer proprement une clé USB ou un disque externe :

```bash
umount /mnt          # par le point de montage
umount /dev/sdc1     # ou directement avec le périphérique
```

!!! danger "Volume occupé"
    Il ne faut pas qu'un utilisateur soit en train d'utiliser le volume pour pouvoir le démonter.

---

## 8. Montage automatique : /etc/fstab

Les montages automatiques sont effectués par **systemd** au démarrage. Ils sont déclarés dans le fichier **`/etc/fstab`**.

Chaque ligne contient **6 colonnes** :

```
<file system> <mount point> <type> <options> <dump> <pass>
```

| Colonne | Rôle |
|---|---|
| `file system` | Périphérique ou système de fichiers à monter |
| `mount point` | Répertoire où monter le système de fichiers |
| `type` | Type de système de fichiers (ext4, ext2…) |
| `options` | Options de montage |
| `dump` | Paramètre de configuration de la commande `dump` |
| `pass` | Vérification du système de fichiers au démarrage |

### Les différentes façons d'identifier un périphérique

| Méthode | Remarque |
|---|---|
| **UUID** | Plus sécurisé, mais moins facile à reconnaître |
| **LABEL** | Plus pratique à lire, attention aux doublons |
| **Chemin du périphérique** | Principalement utilisé pour les volumes LVM |

Il est **déconseillé** d'utiliser directement les chemins des partitions, par exemple `/dev/sdb1`.

### Les options `defaults`

Elles correspondent à : `async`, `nouser`, `exec`, `rw`, `auto`, `suid`, `dev`.

### La colonne `pass`

| Valeur | Rôle |
|---|---|
| `0` | Pas de vérification |
| `1` | Vérification de la partition racine `/` |
| `2` | Vérification des autres systèmes de fichiers |

### Tester le fichier fstab

Avant de redémarrer, il faut **tester la nouvelle ligne** :

```bash
mount /srv/data
```

- Si la commande ne renvoie rien : le montage est réussi.
- Si elle indique qu'elle ne trouve pas : aucune entrée n'a été trouvée (dans `/etc/fstab`).

---

## 9. Informations sur l'espace de stockage

### df

Permet de connaître l'**espace utilisé et disponible** sur les systèmes de fichiers montés.

```
df <options> [/point/de/montage]
```

| Option | Rôle |
|---|---|
| `-h` | Affichage lisible (K, M, G…) |
| `-i` | Afficher les informations sur les inodes |

Exemple : `df -h`

### du

Permet de connaître la **taille d'un répertoire** et de son contenu.

```
du <options> [/point/de/montage]
```

| Option | Rôle |
|---|---|
| `-h` | Affichage lisible (K, M, G…) |
| `-s` | Affiche uniquement la taille du répertoire indiqué |

Exemple : `du -hs /etc`

---

## Exercices

**Exercice 1** : quelle est la taille par défaut d'un bloc de données sous Linux ? Que contient le superbloc, et pourquoi est-il dupliqué ?

??? success "Correction"
    - 4 Ko.
    - Taille des blocs et du FS, nombre de montages effectués, nombre max de montages avant vérification, date du dernier montage, pointeur vers l'inode racine.
    - Il est dupliqué pour des questions de sécurité.

**Exercice 2** : cite 5 informations contenues dans un inode. Quelle information n'y est **pas** ?

??? success "Correction"
    Type de fichier, droits, nombre de liens physiques, UID, GID, taille, dates (`atime`, `ctime`, `mtime`), 15 adresses vers les blocs de données.

    Le **nom du fichier** n'y est pas : il est dans le répertoire qui contient le fichier.

**Exercice 3** : quelle est la différence entre `atime`, `ctime` et `mtime` ?

??? success "Correction"
    - `atime` : dernier accès au fichier
    - `ctime` : dernière modification des informations de l'inode
    - `mtime` : dernière modification des données du fichier

**Exercice 4** : compare ext2, ext3 et ext4. À quoi sert la journalisation ?

??? success "Correction"
    - ext2 : pas de journalisation · ext3 : ajout de la journalisation · ext4 : amélioration d'ext3, réécrit de zéro, peu sujet à la fragmentation.
    - La journalisation améliore la récupération du FS après un crash.

**Exercice 5** : formate en ext4 la partition `/dev/sda2`, puis le volume logique `lv1` du groupe `vggroup1`.

??? success "Correction"
    ```bash
    mkfs.ext4 /dev/sda2
    mkfs.ext4 /dev/vggroup1/lv1
    ```

**Exercice 6** : avec `tune2fs` sur `/dev/sda2` : affiche les infos du superbloc, puis change l'étiquette en `DATA`.

??? success "Correction"
    ```bash
    tune2fs -l /dev/sda2
    tune2fs -L DATA /dev/sda2
    ```

**Exercice 7** : vérifie l'intégrité du système de fichiers ext4 de `/dev/sde2`.

??? success "Correction"
    ```bash
    fsck.ext4 /dev/sde2
    ```

**Exercice 8** : affiche les disques, partitions et volumes logiques en arborescence avec leurs systèmes de fichiers, puis l'UUID des périphériques formatés.

??? success "Correction"
    ```bash
    lsblk -f
    blkid
    ```

**Exercice 9** : monte la partition ext4 `/dev/sdc1` dans `/mnt`, vérifie le montage, puis démonte-la.

??? success "Correction"
    ```bash
    mount -t ext4 /dev/sdc1 /mnt
    findmnt /dev/sdc1
    umount /mnt
    ```

**Exercice 10** : monte `/dev/sdc1` dans `/mnt` en lecture seule et sans exécution de fichiers. Quelles sont les options par défaut ?

??? success "Correction"
    ```bash
    mount -t ext4 -o ro,noexec /dev/sdc1 /mnt
    ```

    Par défaut : `async`, `exec`, `rw`, `suid`.

**Exercice 11** : dans quel fichier déclarer un montage automatique ? Donne l'ordre des 6 colonnes.

??? success "Correction"
    `/etc/fstab` : `<file system> <mount point> <type> <options> <dump> <pass>`

**Exercice 12** : pourquoi est-il déconseillé d'utiliser `/dev/sdb1` dans `/etc/fstab` ? Que peut-on utiliser à la place ?

??? success "Correction"
    Il est déconseillé d'utiliser directement les chemins des partitions. On utilise plutôt l'**UUID** (plus sécurisé) ou le **LABEL** (plus pratique, attention aux doublons). Le chemin du périphérique sert surtout pour les volumes LVM.

**Exercice 13** : à quelles options correspond `defaults` dans `/etc/fstab` ?

??? success "Correction"
    `async`, `nouser`, `exec`, `rw`, `auto`, `suid`, `dev`.

**Exercice 14** : quelle valeur mettre dans la colonne `pass` pour la racine `/` ? Pour une partition de données ? Pour ne rien vérifier ?

??? success "Correction"
    - Racine `/` : `1`
    - Autres systèmes de fichiers : `2`
    - Pas de vérification : `0`

**Exercice 15** : tu as ajouté une ligne pour `/srv/data` dans `/etc/fstab`. Comment la tester avant de redémarrer ? Comment interpréter le résultat ?

??? success "Correction"
    ```bash
    mount /srv/data
    ```

    - Rien ne s'affiche : le montage est réussi.
    - Message « introuvable » : aucune entrée n'a été trouvée dans `/etc/fstab`.

**Exercice 16** : affiche l'espace utilisé et disponible des systèmes de fichiers montés de façon lisible, puis les informations sur les inodes.

??? success "Correction"
    ```bash
    df -h
    df -i
    ```

**Exercice 17** : affiche uniquement la taille totale du répertoire `/etc`, de façon lisible.

??? success "Correction"
    ```bash
    du -hs /etc
    ```
