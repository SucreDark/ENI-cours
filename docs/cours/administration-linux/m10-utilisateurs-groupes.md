---
tags:
  - Administration d'une distribution GNU/Linux
---

# Module 10 – Gestion des utilisateurs et des groupes

!!! abstract "En bref"
    - Chaque utilisateur a un **UID** et un **GID** (groupe principal) · root = 0, daemon = 1 à 999, utilisateurs = 1000 et plus.
    - Groupes : `/etc/group` et `/etc/gshadow` · commandes `groupadd`, `groupmod`, `groupdel`, `gpasswd`.
    - Utilisateurs : `/etc/passwd` (7 champs) et `/etc/shadow` (9 champs, hash du mot de passe) · commandes `useradd`, `usermod` (`-aG` pour ajouter un groupe !), `userdel`, `passwd`, `chfn`, `chsh`.
    - Changer d'identité : `su - jmartin` · élévation de privilèges : `sudo` (autorisations dans `/etc/sudoers`).

## 1. Les identifiants sous Linux

Chaque utilisateur possède deux identifiants importants :

| Identifiant | Rôle |
|---|---|
| **UID** | Identifiant unique de l'utilisateur |
| **GID** | Identifiant de son groupe principal |

Un utilisateur peut appartenir à plusieurs groupes :

- **groupe principal** : groupe attribué à l'utilisateur lors de sa connexion
- **groupes secondaires** : groupes supplémentaires auxquels il appartient

### Les types d'utilisateurs

| Type | UID/GID | Rôle |
|---|---|---|
| **root** | 0 | Super-admin, tous les droits |
| **daemon** | 1 à 999 | Comptes utilisés par les services |
| **Utilisateur classique** | 1000 et plus | Utilisateurs humains |

!!! tip "À retenir"
    Il est conseillé d'**éviter de travailler directement avec root**. On préfère utiliser une **élévation de privilèges**.

---

## 2. Les fichiers de configuration des groupes

Les informations des groupes sont stockées dans deux fichiers : **`/etc/group`** et **`/etc/gshadow`**.

On peut les consulter, mais **on ne les modifie pas directement** : on utilise les commandes dédiées.

### /etc/group

Chaque ligne possède **4 champs** séparés par `:` :

```
nomgroupe:passechiffré:GID:membres
```

| Champ | Rôle |
|---|---|
| `nomgroupe` | Nom du groupe |
| `passechiffré` | Généralement `x` : mot de passe stocké dans `/etc/gshadow` |
| `GID` | Identifiant du groupe |
| `membres` | Membres secondaires du groupe, séparés par des virgules |

Exemple : `informatique:x:1500:jmartin,abenabel,sdia`

### /etc/gshadow

Les 4 champs :

```
nomgroupe:passechiffré:administrateurs:membres
```

- `!` ou `*` dans le champ mot de passe : impossible d'utiliser un mot de passe pour accéder au groupe.
- Champ vide : seuls les membres du groupe peuvent obtenir ses permissions.
- **Administrateurs** : peuvent modifier le mot de passe et les membres du groupe.

---

## 3. Les commandes de gestion des groupes

### groupadd : créer un groupe

```
groupadd <options> [nom du groupe]
```

| Option | Rôle |
|---|---|
| `-g` | Définir le GID du groupe |

Exemple : `groupadd -g 1500 informatique` crée le groupe `informatique` avec le GID 1500.

Si aucun GID n'est précisé, Linux attribue le plus petit identifiant disponible selon sa configuration.

### groupmod : modifier un groupe

```
groupmod <options> [nom du groupe]
```

| Option | Rôle |
|---|---|
| `-g` | Modifier le GID |
| `-n` | Modifier le nom |

| Exemple | Rôle |
|---|---|
| `groupmod -n reseau informatique` | Renomme `informatique` en `reseau` |
| `groupmod -g 1600 reseau` | Modifie son GID en 1600 |

!!! warning "Attention"
    Modifier un GID peut laisser des fichiers avec un ancien groupe propriétaire.

### groupdel : supprimer un groupe

Exemple : `groupdel informatique`

Un groupe ne peut pas être supprimé s'il est encore le **groupe principal** d'un utilisateur.

### gpasswd : administrer les groupes

```
gpasswd <options> [nom du groupe]
```

| Option | Rôle |
|---|---|
| `-a` | Ajouter un utilisateur au groupe |
| `-d` | Supprimer un utilisateur du groupe |

Exemple : `gpasswd -a jmartin informatique`

---

## 4. Les fichiers de configuration des utilisateurs

Les informations des utilisateurs sont stockées dans **`/etc/passwd`** et **`/etc/shadow`**.

### /etc/passwd

