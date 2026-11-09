---
tags:
  - Microsoft 365 – Outils collaboratifs
---

# Module 1 – Découverte de Microsoft 365

!!! abstract "En bref"
    Microsoft 365 = une offre **SaaS** (cloud) avec de multiples applications.
    Le **tenant** = l'ensemble des services de **ton** abonnement, associé à **ton** domaine, pour **ton** entreprise.

## 1. SaaS et Microsoft 365

**SaaS** (*Software as a Service*) : les logiciels sont installés sur des **serveurs distants** et non sur la machine de l'utilisateur. On ne paie pas une licence pour une version, on paie généralement un **abonnement** au service en ligne.

**Caractéristiques du SaaS** : hébergement sur le cloud · accès à la demande · paiement par abonnement · maintenance et mises à jour automatiques · évolution (fonctionnalités ajoutées).

| Points positifs de l'abonnement | Points négatifs |
|---|---|
| Coût réduit | Dépendance à Internet |
| Facilité d'utilisation | Confidentialité et sécurité |
| Mises à jour automatiques | Coût à long terme |
| Accessibilité universelle | Personnalisation limitée |
| Évolutivité et flexibilité | |

**Microsoft 365 :**

- Offres cloud, multiples applications (Exchange, SharePoint, Office…), **multiplateformes**
- Pour les particuliers et les entreprises
- **Moins de serveurs sur site**
- 75 millions d'utilisateurs actifs par jour (fin mai 2020), datacenters en France

## 2. Les services

| Élément de base | Rôle |
|---|---|
| **Exchange Online** | Messagerie |
| **OneDrive** | Stockage de fichiers personnel |
| **Office 365 ProPlus** | Suite Office (installée ou Online) |
| **SharePoint Online** | Organisation, partage, communauté, création d'applis, gestion |
| **Microsoft Teams** | Collaboration |
| **Azure AD** | Annuaire / identités |

Autres services : **Yammer** (réseau social d'entreprise), **OneNote**, **Delve** (principales activités de l'entreprise), **Stream** (partage de vidéos), **Dynamics 365** (liaison avec les applis métiers)…

### Plans et licences

Office 365 est disponible en **familles** (particuliers, PME, éducation, association, gouvernement, employés de terrain, entreprise) et en **plans** :

| Famille | Exemples de plans |
|---|---|
| Particuliers | Famille, Personnel, Famille et étudiant |
| PME | Business Basic, Business Standard, Business Premium, Apps for Business |
| Éducation | A1, A3, A5 |
| Gouvernement | E1, E3, E5 Secteur public |
| Employés de terrain | F3 |
| Entreprise | E3, E5, Apps for Entreprise |

**Comparatif de quelques plans** (tes notes) :

| Plan | Applis installables | Services | Sécurité avancée | Cible |
|---|---|---|---|---|
| Personnel | Oui | OneDrive, Teams | Non | Particuliers |
| Famille | Oui | OneDrive, Teams | Non | Familles |
| Business Basic | **Non** | Exchange, Teams, SharePoint | Non | PME |
| Business Standard | Oui | Exchange, Teams, SharePoint | Non | PME |
| Business Premium | Oui | Exchange, Teams, SharePoint | **Oui** | PME |
| Entreprise E3 | Oui | Tous les services | Standard | Grandes entreprises |
| Entreprise E5 | Oui | Tous les services | Avancée | Grandes entreprises |

## 3. Le tenant

| Terme | Définition |
|---|---|
| **Famille et plan** | Ex. famille Entreprise, plan E5 |
| **Tenant** | L'ensemble des services de ton abonnement Microsoft 365, associé à ton domaine, pour ton entreprise |
| **Administrateur global** | L'utilisateur qui a souscrit l'abonnement : **les plus hauts privilèges** sur tout le tenant |

**Créer un tenant :**

1. Sélectionner un plan (ex. A1, E5, F3)
2. Fournir une adresse mail valide
3. Entrer les données de l'entreprise (nom, nombre de salariés)
4. Choisir le nom du tenant (ex. `admin@monentreprise.onmicrosoft.com`)
5. Valider et terminer l'inscription

## 4. Le domaine Internet

- Nom de tenant type : `nomadmin@domaine.onmicrosoft.com` (envoi et réception de mails possibles)
- **Le nom du tenant n'est pas modifiable**
- Pour avoir des adresses en `@monentreprise.fr` : **louer un domaine Internet** puis créer un **domaine personnalisé** dans Microsoft 365

---

## Exercices

**Exercice A** : cite 2 avantages et 2 inconvénients d'un abonnement SaaS.

??? success "Correction"
    Avantages : coût réduit, mises à jour automatiques (ou facilité, accessibilité, évolutivité). Inconvénients : dépendance à Internet, coût à long terme (ou confidentialité, personnalisation limitée).

**Exercice B** : quel plan Business ne permet pas d'installer les applis Office ? Lequel ajoute la sécurité avancée ?

??? success "Correction"
    **Business Basic** (applis en ligne uniquement) · **Business Premium**

**Exercice 1** : qu'est-ce que le SaaS ? Donne une différence avec un logiciel classique.

??? success "Correction"
    Logiciel installé sur des serveurs distants, utilisé en ligne. On paie un **abonnement** au service plutôt qu'une licence pour une version installée sur sa machine.

**Exercice 2** : qui a les plus hauts privilèges sur un tenant ?

??? success "Correction"
    L'**administrateur global** (celui qui a souscrit l'abonnement).

**Exercice 3** : ton tenant s'appelle `contoso.onmicrosoft.com`. Comment avoir des adresses en `@contoso.fr` ?

??? success "Correction"
    Louer le domaine `contoso.fr` puis l'ajouter comme **domaine personnalisé** dans Microsoft 365 (le nom du tenant, lui, ne change pas).

**Exercice 4** : associe chaque service à son rôle : Exchange Online, OneDrive, Azure AD, Stream.

??? success "Correction"
    Exchange Online → messagerie · OneDrive → stockage perso · Azure AD → annuaire / identités · Stream → partage de vidéos.
