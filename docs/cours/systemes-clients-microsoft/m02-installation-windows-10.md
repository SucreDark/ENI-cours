---
tags:
  - Systèmes clients Microsoft
---

# Module 2 – Installation de Windows 10

!!! abstract "En bref"
    Prendre en compte les prérequis, installer Windows 10 et faire la première configuration.
    Tous les supports d'installation partagent le même fichier source : **install.wim**.

## 1. Les prérequis

| Ressource | 32 bits | 64 bits |
|---|---|---|
| Processeur | 1 GHz | 1 GHz |
| RAM | 1 Go | 2 Go |
| Disque | 16 Go | 32 Go |

**Le 64 bits, c'est quoi ?**

- Adaptation de l'OS aux évolutions des composants, meilleures performances
- Prise en compte native de **plus de 4 Go de RAM**
- Meilleure protection du système, **nécessite des pilotes signés**

## 2. L'installation

**Supports :** DVD, clé USB, image ISO, partage réseau / serveur de déploiement… tout support amorçable pouvant contenir **install.wim**.

Un **mini-OS** est requis pour installer (ou réparer) Windows : il se trouve dans **boot.wim**.

| Type | Quand |
|---|---|
| **Nouvelle installation** | Nouveau matériel, ou remplacement d'un système existant |
| **Mise à niveau** (MAN) | Par-dessus un Windows existant, pour garder applis, paramètres et données. Possible depuis **Windows 7 64 bits** et plus récent |

**Étapes :**

1. Démarrage dans l'environnement d'installation, choix de l'édition (Famille, Pro…) et du mode
2. Configuration du matériel : partitionnement et formatage
3. Copie du contenu de l'image sur la partition
4. Paramétrage automatique (1 redémarrage)
5. 1er démarrage sur le disque, préparation pour la 1re utilisation

## 3. La migration

Que transférer ? Comptes et profils, config des logiciels, paramètres système (pilotes, polices, messagerie…), fichiers et dossiers.

| Quoi | Outil |
|---|---|
| Fichiers et dossiers | Fonctionnalité **Sauvegarder et restaurer** |
| Comptes, paramètres système et logiciels | **USMT** (User State Migration Tool), en ligne de commande |

## 4. TP – Installation de Windows

Créer une VM sous VMware Workstation, installer Windows 10 Pro, faire la config initiale, importer une VM existante.

| Paramètre VM | Valeur |
|---|---|
| Configuration | Typique |
| OS invité | Windows 10 x64 |
| Nom | Win10-XX (XX = tes initiales) |
| Disque | 32 Go (un seul fichier) |
| Mémoire | 4 Go |
| Processeur | 1 processeur, 1 cœur |
| Réseau | Host-Only |

!!! tip "Outil psr"
    `psr` (Enregistreur d'actions utilisateur) enregistre tes étapes avec captures d'écran pour rédiger une procédure :
    clic droit Démarrer > Exécuter > `psr`.

---

## Exercices

**Exercice 1** : quelle quantité de RAM et de disque faut-il au minimum pour Windows 10 64 bits ?

??? success "Correction"
    2 Go de RAM et 32 Go de disque (CPU 1 GHz).

**Exercice 2** : quel fichier contient le système à installer, et lequel contient le mini-OS d'installation ?

??? success "Correction"
    **install.wim** = le système ; **boot.wim** = le mini-OS d'installation / réparation.

**Exercice 3** : quel outil utiliser pour migrer les comptes utilisateurs et les paramètres vers un nouveau poste ?

??? success "Correction"
    **USMT** (User State Migration Tool), en ligne de commande.

**Exercice 4 (TP)** : refais le TP.

- [ ] Créer les dossiers `ISO`, `Procédures` et `VMs-WorkStation`
- [ ] Créer la VM Win10-XX (tableau ci-dessus) et lancer `psr`
- [ ] Installer Windows 10 Pro en français sur tout le disque (installation personnalisée, sans clé)
- [ ] Config de base : France, clavier français, sans internet (installation limitée), utilisateur `pnom`, tout le reste désactivé
- [ ] Installer les VMware Tools, éjecter le DVD, éteindre, snapshot « TP1 terminé »
- [ ] Importer la VM **Discovery** (OVA) et relever ses caractéristiques
