---
tags:
  - Administration d'une distribution GNU/Linux
---

# Module 8 – Gestion avancée des espaces de stockage – LVM

!!! abstract "En bref"
    - LVM = gérer le stockage de manière plus souple : **PV → VG → LV → système de fichiers**.
    - Préparer : type de partition **`8e`** (Linux LVM) dans fdisk.
    - Créer : `pvcreate` → `vgcreate` → `lvcreate -n nom -L taille vg`.
    - Modifier : `vgextend` (ajouter un PV), `lvextend -r -L` (agrandir), `lvreduce` (réduire, **risqué**), `resize2fs` (ext).
    - Afficher : `pvs`/`vgs`/`lvs` (résumé), `pvdisplay`/`vgdisplay`/`lvdisplay` (détaillé) · shell dédié : `lvm`.

## 1. Présentation de LVM

**LVM** (*Logical Volume Manager*) est un système qui permet de **gérer les espaces de stockage de manière plus souple**.

Il permet notamment de :

- regrouper plusieurs partitions ou disques
- créer des volumes logiques
- agrandir ou réduire les volumes
- gérer le stockage sans être limité aux partitions physiques classiques

Il existe **3 éléments** :

| Sigle | Anglais | Français |
|---|---|---|
| **PV** | Physical Volume | Volume physique |
| **VG** | Volume Group | Groupe de volumes |
| **LV** | Logical Volume | Volume logique |

---

## 2. Comprendre le fonctionnement de LVM

Le fonctionnement se fait **toujours dans cet ordre** :

```
PV → VG → LV → Système de fichiers (ext4, XFS…)
```

!!! tip "À retenir"
    - **PV** : les briques de départ
    - **VG** : le réservoir qui regroupe les briques
    - **LV** : les espaces que l'on crée dans le réservoir

---

## 3. Préparer les partitions pour LVM

Avant de créer un LVM, il faut identifier les partitions à utiliser.

Avec `fdisk`, il faut définir le type de partition : **code `8e`**, type **Linux LVM**.

Exemple : `fdisk /dev/sdb`, puis dans fdisk utiliser **`t`** pour modifier le type de partition et sélectionner **`8e`**.

---

## 4. Créer les LVM

### Créer des volumes physiques (PV)

Commande : **`pvcreate`**. Elle permet de transformer des partitions ou disques en volumes physiques utilisables par LVM.

```bash
pvcreate /dev/sdb1 /dev/sdb2 /dev/sdc1
```

### Créer un groupe de volumes (VG)

Commande : **`vgcreate`**.

```bash
vgcreate vggroup1 /dev/sdb1 /dev/sdb2 /dev/sdc1
```

On crée un groupe appelé `vggroup1` contenant 3 volumes physiques.

### Créer des volumes logiques (LV)

Commande : **`lvcreate`**. Elle permet de créer des espaces de stockage dans un groupe de volumes.

```bash
lvcreate -n lv1 -L 2G vggroup1
lvcreate -n lv2 -L 512M vggroup1
```

| Option | Rôle |
|---|---|
| `-n` | Nom du volume logique |
| `-L` | Taille du volume logique |

Unités possibles : `K` = Ko · `M` = Mo · `G` = Go · `T` = To

**Deux chemins possibles pour accéder à un volume logique :**

```
/dev/vgsystem/lvhome
/dev/mapper/vgsystem-lvhome
```

---

## 5. Modifier les LVM

### Agrandir un groupe de volumes (VG)

Commande : **`vgextend`**. Elle permet d'ajouter un volume physique à un groupe existant.

```bash
vgextend vggroup1 /dev/sdd
```

Ici, on ajoute `/dev/sdd` au groupe `vggroup1`.

### Agrandir un volume logique (LV)

Commande : **`lvextend`**.

```bash
lvextend -r -L +512M /dev/vggroup1/lv1
lvextend -r -L 1G /dev/vggroup1/lv2
```

