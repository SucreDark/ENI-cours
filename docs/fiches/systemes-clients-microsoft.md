---
tags:
  - Fiche mémo
---

# Fiche mémo – Systèmes clients Microsoft

<div class="fiche-actions" markdown="0"><button class="exo-btn" onclick="window.print()">🖨 Imprimer / PDF</button></div>

!!! info "Fiche générée automatiquement"
    Les « En bref » et les commandes de chaque module de ce cours, rien de plus.

## Module 1 – Les systèmes d'exploitation et Microsoft Windows 10

Un OS pilote le matériel et reçoit les instructions de l'utilisateur ou des logiciels.
Windows 10 est prédominant en entreprise : un technicien doit le connaître.

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m01-os-et-windows-10.md)

## Module 2 – Installation de Windows 10

Prendre en compte les prérequis, installer Windows 10 et faire la première configuration.
Tous les supports d'installation partagent le même fichier source : **install.wim**.

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m02-installation-windows-10.md)

## Module additionnel – VMware Workstation

La virtualisation fait cohabiter plusieurs systèmes invités isolés sur les ressources d'un ordinateur physique (l'hôte).
Workstation permet de maquetter pour apprendre ou tester avant la production : c'est l'outil majeur de la formation.

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m02b-vmware-workstation.md)

## Module 3 – Interagir avec Windows 10

3 façons de piloter Windows : l'**interface graphique**, la **ligne de commande** (cmd) et **PowerShell**.
L'aide est précieuse : `help` en cmd, `Get-Help` en PowerShell.

| Commande | Rôle |
|---|---|
| `command.com` | OS basés sur MS-DOS (avant Win9X) |
| `cmd.exe` | OS basés sur WinNT (NT, 2000 et +) ; commandes internes, externes, fichiers batch |
| `[texte]` | Facultatif |
| `{texte}` | Choisir un élément parmi ceux présents |
| ` | Séparateur d'éléments (un OU l'autre) |
| `…` | Peut être répété |
| `cls` / `exit` | Efface l'écran / ferme la console |
| `Get-Help ` | Aide de la cmdlet |
| `Help` / `Man ` | Aide page par page |
| ` -?` | Aide depuis n'importe quelle cmdlet |
| `Help about_*` | Liste des concepts |
| `Get-Help -Examples ` | Seulement les exemples |
| `Get-Help -ShowWindow ` | Aide dans une fenêtre séparée |
| `Get-Help -Online ` | Aide à jour sur le site Microsoft |

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m03-interagir-windows-10.md)

## Module 4 – La gestion du stockage

La recette : **installer le média → initialiser → partitionner → installer un système de fichiers → attribuer une lettre** (ou un point de montage).

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m04-gestion-stockage.md)

## Module 5 – Les utilisateurs et les groupes

1 collaborateur = 1 utilisateur. Chaque utilisateur et chaque groupe a un **SID** ;
l'ensemble des SID forme le **jeton d'accès** (`whoami`). L'**UAC** n'accorde les privilèges que quand c'est nécessaire.

| Commande | Rôle |
|---|---|
| `lusrmgr.msc` | Utilisateurs et groupes locaux |
| `compmgmt.msc` | Gestion de l'ordinateur |
| `net user` / `net localgroup` | Ligne de commande (`net help user`) |

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m05-utilisateurs-groupes.md)

## Module 6 – La sécurité NTFS et les ACL

**ACL = DACL + ACE.** Sur un volume NTFS, chaque dossier/fichier filtre le jeton d'accès de l'utilisateur.
Toujours **tester les accès** et respecter les bonnes pratiques Microsoft.

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m06-ntfs-acl.md)

## Module 7 – La gestion du réseau et du pare-feu

Tout poste client doit communiquer sur les réseaux de l'entreprise : configurer la carte, **tester et diagnostiquer** (`ipconfig`, `ping`, `tracert`, `nslookup`), puis **ouvrir/fermer des accès** avec le pare-feu.

| Commande | Rôle |
|---|---|
| `ipconfig` | Afficher la config, agir sur la pile réseau (DNS, DHCP) |
| `ping` | Tester la connectivité (**bloqué par défaut par le pare-feu Windows !**) |
| `tracert` | Voir la route empruntée par les paquets |
| `nslookup` | Diagnostiquer la résolution de noms |

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m07-reseau-pare-feu.md)

## Module 8 – Le partage de ressources

Un partage donne accès à une ressource hébergée par un serveur, depuis un client, à travers le réseau.
**Double vérification : droits du partage PUIS droits NTFS** — le plus restrictif gagne.
Le Bureau à distance (RDP, port 3389) donne accès à un poste à distance.

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m08-partage-ressources.md)

## Module 9 – Les pilotes et les imprimantes

Un périphérique a besoin d'une liaison (locale ou réseau) et l'ordinateur d'un « mode d'emploi » : le **pilote**.
Les imprimantes sont des ressources à part entière (droits NTFS, partage, serveur d'impression).

| Commande | Rôle |
|---|---|
| `*.inf` | Définition du pilote (texte) |
| `*.sys` | Le pilote lui-même |
| `*.cat` | Certificat (Microsoft ou tiers de confiance) |
| `*.exe`, `*.dll`, `*.xml`… | Fichiers complémentaires |
| `msinfo32` | Détail du matériel |
| `driverquery` | Lister les pilotes installés (`/SI` = signés) |
| `pnputil /enum-drivers` | Lister les pilotes tiers (oemXX.inf) |
| `pnputil /add-driver pilote.inf` | Ajouter un pilote au magasin |

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m09-pilotes-imprimantes.md)

## Module 10 – Maintenance du système

Le technicien doit connaître l'état du système **en temps réel** et **sur une période passée**,
puis en cas de panne **investiguer** et **réparer / restaurer** (points de restauration, WinRE).

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m10-maintenance.md)

## Module 11 – Plus loin avec PowerShell

**Rediriger** les flux (`>`, `>>`, `2>`), **enchaîner** avec le pipeline `|`, **filtrer** avec `Where-Object`,
**sélectionner** avec `Select`, et **formater en dernier** (`Format-List / Table / Wide`).

| Commande | Rôle |
|---|---|
| `cmdlet > fichier` (ou `1>`) | Sortie standard → fichier (écrase) |
| `cmdlet >> fichier` (ou `1>>`) | Sortie standard → **fin** du fichier |
| `cmdlet 2> fichier.err` | Erreurs → fichier |
| `cmdlet 2>> fichier.err` | Erreurs → fin du fichier |
| `cmdlet > fichier 2>&1` | Sortie **et** erreurs → fichier |
| `cmdlet 2>$null` | Erreurs « dans le vide » |
| `Format-List` | FL -Property Name,Status,DisplayName` |
| `Format-Table` | FT -Property StandardName,BaseUtcOffset -AutoSize` |
| `Format-Wide` | FW -Property ID -Column 5` (une seule propriété, sur plusieurs colonnes) |

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m11-powershell.md)

