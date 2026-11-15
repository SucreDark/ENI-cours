---
tags:
  - Utilisation d'une distribution GNU/Linux
---

# Module 8 – Mécanismes avancés de Linux et Bash

!!! abstract "En bref"
    - Processus : `ps -ef`, `kill [-signal] PID`, `pkill nom`, `&` (arrière-plan), `jobs`, `Ctrl+Z`, `bg`, `fg`, `nohup`, `time`.
    - Redirections : `>` écrase, `>>` ajoute, `2>` erreurs, `| tee` écran + fichier, `<` entrée depuis un fichier.
    - Archiver/compresser avec **`tar`** : `c` créer, `t` lister, `x` extraire, `z` gzip, `j` bzip2, `u` mettre à jour, `v` verbeux, `f` fichier.
    - Alias : `alias ll='ls -l'`, `unalias` · Variables : `nom="valeur"`, `$nom`, `export`, `unset`, `$(commande)`.

## 1. Gestion des processus sous Linux

| Commande | Rôle |
|---|---|
| `ps` | Lister les processus de l'utilisateur (options possibles : `a e f u x`) |
| `ps -ef` | Lister tous les processus en cours |
| `ps -uf` | Visualiser les processus de l'utilisateur sous forme d'arbre |
| `ps -faux` | Visualiser tous les processus sous forme d'arbre |
| `kill [-signal] <PID>` | Tuer un processus en précisant le type d'arrêt |
| `pkill [-signal] <nom>` | Tuer un processus par son nom (ex. `pkill firefox`) |
| `time <commande>` | Visualiser le temps d'exécution d'une commande (ex. `time wc -l Edition`) |
| `commande [opt] <arg> &` | Lancer une commande en **arrière-plan** (`&` en fin de ligne) |
| `jobs [-l]` | Visualiser les processus en arrière-plan (`-l` : afficher leurs PID) |
| `nohup <commande>` | Détacher le processus du terminal où il est lancé : il n'est pas arrêté à la fermeture du terminal |

**Signaux de `kill` :**

| Signal | Rôle |
|---|---|
| `SIGTERM` | Envoie une instruction au processus pour qu'il se **termine proprement** (par défaut si on ne précise rien) |
| `SIGINT` | Signal d'**interruption** (équivalent à `Ctrl+C` dans un terminal) |
| `SIGHUP` | Signal d'arrêt de **session terminal** |
| `SIGKILL` | Arrêt **inconditionnel** : tue directement le processus |

Exemple : `ps -f` affiche les PID → `kill 749` → un nouveau `ps -f` montre que le processus 749 a disparu.

**Reprendre la main sur le terminal :**

| Commande | Rôle |
|---|---|
| `Ctrl+Z` | Stopper (suspendre) le processus au premier plan |
| `bg 1` | Le relancer en arrière-plan |
| `jobs` | Regarder s'il est bien lancé |
| `fg 1` | Le remettre au premier plan |

## 2. Les mécanismes de redirections

| Commande | Rôle |
|---|---|
| `commande > fichier.txt` | Enregistrer la sortie standard : **écraser** le contenu du fichier |
| `commande >> fichier.txt` | Enregistrer la sortie standard : **ajouter** au contenu du fichier |
| `commande 2> errors.log` | Enregistrer la sortie d'**erreur** : écraser le fichier |
| `commande 2>> errors.log` | Enregistrer la sortie d'erreur : ajouter au fichier |
| `commande \| tee [-a] fichier.txt` | **Doubler** la sortie standard : à l'écran **et** dans un fichier |
| `commande < fichiersource.txt` | Rediriger le flux d'**entrée** depuis un fichier (ex. `wall < modeles/warning.txt`) |

## 3. Archivage et compression

- **Archiver** : créer un fichier conteneur dans lequel on pourra en stocker d'autres (ex. un fichier ISO).
- **Compresser** : réduire la taille d'un fichier pour gagner de la place et faire des transferts plus rapidement (ex. un fichier zip).
- Sous Linux, une commande pour tout faire : **`tar`**.

```bash
tar [ctxzjuvf] archive.tar
```

| Option | Rôle |
|---|---|
| `tar -c` | Créer une archive |
| `tar -t` | Lister le contenu |
| `tar -x` | Extraire le contenu |
| `tar -z` | Préciser la compression avec gzip |
| `tar -j` | Préciser la compression avec bzip2 |
| `tar -u` | Mettre à jour une archive |
| `tar -v` | Activer le mode verbeux |
| `tar -f` | Préciser le nom du fichier |

Exemple : créer `archive.tar` contenant le fichier `Edition` et tous les `.txt` : `tar -cvf archive.tar Edition *.txt`

## 4. Gestion des alias avec Bash

Un **alias** est un raccourci, une abréviation.

| Alias | Raccourci de |
|---|---|
| `ll` | `ls -l` |
| `rm` | `rm -i` |
| `ipa` | `ip address show dev ens33 \| grep 'inet'` |
| `grep` | `grep --color=auto` |

