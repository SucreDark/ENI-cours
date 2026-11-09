---
tags:
  - Systèmes clients Microsoft
---

# Module 13 – Les stratégies de groupe locales

!!! abstract "En bref"
    Les **LGPO** (Local Group Policy Objects) personnalisent l'environnement des utilisateurs, personnalisent Windows et sécurisent le système,
    en modifiant le **registre** de façon conviviale. Prépare aux GPO de domaine.

## 1. La base de registre

- Base de données **hiérarchique et centrale** : toute la configuration du système (utilisateurs, programmes, matériel), depuis Windows 98
- Des milliers de paramètres, consultés en permanence par Windows
- Consultation / modification : **`regedit`**

!!! danger "À manipuler avec la plus grande précaution"

| Ruche | Contenu |
|---|---|
| `HKEY_CLASSES_ROOT` | Infos sur les applications (objets OLE, extensions) |
| `HKEY_CURRENT_USER` | Config de l'utilisateur connecté (= `HKEY_USERS\<SID>`) |
| `HKEY_LOCAL_MACHINE` | Config propre à l'ordinateur (tous utilisateurs) |
| `HKEY_USERS` | Tous les profils utilisateur chargés |
| `HKEY_CURRENT_CONFIG` | Profil matériel utilisé |

Les **ruches** contiennent des **clés** (qui contiennent des clés…), qui contiennent des **valeurs** (binaires / hexadécimales, chaînes). **Chaque valeur = un paramètre du système.**

## 2. Les LGPO

Une seule console pour gérer le poste et les utilisateurs :

- **mmc** + composant logiciel enfichable **Éditeur d'objets de stratégie de groupe**
- **Stratégie de sécurité locale** : `secpol.msc`

**Ce qu'on peut faire :**

- Stratégies de **mots de passe**
- Privilèges d'administration
- Uniformiser l'aspect du poste (bureau, barre des tâches)
- Restreindre l'accès à des paramètres (panneau de configuration, ligne de commande)
- Lancer des **scripts** à l'ouverture / fermeture de session

On peut cibler le poste local ou distant, et différents objets de la SAM (tous, **Administrateurs**, **Non-administrateurs**, un **utilisateur précis**).

### Chaque paramètre

- **Activé** / **Désactivé** / **Non configuré** (= comportement par défaut)
- Peut être commenté, a des conditions, parfois des options
- A surtout une **aide précieuse : lis-la !**

---

## Exercices

**Exercice 1** : dans quelle ruche sont les paramètres de l'utilisateur connecté ? Ceux de la machine ?

??? success "Correction"
    `HKEY_CURRENT_USER` (= `HKEY_USERS\<SID>`) et `HKEY_LOCAL_MACHINE`.

**Exercice 2 (TP)** : impose des mots de passe de 7 caractères min, 3 dans l'historique, complexes.

??? success "Correction"
    `secpol.msc` > Stratégies de comptes > **Stratégie de mot de passe** :
    Longueur minimale = 7, Conserver l'historique = 3, Exigences de complexité = Activé.
    Tester en changeant le mot de passe d'un utilisateur standard (++ctrl+alt+del++ > Modifier un mot de passe).

**Exercice 3 (TP)** : pour les non-administrateurs : interdire le panneau de config, verrouiller la barre des tâches, imposer un fond d'écran.

??? success "Correction"
    `mmc` > ajouter **Éditeur d'objets de stratégie de groupe** > Parcourir > onglet Utilisateurs > **Non-administrateurs**. Puis dans *Configuration utilisateur > Modèles d'administration* :

    - Panneau de configuration > *Interdire l'accès au Panneau de configuration et à l'application Paramètres du PC* → Activé
    - Menu Démarrer et barre des tâches > *Verrouiller la barre des tâches* → Activé
    - Bureau > Bureau > *Papier peint du bureau* → Activé + chemin (BMP/JPG, accessible en lecture)

**Exercice 4 (TP)** : Romain (non-admin) doit quand même avoir le panneau de config, mais pas le gestionnaire des tâches.

??? success "Correction"
    Nouvelle LGPO ciblant **romain** :

    - *Interdire l'accès au Panneau de configuration…* → **Désactivé**
    - Système > Options Ctrl+Alt+Suppr > *Supprimer le Gestionnaire des tâches* → **Activé**

    Tester en ouvrant une session avec Romain.
