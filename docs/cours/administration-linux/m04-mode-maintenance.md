---
tags:
  - Administration d'une distribution GNU/Linux
---

# Module 4 – Debian en mode maintenance

!!! abstract "En bref"
    - Le mode maintenance permet d'intervenir sous Linux quand le système rencontre un problème.
    - **Méthode 1** (GRUB, avec mot de passe root) : `e` → remplacer `quiet` par **`single`** → `Ctrl+X` / `F10` → mot de passe root.
    - **Méthode 2** (GRUB, sans mot de passe) : `e` → ajouter **`init=/bin/bash`** → `mount -o remount,rw /` → `sync`.
    - **Méthode 3** : le mode maintenance du **CD d'installation** Debian.
    - Attention : le clavier est par défaut en **QWERTY**.

## 1. À quoi sert le mode maintenance ?

Le mode maintenance permet d'**intervenir sous Linux lorsque le système rencontre un problème**.

GRUB permet de modifier **temporairement** les paramètres de démarrage.

---

## 2. Méthode 1 : via GRUB (avec mot de passe root)

1. Démarrer l'ordinateur.
2. Dans GRUB, sélectionner le noyau avec les flèches.
3. Appuyer sur **`e`** pour modifier les paramètres.
4. Repérer la ligne commençant par **`linux`**.
5. Remplacer **`quiet`** par **`single`**.

    ```
    linux /vmlinuz-4.19.0-8-amd64 root=/dev/mapper/debian--vg-sys ro single
    ```

6. Valider avec **`Ctrl+X`** ou **`F10`**.
7. Saisir le mot de passe root.

!!! warning "Le clavier est par défaut en QWERTY"

Pour **continuer le démarrage** après les opérations : **`Ctrl+D`**.

---

## 3. Méthode 2 : via GRUB (sans mot de passe root)

1. Dans GRUB, sélectionner le noyau.
2. Appuyer sur **`e`**.
3. Modifier la fin de la ligne `linux` pour ajouter **`init=/bin/bash`** :

    ```
    linux /vmlinuz-4.19.0-8 root=/dev/mapper/debian--vg-sys ro init=/bin/bash
    ```

4. Valider avec **`Ctrl+X`** ou **`F10`**.

**Problème : le système est en lecture seule.** Pour obtenir les droits de lecture et d'écriture :

```bash
mount -o remount,rw /
```

| Élément | Rôle |
|---|---|
| `mount` | Gérer le montage des systèmes de fichiers |
| `-o` | Indiquer des options |
| `remount` | Remonter un système de fichiers déjà monté |
| `rw` | Lecture et écriture |
| `/` | Racine du système |

**Après les modifications**, synchroniser les données en mémoire RAM vers le disque :

```bash
sync
```

---

## 4. Méthode 3 : maintenance via un CD d'installation Debian

Le CD d'installation contient un mode maintenance.

| Avantages | Inconvénients |
|---|---|
| Langue française disponible | Nécessite un CD ou une image ISO |
| Pas besoin du mot de passe root | Peut être complexe en virtualisation |
| Possibilité d'éteindre proprement | |

---

## Exercices

**Exercice 1** : à quoi sert le mode maintenance ?

??? success "Correction"
    À intervenir sous Linux lorsque le système rencontre un problème.

**Exercice 2** : tu connais le mot de passe root. Comment passer en mode maintenance depuis GRUB ? Donne les étapes.

??? success "Correction"
    1. Dans GRUB, sélectionner le noyau avec les flèches.
    2. Appuyer sur `e`.
    3. Sur la ligne `linux`, remplacer `quiet` par `single`.
    4. Valider avec `Ctrl+X` ou `F10`.
    5. Saisir le mot de passe root (attention : clavier en QWERTY).

**Exercice 3** : en mode maintenance (méthode 1), comment continuer le démarrage après tes opérations ?

??? success "Correction"
    `Ctrl+D`

**Exercice 4** : tu as perdu le mot de passe root. Que faut-il ajouter à la ligne `linux` dans GRUB ?

??? success "Correction"
    `init=/bin/bash` à la fin de la ligne :

    ```
    linux /vmlinuz-4.19.0-8 root=/dev/mapper/debian--vg-sys ro init=/bin/bash
    ```

**Exercice 5** : avec la méthode 2, tu ne peux rien modifier. Pourquoi, et quelle commande taper ?

??? success "Correction"
    Le système est en **lecture seule**. On le remonte en lecture-écriture :

    ```bash
    mount -o remount,rw /
    ```

**Exercice 6** : détaille chaque élément de `mount -o remount,rw /`.

??? success "Correction"
    - `mount` : gérer le montage des systèmes de fichiers
    - `-o` : indiquer des options
    - `remount` : remonter un système de fichiers déjà monté
    - `rw` : lecture et écriture
    - `/` : racine du système

**Exercice 7** : après tes modifications en méthode 2, quelle commande taper avant d'éteindre, et pourquoi ?

??? success "Correction"
    `sync` : synchronise les données en mémoire RAM vers le disque.

**Exercice 8** : cite les avantages et les inconvénients du mode maintenance via le CD d'installation.

??? success "Correction"
    - Avantages : langue française disponible, pas besoin du mot de passe root, possibilité d'éteindre proprement.
    - Inconvénients : nécessite un CD ou une image ISO, peut être complexe en virtualisation.

**Exercice 9** : dans quel mode est le clavier par défaut avec les méthodes GRUB ?

??? success "Correction"
    En **QWERTY**.
