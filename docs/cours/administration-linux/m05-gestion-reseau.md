---
tags:
  - Administration d'une distribution GNU/Linux
---

# Module 5 – Gestion du réseau

!!! abstract "En bref"
    - Pour communiquer : **adresse IP + masque + passerelle + DNS**.
    - Consulter : `ip a` (adresses), `ip r` (passerelle), `/etc/resolv.conf` (DNS).
    - Sans interface graphique : **`/etc/network/interfaces`** (`inet dhcp` ou `inet static`) + **`/etc/resolv.conf`** (`nameserver`).
    - Avec interface graphique : **NetworkManager** (`systemctl restart NetworkManager`).

## 1. Prise d'informations réseau

Pour qu'un ordinateur puisse communiquer sur un réseau, il lui faut :

**Adresse IP + Masque réseau + Passerelle + DNS**

| Besoin | Commande / fichier |
|---|---|
| Consulter les informations réseau | `ip a` ou `ip address` |
| Connaître sa passerelle | `ip r` ou `ip route` |
| Connaître les serveurs DNS | Dans **`/etc/resolv.conf`** |

---

## 2. Configuration réseau sans interface graphique

Sur un serveur Debian sans interface graphique, le cours utilise **deux fichiers principaux** : `/etc/network/interfaces` et `/etc/resolv.conf`.

### A. Configuration IP : DHCP

Le fichier s'ouvre avec `vim` et se trouve dans **`/etc/network/interfaces`**.

Exemple DHCP :

```
auto lo
iface lo inet loopback

auto ens33
allow-hotplug ens33
iface ens33 inet dhcp
```

Le serveur DHCP attribue **automatiquement** une adresse IP à la machine.

### B. Configuration IP statique

Une adresse IP statique est une adresse **configurée manuellement**.

Exemple :

```
auto lo
iface lo inet loopback

auto ens33
iface ens33 inet static
    address 10.1.1.10
    netmask 255.255.0.0
    gateway 10.1.255.254
```

### C. Configuration DNS

Le fichier se trouve dans **`/etc/resolv.conf`**.

Exemple :

```
search mondomaine.fr
nameserver 10.1.2.20
nameserver 10.1.2.21
```

On utilise **`nameserver`** pour indiquer les serveurs DNS.

### D. Appliquer les modifications réseau

Après avoir modifié la configuration, on utilise **`systemctl`** pour gérer le service réseau (`networking`) :

```bash
systemctl restart networking
```

---

## 3. Configuration réseau avec interface graphique

Sur un système Linux avec interface graphique, on utilise **NetworkManager**. Il permet de gérer les connexions réseau depuis la GUI.

Pour redémarrer le service :

```bash
systemctl restart NetworkManager
```

On peut également activer/désactiver (on/off) l'interface réseau depuis l'interface graphique.

---

## Exercices

**Exercice 1** : de quoi un ordinateur a-t-il besoin pour communiquer sur un réseau ?

??? success "Correction"
    Une **adresse IP**, un **masque réseau**, une **passerelle** et un **DNS**.

**Exercice 2** : affiche ton adresse IP, puis ta passerelle.

??? success "Correction"
    ```bash
    ip a        # ou ip address
    ip r        # ou ip route
    ```

**Exercice 3** : où trouver les serveurs DNS utilisés par la machine ?

??? success "Correction"
    Dans **`/etc/resolv.conf`** (lignes `nameserver`).

**Exercice 4** : configure l'interface `ens33` en DHCP dans le bon fichier.

??? success "Correction"
    Dans `/etc/network/interfaces` :

    ```
    auto lo
    iface lo inet loopback

    auto ens33
    allow-hotplug ens33
    iface ens33 inet dhcp
    ```

**Exercice 5** : configure `ens33` en IP fixe : `10.1.1.10`, masque `255.255.0.0`, passerelle `10.1.255.254`.

??? success "Correction"
    Dans `/etc/network/interfaces` :

    ```
    auto ens33
    iface ens33 inet static
        address 10.1.1.10
        netmask 255.255.0.0
        gateway 10.1.255.254
    ```

**Exercice 6** : configure le domaine de recherche `mondomaine.fr` et les DNS `10.1.2.20` et `10.1.2.21`.

??? success "Correction"
    Dans `/etc/resolv.conf` :

    ```
    search mondomaine.fr
    nameserver 10.1.2.20
    nameserver 10.1.2.21
    ```

**Exercice 7** : quelle est la différence entre une adresse IP en DHCP et une adresse IP statique ?

??? success "Correction"
    - DHCP : le serveur DHCP attribue **automatiquement** l'adresse à la machine.
    - Statique : l'adresse est **configurée manuellement**.

**Exercice 8** : sur un serveur sans interface graphique, tu as modifié `/etc/network/interfaces`. Comment appliquer la configuration ?

??? success "Correction"
    ```bash
    systemctl restart networking
    ```

**Exercice 9** : sur un poste avec interface graphique, quel outil gère le réseau, et comment redémarrer son service ?

??? success "Correction"
    **NetworkManager** :

    ```bash
    systemctl restart NetworkManager
    ```
