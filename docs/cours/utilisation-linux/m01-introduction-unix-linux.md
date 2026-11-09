---
tags:
  - Utilisation d'une distribution GNU/Linux
---

# Module 1 – Introduction à Unix/Linux

!!! abstract "En bref"
    - Linux = **système d'exploitation majeur issu d'Unix**, utilisé surtout en **ligne de commande** (CLI).
    - Très présent sur les **serveurs**, les **smartphones** (Android) et les **objets connectés**.
    - Au cœur de l'écosystème : le **logiciel libre** (code source disponible, licences GPL, Apache, BSD…).

**Objectifs du module** : connaître les racines historiques de GNU/Linux, avoir une idée de son importance dans le monde actuel, savoir donner des exemples d'utilisation dans la vie courante.

## 1. Historique d'Unix

*À compléter (pas dans tes notes).*

## 2. Historique de Linux

*À compléter (pas dans tes notes).*

## 3. Qu'est-ce que Linux ?

- Linux est un **système d'exploitation majeur, issu d'Unix**.
- Il s'utilise principalement **en ligne de commande** : on parle de **CLI** (*Command Line Interface*), par opposition aux interfaces graphiques (**GUI**).
- Les **distributions** GNU/Linux sont aujourd'hui très nombreuses.

**En entreprise**, on rencontre principalement :

:fontawesome-brands-ubuntu:{ style="color:#E95420" } **Ubuntu** · :simple-centos:{ style="color:#932279" } **CentOS** · :simple-opensuse:{ style="color:#73BA25" } **openSUSE** · :fontawesome-brands-redhat:{ style="color:#EE0000" } **Red Hat**

| Distribution | Particularité |
|---|---|
| :simple-linuxmint:{ style="color:#87CF3E" } Linux Mint | Dérivée d'Ubuntu, adaptée aux débutants et aux utilisateurs avancés |
| :simple-zorin:{ style="color:#15A6F0" } ZorinOS | Facilite la transition (depuis Windows) |
| :simple-kubuntu:{ style="color:#0079C1" } Kubuntu, Xubuntu, Lubuntu | Déclinaisons d'Ubuntu |
| :simple-kalilinux:{ style="color:#557C94" } Kali Linux | Orientée sécurité |
| :simple-raspberrypi:{ style="color:#A22846" } Raspbian | Debian sur Raspberry Pi |
| 3CX | Basée sur Debian, solution de téléphonie du même nom |
| System Rescue CD | Récupération de système et de données en live CD/USB |
| PrimTux | Orientée éducation |

Canal stable actuel de :simple-debian:{ style="color:#A81D33" } Debian : **Debian 12 « Bookworm »**.

**Où trouve-t-on Linux ?** Serveurs web · serveurs d'applications Java · serveurs de bases de données · smartphones (**Android est un dérivé de Linux**) · objets connectés (montres, TV, véhicules…).

## 4. Licences et logiciels libres

Une **distribution GNU/Linux libre** repose sur un **contrat social**, une **redistribution libre et gratuite** et l'**inclusion du code source**.

La notion de **logiciel libre** est au centre de l'écosystème : le code source est disponible, chacun est libre de le **lire, modifier et améliorer**.

**Free Software Foundation** : association fondée par **Richard Stallman** pour promouvoir les logiciels libres et défendre leurs utilisateurs.

Plusieurs licences libres coexistent :

| Licence | À retenir |
|---|---|
| **GNU GPL** (*General Public License*) | 4 droits : **exécuter** le logiciel pour n'importe quel usage · **étudier** et **adapter** le programme (accès au code source) · **redistribuer** des copies · faire bénéficier la communauté des **versions modifiées** |
| **Apache** | Gérée par l'Apache Software Foundation, autorise modification et distribution, respect du copyright |
| **BSD** | Réutilisation **sans restriction**, librement modifiable, **pas de copyleft**, plusieurs versions |
| **CeCILL** | « CEA CNRS INRIA Logiciel Libre », conforme au **droit français**, respecte les principes du libre |
| **Creative Commons** | Pour les **créations artistiques** (photos, logos, graphismes, musiques présents dans les logiciels libres), nombreuses sous-catégories |

---

## Exercices

**Exercice 1** : que veut dire CLI ? Et GUI ?

??? success "Correction"
    **CLI** : *Command Line Interface* (ligne de commande) · **GUI** : interface graphique

**Exercice 2** : cite 4 distributions rencontrées en entreprise.

??? success "Correction"
    Ubuntu, CentOS, openSUSE, Red Hat

**Exercice 3** : cite les 4 droits de la licence GNU GPL.

??? success "Correction"
    Exécuter pour tout usage · étudier et adapter (code source) · redistribuer des copies · partager ses versions modifiées

**Exercice 4** : quelle licence est conforme au droit français ? Laquelle n'a pas de copyleft ?

??? success "Correction"
    **CeCILL** · **BSD**

**Exercice 5** : qui a fondé la Free Software Foundation ?

??? success "Correction"
    **Richard Stallman**
