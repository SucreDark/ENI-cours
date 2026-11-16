---
tags:
  - Administration d'une distribution GNU/Linux
---

# Module 3 – Démarrage d'une distribution Debian

!!! abstract "En bref"
    - Démarrage : **BIOS → MBR → GRUB2 → noyau → systemd → cible**.
    - GRUB : on ne modifie **jamais** `/boot/grub/grub.cfg` directement, on passe par `/etc/default/grub` ou `/etc/grub.d/` puis `update-grub`.
    - systemd = PID 1, gère services et cibles avec **`systemctl`**.
    - Arrêt / redémarrage : `shutdown -h now`, `shutdown -r now` (ou `reboot`), `shutdown -c` pour annuler.

## 1. Démarrage de Linux

| Étape | Rôle |
|---|---|
| 1. **BIOS** | Initialise le matériel et lance le chargeur d'amorçage |
| 2. **MBR** | Contient la première partie du chargeur d'amorçage |
| 3. **GRUB2** | Permet de choisir le système ou le noyau à démarrer |
| 4. **Noyau Linux** (kernel) | Fait le lien entre le matériel et les applications |
| 5. **systemd** | Lance les services et les programmes nécessaires |
| 6. **Cible** (target) | Définit le mode de fonctionnement du système |

---

## 2. GRUB2 : le chargeur d'amorçage

Permet de lancer Linux. Il est composé de plusieurs étapes (*stages*) :

| Stage | Emplacement / rôle |
|---|---|
| **Stage 1** | Situé dans le **MBR**, charge la suite |
| **Stage 1.5** | Situé au début du disque, avant les données de la première partition |
| **Stage 2** | Partie finale, située dans **`/boot/grub/`** |

**Fichiers importants :**

| Fichier | Rôle |
|---|---|
| `/boot/grub/grub.cfg` | Configuration **générée** de GRUB |
| `/etc/default/grub` | Paramètres généraux de GRUB |
| `/etc/grub.d/` | Scripts de configuration |

!!! danger "On ne modifie pas directement `grub.cfg`"
    Après modification de la configuration, on régénère le fichier :

    ```bash
    update-grub
    # ou
    grub-mkconfig -o /boot/grub/grub.cfg
    ```

---

## 3. Le noyau Linux (kernel)

Il permet la communication entre **le matériel**, **les applications** et **le shell**.

Deux fichiers importants dans **`/boot/`** :

| Fichier | Rôle |
|---|---|
| `vmlinuz` | Image principale du noyau |
| `initrd.img` | Contient des éléments nécessaires au démarrage, notamment des pilotes et configurations spécifiques au matériel |

### Paramètres de démarrage

Dans GRUB, on peut appuyer sur **`e`** pour modifier **temporairement** les paramètres de démarrage :

| Paramètre | Rôle |
|---|---|
| `root=` | Indique où se trouve la racine du système `/` |
| `ro` | Monte la racine en lecture seule |
| `quiet` | Réduit les messages affichés au démarrage |

---

## 4. systemd : le gestionnaire du système

systemd est le **premier programme lancé par le noyau** : il possède le **PID 1**.

Son rôle :

- lancer les services
- gérer leur fonctionnement
- organiser le démarrage du système
- gérer les dépendances entre services

Les fichiers des services se trouvent dans **`/lib/systemd/system`**.

### Les cibles (target)

Une cible définit le mode de fonctionnement de Linux :

| Cible | Rôle |
|---|---|
| `poweroff.target` | Arrêter le système |
| `rescue.target` | Mode maintenance |
| `multi-user.target` | Mode console, multi-utilisateur |
| `graphical.target` | Mode graphique |
| `reboot.target` | Redémarrer le système |

**Commandes pour gérer les cibles :**

| Action | Commande |
|---|---|
| Connaître la cible par défaut | `systemctl get-default` |
| Changer la cible par défaut | `systemctl set-default multi-user.target` |
| Changer de cible immédiatement | `systemctl isolate rescue.target` |

### Gérer les services avec systemd

La commande principale est **`systemctl`** : elle permet de gérer les services et les cibles.

