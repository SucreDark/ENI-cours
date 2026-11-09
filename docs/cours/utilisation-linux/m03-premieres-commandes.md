---
tags:
  - Utilisation d'une distribution GNU/Linux
---

# Module 3 – Découverte du shell et premières commandes

!!! abstract "En bref"
    - **root** = super admin (invite `#`) : on se connecte avec son compte normal, puis on élève ses droits au besoin.
    - Une variable se lit avec **`$`** devant son nom (`$HOME`, `$PATH`…).
    - Aide : `commande --help`, `man commande`, `help` (commandes internes du shell).

## 1. Le compte root

- Sous Linux et Unix, le compte **root** est le compte du **super administrateur**.
- L'invite de commande de root utilise le caractère **`#`**.
- Un admin utilise son **compte habituel** pour les opérations courantes et fait **ponctuellement une élévation de droits** selon les besoins.
- Il faut d'abord **se connecter normalement**, puis passer en root.

## 2. Premières commandes

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

**Formats de `date`** (le `+` se place au début du format) :

| Format | Affiche |
|---|---|
| `%n` | Retour à la ligne |
| `%A` | Le jour (lundi…) |
| `%d` | Le numéro du jour du mois |
| `%B` | Le mois |
| `%Y` | L'année |
| `%H` · `%M` | Heures · minutes |

```bash
date "+%A %d %B %Y"     # lundi 09 novembre 2026
```

## 3. Les variables

- Chaque variable porte un **nom** qui permet de mettre des données **en mémoire**.
- La donnée n'existe que dans la **mémoire vive** du système.
- Pour **lire** une variable, on colle le caractère **`$`** devant son nom.
- `set` : visualiser toutes les variables et fonctions · `unset` : supprimer une variable.

Variables d'environnement (écrites **en majuscules**) :

| Variable | Contenu |
|---|---|
| `HOME` (ou `~`) | Répertoire de l'utilisateur |
| `HOSTNAME` | Nom de la machine |
| `LANG` | Langue et encodage des caractères |
| `LOGNAME` · `USER` | Nom de l'utilisateur actuel |
| `PATH` | Où se trouvent les commandes et scripts utilisables |
| `PS1` | Formatage du prompt |
| `PWD` | Répertoire actuel |
| `SHELL` | Shell de connexion |

```bash
echo $HOME
echo $PATH
```

## 4. Simplifier bash et trouver de l'aide

- bash garde un **historique** des commandes : flèches ++arrow-up++ / ++arrow-down++, commande `history`.
- Touche ++tab++ : **complétion** automatique.
- `commande --help` : aide rapide.
- `man commande` : ouvre le **manuel** de la commande.
- `help` : aide **uniquement** pour les commandes **internes** du shell.
- `LANG=C man commande` : le manuel en anglais.

| Dans `man` | Action |
|---|---|
| `/mot` | Rechercher « mot » dans la page |
| `n` · `N` | Occurrence suivante · précédente |
| `h` | Aide interne de man |
| `q` | Quitter |

## 5. Commandes vues dans le TP

| Commande | Rôle |
|---|---|
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

---

## Exercices

**Exercice 1** : change ton mot de passe et vérifie-le.

??? success "Correction"
    `passwd`, puis `exit` et reconnexion avec le nouveau mot de passe.

**Exercice 2** : depuis quand es-tu connecté ? Qui travaille sur le serveur ?

??? success "Correction"
    `who am i` · `who`

**Exercice 3** : quel est le temps d'inactivité des utilisateurs connectés ?

??? success "Correction"
    `w -u` (ou `who -uH`)

**Exercice 4** : quel est le numéro de processus de ta session ?

??? success "Correction"
    `who am i --all --heading` (ou `echo $$`)

**Exercice 5** : affiche tes UID, GID et groupes.

??? success "Correction"
    `id`

**Exercice 6** : affiche juste l'heure, puis la date au format « lundi 24 septembre 2009 ».

??? success "Correction"
    `date +%X` · `date "+%A %d %B %Y"` (attention au **+** devant le format)

**Exercice 7** : affiche le contenu de ta variable `PATH`, puis le nom de ton terminal.

??? success "Correction"
    `echo $PATH` · `tty`

**Exercice 8** : dans `man ls`, comment chercher le mot « size » puis passer à l'occurrence suivante ?

??? success "Correction"
    `/size` puis `n`

**Exercice 9** : affiche janvier 1900, toute l'année 1900, puis septembre 1752. Particularité ?

??? success "Correction"
    `cal 1 1900` · `cal 1900` · `cal 9 1752` → passage au **calendrier grégorien** : 11 jours sautés, **du 3 au 13 septembre**.
