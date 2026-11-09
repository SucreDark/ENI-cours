---
tags:
  - Microsoft 365 – Outils collaboratifs
---

# Module 2 – Notions de base sur Word

!!! abstract "En bref"
    On tape d'abord **au kilomètre** sans mise en forme, puis on structure avec des **styles** (titres, paragraphes, listes),
    l'**espacement de paragraphe** (jamais de paragraphes vides), les **tabulations**, les **sauts** et une **table des matières automatique**.

## 1. L'interface de Word

Au démarrage : nouveau document, modèle ou document récent.

| Zone | Rôle |
|---|---|
| **Barre de titre** | Nom du fichier et du logiciel |
| **Ruban** | Onglets de commandes par thème (Accueil, Mise en page, Affichage…) |
| **Barre d'accès rapide** | Personnalisable, commandes les plus utilisées |
| **Zone utilisateur** | Nom de l'utilisateur de la licence |
| **Règles** | Non affichées par défaut ; positionnement précis, taquets de tabulation |
| **Barres de défilement** | Naviguer dans le document |
| **Zone de rédaction** | Le texte |
| **Barre d'état** | Infos sur le document |

## 2. Créer un document

1. Afficher les **caractères non imprimables** (menu Accueil, bouton ¶)
2. **Taper au kilomètre**, sans mise en forme
3. Identifier les éléments : **titres**, **paragraphes**, **listes** (à puces, numérotées)
4. Mettre en forme : alignements et tabulations, **espacement** (pas de paragraphes vides), **styles** (pas de paragraphe en style Normal), **enchaînement** des styles, **sauts**
5. Créer le **sommaire** automatiquement

## 3. Mise en forme

### Page de garde et sommaire

Prévoir des pages vides si besoin et insérer des **sauts de page** (menu Insertion).

### Les titres

- Choisir la numérotation, la police (casse, taille), la mise en forme (gras, italique, souligné)
- Ajuster les retraits (clic droit sur la puce) : marge, espace numéro/texte, caractère après le numéro (tabulation ou espace)
- **Mettre à jour le style Titre 1** avec le titre créé (menu Accueil), idem pour les autres niveaux
- **Hiérarchiser** avec la **liste à plusieurs niveaux** : pour chaque niveau, bouton *Plus*, associer le style, la mise en forme, la position

**Étapes :** 1) créer les titres, 2) définir la liste à plusieurs niveaux, 3) refaire les retraits (souvent modifiés).

### Les paragraphes

- Aligner par rapport au titre (retraits, taquets de la règle), police, alignement (**gauche, centré, droite, justifié**)
- **Créer un nouveau style** pour sauvegarder la structure (il apparaît dans l'accès rapide)
- **Lier les styles** : dans *Modifier le style*, choisir le **style du paragraphe suivant** → mise en forme automatique pendant la frappe

### L'espacement

- **Ne pas utiliser de paragraphes vides** → utiliser l'**espacement avant / après** et l'**interligne** (outil *Interligne et espacement de paragraphe*)
- Depuis l'accès rapide : clic droit sur un style > Modifier > Format > Paragraphe → s'applique à **tous** les paragraphes du style

### Les tabulations

| Taquet | |
|---|---|
| Gauche, centré, droit, **décimal** | Un caractère « tabulation » par taquet sur la règle |

Positionner les taquets sur le texte sélectionné, puis créer un style pour les réutiliser.

### Les sauts

| Saut | Rôle |
|---|---|
| **De page** | Fixer le contenu d'une page |
| **De colonne** | Fin du contenu d'une colonne |
| **De section page suivante** | Nouvelle section sur une nouvelle page : en-tête, pied de page, **orientation**, numérotation différents |
| **De section continu** | Nouvelle section sur la même page (ex. marges différentes) |

### La table des matières

- Menu **Références** > Table des matières (automatique ou **personnalisée** : format, niveaux à afficher, caractères de suite)
- Elle se base sur les styles **Titre X** ; son apparence dépend des styles **TM X**

---

## Exercices

**Exercice 1** : pourquoi ne faut-il pas faire d'espaces avec des paragraphes vides ?

??? success "Correction"
    On utilise l'**espacement avant/après** des styles : la mise en forme reste homogène et se modifie en une fois pour tous les paragraphes du style.

**Exercice 2** : comment faire pour que, après un Titre 1, Word passe automatiquement au style T1-Paragraphe ?

??? success "Correction"
    Modifier le style Titre 1 > **Style du paragraphe suivant** = T1-Paragraphe.

**Exercice 3** : une seule page de ton document doit être en paysage. Quel saut utiliser ?

??? success "Correction"
    Des **sauts de section (page suivante)** avant et après cette page, puis changer l'orientation de cette section.

**Exercice 4** : sur quoi se base la table des matières automatique ?

??? success "Correction"
    Sur les styles **Titre 1, Titre 2…** ; son apparence se règle via les styles **TM 1, TM 2…**

**Exercice 5 (TP Système solaire)** : mets en forme le document brut à l'aide de styles.

- [ ] Titre 1 : Comic Sans MS 14 pt gras, 12 pt avant / 6 pt après, numérotation I, II, III, retrait 0,5 cm, paragraphe suivant T1-Paragraphe
- [ ] Titre 2 : 13 pt gras, 6/3 pt, A., B., C., retrait 0,5 cm
- [ ] Titre 3 : 12 pt gras italique, 6/3 pt, 1., 2., 3., retrait 1 cm
- [ ] Titre 4 : 11 pt italique, 4/0 pt, a), b), c), retrait 1,5 cm
- [ ] Définir la **liste à plusieurs niveaux** pour ces titres
- [ ] Paragraphes T1 / T2 / T3 en Cambria 13 / 12 / 11 pt, justifiés, retraits 0,75 / 1,25 / 1,75 cm
- [ ] Styles de puces et sous-puces (T2-Puces, T2-SousPuces…), retrait négatif 0,5 cm
- [ ] Page de garde, sauts, table des matières
