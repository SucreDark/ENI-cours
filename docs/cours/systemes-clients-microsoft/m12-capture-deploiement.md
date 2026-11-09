---
tags:
  - Systèmes clients Microsoft
---

# Module 12 – Introduction à la capture et au déploiement d'image

!!! abstract "En bref"
    Pour industrialiser l'installation : préparer un **master**, le généraliser avec **`sysprep`**, **capturer** son image, puis **déployer** des clones (serveur de déploiement en PXE, ou dism + WinPE).

## 1. La problématique

- Productivité du service informatique
- Parc **homogène** (moins de configurations) et OS homogènes (moins de maintenance)
- Systèmes **clé en main** pour les nouveaux collaborateurs ou en cas de poste défaillant

→ Solution : des **images de référence**.

## 2. Préparer le master

1. Installer le poste de référence
2. Configuration initiale de l'OS
3. Installer les applications validées par la DSI
4. Préparer le clonage avec **`sysprep`**

### Sysprep

Rend chaque poste **unique** : remet à zéro les paramètres personnalisés du master. Une version par génération de systèmes, en graphique ou en ligne de commande.

```
C:\Windows\System32\sysprep\sysprep.exe /oobe /generalize /shutdown
```

| Paramètre | Rôle |
|---|---|
| `/oobe` | *Out-of-Box Experience* : interaction utilisateur au redémarrage |
| `/generalize` | Généraliser |
| `/shutdown` | Éteindre le système |
| Mode **Audit** | Pré-paramétrages spécifiques avant l'OOBE |
| `/PersistAllDeviceInstalls` | Garder les pilotes installés manuellement (supprimés par défaut) |

Journaux après redémarrage : dossiers **Panther** (dans `C:\Windows\System32\Sysprep`, fichiers TXT et EVT).

!!! warning "Limites de sysprep"
    - Incompatible avec certaines configurations (rôles serveur, jonction au domaine…) et les **applis du Microsoft Store**
    - Ne supprime **pas** les comptes utilisateurs → activer et utiliser le compte **Administrateur** (il sera réinitialisé)

## 3. Exploiter le master

!!! danger "Une fois le master éteint"
    **Ne pas le redémarrer** avant d'avoir capturé son image !

| Méthode | Comment |
|---|---|
| **Automatisée** : serveur de déploiement | Amorçage **PXE**, images d'amorçage sur le serveur, capture et déploiement par le serveur |
| **Manuelle** : **dism** | Support **WinPE** amorçable (DVD, clé USB…) : léger, outils de capture/déploiement |

- **Mise à jour des images** hors ligne : format **WIM** + `dism` (présent dans WinPE et Windows)
- **Poste cible prêt ?** Outils Microsoft de compatibilité (Conseiller de mise à niveau, Application Compatibility Toolkit…) ; WinPE contient `diskpart`, mount, drvload, net use, PowerShell…

## 4. Déployer

| | Serveur de déploiement (ex. **WDS**) | **dism** |
|---|---|---|
| Usage | Déploiement **en masse** | Au **cas par cas** |
| Démarrage | Postes en **boot PXE**, ils contactent le serveur | Sur le support **WinPE** |
| Ensuite | Choix de l'image à déployer | Partitionnement du disque puis application de l'image |

---

## Exercices

**Exercice 1** : donne la commande `sysprep` complète pour généraliser un master en mode OOBE puis l'éteindre.

??? success "Correction"
    `C:\Windows\System32\sysprep\sysprep.exe /oobe /generalize /shutdown`

**Exercice 2** : pourquoi utiliser le compte Administrateur avant un `sysprep` ?

??? success "Correction"
    Sysprep **ne supprime pas** les comptes utilisateurs ; le compte Administrateur, lui, est réinitialisé. On supprime donc les autres comptes et leurs profils, et on travaille en Administrateur.

**Exercice 3** : déploiement en masse ou au cas par cas : quelle méthode pour chaque ?

??? success "Correction"
    En masse : **serveur de déploiement (WDS) + PXE**. Au cas par cas : **dism + WinPE**.

**Exercice 4 (TP Atelier 15)** : déroule le TP.

- [ ] Activer le compte Administrateur, lui mettre un mot de passe, ouvrir une session avec
- [ ] Faire un snapshot
- [ ] Supprimer les utilisateurs créés (et leurs profils)
- [ ] `sysprep /oobe /generalize /shutdown`
- [ ] Créer un **Full Clone** de Win10-XX dans `VMs-WorkStation\Win10-XX-Clone`
- [ ] Revenir au snapshot sur Win10-XX, démarrer le clone et faire sa config initiale
- [ ] Comparer les deux VM : VMware Tools, nom, volumes, utilisateurs SAM, IP, 1er log système, points de restauration, compte admin, pilote d'imprimante, règle ICMP

??? info "Astuce du TP : date du premier événement système"
    `Get-WinEvent -LogName System -Oldest -MaxEvents 1 | Select-Object TimeCreated`
