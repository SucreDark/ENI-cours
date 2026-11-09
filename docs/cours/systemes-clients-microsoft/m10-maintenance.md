---
tags:
  - Systèmes clients Microsoft
---

# Module 10 – Maintenance du système

!!! abstract "En bref"
    Le technicien doit connaître l'état du système **en temps réel** et **sur une période passée**,
    puis en cas de panne **investiguer** et **réparer / restaurer** (points de restauration, WinRE).

## 1. Les outils de diagnostic

**Problématiques :**

- **Performances** : le système arrive-t-il à faire ses tâches ? 4 composants surveillés : **processeur, mémoire, disque, réseau**
- **Fiabilité** : comportement attendu au démarrage, au lancement des services, des applications ?

| Analyse | Outils |
|---|---|
| **Temps réel** | **Gestionnaire des tâches** (processus, services, perf CPU / RAM) · **Observateur d'événements** · **Moniteur de ressources** (détail des 4 composants) · **Analyseur de performances** (compteurs) |
| **Historique** | **Historique de fiabilité** (vue synthétique dans le temps) · **Observateur d'événements** (journaux de 20 Mo par défaut) · **Analyseur de performances** (compteurs planifiés) |
| **Automatique** | **Diagnostic de mémoire Windows** (redémarre et teste la RAM) · **Résolution des problèmes** (packs orientés utilisateur, solution non consultable) |

But : trouver des indices pour comprendre et chercher (aide Windows, Technet, blogs, moteur de recherche…).

## 2. Les points de restauration

Comme un journal des modifications du système, pour revenir à un état antérieur (plus rapide qu'une restauration complète).

- Sauvegarde **le registre, certains fichiers système et les programmes**
- **Ne sauvegarde PAS les données**
- **Désactivé par défaut**, s'active **par lecteur**
- Créés **chaque jour**, à chaque **événement important** (installation de pilote, désinstallation de logiciel…) ou **manuellement**
- Outil : `sysdm.cpl` > Protection du système ; espace dédié géré en **FIFO**
- Restauration possible depuis **WinRE**

## 3. La récupération : WinRE

**WinRE** = OS léger de réparation quand le système principal ne démarre plus : outils de diagnostic et de réparation, réinitialisation du PC (retour config d'usine).

**Lancer WinRE :**

- Menu Démarrer : ++shift++ + Redémarrer
- `shutdown /r /o`
- Paramètres > Mise à jour et sécurité > Récupération > Redémarrer maintenant
- Support d'installation > *Réparer l'ordinateur*
- **Automatiquement** après 2 échecs de démarrage consécutifs, ou 2 arrêts imprévus moins de 2 min après le démarrage

| Option avancée | Rôle |
|---|---|
| **Restauration du système** | Utilise un point de restauration (droits admin requis) |
| **Récupération de l'image système** | Utilise une sauvegarde d'image (si elle existe), média source requis |
| **Invite de commandes** | Outils de diagnostic / réparation, cmd en admin |
| **Rétrograder** | Retour à Windows 7 / 8.1 si Windows 10 est une MAN (pas vers la build W10 précédente) |
| **Paramètres** | Démarrage spécial : mode sans échec, vidéo basse résolution, désactiver le contrôle des signatures de pilotes… |
| **Outil de redémarrage système** | Répare le **MBR** manquant/corrompu et le magasin **BCD** |

---

## Exercices

**Exercice 1** : quel outil donne une vue synthétique de la santé du système sur plusieurs jours ?

??? success "Correction"
    L'**Historique de fiabilité**.

**Exercice 2** : quels outils pour trouver en temps réel les processus qui consomment le plus de CPU, RAM, disque, réseau ?

??? success "Correction"
    **Gestionnaire des tâches** et **Moniteur de ressources**.

**Exercice 3 (TP)** : tu crées un point de restauration, puis des fichiers dans Documents, puis tu désinstalles IE11. Après restauration, qu'est-ce que tu retrouves ?

??? success "Correction"
    IE11 est de retour (désinstallé **après** le point de restauration) **et** les fichiers sont toujours là : un point de restauration **n'affecte pas les données utilisateur**.

**Exercice 4** : comment activer la protection du système et créer un point manuel ?

??? success "Correction"
    `sysdm.cpl` > Protection du système > sélectionner C: > **Configurer** > *Activer la protection du système* (~5 % d'espace) > **Créer**.

**Exercice 5** : cite 3 façons de démarrer sur WinRE.

??? success "Correction"
    ++shift++ + Redémarrer, `shutdown /r /o`, Paramètres > Récupération, ou le support d'installation (*Réparer l'ordinateur*). Il se lance aussi seul après 2 échecs de démarrage.
