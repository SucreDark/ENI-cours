---
tags:
  - Utilisation d'une distribution GNU/Linux
---

# Module 2 – Découverte du système d'exploitation Linux

!!! abstract "En bref"
    - Le **noyau** (*kernel*) est le programme principal : il gère les ressources et ordonnance les tâches.
    - Le **shell** principal des distributions GNU/Linux est **bash**.
    - Connexion à distance en **SSH** (PuTTY…), déconnexion avec `exit`, `logout` ou ++ctrl+d++.

## 1. Les différents types d'OS

| Type | Exemple |
|---|---|
| Système **propriétaire** | OS400 (IBM) |
| Système ouvert **mono-poste, mono-tâche** | DOS |
| Système ouvert **multi-poste, multi-tâche** | Unix, GNU/Linux, Windows, OS X |

## 2. Le noyau

Le **noyau** Unix/Linux est le **programme principal** du système. Son rôle :

- **gérer les ressources** ;
- **ordonnancer** les différentes tâches ;
- **mettre les ressources à disposition** des utilisateurs.

Les « linuxiens » parlent très souvent de **kernel** (= noyau).

## 3. Les shells

| Shell | Commande | À retenir |
|---|---|---|
| Bourne shell | `sh` | Apparaît dans Unix v7 |
| C shell | `csh` / `tcsh` | Inspiré du langage C |
| Korn shell | `ksh` | Compatible Bourne shell, reprend des éléments du C shell |
| **Bourne Again Shell** | `bash` | **Shell principal** des distributions GNU/Linux, implémentation libre du Bourne shell |

## 4. Connexion et déconnexion à distance

| Outil | Particularité |
|---|---|
| **PuTTY** | Le plus connu pour la connexion **SSH**, open source (licence MIT), modules de copie de fichiers `pscp` et `psftp` |
| **KiTTY** | « Fork » de PuTTY, lancement automatique de commandes |
| **mRemoteNG** | Multi-connexion (Linux, Windows, Citrix…) |
| **MobaXterm** | Logiciel propriétaire, multi-protocole (Linux, Windows, VNC…) |

**3 méthodes de déconnexion** :

| Méthode | À retenir |
|---|---|
| `exit` | Compatible avec presque tous les shells |
| `logout` | Disponible sur bash mais pas sur le Bourne shell |
| ++ctrl+d++ (`^D`) | Raccourci clavier |

---

## Exercices

**Exercice 1** : cite les 3 rôles du noyau.

??? success "Correction"
    Gérer les ressources · ordonnancer les tâches · mettre les ressources à disposition des utilisateurs

**Exercice 2** : quel est le shell principal des distributions GNU/Linux ? De quel shell est-il l'implémentation libre ?

??? success "Correction"
    **bash** (*Bourne Again Shell*), implémentation libre du **Bourne shell** (`sh`)

**Exercice 3** : quel outil utiliser pour copier des fichiers avec PuTTY ?

??? success "Correction"
    `pscp` (ou `psftp`)

**Exercice 4** : `logout` ne marche pas dans ton shell. Pourquoi, et quoi utiliser ?

??? success "Correction"
    Tu es sans doute sous Bourne shell (`sh`) : utilise `exit` ou ++ctrl+d++.