| Option | Rôle |
|---|---|
| `-L` | Définit la taille |
| `+512M` | Ajoute 512 Mo à la taille actuelle |
| `1G` | Définit la taille totale à 1 Go |
| `-r` | Redimensionne automatiquement le système de fichiers |

### Réduire un volume logique (LV)

Commande : **`lvreduce`**. Elle permet de réduire la taille d'un volume logique.

!!! danger "Réduire un volume est risqué"
    Le système de fichiers doit être réduit correctement **avant** de réduire le volume logique, sinon on risque de **perdre des données**.

Il y a aussi **`resize2fs`** pour redimensionner un système de fichiers **ext**.

---

## 6. Afficher les informations LVM

Il existe deux familles de commandes :

- commandes courtes avec **`s`** : affichage **résumé**
- commandes avec **`display`** : affichage **détaillé**

| Élément | Résumé | Détaillé |
|---|---|---|
| PV | `pvs` | `pvdisplay` |
| VG | `vgs` | `vgdisplay` |
| LV | `lvs` | `lvdisplay` |

Shell dédié à LVM : **`lvm`**.

---

## Exercices

**Exercice 1** : que signifient PV, VG et LV ? Dans quel ordre fonctionne LVM ?

??? success "Correction"
    - PV : volume physique (les briques) · VG : groupe de volumes (le réservoir) · LV : volume logique (les espaces créés dans le réservoir).
    - Ordre : **PV → VG → LV → système de fichiers**.

**Exercice 2** : quel type donner dans fdisk à une partition destinée à LVM ?

??? success "Correction"
    Avec `t`, le code **`8e`** (Linux LVM).

**Exercice 3** : transforme `/dev/sdb1`, `/dev/sdb2` et `/dev/sdc1` en volumes physiques, puis crée le groupe `vggroup1` avec.

??? success "Correction"
    ```bash
    pvcreate /dev/sdb1 /dev/sdb2 /dev/sdc1
    vgcreate vggroup1 /dev/sdb1 /dev/sdb2 /dev/sdc1
    ```

**Exercice 4** : dans `vggroup1`, crée un volume logique `lv1` de 2 Go et un volume `lv2` de 512 Mo.

??? success "Correction"
    ```bash
    lvcreate -n lv1 -L 2G vggroup1
    lvcreate -n lv2 -L 512M vggroup1
    ```

**Exercice 5** : donne les deux chemins pour accéder au volume logique `lvhome` du groupe `vgsystem`.

??? success "Correction"
    - `/dev/vgsystem/lvhome`
    - `/dev/mapper/vgsystem-lvhome`

**Exercice 6** : ajoute le disque `/dev/sdd` au groupe `vggroup1`.

??? success "Correction"
    ```bash
    vgextend vggroup1 /dev/sdd
    ```

**Exercice 7** : ajoute 512 Mo à `lv1`, puis fixe la taille totale de `lv2` à 1 Go, en redimensionnant le système de fichiers automatiquement.

??? success "Correction"
    ```bash
    lvextend -r -L +512M /dev/vggroup1/lv1
    lvextend -r -L 1G /dev/vggroup1/lv2
    ```

**Exercice 8** : quelle est la différence entre `-L +512M` et `-L 1G` ? À quoi sert `-r` ?

??? success "Correction"
    - `+512M` : ajoute 512 Mo à la taille actuelle.
    - `1G` : définit la taille totale à 1 Go.
    - `-r` : redimensionne automatiquement le système de fichiers.

**Exercice 9** : pourquoi réduire un volume logique avec `lvreduce` est-il risqué ?

??? success "Correction"
    Le système de fichiers doit être réduit correctement **avant** le volume logique, sinon on risque de perdre des données.

**Exercice 10** : affiche les volumes physiques en résumé, puis les groupes de volumes en détail, puis les volumes logiques en résumé.

??? success "Correction"
    ```bash
    pvs
    vgdisplay
    lvs
    ```