Exemple avec le service `cron` :

| Commande | Rôle |
|---|---|
| `systemctl status cron.service` | Voir l'état |
| `systemctl start cron.service` | Démarrer |
| `systemctl stop cron.service` | Arrêter |
| `systemctl restart cron.service` | Redémarrer |
| `systemctl enable cron.service` | Activer au démarrage |
| `systemctl disable cron.service` | Désactiver au démarrage |

**Lister les unités systemd :**

| Commande | Rôle |
|---|---|
| `systemctl list-units` | Lister les unités |
| `systemctl list-units --all` | Afficher toutes les unités, même inactives |

---

## 5. Arrêter ou redémarrer Linux

Commande principale : **`shutdown`**

| Action | Commande |
|---|---|
| Arrêt immédiat | `shutdown -h now` |
| Arrêt dans 10 min avec avertissement | `shutdown -h +10 "message"` |
| Redémarrage immédiat | `reboot` ou `shutdown -r now` |
| Redémarrer à 16h30 | `shutdown -r 16:30 "message"` |
| Annuler un arrêt programmé | `shutdown -c` |

---

## Exercices

**Exercice 1** : remettre dans l'ordre les étapes du démarrage : noyau, cible, BIOS, systemd, GRUB2, MBR.

??? success "Correction"
    **BIOS → MBR → GRUB2 → noyau → systemd → cible**

**Exercice 2** : où se trouvent le stage 1 et le stage 2 de GRUB2 ?

??? success "Correction"
    - Stage 1 : dans le **MBR** (il charge la suite).
    - Stage 2 : dans **`/boot/grub/`**.

**Exercice 3** : tu veux changer un paramètre de GRUB. Quel fichier modifier, et que faire ensuite ?

??? success "Correction"
    On modifie **`/etc/default/grub`** (ou les scripts de `/etc/grub.d/`), **jamais `grub.cfg` directement**, puis on régénère :

    ```bash
    update-grub
    # ou
    grub-mkconfig -o /boot/grub/grub.cfg
    ```

**Exercice 4** : quels sont les deux fichiers importants du noyau dans `/boot/`, et à quoi servent-ils ?

??? success "Correction"
    - `vmlinuz` : image principale du noyau.
    - `initrd.img` : éléments nécessaires au démarrage (pilotes, configurations spécifiques au matériel).

**Exercice 5** : au démarrage, comment modifier temporairement les paramètres du noyau ? Que signifient `ro` et `quiet` ?

??? success "Correction"
    Dans GRUB, appuyer sur **`e`**.

    - `ro` : monte la racine en lecture seule.
    - `quiet` : réduit les messages affichés au démarrage.

**Exercice 6** : quel est le PID de systemd, et pourquoi ?

??? success "Correction"
    **PID 1** : c'est le premier programme lancé par le noyau.

**Exercice 7** : afficher la cible par défaut, puis faire démarrer la machine en mode console multi-utilisateur par défaut.

??? success "Correction"
    ```bash
    systemctl get-default
    systemctl set-default multi-user.target
    ```

**Exercice 8** : passer immédiatement en mode maintenance.

??? success "Correction"
    ```bash
    systemctl isolate rescue.target
    ```

**Exercice 9** : avec le service `cron` : voir son état, l'arrêter, le redémarrer, puis l'empêcher de se lancer au démarrage.

??? success "Correction"
    ```bash
    systemctl status cron.service
    systemctl stop cron.service
    systemctl start cron.service
    systemctl disable cron.service
    ```

**Exercice 10** : lister toutes les unités systemd, même inactives.

??? success "Correction"
    ```bash
    systemctl list-units --all
    ```

**Exercice 11** : programmer un arrêt dans 10 minutes avec le message « Arrêt du serveur », puis l'annuler.

??? success "Correction"
    ```bash
    shutdown -h +10 "Arrêt du serveur"
    shutdown -c
    ```

**Exercice 12** : redémarrer immédiatement (2 façons), puis programmer un redémarrage à 16h30.

??? success "Correction"
    ```bash
    reboot
    shutdown -r now
    shutdown -r 16:30 "message"
    ```