## Module 12 – Introduction à la capture et au déploiement

Pour industrialiser l'installation : préparer un **master**, le généraliser avec **`sysprep`**, **capturer** son image, puis **déployer** des clones (serveur de déploiement en PXE, ou dism + WinPE).

| Commande | Rôle |
|---|---|
| `/oobe` | *Out-of-Box Experience* : interaction utilisateur au redémarrage |
| `/generalize` | Généraliser |
| `/shutdown` | Éteindre le système |
| `/PersistAllDeviceInstalls` | Garder les pilotes installés manuellement (supprimés par défaut) |

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m12-capture-deploiement.md)

## Module 13 – Les stratégies de groupe locales

Les **LGPO** (Local Group Policy Objects) personnalisent l'environnement des utilisateurs, personnalisent Windows et sécurisent le système,
en modifiant le **registre** de façon conviviale. Prépare aux GPO de domaine.

| Commande | Rôle |
|---|---|
| `HKEY_CLASSES_ROOT` | Infos sur les applications (objets OLE, extensions) |
| `HKEY_CURRENT_USER` | Config de l'utilisateur connecté (= `HKEY_USERS\`) |
| `HKEY_LOCAL_MACHINE` | Config propre à l'ordinateur (tous utilisateurs) |
| `HKEY_USERS` | Tous les profils utilisateur chargés |
| `HKEY_CURRENT_CONFIG` | Profil matériel utilisé |

[:octicons-arrow-right-24: Voir le module](../cours/systemes-clients-microsoft/m13-strategies-groupe-locales.md)
