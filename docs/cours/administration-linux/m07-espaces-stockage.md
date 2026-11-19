---
tags:
  - Administration d'une distribution GNU/Linux
---

# Module 7 – Gestion des espaces de stockage

!!! abstract "En bref"
    - **MBR** : ancienne norme, 4 partitions principales max, limite 2,2 To. **GPT** : remplace le MBR, 128 partitions, pas de partition étendue, limite théorique 9,4 Zo.
    - Disques : `/dev/sda`, `/dev/sdb`… · partitions 1 à 4 = principales/étendue, logiques à partir de **5**.
    - **`fdisk`** : `fdisk -l /dev/sda` (afficher), `fdisk /dev/sdb` (menu interactif).
    - Menu fdisk : `m` aide, `n` nouvelle, `p` afficher, `t` type, `w` enregistrer et quitter, `q` quitter sans enregistrer.
    - Types (hexadécimal) : `82` swap, `83` Linux, `8e` Linux LVM, `7` HPFS/NTFS/exFAT, `5` étendue.

## 1. Le partitionnement d'un disque

Il existe **deux normes principales** :

| Norme | Caractéristiques |
|---|---|
| **MBR** | Ancienne norme · maximum **4 partitions principales** · 56 partitions logiques maximum via une **partition étendue** · limite de **2,2 To** |
| **GPT** | Remplace le MBR · **128 partitions** (voire 256) · **pas besoin de partition étendue** · limite théorique de **9,4 Zo** |

### MBR (Master Boot Record)

Il est constitué de **2 éléments principaux** :

| Élément | Taille | Contenu |
|---|---|---|
| **Boot loader** | 446 premiers octets | Contient le stage 1 de GRUB sous Linux |
| **Table de partitions** | 64 octets | Contient les informations des 4 partitions principales |

### GPT (GUID Partition Table)

- Remplace le MBR.
- Permet davantage de partitions.
- Supporte des capacités de stockage beaucoup plus importantes.

---

## 2. Nommage des disques sous Linux

Sous Linux, les disques SCSI/SATA sont représentés dans **`/dev`**. Le nom est composé de **`sd`** suivi d'une lettre :

| Disque | Signification |
|---|---|
| `/dev/sda` | Premier disque détecté |
| `/dev/sdb` | Deuxième disque détecté |
| `/dev/sdc` | Troisième disque détecté |

### Nommage des partitions

- Les chiffres de **1 à 4** sont réservés aux partitions **principales** et à la partition **étendue**.
- Les partitions **logiques** commencent toujours à **5**.

| Exemple | Signification |
|---|---|
| `/dev/sdb` | Disque entier |
| `/dev/sdb1` | 1re partition principale |
| `/dev/sdb5` | 1re partition logique |

---

## 3. La commande fdisk

`fdisk` est un outil permettant de **gérer le partitionnement des disques**.

```
fdisk [option] <périphérique de stockage>
```

| Action | Commande |
|---|---|
| Afficher les partitions d'un disque | `fdisk -l /dev/sda` |
| Ouvrir fdisk sur un disque (menu interactif) | `fdisk /dev/sdb` |

**Commandes à connaître** (dans le menu interactif) :

| Touche | Rôle |
|---|---|
| `m` | Afficher l'aide |
| `n` | Ajouter une nouvelle partition |
| `p` | Afficher la table des partitions |
| `t` | Modifier le type d'une partition |
| `w` | Enregistrer les modifications et quitter |
| `q` | Quitter sans enregistrer |

!!! warning "`p` a deux usages"
    `p` peut aussi servir à choisir une partition **primaire** après avoir utilisé `n`.

---

## 4. Créer une partition avec fdisk

Exemple : créer une partition de **20 Go** sur `/dev/sdb`.

| Étape | Action | Saisie |
|---|---|---|
| 1 | Ouvrir le disque | `fdisk /dev/sdb` |
| 2 | Créer une partition | `n` |
| | Choisir le type | `p` : partition primaire · `e` : partition étendue |
| 3 | Choisir le numéro : `Numéro de partition (1-4, 1 par défaut)` | `Entrée` (valeur par défaut) |
| 4 | Choisir le premier secteur : `Premier secteur (2048-62914559, 2048 par défaut)` | `Entrée` (valeur par défaut) |
| 5 | Choisir la taille : `Dernier secteur` | `+20G` (crée une partition de 20 Go) |
| 6 | Vérifier la partition | `p` (affiche la table des partitions) |

### Modifier le type d'une partition

Une fois la partition créée, on peut définir son type avec **`t`**. Pour afficher la liste des types disponibles : **`L`**.

| Code (hexadécimal) | Type |
|---|---|
| `82` | Partition d'échange swap |
| `83` | Linux |
| `8e` | Linux LVM |
| `7` | HPFS/NTFS/exFAT |
| `5` | Étendue |

### Enregistrer les modifications

| Touche | Rôle |
|---|---|
| `w` | Enregistrer et quitter fdisk |
| `q` | Quitter sans enregistrer |

---

## Exercices

**Exercice 1** : compare MBR et GPT (nombre de partitions, partition étendue, taille max).

??? success "Correction"
    - **MBR** : 4 partitions principales max (logiques via une partition étendue), limite 2,2 To.
    - **GPT** : 128 partitions (voire 256), pas besoin de partition étendue, limite théorique 9,4 Zo.

**Exercice 2** : de quels éléments est constitué le MBR, et quelle est leur taille ?

??? success "Correction"
    - Boot loader : 446 premiers octets (stage 1 de GRUB sous Linux).
    - Table de partitions : 64 octets (informations des 4 partitions principales).

**Exercice 3** : que désignent `/dev/sdc`, `/dev/sdb1` et `/dev/sdb5` ?

??? success "Correction"
    - `/dev/sdc` : troisième disque détecté.
    - `/dev/sdb1` : 1re partition principale du 2e disque.
    - `/dev/sdb5` : 1re partition logique du 2e disque.

**Exercice 4** : sur un disque MBR, à quel numéro commencent les partitions logiques ? Pourquoi ?

??? success "Correction"
    À **5**, car 1 à 4 sont réservés aux partitions principales et à la partition étendue.

**Exercice 5** : affiche les partitions du disque `/dev/sda`.

??? success "Correction"
    ```bash
    fdisk -l /dev/sda
    ```

**Exercice 6** : crée une partition primaire de 20 Go sur `/dev/sdb`, vérifie-la, puis enregistre.

??? success "Correction"
    ```
    fdisk /dev/sdb
    n          # nouvelle partition
    p          # primaire
    Entrée     # numéro par défaut (1)
    Entrée     # premier secteur par défaut (2048)
    +20G       # dernier secteur : 20 Go
    p          # vérifier la table des partitions
    w          # enregistrer et quitter
    ```

**Exercice 7** : la partition `/dev/sdb1` doit servir de swap. Comment changer son type dans fdisk ?

??? success "Correction"
    `t` (puis `L` pour voir la liste des types si besoin) et saisir le code **`82`**, puis `w`.

**Exercice 8** : donne les codes de type pour Linux, Linux LVM, NTFS et une partition étendue. En quelle base sont-ils écrits ?

??? success "Correction"
    - Linux : `83` · Linux LVM : `8e` · HPFS/NTFS/exFAT : `7` · Étendue : `5`
    - En **hexadécimal**.

**Exercice 9** : tu t'es trompé dans fdisk et tu ne veux rien garder. Quelle touche utiliser ?

??? success "Correction"
    `q` : quitter sans enregistrer.
