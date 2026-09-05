# DBM Candidate Pilot — Commercial Update 2026-09

## Grille commerciale officielle — version unique dans tout le dossier
- FAST — 6 mois — 6 500 FCFA/jour — cible contractuelle **1 000 000 FCFA**. Calcul interne : 154 jours de paiement maximum, avec dernier paiement ajusté à 5 500 FCFA.
- BALANCE — 8 mois — 5 500 FCFA/jour — cible contractuelle **1 100 000 FCFA**. Calcul interne : 200 jours de paiement.
- FLEX — 10 mois — 4 500 FCFA/jour — cible contractuelle **1 200 000 FCFA**. Calcul interne : 267 jours de paiement maximum, avec dernier paiement ajusté à 3 000 FCFA.

Les montants commerciaux affichés restent arrondis à 1 000 000 / 1 100 000 / 1 200 000 FCFA, même si le nombre réel de jours de paiement augmente ou diminue pour atteindre exactement la cible.

## Investissement de référence
700 000 FCFA = 600 000 moto + 40 000 GPS + 20 000 carte grise + 20 000 assurance + 20 000 accessoires.

**Important :** aucun ancien montant de 90 000 FCFA ou 50 000 FCFA n'est intégré à l'investissement. Les frais de dossier/digitalisation sont contractuels, séparés du paiement journalier et ne sont jamais ajoutés automatiquement au tarif journalier.

## Règle de calcul
`jours = plafond(montant_cible / tarif_journalier)` avec un dernier paiement ajusté au solde restant afin de ne pas dépasser le montant contractuel cible.

Le score préliminaire, la recommandation de formule et la validation finale restent distincts.

Run `supabase/migrations-003-commercial.sql` before using the commercial fields in an existing pilot database.


## Cohérence du dossier
Toutes les références commerciales du pilote et de la landing page utilisent désormais la même grille FAST / BALANCE / FLEX : 6 500 / 5 500 / 4 500 FCFA par jour et 1 000 000 / 1 100 000 / 1 200 000 FCFA de cible.
