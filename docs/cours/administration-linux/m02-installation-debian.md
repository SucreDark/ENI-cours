---
tags:
  - Administration d'une distribution GNU/Linux
---

# Module 2 – Installation d'une distribution Debian

!!! note "Module en cours"
    Fait jusqu'à la démonstration partie 1. Reste : démonstration partie 2 et TP.

!!! abstract "En bref"
    - Installation depuis un **CD-ROM** ou une **clé USB** (préparée avec Ventoy, balenaEtcher, Rufus, UNetbootin).
    - Parc de machines : **FAI** (installation sans intervention), CD personnalisé pré-configuré, outils de **clonage** (FOG, Symantec Ghost, Acronis True Image…).
    - Minimum **2 partitions** : la racine **`/`** et le **swap**.
    - Swap selon la RAM : 512 Mo → 768 Mo · 1 Go → 1 Go · 2 Go et plus → 2 Go.

## 1. Les modes d'installation

- Installation avec un **CD-ROM**
- Installation avec une **clé USB**

**Logiciels pour préparer la clé USB :**

| Logiciel | Systèmes |
|---|---|
| **Ventoy** | Windows, Linux |
| **balenaEtcher** | Windows, Linux, macOS |
| **Rufus** | Windows |
| **UNetbootin** | Windows, Linux, macOS |

**Déploiement sur un grand nombre de machines**, plusieurs méthodes plus ou moins automatisées existent :

- **FAI** : installation sans intervention
- **CD personnalisé** avec pré-configuration
- **Outils de clonage** : FOG, Symantec Ghost, Acronis True Image…

---

## 2. Installer Debian

Un système Linux doit contenir **au minimum deux partitions** :

- une partition **racine** : `/`
- une partition d'**échange** : **swap**

L'espace disque du swap dépend de la RAM allouée :

| RAM | Swap |
|---|---|
| 512 Mo | 768 Mo |
| 1 Go | 1 Go |
| 2 Go et plus | 2 Go |

---

## Exercices

**Exercice 1** : citer les deux modes d'installation de Debian vus dans le cours.

??? success "Correction"
    Avec un **CD-ROM** ou avec une **clé USB**.

**Exercice 2** : tu es sur macOS et tu veux préparer une clé USB d'installation. Quels logiciels du cours peux-tu utiliser ?

??? success "Correction"
    **balenaEtcher** ou **UNetbootin** (Ventoy : Windows/Linux, Rufus : Windows uniquement).

**Exercice 3** : tu dois installer Debian sur 50 postes. Quelles méthodes existent ?

??? success "Correction"
    - **FAI** : installation sans intervention
    - Un **CD personnalisé** avec pré-configuration
    - Des **outils de clonage** : FOG, Symantec Ghost, Acronis True Image…

**Exercice 4** : quelles sont les deux partitions minimum d'un système Linux ?

??? success "Correction"
    La partition **racine `/`** et la partition d'échange **swap**.

**Exercice 5** : quelle taille de swap prévoir pour une machine avec 1 Go de RAM ? Et avec 8 Go ?

??? success "Correction"
    - 1 Go de RAM → **1 Go** de swap
    - 8 Go de RAM (2 Go et plus) → **2 Go** de swap
