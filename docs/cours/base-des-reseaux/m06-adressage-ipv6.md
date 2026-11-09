---
tags:
  - Base des réseaux
---

# Module 6 – L'adressage IPv6

!!! abstract "En bref"
    - IPv6 = **128 bits**, **8 groupes** de 4 chiffres hexadécimaux séparés par `:`.
    - Simplification : on enlève les **0 en tête** de groupe, et **une seule fois** `::` pour une suite de groupes à 0.
    - 3 types : **unicast**, **multicast**, **anycast**. **Pas de broadcast** en IPv6.

## 1. Structure d'une adresse IPv6

- **128 bits** (contre 32 pour IPv4)
- **8 groupes de 4 chiffres hexadécimaux** séparés par `:`
- Chaque groupe = **16 bits = 2 octets**

Exemple : `2001:0db8:85a3:0000:0000:8a2e:0370:7334`

## 2. Règles de simplification

1. Supprimer les **zéros au début** de chaque groupe : `0db8` → `db8`
2. Remplacer **une** suite de groupes à zéro par `::` (**une seule fois** par adresse maximum)

```
2001:0db8:0000:0000:0000:ff00:0042:8329
            ↓
2001:db8::ff00:42:8329
```

## 3. Adresses et plages à retenir

| Adresse / plage | Rôle |
|---|---|
| `::/0` | Route par défaut (tous les réseaux) |
| `::/128` | Adresse non spécifiée (utilisée notamment avant l'obtention d'une adresse) |
| `::1/128` | Boucle locale (loopback), équivalent de `127.0.0.1` en IPv4 |
| `FE80::/10` | Adresse **locale de lien**, auto-configuration |
| `2000::/3` | Adresse **globale**, routable sur Internet |
| `FF00::/8` | **Multicast** : envoi à plusieurs destinataires |
| `FC00::/7` | Adresses **locales uniques**, non routables sur Internet |
| `FD00::/8` | Partie de `FC00::/7` utilisée pour les adresses locales uniques |

## 4. Avantages d'IPv6

- **Plus d'adresses** : environ 3,4 × 10³⁸
- **Moins besoin de NAT** : chaque appareil peut avoir une IP unique
- **QoS** : meilleure gestion de la qualité de service
- **Auto-configuration** : l'appareil peut générer lui-même son adresse
- **IPsec** : prise en charge des mécanismes de sécurité IP

## 5. Coexistence IPv4 / IPv6

Les deux versions ne sont **pas directement compatibles**. Trois solutions :

| Solution | Principe |
|---|---|
| **Double Stack** | IPv4 et IPv6 fonctionnent ensemble |
| **Tunneling** | IPv6 est transporté dans des paquets IPv4 |
| **NAT64** | Communication entre appareils IPv6 et IPv4 |

## 6. Les types d'adresses

| Type | Destinataire |
|---|---|
| **Unicast** | Un appareil précis |
| **Multicast** | Plusieurs appareils (un groupe) en une seule transmission |
| **Anycast** | Le nœud **le plus proche** parmi plusieurs appareils ayant la même adresse |

!!! info "Et le broadcast ?"
    Le broadcast (tous les appareils du réseau) n'existe qu'en **IPv4**. **Pas de broadcast en IPv6.**

## 7. L'adresse GUA

**GUA** (*Global Unicast Address*) : adresse IPv6 **globale, routable sur Internet**, comparable à une adresse IPv4 publique.

| Préfixe global | Sous-réseau | Identifiant d'interface |
|---|---|---|
| **48 bits** | **16 bits** | **64 bits** |
| Identifie le réseau à l'échelle mondiale | Permet de créer des sous-réseaux | Identifie l'interface de l'appareil |

Total : 48 + 16 + 64 = **128 bits**.

!!! warning "Attention"
    Avoir une GUA ne veut pas forcément dire qu'un appareil est joignable depuis Internet : le **routage** et les règles de **pare-feu** doivent aussi l'autoriser.

## 8. Les adresses multicast

La **multidiffusion** permet d'envoyer un paquet à **un groupe précis d'appareils** en une seule transmission.

**Structure** : une adresse multicast appartient à `FF00::/8`, elle commence donc par `FF`.

| Préfixe (8 bits) | Flags (4 bits) | Scope (4 bits) | ID de groupe (112 bits) |
|---|---|---|---|
| `FF` : identifie le multicast | Propriétés de l'adresse | Portée | Groupe de destinataires |

**Portées (scope)** : jusqu'où le paquet peut être diffusé.

| Valeur | Portée | Signification |
|---|---|---|
| 2 | Lien local | Sur le réseau local uniquement |
| 5 | Site local | À l'échelle d'un site |
| E | Globale | Peut être acheminé à l'échelle mondiale |

**Exemples** :

| Adresse | Groupe |
|---|---|
| `FF02::1` | Tous les nœuds du lien local |
| `FF02::2` | Tous les routeurs du lien local |
| `FF02::1:2` | Serveurs et relais DHCPv6 du lien |
| `FF02::FB` | Découverte de services avec mDNS |
| `FF05::1` | Tous les nœuds du site |
| `FF0E::101` | Groupe multicast de portée globale |

**Utilisations** : streaming audio/vidéo · **PIM** (gérer le routage multicast) · **mDNS** et **SSDP** (découverte de services) · **OSPF** (utilise des adresses multicast).

---

## Exercices

**Exercice 1** : simplifie `2001:0db8:0000:0000:0000:ff00:0042:8329`.

??? success "Correction"
    `2001:db8::ff00:42:8329`

**Exercice 2** : simplifie `fe80:0000:0000:0000:0204:61ff:fe9d:f156`.

??? success "Correction"
    `fe80::204:61ff:fe9d:f156`

**Exercice 3** : pourquoi `2001:db8::1::5` est-elle invalide ?

??? success "Correction"
    `::` est utilisé **deux fois** : on ne pourrait plus savoir combien de groupes à 0 il remplace.

**Exercice 4** : à quoi correspondent `::1`, `FE80::/10` et `FF00::/8` ?

??? success "Correction"
    Loopback · locale de lien · multicast

**Exercice 5** : combien de bits pour le préfixe global, le sous-réseau et l'identifiant d'interface d'une GUA ?

??? success "Correction"
    **48** + **16** + **64** = 128 bits

**Exercice 6** : quelle est la portée de `FF02::1` ? Et de `FF05::1` ?

??? success "Correction"
    `FF02` → scope **2** = lien local · `FF05` → scope **5** = site local

**Exercice 7** : cite les 3 solutions de coexistence IPv4 / IPv6.

??? success "Correction"
    **Double Stack**, **Tunneling**, **NAT64**

**Exercice 8** : quelle est la différence entre multicast et anycast ?

??? success "Correction"
    Multicast : **tous** les membres du groupe reçoivent. Anycast : seul le nœud **le plus proche** reçoit.
