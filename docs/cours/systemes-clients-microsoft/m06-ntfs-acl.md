---
tags:
  - Systèmes clients Microsoft
---

# Module 6 – La sécurité NTFS et les ACL

!!! abstract "En bref"
    **ACL = DACL + ACE.** Sur un volume NTFS, chaque dossier/fichier filtre le jeton d'accès de l'utilisateur.
    Toujours **tester les accès** et respecter les bonnes pratiques Microsoft.

## 1. NTFS et les ACL

Sur un volume **NTFS** :

- Tous les dossiers et fichiers sont soumis à la sécurité NTFS
- Des **autorisations** définissent les privilèges d'accès
- L'utilisateur présente son **jeton d'accès**, filtré par la ressource
- Les autorisations sont stockées dans l'index NTFS, visibles dans l'**onglet Sécurité** de chaque objet

| Sigle | Nom | Contenu |
|---|---|---|
| **ACL** | Liste de contrôle d'accès | DACL + ACE |
| **DACL** | Liste de contrôle d'accès discrétionnaire | Les utilisateurs et groupes (locaux, prédéfinis, entités de sécurité) |
| **ACE** | Entrée de contrôle d'accès | Les privilèges d'accès d'un groupe |

## 2. Les autorisations

**ACE de base** (cumulatives, menu *Modifier*) :

| Niveau | Comprend |
|---|---|
| **Lecture** | Affichage du contenu du dossier, Lecture, Lecture et exécution |
| **Modification** | Écriture, Modification |
| **Contrôle total** | Tout (dont modifier les ACL) |

**Autorisations spéciales** (menu *Avancé*) : affinent les privilèges (création de fichiers, suppression de sous-dossiers et fichiers…).

### Les règles

- Un groupe **absent** de la DACL → accès refusé (**refus implicite**)
- Chaque règle peut **autoriser** ou **refuser**
- Plusieurs règles peuvent s'appliquer à un même utilisateur : **la plus permissive l'emporte**
- Mais le **refus explicite l'emporte** sur l'autorisation

## 3. L'héritage

- Un dossier propage par défaut ses autorisations à ses enfants
- Les autorisations héritées sont **grisées** et non modifiables
- Une **autorisation explicite** l'emporte sur un **refus hérité**
- Pour les modifier : changer le dossier parent (voire la racine du volume) ou **casser l'héritage** (avec précaution, menu *Avancé*)

### Copie et déplacement

| | Même volume | Entre deux volumes |
|---|---|---|
| **Déplacement** | **Conserve** ses autorisations | Hérite de la destination |
| **Copie** | Hérite de la destination | Hérite de la destination |

## 4. Vérifier les accès

- Tester **en grandeur réelle** en ouvrant une session avec les utilisateurs
- Ou : propriétés > Sécurité > Avancé > onglet **Accès effectif**

## 5. Bonnes pratiques

- Privilégier les **groupes** dans les DACL (pas d'utilisateurs)
- Utiliser au maximum les **ACE de base**
- Garder l'héritage en tête (copies, déplacements) et **privilégier l'héritage**
- Privilégier le **refus implicite**
- **Toujours tester** les accès
- Attention au **double jeton d'accès** des administrateurs (UAC) !

---

## Exercices

**Exercice 1** : un utilisateur a « Lecture » via un groupe et « Modification » via un autre. Que peut-il faire ? Et s'il a en plus un refus explicite en écriture ?

??? success "Correction"
    Les droits se cumulent → **Modification**. Avec un **refus explicite**, le refus l'emporte → pas d'écriture.

**Exercice 2** : tu déplaces un fichier de `D:\A` vers `D:\B`. Garde-t-il ses autorisations ? Et vers `E:\` ?

??? success "Correction"
    Même volume : il **conserve** ses autorisations. Autre volume : il **hérite** de la destination.

**Exercice 3 (TP)** : quelles autorisations a par défaut un dossier créé à la racine du volume DATA ?

??? success "Correction"
    Hérités du volume (coches grisées) : Utilisateurs authentifiés → Modification, Système → Contrôle total, Administrateurs → Contrôle total, Utilisateurs → Lecture.

**Exercice 4 (TP)** : sur `Echange`, tes collègues modifient, les admins ont le contrôle total, les utilisateurs lisent. Comment faire proprement ?

??? success "Correction"
    1. Sur le volume D: : supprimer *Utilisateurs authentifiés* (garder Système et Administrateurs en Contrôle total, Utilisateurs en Lecture)
    2. Sur `Echange` : ajouter le **groupe** `L_Collegues` en **Modification**
    3. Tester avec chaque utilisateur ou via **Accès effectif**

**Exercice 5 (PowerShell)** : affiche les droits du dossier `M:\2022`. Quelle cmdlet modifie une ACL ?

??? success "Correction"
    `Get-Acl M:\2022` (`(Get-Acl M:\2022).Access` pour le détail) ; modification avec **`Set-Acl`**.
