---
tags:
  - Systèmes clients Microsoft
---

# Module 3 – Interagir avec Windows 10

!!! abstract "En bref"
    3 façons de piloter Windows : l'**interface graphique**, la **ligne de commande** (cmd) et **PowerShell**.
    L'aide est précieuse : `help` en cmd, `Get-Help` en PowerShell.

## 1. L'interface graphique

- OS **multi-utilisateur** : bureau personnalisable, menu Démarrer (clic gauche = tuiles, clic droit = principaux raccourcis), bureaux supplémentaires, Timeline (historique des actions)
- OS **multitâche** : barre des tâches, ++win+tab++, gestionnaire des tâches
- **Zone de notification** : config réseau, connectivité rapide, mode tablette, « Tous les paramètres »
- Zone de recherche indexée, panneau de configuration, **consoles MMC** (préconfigurées ou personnalisées)

## 2. La ligne de commande (cmd)

Windows est historiquement orienté GUI, mais la CLI est requise pour certaines actions et pour automatiser (scripts).

| Shell | OS |
|---|---|
| `command.com` | OS basés sur MS-DOS (avant Win9X) |
| `cmd.exe` | OS basés sur WinNT (NT, 2000 et +) ; commandes internes, externes, fichiers batch |
| PowerShell | Natif depuis Server 2008 |

```
C:\windows\system32> shutdown /r /t 0
└── prompt ───────┘ └commande┘└opt┘└option + paramètre┘
```

**Règles :**

- Le 1er mot est toujours une commande ; une option commence par `/` ; les mots sont séparés par un espace
- Le prompt est dynamique et personnalisable
- Les quotes protègent les caractères spéciaux : `'Mes Documents'`
- Redirection vers un fichier : `>` (écrase) / `>>` (ajoute). Ex. `help shutdown > aide.txt`

### Lire la syntaxe de l'aide

| Notation | Sens |
|---|---|
| Texte sans crochet | Obligatoire |
| `[texte]` | Facultatif |
| `{texte}` | Choisir un élément parmi ceux présents |
| `|` | Séparateur d'éléments (un OU l'autre) |
| `…` | Peut être répété |

Ex. `COPY [/D] [/V] [/N] [/Y | /-Y] … source [+ source …] [cible]` → `COPY` et `source` obligatoires, options facultatives, plusieurs sources possibles.

## 3. PowerShell

Dernier shell Microsoft : interpréteur de commandes **et** langage de script, **orienté objet**, basé sur **.NET Framework**.

| Version | Date | Windows |
|---|---|---|
| 1.0 | Nov. 2006 | Server 2008 |
| 2.0 | Oct. 2009 | Windows 7 / Server 2008 R2 |
| 3.0 (.NET 4.0) | Sept. 2012 | Windows 8 / Server 2012 |
| 4.0 (.NET 4.5) | Oct. 2013 | Windows 8.1 / Server 2012 R2 |
| 5.0 (.NET 4.5) | Sept. 2014 | Windows 10 |

- Consoles : console texte native (possible en admin), **ISE** pour les scripts, outils tiers (Windows Terminal, VS Code)
- `$PSVersionTable` : versions de PowerShell (`PSVersion`, `PSCompatibleVersions`)

### Les cmdlets

**Verbe-Nom** : verbes courants `Get`, `Set`, `Remove`, `Add`, `New` ; noms selon le contexte (`LocalUser`, `NetAdapter`, `Alias`…).
Non sensibles à la casse, avec paramètres (obligatoires ou optionnels), arguments, et parfois des alias.

```powershell
Get-ChildItem -Path C:\Users
#   cmdlet     paramètre argument
```

| Touche | Action |
|---|---|
| ++tab++ / ++shift+tab++ | Complétion (chemin, commande, paramètre, valeur) |
| ++ctrl+space++ | Liste des propositions de complétion |
| ++esc++ | Efface la ligne en cours |
| ++arrow-up++ / ++arrow-down++ | Historique |
| ++home++ / ++end++ | Début / fin de ligne |
| ++ctrl+c++ | Arrête l'instruction en cours |
| `cls` / `exit` | Efface l'écran / ferme la console |

## 4. L'aide de PowerShell

- v1/v2 : aide intégrée ; **v3 et +** : aide téléchargeable (en anglais), à mettre à jour (droits admin)
- `Update-Help` (`-Force` pour dépasser la limite d'1 MAJ/jour)
- Hors ligne : `Update-Help -SourcePath \\chemin\aide -UICulture en-US -Credential <login>`

| Commande | Effet |
|---|---|
| `Get-Help <cmdlet>` | Aide de la cmdlet |
| `Help` / `Man <x>` | Aide page par page |
| `<cmdlet> -?` | Aide depuis n'importe quelle cmdlet |
| `Help about_*` | Liste des concepts |
| `Get-Help -Examples <x>` | Seulement les exemples |
| `Get-Help -ShowWindow <x>` | Aide dans une fenêtre séparée |
| `Get-Help -Online <x>` | Aide à jour sur le site Microsoft |

## 5. Cmdlets de base et objets

Un **objet** (carte réseau, disque, utilisateur, fichier…) a des **propriétés** (caractéristiques) et des **méthodes** (actions). Exemple du cours : l'objet *monBallon* (forme, diamètre, masse / lancer, gonfler…).

```powershell
Get-monBallon                              # quelques propriétés (les autres sont cachées)
Get-monBallon | Select *                   # toutes les propriétés
Get-monBallon | Select diamètre,forme      # seulement celles demandées
(Get-monBallon).description                # une seule propriété
Set-monBallon -Nom "Basket" -Description "Ballon de Basket"   # modifier
New-monBallon -Nom "Rugby" -Forme "ovale"                     # créer
Remove-monBallon -Nom "Football"                              # supprimer
```

**`Get-Command`** : la cmdlet la plus importante, pour découvrir les commandes.

```powershell
Get-Command get-*        # commandes qui commencent par Get
Get-Command *printer*    # contenant "printer"
Get-Command new-*user*   # commencent par New ET contiennent "user"
```

Une fois la commande trouvée → `Get-Help` pour se l'approprier.

!!! tip "En complément (tes notes)"
    - `Get-Verb` affiche les **verbes reconnus** par PowerShell, `Get-Alias` les alias.
    - **Rétrocompatibilité** : capacité d'un script ou d'un logiciel récent à fonctionner sur des versions plus anciennes (d'où l'intérêt de vérifier `$PSVersionTable`).

---

## Exercices

**Exercice 1** : dans `help copy`, que signifient `[ ]`, `{ }` et `|` ?

??? success "Correction"
    `[ ]` facultatif, `{ }` choisir un élément parmi ceux présents, `|` séparateur (l'un ou l'autre).

**Exercice 2 (TP Premiers pas)** : quelle commande affiche la version de PowerShell ?

??? success "Correction"
    `$PSVersionTable` (ou `Get-Host`).

**Exercice 3** : affiche le contenu de `C:\Users`. Quels sont les alias de `Get-ChildItem` ?

??? success "Correction"
    `Get-ChildItem -Path C:\Users` — alias : `dir`, `gci`, `ls` (trouvés avec `Get-Alias`).

**Exercice 4** : affiche le contenu du fichier `C:\PowerShell\Intro.txt`, puis va à la racine de `C:\`.

??? success "Correction"
    `Get-Content C:\PowerShell\Intro.txt` (alias `gc`, `type`, `cat`), puis `Set-Location C:\` (alias `cd`).

**Exercice 5** : trouve toutes les cmdlets qui créent quelque chose lié aux utilisateurs.

??? success "Correction"
    `Get-Command new-*user*`