| Commande | Rôle |
|---|---|
| `alias ll='ls -l'` | Créer un alias |
| `unalias rm` | Supprimer un alias |

- Dans `~/.bashrc` (avec vim), on **supprime le `#`** devant l'alias que l'on veut utiliser ; inversement, on **remet le `#`** pour le désactiver.

## 5. Plus loin avec les variables

- Chaque variable porte un **nom**, qui permet de récupérer et modifier le contenu de cette mémoire.
- La donnée n'existe que dans la **mémoire vive** du système.
- Pour lire une variable, on accole un **`$`** avant son nom : `echo $var`.

| Commande | Rôle |
|---|---|
| `prenom="Romain"` puis `echo $prenom` | Créer une variable |
| `export prenom` | Exporter une variable (visible dans un sous-shell : `bash` puis `echo $prenom`) |
| `export departement="comptabilité"` | Créer une variable d'environnement |
| `unset departement` | Détruire une variable |
| `heure=$(date +%Hh%M)` puis `echo $heure` | Variable contenant le résultat d'une commande |

---

## Exercices

**Exercice 1** : liste tous les processus en cours sous forme d'arbre. Puis tue proprement le processus 1234, et s'il résiste, de force.

??? success "Correction"
    `ps -faux` · `kill 1234` (SIGTERM par défaut) puis `kill -SIGKILL 1234`

**Exercice 2** : ferme tous les processus Firefox par leur nom.

??? success "Correction"
    `pkill firefox`

**Exercice 3** : tu as lancé une longue commande sans `&` et tu n'as plus la main. Comment la passer en arrière-plan puis la ramener ?

??? success "Correction"
    `Ctrl+Z` (stopper), `bg 1` (relancer en arrière-plan), `jobs` (vérifier), `fg 1` (premier plan).

**Exercice 4** : lance `script.sh` pour qu'il continue même si tu fermes le terminal.

??? success "Correction"
    `nohup ./script.sh &`

**Exercice 5** : enregistre la liste des fichiers dans `liste.txt`, puis ajoute la date à la fin du même fichier.

??? success "Correction"
    `ls > liste.txt` · `date >> liste.txt`

**Exercice 6** : lance `find / -name "*.log"` en envoyant les erreurs dans `errors.log`, et le résultat à la fois à l'écran et dans `logs.txt`.

??? success "Correction"
    `find / -name "*.log" 2> errors.log | tee logs.txt`

**Exercice 7** : crée une archive compressée gzip `sauv.tar.gz` de ton dossier `Documents`, liste son contenu, puis extrais-la.

??? success "Correction"
    `tar -czvf sauv.tar.gz Documents` · `tar -tzf sauv.tar.gz` · `tar -xzvf sauv.tar.gz`

**Exercice 8** : différence entre archiver et compresser ? Quelle option de tar pour bzip2 ?

??? success "Correction"
    Archiver = regrouper plusieurs fichiers dans un conteneur · compresser = réduire la taille. bzip2 : `-j` (gzip : `-z`).

**Exercice 9** : crée un alias `ipa` qui affiche les adresses IP de `ens33`, puis supprime-le.

??? success "Correction"
    `alias ipa="ip address show dev ens33 | grep 'inet'"` · `unalias ipa`

**Exercice 10** : crée une variable `ville` contenant « Nantes », affiche-la, rends-la visible dans un sous-shell, puis détruis-la.

??? success "Correction"
    `ville="Nantes"` · `echo $ville` · `export ville` (vérifier : `bash`, `echo $ville`, `exit`) · `unset ville`

**Exercice 11** : stocke la date du jour au format `13/11/2026` dans une variable `jour`.

??? success "Correction"
    `jour=$(date +%d/%m/%Y)` puis `echo $jour`

---

## TP 1 – Utilisation des systèmes

**Exercice TP1 1** : liste tous les processus qui finissent par un `d`. Le résultat sera stocké dans `$HOME/process/daemons.txt`.

??? success "Correction"
    `mkdir $HOME/process` puis `ps -e | grep d$ > $HOME/process/daemons.txt` (vérifier : `cat process/daemons.txt`)

**Exercice TP1 2** : recherche les fichiers dont le nom se termine par `.conf` à partir de la racine, uniquement sur le système de fichiers racine. Le résultat sera affiché à l'écran tout en étant stocké dans `$HOME/resultats/fichiers.conf`.

??? success "Correction"
    `mkdir $HOME/resultats` puis `find / -mount -type f -name "*.conf" 2>/dev/null | tee resultats/fichiers.conf`

**Exercice TP1 3** : comment connaître le temps exact d'exécution de la commande précédente ?

??? success "Correction"
    `time find / -mount -type f -name "*.conf" 2>/dev/null | tee resultats/fichiers.conf`

**Exercice TP1 4** : en une commande, renvoie dans `$HOME/resultats/compteur.txt` le nombre de fichiers trouvés au point 2, sans utiliser `fichiers.conf`. Le résultat ne doit contenir que ce nombre.

