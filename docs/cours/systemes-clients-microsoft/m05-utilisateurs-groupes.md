---
tags:
  - Systèmes clients Microsoft
---

# Module 5 – Les utilisateurs et les groupes

!!! abstract "En bref"
    1 collaborateur = 1 utilisateur. Chaque utilisateur et chaque groupe a un **SID** ;
    l'ensemble des SID forme le **jeton d'accès** (`whoami`). L'**UAC** n'accorde les privilèges que quand c'est nécessaire.

## 1. La notion d'utilisateur

Le poste client est une porte ouverte sur le SI : il faut s'identifier.
Accès validé par **identifiant + mot de passe**, **biométrie** (Windows Hello), **objet tiers** (carte à puce, badge), + 2ᵉ authentification possible (SMS, lien…).

| | Utilisateur **local** | Utilisateur **du domaine** |
|---|---|---|
| Stockage | Base locale **SAM** (Security Account Manager) | Annuaire **Active Directory** (contrôleur de domaine, ou externalisé : Azure…) |
| Portée | Ressources de cet ordinateur seulement | Session possible sur tous les ordinateurs du domaine |
| Authentification | Locale | **Kerberos**, par le réseau |
| Ouverture de session | Comptes affichés sur l'écran d'accueil | Poste joint au domaine au préalable ; domaine sélectionné par défaut |

Tout utilisateur est identifié par son **SID** (Security IDentifier).

### Catégories d'utilisateurs

| Catégorie | Droits | Groupe |
|---|---|---|
| **Standard** | Utiliser les ressources | Utilisateurs |
| **Administrateur** | Utiliser et modifier les ressources (l'utilisateur créé à l'installation en fait partie) | Administrateurs |
| **Invité** | Utilisation restreinte, sans mot de passe | Invités |

!!! warning "Désactivés par défaut"
    Les comptes **Administrateur** et **Invité** intégrés sont désactivés par défaut.

## 2. Les profils

À la 1re ouverture de session, un **profil** est créé dans `C:\Users\<login>` : paramètres et données (Documents, Téléchargements, Bureau, Images…).

- **Profil public** : commun à tous
- **Profil par défaut** (caché) : modèle pour créer les nouveaux profils

!!! danger "Ne jamais gérer les profils à la main dans C:\Users"
    Passer par `sysdm.cpl` > Paramètres système avancés > Profils des utilisateurs (supprimer, changer le type, profil par défaut).

## 3. Les groupes

Tout utilisateur appartient à au moins un groupe. Le SID du groupe s'ajoute au jeton d'accès de l'utilisateur.

| Type | Rôle |
|---|---|
| **Groupes locaux** | Autorisations d'accès aux ressources, privilèges d'administration |
| **Groupes prédéfinis** | Présents nativement : privilèges et délégation (Administrateurs, Opérateurs de sauvegarde…) |
| **Entités de sécurité intégrées** | Invisibles dans les consoles, affectation automatique (Tout le monde, Utilisateurs authentifiés…) |

## 4. Les outils

| Outil | |
|---|---|
| `lusrmgr.msc` | Utilisateurs et groupes locaux |
| `compmgmt.msc` | Gestion de l'ordinateur |
| Panneau de config > Comptes d'utilisateurs | Orienté utilisateur |
| `net user` / `net localgroup` | Ligne de commande (`net help user`) |

```powershell
Get-LocalUser                   # liste
New-LocalUser / Set-LocalUser / Rename-LocalUser
Enable-LocalUser / Disable-LocalUser / Remove-LocalUser
{Get|Set|New|Remove}-LocalGroup
{Get|Set|Remove}-LocalGroupMember
```

## 5. Le contrôle de compte d'utilisateur (UAC)

Sans UAC, tout le monde est logé à la même enseigne, même les admins. Avec l'UAC, les privilèges ne sont accordés que si nécessaire :
élévation symbolisée par le **bouclier** → **validation** pour un admin, **authentification** pour un utilisateur standard.

- **Pourquoi** : lutter contre les programmes malveillants, avertir avant un paramètre sensible
- **Configurer** : panneau de configuration, ou `secpol.msc` > Stratégies locales > Options de sécurité > « Contrôle de compte d'utilisateur »
- **Demander l'élévation** : clic droit > *Exécuter en tant qu'administrateur*

## Récapitulatif

Un utilisateur = login + mot de passe, un **profil local** (créé à la 1re session), un **SID**, des **appartenances de groupes** (onglet *Membre de*). Tous ces SID = **jeton d'accès**, consultable avec `whoami`.

---

## Exercices

**Exercice 1** : où est stocké un compte local ? un compte de domaine ?

??? success "Correction"
    Local : base **SAM** de l'ordinateur. Domaine : annuaire **Active Directory**.

**Exercice 2 (TP)** : François doit administrer tout le poste, Yann lire les journaux et configurer la carte réseau, deux collègues sauvegarder le poste. Dans quels groupes prédéfinis les mettre ?

??? success "Correction"
    - François → **Administrateurs**
    - Yann → **Lecteurs des journaux d'événements** + **Opérateurs de configuration réseau**
    - Collègues → **Opérateurs de sauvegarde**

**Exercice 3** : crée l'utilisateur Romain en cmd sans que le mot de passe s'affiche, puis ajoute-le à L_Responsables.

??? success "Correction"
    Dans un cmd **en administrateur** :
    ```
    net user Romain * /add
    net localgroup L_Responsables Romain /add
    ```

**Exercice 4** : un collègue retiré du groupe Utilisateurs ne peut plus ouvrir de session. Pourquoi ?

??? success "Correction"
    Seuls les membres de **Utilisateurs**, **Administrateurs** ou **Invités** peuvent ouvrir une session locale.

**Exercice 5** : Yann et Romain existent mais n'ont pas de profil dans `C:\Users`. Normal ?

??? success "Correction"
    Oui : le profil n'est créé qu'à la **première ouverture de session**, à partir du **profil par défaut**.

**Exercice 6** : affiche ton SID puis ceux de tes groupes.

??? success "Correction"
    `whoami /user` puis `whoami /groups`.

**Exercice 7 (PowerShell)** : liste nom, SID, description des utilisateurs locaux ; puis nom et SID des membres de L_SupportInfo.

??? success "Correction"
    ```powershell
    Get-LocalUser | Select Name,SID,Description
    Get-LocalGroupMember -Name L_SupportInfo | Select Name,SID
    ```
