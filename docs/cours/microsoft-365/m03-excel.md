---
tags:
  - Microsoft 365 – Outils collaboratifs
---

# Module 3 – Notions de base sur Excel

!!! abstract "En bref"
    Excel ≈ une calculatrice géante : des **cellules** (A1…), des **formules** qui commencent par `=`, des **fonctions** par catégorie,
    et des **références relatives / absolues** (`$`, touche ++f4++) pour recopier correctement.

## 1. Le classeur

- Créer : nouveau classeur ou modèle · Ouvrir : récents, ordinateur, réseau
- Limites liées à l'ordinateur et à l'OS

| Limite | Valeur |
|---|---|
| Feuilles par classeur | 255 |
| Lignes / colonnes par feuille | 1 048 576 / 16 384 (cellules de **A1 à XFD1048576**) |
| Nom d'une feuille | 31 caractères max |
| Contenu d'une cellule | Texte 32 767 car. · Formule 8 192 car. · Chiffre 11 car. affichables (sinon notation exponentielle) |

!!! note "Coquille du support"
    Le support indique 10 148 576 lignes ; la vraie limite d'Excel est **1 048 576**.

## 2. Calculs simples

Opérateurs : `+` `-` `*` `/`, plus `%` et `^`.

**Ordre de calcul :** `%` → `^` → `*` et `/` → `+` et `-`. Les **parenthèses** rendent un calcul prioritaire.

## 3. Les cellules

- Référence = lettre(s) de colonne + numéro de ligne
- Une référence peut être remplacée par un **nom** (zone de référence, ou *Formules > Gestionnaire de noms* : nouveau, modifier, supprimer)

| Pointeur | Action |
|---|---|
| **Croix blanche** | Sélectionner (référence ou nb de lignes/colonnes affiché) ; éditer via la barre de formule ou double-clic |
| **Flèche blanche** (bord de la cellule) | **Déplacer** la cellule ; avec ++ctrl++ : **copier** |
| **Croix noire** (petit carré en bas à droite) | **Recopier** en incrémentant si possible |

Incrémentation : selon les **listes personnalisées** (Options > Options avancées > Modifier les listes personnalisées) ou en sélectionnant 2 cellules pour définir un **pas**.

## 4. Les fonctions

Catégories : Base de données, Cube, Date et heure, Finances, Informations, Ingénierie, **Logique**, **Maths et trigo**, **Recherche et référence**, Statistiques, **Texte**, Web.

=== "Maths"

    | Fonction | Exemple → résultat |
    |---|---|
    | `ALEA()` | nombre aléatoire entre 0 et 1 |
    | `ARRONDI(x;n)` | `=ARRONDI(3,14159;2)` → 3,14 |
    | `ARRONDI.INF` / `ARRONDI.SUP` | (…;3) → 3,141 / 3,142 |
    | `ENT(x)` | `=ENT(3,14159)` → 3 |
    | `SOMME()` / `PRODUIT()` | `=SOMME(B2:B3)` = B2+B3 |
    | `QUOTIENT(a;b)` | `=QUOTIENT(5;2)` → 2 (partie entière) |
    | `MOD(a;b)` | `=MOD(5;2)` → 1 (reste) |

=== "Texte"

    | Fonction | Exemple → résultat |
    |---|---|
    | `CONCAT()` ou `&` | `=CONCAT("Hello";" ";"world")` → Hello world |
    | `GAUCHE(t;n)` / `DROITE(t;n)` | `GAUCHE("Hello";4)` → Hell · `DROITE("Hello";2)` → lo |
    | `MAJUSCULE()` / `MINUSCULE()` | HELLO / hello |
    | `NBCAR()` | `=NBCAR("Hello world")` → 11 |
    | `TEXTE()` / `CNUM()` | nombre → texte / texte → nombre |

=== "Recherche"

    | Fonction | Rôle |
    |---|---|
    | `COLONNE(E3)` / `LIGNE(E3)` | 5 / 3 |
    | `RECHERCHEV(val;tableau;n°col)` | Cherche une valeur dans la 1re colonne et renvoie la valeur d'une autre **colonne** sur la même ligne |
    | `RECHERCHEH(val;tableau;n°ligne)` | Pareil mais en **ligne** |
    | `TROUVE("o";C3)` | Position d'un texte dans un texte |

=== "Logique"

    | Fonction | Exemple |
    |---|---|
    | `SI(test;si_vrai;si_faux)` | `=SI(B5="Yann";"Vrai";"Faux")` |
    | `ET()` | toutes les conditions vraies : `=SI(ET(B4="Gilles";A4>2);"OK";"Anormal")` |
    | `OU()` | au moins une vraie |
    | `SIERREUR(formule;valeur)` | gère les erreurs |

**Utiliser une fonction :** cellule de destination → taper `=` + les premières lettres → double-clic sur la fonction (aide simplifiée, lien vers l'aide détaillée).

## 5. Recopier une formule

En recopiant, les références **évoluent** : `=SOMME(A2:D2)` en E2 devient `=SOMME(A3:D3)` en E3.

| Référence | Écriture | À la recopie |
|---|---|---|
| Relative | `A1` | Évolue |
| Absolue | `$A$1` | Ne bouge pas |
| Colonne absolue | `$A1` | Colonne fixe |
| Ligne absolue | `A$1` | Ligne fixe |

++f4++ fait défiler les types de référence. Pour ne recopier **que la formule** : collage spécial.

## 6. Excel et SharePoint

Documents stockés sur SharePoint : **sauvegarde automatique**, **gestion des versions** (ouvrir une version antérieure sans écraser la courante), **historique** des personnes qui ont modifié (flèche à côté du nom du classeur, ou menu Fichier).

---

## Exercices

**Exercice 1** : que vaut `=2+3*4^2` ?

??? success "Correction"
    `4^2 = 16`, `3*16 = 48`, `2+48 =` **50**.

**Exercice 2** : tu recopies `=B2*$E$1` de C2 vers C3. Que devient la formule ?

??? success "Correction"
    `=B3*$E$1` : B2 (relative) évolue, $E$1 (absolue) reste.

**Exercice 3** : construis un code client = 3 premières lettres du nom en majuscules + ville (A2 = nom, B2 = ville).

??? success "Correction"
    `=MAJUSCULE(GAUCHE(A2;3))&B2`

**Exercice 4** : en E2 tu as un code client ; le tableau Clients est en `'Liste des clients'!A2:F50` avec le nom en colonne 2. Récupère le nom.

??? success "Correction"
    `=RECHERCHEV(E2;'Liste des clients'!$A$2:$F$50;2;FAUX)` (références absolues pour pouvoir recopier).

**Exercice 5** : affiche « vide » si A2 ou B2 est vide, sinon leur concaténation.

??? success "Correction"
    `=SI(OU(A2="";B2="");"";A2&B2)`

**Exercice 6 (TP Clients)** : refais le classeur.

- [ ] Codes clients (MAJUSCULE, GAUCHE, &)
- [ ] Codes ouvrages (MAJUSCULE, GAUCHE, DROITE, &)
- [ ] Numéros de commande (DROITE, ANNEE, MOIS, JOUR, SI, OU, &)
- [ ] Nom et prénom, titre et tome, montant TTC (RECHERCHEV)
- [ ] Total de la commande (SI, OU, SOMME.SI.ENS)