Le fichier contient **7 champs** :

```
nom:motdepasse:UID:GID:nom complet:répertoire personnel:shell
```

Deux commandes utiles :

| Commande | Rôle |
|---|---|
| `chfn` | Modifier les informations personnelles |
| `chsh` | Modifier le shell de connexion |

### /etc/shadow

Le fichier contient **9 champs** :

```
user:motdepasse:datedernierchangement:agemini:agemax:périodeavertissement:périodeinactivité:datefinvalidité:champréservé
```

### Le hash du mot de passe

Un mot de passe n'est pas stocké directement : il est transformé en une empreinte appelée **hash**.

| Préfixe | Algorithme |
|---|---|
| `$1$` | MD5 |
| `$2a$` | Blowfish |
| `$2$` | Blowfish (variante) |
| `$5$` | SHA-256 |
| `$6$` | SHA-512 |

Le hash utilise également un **sel** : une chaîne aléatoire ajoutée au mot de passe avant le calcul du hash. Cela permet notamment que deux utilisateurs ayant le même mot de passe aient des hashs différents.

---

## 5. Les commandes de gestion des utilisateurs

### useradd : créer un utilisateur

```
useradd <options> [utilisateur]
```

| Option | Rôle |
|---|---|
| `-m` | Créer le répertoire personnel |
| `-d` | Définir le chemin du répertoire personnel |
| `-u` | Définir l'UID |
| `-g` | Définir le groupe principal |
| `-G` | Définir les groupes secondaires |
| `-s` | Définir le shell |
| `-r` | Créer un utilisateur système |

Exemple :

```bash
useradd -m -u 1501 -g 1500 -G sudo -s /bin/bash jmartin
```

!!! note "Important"
    Avec `-m`, le contenu de **`/etc/skel`** est copié dans le répertoire personnel du nouvel utilisateur.

### usermod : modifier un utilisateur

```
usermod <options> [utilisateur]
```

| Option | Rôle |
|---|---|
| `-d` | Modifier le répertoire personnel |
| `-m` | Déplacer le contenu de l'ancien répertoire vers le nouveau (avec `-d`) |
| `-e` | Définir la date d'expiration du compte |
| `-f` | Définir le délai d'inactivité après expiration du mot de passe |
| `-g` | Modifier le groupe principal |
| `-G` | Définir les groupes secondaires |
| `-a` | Ajouter des groupes sans supprimer les anciens (avec `-G`) |
| `-s` | Modifier le shell |
| `-L` | Verrouiller le mot de passe |
| `-U` | Déverrouiller le mot de passe |

Exemples :

| Commande | Rôle |
|---|---|
| `usermod -d /home/jean -m jmartin` | Change le répertoire personnel et déplace son contenu |
| `usermod -g informatique jmartin` | Change son groupe principal |
| `usermod -aG sudo jmartin` | Ajoute `jmartin` au groupe `sudo` sans supprimer ses autres groupes secondaires |
| `usermod -s /bin/sh jmartin` | Change son shell |
| `usermod -L jmartin` | Verrouille son mot de passe |
| `usermod -U jmartin` | Déverrouille son mot de passe |

!!! danger "Piège"
    `-G` seul **remplace** la liste des groupes secondaires. Pour simplement **ajouter** un groupe, utiliser **`-aG`**.

### userdel : supprimer un utilisateur

```
userdel <options> [utilisateur]
```

| Option | Rôle |
|---|---|
| `-r` | Supprimer également le répertoire personnel et son contenu |

!!! warning "Attention"
    Les fichiers appartenant à cet utilisateur dans d'autres répertoires ne sont pas supprimés.

### passwd : gérer les mots de passe

| Option | Rôle |
|---|---|
| `-e` | Forcer le changement du mot de passe à la prochaine connexion |
| `-l` | Verrouiller le mot de passe |
| `-u` | Déverrouiller le mot de passe |

---

## 6. Changement d'identité et élévation de privilèges

Il existe deux commandes importantes : **`su`** et **`sudo`**.

### su : changer d'utilisateur

Permet de **changer d'identité** ou d'**exécuter une commande sous l'identité d'un autre utilisateur**.

| Option | Rôle |
|---|---|
| `-` ou `-l` | Effectuer un changement complet d'identité |
| `-s` | Choisir le shell à utiliser |
| `-c` | Exécuter une commande sous l'identité de l'utilisateur |

Exemple : `su jmartin` passe sous l'identité de `jmartin`.

### sudo

Les autorisations sont définies dans **`/etc/sudoers`**.

| Exemple | Rôle |
|---|---|
| `sudo apt update` | Exécute `apt update` avec les privilèges admin |
| `sudo -i` | Ouvre une session admin complète |

---

