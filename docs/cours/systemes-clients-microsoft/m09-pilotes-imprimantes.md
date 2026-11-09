---
tags:
  - Systèmes clients Microsoft
---

# Module 9 – Les pilotes et les imprimantes

!!! abstract "En bref"
    Un périphérique a besoin d'une liaison (locale ou réseau) et l'ordinateur d'un « mode d'emploi » : le **pilote**.
    Les imprimantes sont des ressources à part entière (droits NTFS, partage, serveur d'impression).

## 1. Les pilotes

**Prise en charge du matériel :**

- **Plug and Play** : à chaud ; **non Plug and Play** : redémarrage nécessaire (plus rare)
- Détection et installation **automatique** ou **manuelle**
- Affichage et paramétrage : **Gestionnaire de périphériques** (`devmgmt.msc`) → composants pris en charge ou non, mettre à jour, désactiver, désinstaller, **restaurer le pilote**, détails, paramètres

**Caractéristiques :**

- Spécifiques à l'architecture : **32 ou 64 bits**
- **Pilotes signés** privilégiés par Microsoft (certificat Microsoft ou procédure Microsoft) : garantissent la stabilité, **obligatoires en 64 bits**

| Fichier | Rôle |
|---|---|
| `*.inf` | Définition du pilote (texte) |
| `*.sys` | Le pilote lui-même |
| `*.cat` | Certificat (Microsoft ou tiers de confiance) |
| `*.exe`, `*.dll`, `*.xml`… | Fichiers complémentaires |

**Installation** à partir du fichier **INF** (clic droit > Installer) ou d'un assistant (`setup.exe`). Une fois installé, le pilote est mémorisé (réinstallation automatique) :

- Fichiers INF dans `C:\Windows\inf` (chaque pilote installé à la main → `oemXX.inf`)
- Autres fichiers dans `C:\Windows\System32` et `C:\Windows\SysWOW64`
- **Magasin de pilotes** (prise en charge immédiate) : `C:\Windows\System32\DriverStore`

| Commande | Rôle |
|---|---|
| `msinfo32` | Détail du matériel |
| `driverquery` | Lister les pilotes installés (`/SI` = signés) |
| `pnputil /enum-drivers` | Lister les pilotes tiers (oemXX.inf) |
| `pnputil /add-driver pilote.inf` | Ajouter un pilote au magasin |

## 2. Les imprimantes

| Terme | Définition |
|---|---|
| **Périphérique d'impression** | Le matériel qui sort la feuille |
| **Imprimante** | Le logiciel : pilote, configuration, file d'attente, port d'impression |
| **File d'attente** | Service **spouleur** : convertit le document pour le périphérique et envoie le job au port |
| **Imprimante locale** | Reliée directement à l'ordinateur (port local) |
| **Imprimante partagée** | Imprimante locale partagée sur le réseau par l'OS : dispo **seulement si l'ordinateur est allumé** |
| **Imprimante réseau** | Indépendante : son propre OS, une interface réseau, un service web de config |

### Imprimante locale

- Reconnue directement, pilote générique du magasin (ou pilote signé constructeur pour plus de fonctions)
- Sécurité **NTFS** (onglet Sécurité des propriétés)
- Panneau de configuration : file d'attente, propriétés (infos générales, options avancées : horaires, priorité…)
- **Partage** : accessible via `\\serveur\imprimante`, si l'hôte est allumé, droits NTFS appliqués

### Imprimante réseau et serveur d'impression

Le rôle **Serveur d'impression** permet de partager plusieurs imprimantes, centraliser et simplifier leur gestion. Côté client : chemin UNC du serveur, puis **Connecter**.

- **Spouleur** : gère la file d'attente, envoie les travaux au périphérique (déplaçable via une clé de registre)
- **Pool d'impression** : une imprimante reliée à plusieurs périphériques → les travaux vont au prochain disponible, moins d'attente

!!! tip "En complément (tes notes)"
    - Site **PCI Lookup** : identifier un périphérique inconnu à partir de ses identifiants matériels.

---

## Exercices

**Exercice 1** : quel fichier définit un pilote ? Où se trouve le magasin de pilotes ?

??? success "Correction"
    Le fichier **.inf**. Magasin : `C:\Windows\System32\DriverStore` (géré avec `pnputil`).

**Exercice 2** : différence entre imprimante partagée et imprimante réseau ?

??? success "Correction"
    **Partagée** : imprimante locale partagée par l'OS d'un ordinateur, dispo seulement s'il est allumé.
    **Réseau** : indépendante, avec son propre OS et sa carte réseau.

**Exercice 3 (TP)** : génère deux CSV : le détail de tous les pilotes, et leur signature.

??? success "Correction"
    ```
    driverquery /v /fo CSV > pilotes_details.csv
    driverquery /si /fo CSV > pilotes_signatures.csv
    ```

**Exercice 4 (TP)** : où trouver le VENDOR_ID et le DEVICE_ID de la carte graphique ?

??? success "Correction"
    `devmgmt.msc` > Cartes graphiques > Propriétés > onglet **Détails** > propriété **ID compatibles** (ex. VEN 15AD, DEV 0405 pour la carte VMware).

**Exercice 5 (TP)** : connecte-toi à l'imprimante partagée de Discovery.

??? success "Correction"
    Explorateur : `\\<IP Discovery>\HP_LaserJet_Accueil_RDC_Bât2` → identifiants → clic droit **Connecter…** ; elle apparaît ensuite dans Périphériques et imprimantes.

**Exercice 6 (PowerShell)** : affiche nom, partage, nom de partage, port, emplacement et priorité de « HP LaserJet ».

??? success "Correction"
    ```powershell
    Get-Printer -Name "HP LaserJet" | Select Name,Shared,ShareName,PortName,Location,Priority
    ```
