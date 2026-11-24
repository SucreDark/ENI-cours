---
tags:
  - Administration d'une distribution GNU/Linux
---

# Module 12 – Maintenance d'un système en production

!!! abstract "En bref"
    - **journald** (service systemd) enregistre les événements → `journalctl` (`-f`, `-u`, `-p`, `_PID=`).
    - **rsyslog** conserve les journaux dans des fichiers (`/etc/rsyslog.conf`) : `facility.priorité  fichier`.
    - **cron** planifie les tâches : `crontab -e` (utilisateur) ou `/etc/crontab` (système, + colonne utilisateur) · **anacron** rattrape les tâches manquées.
    - Taille des logs : `/etc/systemd/journald.conf` (`Storage=`, `SystemMaxUse=`, `SystemMaxFileSize=`) et **logrotate**.
    - Infos système : `uname -a`, `lscpu`, `lsblk`, `df`, `du -sh` · performances : `top`, `htop`, `glances`.

## Objectifs

- Analyser le système.
- Gérer les journaux.
- Planifier des tâches.
- Gérer la taille des logs.

## 1. Journald – consulter les journaux

**Journald** est un service de **systemd** qui enregistre les événements des services, des programmes et des tâches.

| Commande | Rôle |
|---|---|
| `systemctl status sshd.service` | État du service + ses derniers logs |
| `journalctl` | Journaux complets |
| `journalctl -f` | Logs en temps réel |
| `journalctl -u cron` | Logs d'un service |
| `journalctl _PID=1` | Logs d'un processus (par PID) |
| `journalctl /usr/sbin/sshd` | Logs d'un programme |
| `journalctl -p err` | Logs d'un niveau de priorité |

Fichier de configuration : `/etc/systemd/journald.conf`.

### Niveaux de priorité (du plus grave au moins grave)

| Niveau | Signification |
|---|---|
| `emerg` | Urgence, système inutilisable |
| `alert` | Intervention immédiate nécessaire |
| `crit` | Erreur de fonctionnement critique |
| `err` | Erreur |
| `warning` | Avertissement |
| `notice` | Événement normal à signaler |
| `info` | Information |
| `debug` | Débogage |

Les options se combinent :

```bash
journalctl -f /usr/sbin/sshd -p info
```

## 2. Rsyslog – conserver les journaux

Journald stocke les logs dans une base de données, par défaut **uniquement pour le démarrage en cours**. **Rsyslog** permet de les conserver dans des **fichiers**.

### Facilities (origine du message)

| Facility | Origine |
|---|---|
| `auth` | Sécurité / authentification (SSH…) |
| `authpriv` | Contrôle d'accès |
| `daemon` | Processus système et applications |
| `kern` | Noyau |
| `mail` | Messagerie |
| `user` | Facility par défaut |
| `local0` à `local7` | Messages de différents programmes |
| `*` | Toutes |
| `none` | Aucune |

### Configuration : `/etc/rsyslog.conf`

Syntaxe : `facility.priorité   fichier`

```
auth,authpriv.*                 /var/log/auth.log
*.*;auth,authpriv.none          -/var/log/syslog
daemon.*                        -/var/log/daemon.log
```

- Le `-` devant le chemin = écriture **asynchrone**.

### logger

Envoyer un message dans les journaux :

```bash
logger -p cron.info message de test
```

→ facility `cron`, priorité `info`.

## 3. Cron – planification des tâches

**cron** exécute automatiquement des commandes à des dates et heures définies.

### Planification utilisateur

```bash
crontab -e     # ouvre le fichier de planification de l'utilisateur
```

| Minute | Heure | Jour du mois | Mois | Jour de semaine | Commande |
|---|---|---|---|---|---|
| 0-59 | 0-23 | 1-31 | 1-12 | 0-7 (0 et 7 = dimanche) | commande à lancer |

| Caractère | Signification | Exemple |
|---|---|---|
| `,` | Liste | `1,3,5` |
| `-` | Intervalle | `10-20` |
| `*` | Toutes les valeurs | `*` |
| `/` | Répétition | `*/2` |

```
0 5 * * 1 /opt/bin/backup.sh
```

→ tous les **lundis à 5h00**.

### Planification système

Fichier `/etc/crontab` : même syntaxe, avec une **colonne en plus** pour l'**utilisateur** qui exécute la commande.

### Anacron