??? success "Correction"
    `find / -mount -type f -name "*.conf" 2>/dev/null | wc -l > resultats/compteur.txt`

## TP 2 – Archivage et compression

**Exercice TP2 1** : réalise une sauvegarde de ton répertoire personnel dans `/tmp`, en utilisant ton login pour nommer le fichier. Note sa taille.

??? success "Correction"
    `tar -cvf /tmp/$LOGNAME.tar $HOME` · `ls -lh /tmp/$LOGNAME.tar`

**Exercice TP2 2** : crée une nouvelle archive de ton répertoire personnel, compressée avec gzip, en une seule instruction.

??? success "Correction"
    `tar -czvf /tmp/$LOGNAME.tar.gz $HOME` · `ls -lh /tmp/$LOGNAME.tar.gz`

**Exercice TP2 3** : même chose avec une compression bzip2.

??? success "Correction"
    `tar -cjvf /tmp/$LOGNAME.tar.bz2 $HOME` · `ls -lh /tmp/$LOGNAME.tar.bz2`

**Exercice TP2 4** : compare la taille des trois archives. Laquelle est la moins volumineuse ?

??? success "Correction"
    `ls -l /tmp/$LOGNAME.tar*`

**Exercice TP2 5** : dans ton répertoire de connexion, crée le répertoire `Restaurations` et restaure ta sauvegarde dedans en une seule instruction.

??? success "Correction"
    `mkdir $HOME/Restaurations` puis `tar -xzvf /tmp/$LOGNAME.tar.gz -C Restaurations` (`-C` : dossier de destination)

**Exercice TP2 6** : crée une nouvelle sauvegarde non compressée en excluant ce répertoire.

??? success "Correction"
    `tar -cvf /tmp/$LOGNAME-v2.tar --exclude=Restaurations $HOME`

**Exercice TP2 7** : crée un nouveau fichier vide dans ton répertoire d'accueil et mets à jour l'archive. Vérifie avec la commande qui liste le contenu de l'archive.

??? success "Correction"
    `touch new_fichier.txt` · `tar -uvf /tmp/$LOGNAME-v2.tar ~/new_fichier.txt` · `tar -tf /tmp/$LOGNAME-v2.tar`

## TP 3 – Redirections et alias

**Exercice TP3 1** : reproduis les actions du TP 1 (lister les daemons, rechercher les `.conf`, compter les fichiers) avec des **alias**.

??? success "Correction"
    ```bash
    mkdir -p $HOME/process $HOME/resultats
    alias lister_daemons='ps -e | grep d$ > $HOME/process/daemons.txt'
    alias rechercher_conf='find / -mount -type f -name "*.conf" 2>/dev/null | tee $HOME/resultats/fichiers.conf'
    alias compter_fichiers='find / -mount -type f -name "*.conf" 2>/dev/null | wc -l > $HOME/resultats/compteur.txt'
    lister_daemons
    rechercher_conf
    time rechercher_conf
    compter_fichiers
    ```
    Les alias ne sont valables que pour la session actuelle.

**Exercice TP3 2** : compte les fichiers trouvés **à partir** du fichier `fichiers.conf` (deux façons).

??? success "Correction"
    `cat $HOME/resultats/fichiers.conf | wc -l > $HOME/resultats/compteur.txt` · `grep -c f$ $HOME/resultats/fichiers.conf > $HOME/resultats/compteur.txt`

## TP 4 – Manipuler des variables

**Exercice TP4 1** : affiche le répertoire personnel en utilisant une variable adéquate.

??? success "Correction"
    `ls $HOME` (ou `ls ~`)

**Exercice TP4 2** : affiche le contenu de la variable contenant les chemins vers les binaires usuels de l'utilisateur.

??? success "Correction"
    `echo $PATH`

**Exercice TP4 3** : crée un dossier `scripts` à la racine du répertoire personnel et ajoute-le aux chemins usuels, de façon pérenne.

??? success "Correction"
    `mkdir $HOME/scripts` · `PATH=$PATH:$HOME/scripts` · pérenne : `echo PATH=$PATH:$HOME/scripts >> ~/.bashrc`

**Exercice TP4 4** : crée une variable `monnom` contenant le login de l'utilisateur.

??? success "Correction"
    `monnom="$LOGNAME"` (ou `monnom=$(logname)`)

**Exercice TP4 5** : affiche les variables de l'utilisateur.

??? success "Correction"
    `env`

**Exercice TP4 6** : ouvre un sous-shell et vérifie le contenu de `monnom` (il doit être vide). Ferme le sous-shell.

??? success "Correction"
    `bash` · `echo $monnom` (vide : variable locale) · `exit`

**Exercice TP4 7** : transforme la variable locale en variable d'environnement.

??? success "Correction"
    `export monnom`

**Exercice TP4 8** : ouvre un sous-shell et vérifie `monnom` (il doit contenir le login). Ferme le sous-shell.

??? success "Correction"
    `bash` · `echo $monnom` · `exit`
