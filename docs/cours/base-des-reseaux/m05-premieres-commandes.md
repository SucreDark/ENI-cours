---
tags:
  - Base des réseaux
---

# Module 5 – Les premières commandes

!!! abstract "En bref"
    - **`ipconfig`** (Windows) / **`ip`** (Linux) : voir et modifier la config IP.
    - **`ping`** : la machine est-elle joignable ? (ICMP) · **`tracert`** / **`traceroute`** : par où passent les paquets ?
    - **`netstat`** : connexions actives et ports en écoute.

## 1. ipconfig (Windows)

| Commande | Rôle |
|---|---|
| `ipconfig` | Affiche IP, masque et passerelle |
| `ipconfig /all` | Toutes les informations réseau détaillées |
| `ipconfig /release` | Libère l'adresse IP obtenue par DHCP |
| `ipconfig /renew` | Demande une IP au serveur DHCP |
| `ipconfig /flushdns` | Vide le cache DNS |
| `ipconfig /displaydns` | Affiche le cache DNS |
| `ipconfig /registerdns` | Renouvelle l'enregistrement DNS dynamique |

## 2. ip (Linux)

| Commande | Rôle |
|---|---|
| `ip link` | Affiche les interfaces réseau |
| `ip link set dev eth0 up` / `down` | Active / désactive l'interface |
| `ip addr` | Affiche les adresses IP |
| `ip -4 addr` | Affiche uniquement les adresses IPv4 |
| `ip addr add IP/masque dev eth0` | Ajoute une IP |
| `ip addr del IP/masque dev eth0` | Supprime une IP |
| `ip route` | Affiche la table de routage |
| `ip route add réseau/masque via passerelle` | Ajoute une route |
| `ip route del réseau/masque` | Supprime une route |
| `ip neigh` | Affiche la table des voisins IP/MAC |
| `ip neigh del IP dev eth0` | Supprime une entrée |

## 3. ping

**ping** teste si une machine est **joignable** sur le réseau. Il utilise le protocole **ICMP** et mesure le **temps de réponse** et les **pertes de paquets**.

| Commande | Rôle |
|---|---|
| `ping 192.168.1.1` | Teste la connexion vers une adresse IP |
| `ping www.google.com` | Teste la connexion vers un nom de domaine |
| `ping -c 4 8.8.8.8` | (Linux) Envoie 4 requêtes |
| `ping -n 4 8.8.8.8` | (Windows) Envoie 4 requêtes |
| `ping -t 8.8.8.8` | (Windows) Ping en continu, jusqu'à ++ctrl+c++ |
| `ping -s 1000 8.8.8.8` | (Linux) Définit la taille des paquets |
| `ping -i 0.5 8.8.8.8` | (Linux) Modifie l'intervalle entre les requêtes |
| `ping -q 8.8.8.8` | (Linux) Affiche seulement les statistiques |

**Lire le résultat** :

- **Temps de réponse** : durée aller-retour en millisecondes (ms)
- **Perte de paquets** : paquets envoyés sans réponse
- **Aucune réponse** : machine inaccessible ou requêtes bloquées (par exemple par un pare-feu)

## 4. netstat

Affiche les **connexions réseau actives**, les **ports en écoute** et des statistiques réseau.

| Commande | Rôle |
|---|---|
| `netstat -a` | Connexions et ports en écoute |
| `netstat -n` | IP et ports au format numérique |
| `netstat -r` | Table de routage |
| `netstat -an` | Toutes les connexions et ports en numérique |
| `netstat -e` | (Windows) Statistiques réseau |
| `netstat -t` / `-u` | (Linux) Connexions TCP / UDP |
| `netstat -l` | (Linux) Ports en écoute |
| `netstat -p` | (Linux) Processus associés (droits parfois nécessaires) |
| `netstat -an \| grep :80` | (Linux) Connexions sur le port 80 |

**États des connexions TCP** :

| État | Signification |
|---|---|
| `LISTEN` | Attend une connexion |
| `ESTABLISHED` | Connexion établie |
| `CLOSE_WAIT` | L'autre partie a fermé, en attente de fermeture |
| `TIME_WAIT` | Attend avant de terminer la connexion |
| `SYN_SENT` | Demande envoyée, en attente de réponse |

## 5. tracert / traceroute

Affiche le **chemin emprunté par les paquets** jusqu'à une destination, en identifiant les **routeurs traversés** et leur **temps de réponse**.

| Option (Windows `tracert`) | Rôle |
|---|---|
| `tracert www.google.com` | Chemin vers Google |
| `/d` | Affiche uniquement les IP (pas de résolution de noms) |
| `/h <nombre>` | Nombre maximum de sauts (30 par défaut) |
| `/w <ms>` | Temps d'attente (4 000 ms par défaut) |
| `/4` · `/6` | Force IPv4 · IPv6 |

Exemple : `tracert /d /h 15 /w 1000 www.google.com`
Sous Debian/Ubuntu : `sudo apt install traceroute`.

---

## Exercices

**Exercice 1** : ton PC est en APIPA. Quelles commandes Windows pour redemander une IP au DHCP ?

??? success "Correction"
    `ipconfig /release` puis `ipconfig /renew`

**Exercice 2** : un site a changé d'IP mais ton PC va toujours à l'ancienne. Quelle commande ?

??? success "Correction"
    `ipconfig /flushdns` (vide le cache DNS)

**Exercice 3** : envoie exactement 4 pings vers 8.8.8.8 sous Linux, puis sous Windows.

??? success "Correction"
    Linux : `ping -c 4 8.8.8.8` · Windows : `ping -n 4 8.8.8.8`

**Exercice 4** : un ping ne reçoit aucune réponse. Deux causes possibles ?

??? success "Correction"
    Machine **inaccessible**, ou requêtes **bloquées** (par un pare-feu par exemple).

**Exercice 5** : sous Linux, affiche ta table de routage et ajoute une route vers 10.0.0.0/8 via 192.168.1.254.

??? success "Correction"
    `ip route` · `sudo ip route add 10.0.0.0/8 via 192.168.1.254`

**Exercice 6** : que signifie l'état `LISTEN` dans `netstat` ? Et `ESTABLISHED` ?

??? success "Correction"
    `LISTEN` : le port attend une connexion · `ESTABLISHED` : connexion établie

**Exercice 7** : trace la route vers google.com sans résolution de noms, 15 sauts max.

??? success "Correction"
    `tracert /d /h 15 www.google.com`

**TP Packet Tracer** (dans `C2- Bases des Réseaux\Module 5`) :

- [ ] `M05-01-TP-Packet_Tracer_Les_commandes.pka`