**Anacron** exécute les tâches qui n'ont pas pu être lancées à l'heure prévue (ex. système éteint).

```bash
anacron -u cron.daily    # met à jour l'horodatage de cron.daily
```

## 4. Gestion de la taille des logs

### Journald

- Par défaut, journald stocke dans `/run/log/journal` (non persistant).
- Pour garder les logs de façon **persistante** : créer `/var/log/journal`.

Configuration : `/etc/systemd/journald.conf`

| Paramètre | Rôle |
|---|---|
| `Storage=` | Mode de stockage |
| `SystemMaxUse=` | Taille max utilisée |
| `SystemMaxFileSize=` | Taille max de chaque fichier |

Désactiver rsyslog :

```bash
systemctl disable rsyslog
```

### Logrotate

**Logrotate** gère la taille des fichiers de logs : **rotation, compression, conservation**. Il est lancé chaque jour par cron.

- `/etc/logrotate.conf`
- `/etc/cron.daily/logrotate`

```
/var/log/squid/access.log {
    daily
    compress
    delaycompress
    rotate 366
    create 640
}
```

| Directive | Rôle |
|---|---|
| `daily` | Rotation quotidienne |
| `compress` | Compresser les anciens logs |
| `delaycompress` | Reporter la compression (à la rotation suivante) |
| `rotate 366` | Conserver 366 rotations |
| `create 640` | Créer le nouveau fichier avec les droits 640 |

## 5. Prise d'informations sur le système

### Informations générales

| Commande | Rôle |
|---|---|
| `cat /etc/debian_version` | Version de Debian |
| `uname -a` | Noyau et architecture |
| `lscpu` | Processeur |
| `lspci` | Matériels PCI |
| `lsusb` | Périphériques USB |

### Stockage et fichiers

| Commande | Rôle |
|---|---|
| `fdisk -l` | Partitions |
| `pvs` / `vgs` / `lvs` | PV / VG / LV (LVM) |
| `lsblk` | Disques |
| `blkid` | Systèmes de fichiers |
| `findmnt` | Montages |
| `df` | Espace disponible |
| `du -sh /root` | Taille totale d'un répertoire |
| `ls -lh fichier` | Infos détaillées |
| `file /bin/bash` | Nature / type d'un fichier |
| `lsof /root` | Fichiers ouverts dans un répertoire |

### Performances et processus

| Commande | Rôle |
|---|---|
| `top` | Surveillance en temps réel |
| `htop` | Version interactive (à installer) |
| `glances` | Outil de surveillance (à installer) |

Ils permettent de surveiller le **CPU**, la **RAM**, les **processus** en cours et la **charge** du système.

## Exercices

**Exercice 1** : affiche l'état du service SSH avec ses derniers logs.

??? success "Correction"
    ```bash
    systemctl status sshd.service
    ```

**Exercice 2** : affiche les logs du système en temps réel, puis uniquement ceux du service `cron`.

??? success "Correction"
    ```bash
    journalctl -f
    journalctl -u cron
    ```

**Exercice 3** : affiche les logs du processus de PID 1, puis ceux du programme `/usr/sbin/sshd`.

??? success "Correction"
    ```bash
    journalctl _PID=1
    journalctl /usr/sbin/sshd
    ```

**Exercice 4** : affiche uniquement les erreurs. Range ensuite ces niveaux du plus grave au moins grave : `info`, `crit`, `emerg`, `warning`, `err`, `debug`, `alert`, `notice`.

??? success "Correction"
    ```bash
    journalctl -p err
    ```
    `emerg` → `alert` → `crit` → `err` → `warning` → `notice` → `info` → `debug`.

**Exercice 5** : suis en temps réel les logs de `sshd` de niveau `info`. Ouvre une connexion SSH depuis une autre machine et observe.

??? success "Correction"
    ```bash
    journalctl -f /usr/sbin/sshd -p info
    ```

**Exercice 6** : envoie le message « test TP » dans les journaux avec la facility `cron` et la priorité `info`, puis retrouve-le.

??? success "Correction"
    ```bash
    logger -p cron.info test TP
    journalctl -u cron        # ou : journalctl -f dans un autre terminal
    ```

**Exercice 7** : explique ces lignes de `/etc/rsyslog.conf`. Que veut dire le `-` ?
```
auth,authpriv.*                 /var/log/auth.log
*.*;auth,authpriv.none          -/var/log/syslog
```

