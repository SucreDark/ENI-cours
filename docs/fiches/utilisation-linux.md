---
tags:
  - Fiche mémo
---

# Fiche mémo – Utilisation d'une distribution GNU/Linux

<div class="fiche-actions" markdown="0"><button class="exo-btn" onclick="window.print()">🖨 Imprimer / PDF</button></div>

!!! info "Fiche générée automatiquement"
    Les « En bref » et les commandes de chaque module de ce cours, rien de plus.

## Module 1 – Introduction à Unix/Linux

- Linux = **système d'exploitation majeur issu d'Unix**, utilisé surtout en **ligne de commande** (CLI).
- Très présent sur les **serveurs**, les **smartphones** (Android) et les **objets connectés**.
- Au cœur de l'écosystème : le **logiciel libre** (code source disponible, licences GPL, Apache, BSD…).

[:octicons-arrow-right-24: Voir le module](../cours/utilisation-linux/m01-introduction-unix-linux.md)

## Module 2 – Découverte du système d'exploitation Linux

- Le **noyau** (*kernel*) est le programme principal : il gère les ressources et ordonnance les tâches.
- Le **shell** principal des distributions GNU/Linux est **bash**.
- Connexion à distance en **SSH** (PuTTY…), déconnexion avec `exit`, `logout` ou ++ctrl+d++.

| Commande | Rôle |
|---|---|
| `exit` | Compatible avec presque tous les shells |
| `logout` | Disponible sur bash mais pas sur le Bourne shell |

[:octicons-arrow-right-24: Voir le module](../cours/utilisation-linux/m02-decouverte-linux.md)

## Module 3 – Découverte du shell et premières commandes

- **root** = super admin (invite `#`) : on se connecte avec son compte normal, puis on élève ses droits au besoin.
- Une variable se lit avec **`$`** devant son nom (`$HOME`, `$PATH`…).
- Aide : `commande --help`, `man commande`, `help` (commandes internes du shell).

| Commande | Rôle |
|---|---|
| `logname` | Nom de l'utilisateur |
| `id` | Infos de groupes, UID, GID |
| `who` | Utilisateurs connectés |
| `passwd` | Modifier le mot de passe |
| `passwd -S` | Informations sur le mot de passe actuel |
| `date` | Date et heure (modifiable avec un format) |
| `cal` | Affiche le calendrier |
| `tty` | Affiche le nom du terminal |
| `pwd` | Où on est dans les dossiers |
| `%n` | Retour à la ligne |
| `%A` | Le jour (lundi…) |
| `%d` | Le numéro du jour du mois |
| `%B` | Le mois |
| `%Y` | L'année |
| `%H` · `%M` | Heures · minutes |
| `HOME` (ou `~`) | Répertoire de l'utilisateur |
| `HOSTNAME` | Nom de la machine |
| `LANG` | Langue et encodage des caractères |
| `LOGNAME` · `USER` | Nom de l'utilisateur actuel |
| `PATH` | Où se trouvent les commandes et scripts utilisables |
| `PS1` | Formatage du prompt |
| `PWD` | Répertoire actuel |
| `SHELL` | Shell de connexion |
| `/mot` | Rechercher « mot » dans la page |
| `n` · `N` | Occurrence suivante · précédente |
| `h` | Aide interne de man |
| `q` | Quitter |
| `passwd` | Changer son mot de passe (respecter la complexité) |
| `who` | Utilisateurs connectés |
| `who am i` | Depuis quand **je** suis connecté |
| `w -u` | Temps d'inactivité des utilisateurs connectés |
| `who am i --all --heading` / `echo $$` | Numéro de processus de la session |
| `id` | UID, GID et groupes d'appartenance |
| `date +%X` | Juste l'heure |
| `date "+%A %d %B %Y"` | Date au format « lundi 24 septembre 2009 » |
| `cal [mois] [année]` | Calendrier (`cal 1 1900`, `cal 1900`) |
| `exit` | Fermer la session |

[:octicons-arrow-right-24: Voir le module](../cours/utilisation-linux/m03-premieres-commandes.md)

## Module 4 – Fichiers et dossiers sous Linux

- Le répertoire personnel est dans **`$HOME`**.
- `cd` pour se déplacer, `cd ..` pour remonter, `.` = le répertoire actuel.
- Le **FHS** standardise l'arborescence : `/home`, `/etc`, `/var/log`, `/bin`…

| Commande | Rôle |
|---|---|
| `cd` | Se déplacer dans les dossiers, un à un ou en écrivant le chemin complet |
| `cd ..` | Remonter au dossier précédent (enchaînable pour remonter plusieurs dossiers : `cd ../..`) |
| `.` | Le répertoire actuel : pour lancer un script (`./monscript.sh`) ou le préciser (`find . -name "*.txt"`) |
| `/home` | Dossiers de tous les utilisateurs, **sauf root** |
| `/root` | Répertoire de l'utilisateur root |
| `/media` | Pour connecter des médias (CD, USB) |
| `/mnt` | Pour connecter des partitions de disques |
| `/bin` | Commandes pour les utilisateurs |
| `/sbin` | Commandes pour root (super-admin) |
| `/opt` | Programmes installés manuellement |
| `/boot` | Fichiers de démarrage |
| `/dev` | Fichiers de liaison des périphériques (disque dur, clavier, écran…) |
| `/etc` | Paramètres du système |
| `/var` | Données variables (sites web, journaux…) |
| `/var/log` | Fichiers de journalisation du système |
| `/lib` | Librairies utiles aux exécutables de `/bin` et `/sbin` |
| `/tmp` | Fichiers temporaires |
| `/proc` | Répertoire virtuel des paramètres du noyau |
| `/sys` | Informations sur les périphériques et pilotes |

[:octicons-arrow-right-24: Voir le module](../cours/utilisation-linux/m04-fichiers-dossiers.md)