## Exercices

**Exercice 1** : que sont l'UID et le GID ? Quelle est la différence entre groupe principal et groupes secondaires ?

??? success "Correction"
    - UID : identifiant unique de l'utilisateur · GID : identifiant de son groupe principal.
    - Groupe principal : attribué à la connexion · groupes secondaires : groupes supplémentaires auxquels il appartient.

**Exercice 2** : à quel type de compte correspondent les UID 0, 105 et 1002 ?

??? success "Correction"
    - 0 : **root**
    - 105 : **daemon** (compte de service, 1 à 999)
    - 1002 : **utilisateur classique** (1000 et plus)

**Exercice 3** : explique la ligne `informatique:x:1500:jmartin,abenabel,sdia` de `/etc/group`.

??? success "Correction"
    - `informatique` : nom du groupe
    - `x` : mot de passe stocké dans `/etc/gshadow`
    - `1500` : GID
    - `jmartin,abenabel,sdia` : membres secondaires

**Exercice 4** : crée le groupe `informatique` avec le GID 1500, renomme-le en `reseau`, puis change son GID en 1600.

??? success "Correction"
    ```bash
    groupadd -g 1500 informatique
    groupmod -n reseau informatique
    groupmod -g 1600 reseau
    ```

**Exercice 5** : ajoute `jmartin` au groupe `informatique`, puis retire-le.

??? success "Correction"
    ```bash
    gpasswd -a jmartin informatique
    gpasswd -d jmartin informatique
    ```

**Exercice 6** : quels sont les 7 champs de `/etc/passwd` ? Où est stocké le mot de passe ?

??? success "Correction"
    `nom:motdepasse:UID:GID:nom complet:répertoire personnel:shell`

    Le mot de passe (son hash) est dans `/etc/shadow`.

**Exercice 7** : dans `/etc/shadow`, un mot de passe commence par `$6$`. Quel algorithme ? À quoi sert le sel ?

??? success "Correction"
    - `$6$` : **SHA-512**.
    - Le sel est une chaîne aléatoire ajoutée au mot de passe avant le hash : deux utilisateurs avec le même mot de passe ont des hashs différents.

**Exercice 8** : crée l'utilisateur `jmartin` avec son répertoire personnel, l'UID 1501, le groupe principal 1500, le groupe secondaire `sudo` et le shell `/bin/bash`. Qu'est-ce qui est copié dans son répertoire ?

??? success "Correction"
    ```bash
    useradd -m -u 1501 -g 1500 -G sudo -s /bin/bash jmartin
    ```

    Le contenu de `/etc/skel`.

**Exercice 9** : déplace le répertoire personnel de `jmartin` vers `/home/jm` en déplaçant son contenu, puis fais expirer son compte le 31/12/2026.

??? success "Correction"
    ```bash
    usermod -d /home/jm -m jmartin
    usermod -e 2026-12-31 jmartin
    ```

**Exercice 10** : ajoute `jmartin` au groupe `sudo` sans lui retirer ses autres groupes secondaires. Que se passerait-il avec `usermod -G sudo jmartin` ?

??? success "Correction"
    ```bash
    usermod -aG sudo jmartin
    ```

    Avec `-G` seul, la liste des groupes secondaires serait **remplacée** : `jmartin` ne serait plus que dans `sudo`.

**Exercice 11** : verrouille le mot de passe de `jmartin` (2 façons), puis force-le à changer de mot de passe à sa prochaine connexion.

??? success "Correction"
    ```bash
    usermod -L jmartin     # ou : passwd -l jmartin
    usermod -U jmartin     # déverrouiller (ou passwd -u jmartin)
    passwd -e jmartin
    ```

**Exercice 12** : supprime l'utilisateur `jmartin` avec son répertoire personnel. Ses fichiers ailleurs sur le système sont-ils supprimés ?

??? success "Correction"
    ```bash
    userdel -r jmartin
    ```

    Non : les fichiers lui appartenant dans d'autres répertoires ne sont pas supprimés.

**Exercice 13** : quelle commande permet de modifier le shell de connexion ? Et les informations personnelles ?

??? success "Correction"
    - Shell : `chsh`
    - Informations personnelles : `chfn`

**Exercice 14** : passe complètement sous l'identité de `jmartin`, puis exécute uniquement la commande `ls` sous son identité.

??? success "Correction"
    ```bash
    su - jmartin
    su -c "ls" jmartin
    ```

**Exercice 15** : mets à jour la liste des paquets avec les privilèges admin, puis ouvre une session admin complète. Où sont définies les autorisations sudo ?

??? success "Correction"
    ```bash
    sudo apt update
    sudo -i
    ```

    Dans `/etc/sudoers`.
