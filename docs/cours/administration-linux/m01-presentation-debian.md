---
tags:
  - Administration d'une distribution GNU/Linux
---

# Module 1 – Présentation de Debian GNU/Linux

!!! abstract "En bref"
    - Syntaxe des commandes : `commande [option] <argument>` (ex. `ls -l /home/user01`).
    - 3 branches principales : **stable** (production, recommandée), **testing** (future stable), **unstable** (en constante évolution).
    - Sous-branches : **oldstable** et **oldoldstable**.

## 1. Conventions typographiques

La syntaxe des commandes est représentée comme ceci :

```
commande [option] <argument>
```

Exemple : `ls -l /home/user01`

---

## 2. Branches et versions de Debian

Debian a **3 branches principales** :

| Branche | Rôle |
|---|---|
| **Stable** | Version de **production** de Debian, **recommandée** |
| **Testing** | Contient la **future version stable** de Debian |
| **Unstable** | Version en **constante évolution** |

Des sous-branches **oldstable** et **oldoldstable** existent également.

---

## Exercices

**Exercice 1** : dans `ls -l /home/user01`, qu'est-ce qui est la commande, l'option et l'argument ?

??? success "Correction"
    - Commande : `ls`
    - Option : `-l`
    - Argument : `/home/user01`

**Exercice 2** : quelle branche de Debian installer sur un serveur de production ?

??? success "Correction"
    La branche **stable** : c'est la version de production, recommandée.

**Exercice 3** : quelle branche contient la future version stable ?

??? success "Correction"
    La branche **testing**.

**Exercice 4** : citer les 3 branches principales et les 2 sous-branches de Debian.

??? success "Correction"
    - Principales : **stable**, **testing**, **unstable** (en constante évolution).
    - Sous-branches : **oldstable** et **oldoldstable**.
