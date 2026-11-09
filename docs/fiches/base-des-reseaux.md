---
tags:
  - Fiche mémo
---

# Fiche mémo – Base des réseaux

<div class="fiche-actions" markdown="0"><button class="exo-btn" onclick="window.print()">🖨 Imprimer / PDF</button></div>

!!! info "Fiche générée automatiquement"
    Les « En bref » et les commandes de chaque module de ce cours, rien de plus.

## Module 1 – Le modèle OSI

- Le modèle **OSI** = 7 couches, chacune avec un rôle précis.
- Chaque couche **encapsule** les données : SDU + PCI = PDU.
- Envoi : couche **7 → 1**. Réception : couche **1 → 7**.

[:octicons-arrow-right-24: Voir le module](../cours/base-des-reseaux/m01-modele-osi.md)

## Module 2 – Les unités informatiques

- **1 octet = 8 bits**, valeurs des bits : 128 64 32 16 8 4 2 1.
- Binaire → décimal : **addition** des valeurs des bits à 1.
- Décimal → binaire : **divisions par 2**, on lit les restes **à l'envers**.

[:octicons-arrow-right-24: Voir le module](../cours/base-des-reseaux/m02-unites-informatiques.md)

## Module 3 – L'adressage IPv4

Adresse IPv4 = 32 bits en 4 octets = **identifiant réseau + identifiant hôte**, séparés par le **masque**.
@réseau = bits hôte à **0** · @diffusion = bits hôte à **1** · **nb d'hôtes = 2ⁿ − 2** (n = bits hôte).

[:octicons-arrow-right-24: Voir le module](../cours/base-des-reseaux/m03-adressage-ipv4.md)

## Module 4 – La communication

- Un **switch** propage les broadcasts dans son VLAN, un **routeur** sépare les domaines de diffusion.
- Le **routeur** lit l'IP de destination, consulte sa **table de routage** et choisit où envoyer le paquet.
- Subnetting = **séparation** · Supernetting = **regroupement**.

[:octicons-arrow-right-24: Voir le module](../cours/base-des-reseaux/m04-communication.md)

## Module 5 – Les premières commandes

- **`ipconfig`** (Windows) / **`ip`** (Linux) : voir et modifier la config IP.
- **`ping`** : la machine est-elle joignable ? (ICMP) · **`tracert`** / **`traceroute`** : par où passent les paquets ?
- **`netstat`** : connexions actives et ports en écoute.

| Commande | Rôle |
|---|---|
| `ipconfig` | Affiche IP, masque et passerelle |
| `ipconfig /all` | Toutes les informations réseau détaillées |
| `ipconfig /release` | Libère l'adresse IP obtenue par DHCP |
| `ipconfig /renew` | Demande une IP au serveur DHCP |
| `ipconfig /flushdns` | Vide le cache DNS |
| `ipconfig /displaydns` | Affiche le cache DNS |
| `ipconfig /registerdns` | Renouvelle l'enregistrement DNS dynamique |
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
| `ping 192.168.1.1` | Teste la connexion vers une adresse IP |
| `ping www.google.com` | Teste la connexion vers un nom de domaine |
| `ping -c 4 8.8.8.8` | (Linux) Envoie 4 requêtes |
| `ping -n 4 8.8.8.8` | (Windows) Envoie 4 requêtes |
| `ping -t 8.8.8.8` | (Windows) Ping en continu, jusqu'à Ctrl+C |
| `ping -s 1000 8.8.8.8` | (Linux) Définit la taille des paquets |
| `ping -i 0.5 8.8.8.8` | (Linux) Modifie l'intervalle entre les requêtes |
| `ping -q 8.8.8.8` | (Linux) Affiche seulement les statistiques |
| `netstat -a` | Connexions et ports en écoute |
| `netstat -n` | IP et ports au format numérique |
| `netstat -r` | Table de routage |
| `netstat -an` | Toutes les connexions et ports en numérique |
| `netstat -e` | (Windows) Statistiques réseau |
| `netstat -t` / `-u` | (Linux) Connexions TCP / UDP |
| `netstat -l` | (Linux) Ports en écoute |
| `netstat -p` | (Linux) Processus associés (droits parfois nécessaires) |
| `netstat -an \| grep :80` | (Linux) Connexions sur le port 80 |
| `LISTEN` | Attend une connexion |
| `ESTABLISHED` | Connexion établie |
| `CLOSE_WAIT` | L'autre partie a fermé, en attente de fermeture |
| `TIME_WAIT` | Attend avant de terminer la connexion |
| `SYN_SENT` | Demande envoyée, en attente de réponse |
| `tracert www.google.com` | Chemin vers Google |
| `/d` | Affiche uniquement les IP (pas de résolution de noms) |
| `/h ` | Nombre maximum de sauts (30 par défaut) |
| `/w ` | Temps d'attente (4 000 ms par défaut) |
| `/4` · `/6` | Force IPv4 · IPv6 |

[:octicons-arrow-right-24: Voir le module](../cours/base-des-reseaux/m05-premieres-commandes.md)

## Module 6 – L'adressage IPv6

- IPv6 = **128 bits**, **8 groupes** de 4 chiffres hexadécimaux séparés par `:`.
- Simplification : on enlève les **0 en tête** de groupe, et **une seule fois** `::` pour une suite de groupes à 0.
- 3 types : **unicast**, **multicast**, **anycast**. **Pas de broadcast** en IPv6.

| Commande | Rôle |
|---|---|
| `::/0` | Route par défaut (tous les réseaux) |
| `::/128` | Adresse non spécifiée (utilisée notamment avant l'obtention d'une adresse) |
| `::1/128` | Boucle locale (loopback), équivalent de `127.0.0.1` en IPv4 |
| `FE80::/10` | Adresse **locale de lien**, auto-configuration |
| `2000::/3` | Adresse **globale**, routable sur Internet |
| `FF00::/8` | **Multicast** : envoi à plusieurs destinataires |
| `FC00::/7` | Adresses **locales uniques**, non routables sur Internet |
| `FD00::/8` | Partie de `FC00::/7` utilisée pour les adresses locales uniques |
| `FF` : identifie le multicast | Propriétés de l'adresse |
| `FF02::1` | Tous les nœuds du lien local |
| `FF02::2` | Tous les routeurs du lien local |
| `FF02::1:2` | Serveurs et relais DHCPv6 du lien |
| `FF02::FB` | Découverte de services avec mDNS |
| `FF05::1` | Tous les nœuds du site |
| `FF0E::101` | Groupe multicast de portée globale |

[:octicons-arrow-right-24: Voir le module](../cours/base-des-reseaux/m06-adressage-ipv6.md)

## TP – Passerelle par défaut sous Packet Tracer

La **passerelle par défaut** est l'adresse IP du routeur, **dans le même réseau que le PC**.
Sans elle, un PC ne peut parler qu'aux machines de son propre réseau.

[:octicons-arrow-right-24: Voir le module](../cours/base-des-reseaux/tp-passerelle-packet-tracer.md)