??? success "Correction"
    - Ligne 1 : tous les messages `auth` et `authpriv` (toutes priorités) vont dans `/var/log/auth.log`.
    - Ligne 2 : tous les messages, **sauf** `auth` et `authpriv`, vont dans `/var/log/syslog`.
    - `-` = écriture asynchrone.

**Exercice 8** : ajoute une ligne dans `/etc/rsyslog.conf` pour envoyer tous les messages `daemon` dans `/var/log/daemon.log` en écriture asynchrone, puis redémarre rsyslog.

??? success "Correction"
    ```
    daemon.*                        -/var/log/daemon.log
    ```
    ```bash
    systemctl restart rsyslog
    ```

**Exercice 9** : traduis ces lignes de crontab.
```
0 5 * * 1 /opt/bin/backup.sh
*/15 * * * * /opt/bin/check.sh
30 22 1,15 * * /opt/bin/rapport.sh
0 8-18 * * 1-5 /opt/bin/sync.sh
```

??? success "Correction"
    - Tous les lundis à 5h00.
    - Toutes les 15 minutes.
    - Le 1er et le 15 de chaque mois à 22h30.
    - Toutes les heures pile de 8h à 18h, du lundi au vendredi.

**Exercice 10** : planifie pour ton utilisateur la commande `date >> /tmp/date.log` toutes les 2 minutes. Vérifie au bout de quelques minutes, puis supprime la ligne.

??? success "Correction"
    ```bash
    crontab -e
    ```
    ```
    */2 * * * * date >> /tmp/date.log
    ```
    ```bash
    cat /tmp/date.log
    crontab -e      # supprimer la ligne
    ```

**Exercice 11** : dans `/etc/crontab`, planifie `/opt/bin/backup.sh` tous les dimanches à 3h00, exécuté par `root`. Quelle différence avec `crontab -e` ?

??? success "Correction"
    ```
    0 3 * * 0 root /opt/bin/backup.sh
    ```
    `/etc/crontab` a une colonne en plus : l'utilisateur qui exécute la commande.

**Exercice 12** : à quoi sert anacron ? Mets à jour l'horodatage de `cron.daily`.

??? success "Correction"
    Il exécute les tâches qui n'ont pas pu se lancer à l'heure prévue (machine éteinte).
    ```bash
    anacron -u cron.daily
    ```

**Exercice 13** : rends les journaux de journald persistants et limite leur taille totale à 200 Mo, avec des fichiers de 20 Mo maximum.

??? success "Correction"
    ```bash
    mkdir /var/log/journal
    nano /etc/systemd/journald.conf
    ```
    ```
    Storage=persistent
    SystemMaxUse=200M
    SystemMaxFileSize=20M
    ```
    ```bash
    systemctl restart systemd-journald
    ```

**Exercice 14** : explique ce bloc logrotate. Où sont les fichiers de configuration de logrotate et qui le lance ?
```
/var/log/squid/access.log {
    daily
    compress
    delaycompress
    rotate 366
    create 640
}
```

??? success "Correction"
    - Rotation quotidienne, anciens logs compressés (compression reportée d'une rotation), 366 rotations conservées, nouveau fichier créé avec les droits 640.
    - Config : `/etc/logrotate.conf` · lancé chaque jour par cron via `/etc/cron.daily/logrotate`.

**Exercice 15** : relève la version de Debian, le noyau, le processeur, les disques et les montages de ta VM.

??? success "Correction"
    ```bash
    cat /etc/debian_version
    uname -a
    lscpu
    lsblk
    findmnt
    ```

**Exercice 16** : affiche l'espace disque disponible (lisible), la taille totale de `/var/log`, la nature de `/bin/bash` et les fichiers ouverts dans `/root`.

??? success "Correction"
    ```bash
    df -h
    du -sh /var/log
    file /bin/bash
    lsof /root
    ```

**Exercice 17** : surveille les processus avec `top`, puis installe et lance `htop`.

??? success "Correction"
    ```bash
    top           # q pour quitter
    apt install htop
    htop
    ```

**Remise en état** : supprime la ligne ajoutée dans `/etc/crontab` et dans `/etc/rsyslog.conf` (puis `systemctl restart rsyslog`), et remets `/etc/systemd/journald.conf` comme avant si besoin.
