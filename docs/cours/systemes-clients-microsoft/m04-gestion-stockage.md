---
tags:
  - Systèmes clients Microsoft
---

# Module 4 – La gestion du stockage

!!! abstract "En bref"
    La recette : **installer le média → initialiser → partitionner → installer un système de fichiers → attribuer une lettre** (ou un point de montage).

## 1. Le partitionnement

Partitionner = séparer un disque en plusieurs portions logiques, étanches et indépendantes.
La **table de partition** est le « sommaire » du disque : elle décrit ses partitions.

| | **MBR** (Master Boot Record) | **GPT** (GUID Partition Table) |
|---|---|---|
| Format | Historique | Nouveau, gomme les inconvénients du MBR |
| Lu par | BIOS | UEFI (évolution du BIOS depuis 2013) |
| Emplacement | 1er secteur du disque (512 o) | Dupliqué sur plusieurs secteurs (début et fin) |
| Partitions max | 4 | 128 |
| Taille max | 2,2 To par disque | 256 To par partition |
| OS compatibles | 32 et 64 bits | 64 bits + puce UEFI seulement |

### Disque de base vs disque dynamique

| Disque **de base** | Disque **dynamique** |
|---|---|
| 4 partitions principales max | Les partitions s'appellent des **volumes** |
| Étendre seulement avec l'espace libre **contigu** | Étendre avec l'espace libre du disque **ou d'un autre disque** (gestion par ensemble, RAID) |
| Au-delà de 4 : **partition étendue** + **lecteurs logiques** | Conversion base → dynamique **sans perte de données** |

```
Disque de base MBR :
[ Principale ][ Principale ][ Principale ][ Étendue : Logique 1 | Logique 2 | Logique 3 ]
```

## 2. Les systèmes de fichiers

Formater = installer un système de fichiers (FS), qui organise les données. Une partition formatée = un **volume**.

| FS | Caractéristiques |
|---|---|
| **NTFS** | Par défaut chez Microsoft ; sécurisé (ACL), chiffrement (EFS), compression intégrés ; volume max 256 To |
| **FAT16 / FAT32** | Historique, standard ; volume max 4 Go ; non sécurisé |
| **ReFS** | Évolution de NTFS ; volumes quasi illimités ; correction proactive des erreurs |
| Autres | ext4, VMFS, UDF… |

## 3. Les disques durs virtuels (VHD / VHDX)

- Bootables, taille fixe ou dynamique
- Pour les VM, mais utilisables sur machine physique (montables comme un ISO)
- Manipulables comme un fichier (clonage, déplacement, compression, versioning)
- Disques virtuels par défaut d'**Hyper-V**

## 4. Les outils

=== "Graphique"

    Console **Gestion des disques** : `diskmgmt.msc`

=== "cmd : `diskpart`"

    Très utilisé en production.

    ```
    diskpart
    list disk
    select disk 1
    list volume
    select volume 1
    format FS=NTFS LABEL=COMMUN QUICK
    assign letter=K
    ```

=== "PowerShell"

    ```powershell
    Get-Disk                                          # relever le numéro du disque
    Initialize-Disk -Number 1                         # GPT par défaut (-PartitionStyle MBR sinon)
    New-Partition -DiskNumber 1 -UseMaximumSize -AssignDriveLetter
    Set-Partition -DiskNumber 1 -PartitionNumber 2 -NewDriveLetter F   # lettre après coup
    Format-Volume -DriveLetter F                      # NTFS par défaut
    ```

---

## Exercices

**Exercice 1** : un disque de 3 To doit être entièrement utilisable. MBR ou GPT ?

??? success "Correction"
    **GPT** : le MBR ne gère pas les disques de plus de 2,2 To.

**Exercice 2** : sur un disque de base MBR, comment avoir plus de 4 partitions ?

??? success "Correction"
    3 partitions principales + 1 **partition étendue** contenant des **lecteurs logiques**.

**Exercice 3** : que se passe-t-il quand on étend un volume avec l'espace d'un 2ᵉ disque ?

??? success "Correction"
    Les disques de base sont convertis en **disques dynamiques** (sans perte de données) et le volume devient un **volume fractionné**.

**Exercice 4 (TP Discovery)** : en PowerShell, affiche numéro, taille et type de table des disques, puis nomme le volume C: « System ».

??? success "Correction"
    ```powershell
    Get-Disk | Select Number,Size,PartitionStyle
    Set-Volume -DriveLetter C -NewFileSystemLabel "System"
    ```

**Exercice 5 (TP)** : refais le TP sur ta VM Win10 avec 2 disques de 60 Go.

- [ ] Initialiser les 2 disques en GPT
- [ ] Disque 1 : 3 partitions de 15 Go (15360 Mo) + 1 de 7 Go (7168 Mo), sans lettre ni formatage
- [ ] Formater en NTFS : DATA (D:) et TOOLS (E:) — libérer D: du lecteur DVD si besoin
- [ ] Formater la partition de 7 Go en FAT32 : ARCHIVE
- [ ] Étendre DATA de 15 Go **uniquement** avec le disque 2 (→ disques dynamiques)
- [ ] Avec `diskpart` : formater la 3ᵉ partition en NTFS « COMMUN », l'étendre avec l'espace restant du disque 1
- [ ] Supprimer DATA puis le recréer avec tout l'espace libre des 2 disques
