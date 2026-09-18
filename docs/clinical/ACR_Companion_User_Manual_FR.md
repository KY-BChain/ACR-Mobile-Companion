# ACR Companion : manuel d’utilisation pour les évaluateurs

**S’applique à :** v0.6.7 (Build 48). La version dont vous disposez est indiquée sur l’écran **À propos**.
**Mise à jour :** 18 septembre 2026
**Statut :** approuvé par CRIL pour l’évaluation sur invitation. Ne pas distribuer au public.
**Pour :** évaluateurs cliniques invités et testeurs d’évaluation.
**Version chinoise :** ACR_Companion_User_Manual_ZH-CN.

---

## 1. Avant de continuer

- **Données synthétiques uniquement.** N’entrez jamais les informations d’un patient réel, même codées ou pseudonymisées. L’application ne demande ni nom ni numéro d’hôpital.
- **Ne pas utiliser en clinique.** Les résultats sont une aide à la décision pour l’évaluation. Ils ne doivent pas servir à diagnostiquer ou à traiter qui que ce soit.
- **L’application ne contient aucune règle clinique.** Tout ce que vous voyez dans un résultat provient de la plateforme ACR. L’application recueille vos saisies, les envoie de manière sécurisée et affiche la réponse.
- **Fonctionnement des règles** (sous-type, risque, lignes de traitement, confiance bayésienne) : voir le document compagnon *ACR Companion — liste de revue et de test pour les évaluateurs ZZU*. Ce manuel explique comment utiliser l’application.

Dans ce manuel, les **mots en gras** sont les noms des boutons et des écrans tels qu’ils apparaissent en anglais.

---

## 2. Ce dont vous avez besoin

| | |
|---|---|
| Téléphone | Un téléphone Android ou un iPhone |
| Code d’invitation | Un code personnel envoyé par CRIL. Gardez-le privé |
| Internet | Wi-Fi ou données mobiles, pour obtenir les résultats |
| Langue | English (UK), 简体中文, Français, Deutsch, Русский, العربية, 한국어 ou 日本語. Seuls l’anglais et le chinois ont été vérifiés ; les autres traductions sont des brouillons |

---

## 3. Installation de l’application

**CRIL vous indiquera comment obtenir l’application pour votre téléphone.** Installez uniquement le fichier ou le lien envoyé par CRIL.

**Android**
1. Ouvrez le fichier d’installation (se terminant par `.apk`) envoyé par CRIL.
2. Si le téléphone le demande, autorisez l’installation depuis cette source (par exemple votre navigateur ou gestionnaire de fichiers). Certains téléphones, comme Xiaomi et Samsung, affichent une invite de sécurité supplémentaire : choisissez de continuer.
3. Une fois l’installation terminée, ouvrez **ACR Companion**.

**iPhone**
L’installation sur iPhone est organisée séparément par CRIL. La première fois que l’application est ouverte, l’iPhone peut vous demander de faire confiance au développeur : allez dans *Réglages → Général → VPN et gestion de l’appareil* et faites confiance.

Si une version antérieure est déjà installée, CRIL vous indiquera s’il faut la mettre à jour par-dessus ou la supprimer d’abord.

---

## 4. Les écrans en un coup d’œil

| Ordre | Écran | Ce que vous y faites |
|---|---|---|
| — | **Accès à l’évaluation** | Se connecter avec le code d’invitation ; choisir Plateforme live ou Démonstration synthétique |
| — | Bienvenue (**Avant de commencer**) | Lire les avis ; changer la langue ; ouvrir **À propos** |
| 1 sur 5 | **Statut des récepteurs** | ER, PR, HER2, Ki-67 |
| 2 sur 5 | **Caractéristiques de la tumeur** | Stade, grade, histologie, statut ganglionnaire, âge |
| 3 sur 5 | **Biomarqueurs et chirurgie** | CA 15-3, CEA, date de chirurgie, option bayésienne |
| 4 sur 5 | **Champs contractuels principaux** | Taille de la tumeur, sexe |
| 5 sur 5 | **Champs contractuels supplémentaires** | ECOG, PD-L1, HER2-low, LVEF, intention thérapeutique |
| — | **Revue** | Tout vérifier, puis **Envoyer** |
| — | **Résultat de l’évaluation** | Lire le résultat |

Chaque écran de saisie affiche *Étape n sur 5* en haut, avec **Retour** et **Suivant** en bas.

---

## 5. Ouvrir l’application et choisir une langue

1. Ouvrez l’application. Elle démarre sur **Accès à l’évaluation**.
2. Pour changer la langue, appuyez sur **Retour** pour atteindre l’écran Bienvenue, appuyez sur **Langue** et choisissez. Tous les écrans suivent votre choix ; l’arabe se lit de droite à gauche.
3. L’écran Bienvenue contient aussi **À propos**, qui décrit la plateforme ACR et affiche la version de l’application.
4. Si vous restez sur l’écran Bienvenue quelques secondes, une affiche d’introduction d’une page apparaît. Balayez latéralement pour l’avis **Confidentialité et cookies**, où **LIRE LES DÉTAILS** ouvre ce manuel sur le téléphone. Balayez vers le haut pour continuer.
5. Appuyez sur **J’ai compris — Commencer** pour revenir à **Accès à l’évaluation**.

---

## 6. Première connexion

1. Sur **Accès à l’évaluation**, saisissez votre code d’invitation dans **Code d’invitation**.
2. Appuyez sur **Connexion sécurisée**.
3. Un message confirme : *« Code d’invitation accepté et appairé avec cet appareil mobile et cet appareil mobile uniquement. Pour 30 jours. »* Il indique aussi la date d’appairage et la date d’expiration (en UTC). Appuyez sur **Continuer**.
4. Appuyez sur **Suivant** pour commencer une évaluation.

**À noter :**
- **Votre code ne fonctionne que sur un seul téléphone.** Le premier téléphone sur lequel il est saisi y est appairé. Sur tout autre téléphone, l’application affiche *« Appareil incorrect utilisé. »*
- **L’accès dure 30 jours** à partir de l’appairage. Ensuite, l’application affiche *« Code d’invitation expiré. Demandez-en un nouveau. »* Demandez un nouveau code à CRIL.
- **Vous ne saisissez le code qu’une seule fois.** Ensuite, l’application se reconnecte automatiquement à chaque ouverture. Vous ne le saisirez à nouveau qu’après **Déconnecter l’accès** (voir section 12), et les 30 jours ne recommencent pas.
- Le code lui-même n’est jamais stocké sur le téléphone.

### Le panneau de connexion
**Preuve de connexion** sur le même écran affiche :
- **Passerelle :** **Connectée**, **Serveur non connecté** ou **Vérification…**
- **Attestation de référence :** **VÉRIFIÉE** signifie que la plateforme ACR est exactement la version approuvée, et que des résultats live peuvent être produits. **NON CORRESPONDANTE** ou **INDISPONIBLE** signifie que les résultats live sont bloqués.

---

## 7. Plateforme live ou démonstration synthétique

Choisissez sous **Mode de livraison** avant de commencer :

| Choix | Ce qui se passe | À utiliser pour |
|---|---|---|
| **Plateforme live** (bleu) | Vos saisies sont envoyées à la plateforme ACR, qui applique ses règles cliniques maintenant | Tous les cas de test réels |
| **Démonstration synthétique** (ambre) | Aucune règle n’est exécutée. L’application remplit un cas de démonstration fixe, et le service affiche un résultat enregistré auparavant depuis la plateforme live pour exactement ce cas | Un aperçu rapide d’un résultat complet, ou lorsque la plateforme live est hors ligne |

En mode démonstration, **ne modifiez aucune valeur**. Si vous le faites, la Revue affiche un encadré rouge **Cas de démonstration modifié** et aucun résultat n’est renvoyé.

---

## 8. Saisir un cas

### Conseils généraux
- **Champs obligatoires :** uniquement ER, PR, HER2 et Ki-67 sur l’écran 1. **Suivant** reste indisponible tant que Ki-67 n’est pas un nombre de 0 à 100.
- **Tout le reste est facultatif,** mais certaines valeurs sont marquées **nécessaires pour une évaluation complète**. Sans elles, la plateforme répond quand même, mais retient le risque (section 10).
- **Les choix** sont des boutons : appuyez sur l’un pour le sélectionner.
- **Nombres :** après la saisie, appuyez sur **Terminé** au-dessus du clavier (iPhone) ou sur la touche valider/terminé du clavier (Android) pour fermer le clavier.
- **Erreurs :** une valeur invalide s’affiche en rouge avec une courte explication, par exemple *« Entrez une valeur de 0 à 100. »*
- **Valeurs d’exemple :** pour gagner du temps, les écrans 1 à 3 d’une nouvelle évaluation Live s’ouvrent **déjà remplis** avec un cas d’exemple synthétique. Modifiez-les selon votre test. Les écrans 4 et 5 s’ouvrent vides.

### Écran 1 sur 5 — Statut des récepteurs

| Champ | Saisie | |
|---|---|---|
| Statut ER | positif / négatif | obligatoire |
| Statut PR | positif / négatif | obligatoire |
| Statut HER2 | positif / négatif | obligatoire |
| Ki-67 (%) | 0–100 | obligatoire |

L’indication *« Luminal A < 14, Luminal B ≥ 14 »* n’est qu’une aide ; la plateforme décide du sous-type.

*À noter : HER2 propose actuellement uniquement Positif ou Négatif. Il n’y a pas encore de choix « 2+, ISH en attente » (équivoque). Un cas qui serait normalement enregistré comme équivoque ne peut pas être saisi comme tel pour le moment ; veuillez informer CRIL si cela affecte vos tests.*

L’écran affiche aussi l’**ID de session**, une référence aléatoire créée pour chaque évaluation. Ce n’est pas un identifiant patient.

### Écran 2 sur 5 — Caractéristiques de la tumeur

| Champ | Saisie | |
|---|---|---|
| Stade | 0 à IV, avec sous-stades | nécessaire pour une évaluation complète |
| Grade | 1, 2 ou 3 | nécessaire pour une évaluation complète |
| Sous-type histologique | IDC, ILC, DCIS ou maladie de Paget | facultatif |
| Statut ganglionnaire | N0, N1, N2 ou N3 | nécessaire pour une évaluation complète |
| Âge (années) | années entières, 18–120 | nécessaire pour une évaluation complète |

### Écran 3 sur 5 — Biomarqueurs et chirurgie

| Champ | Saisie | |
|---|---|---|
| CA 15-3 (U/mL) | 0 ou plus | facultatif |
| CEA (ng/mL) | 0 ou plus | facultatif |
| Date de chirurgie | AAAA-MM-JJ (les dates futures sont acceptées) | facultatif |
| Amélioration bayésienne | ON / OFF | facultatif |

### Écran 4 sur 5 — Champs contractuels principaux
Cet écran et le suivant sont étiquetés **ÉVALUATION UNIQUEMENT · CHAMPS PROVISOIRES** : leurs définitions cliniques sont encore en cours de revue.

| Champ | Saisie | |
|---|---|---|
| Taille de la tumeur | un nombre supérieur à 0. **L’unité n’est pas encore décidée** | nécessaire pour une évaluation complète |
| Sexe | féminin / masculin / autre / inconnu | facultatif |

### Écran 5 sur 5 — Champs contractuels supplémentaires

| Champ | Saisie | |
|---|---|---|
| Score ECOG | nombre entier, 0–4 | nécessaire pour une évaluation complète |
| Statut PD-L1 | positif / négatif / non testé | facultatif |
| HER2-low | positif / négatif / inconnu | facultatif |
| LVEF (%) | 0–100 | facultatif |
| Intention thérapeutique | néoadjuvant / adjuvant / non précisé | facultatif |

Appuyez sur **Revue** lorsque vous avez terminé.

---

## 9. Revue et envoi

**Revue** liste chaque valeur avant tout envoi.

- **Encadré rouge « Nécessaire pour une évaluation complète » :** liste les valeurs que vous avez laissées vides et dont la plateforme a besoin. Appuyez sur un lien **Aller à …** pour sauter à cet écran ; vos autres saisies sont conservées. **Vous pouvez quand même envoyer.**
- **« valeur d’exemple, non modifiée » :** marque une valeur d’exemple que vous n’avez pas modifiée, pour distinguer vos propres saisies.
- **Mode de livraison :** affiche Live ou Démonstration synthétique (en ambre).
- **Référence :** l’envoi n’est possible que lorsque la plateforme est **VÉRIFIÉE**.

Appuyez sur **Modifier** pour revenir à l’écran 1, ou sur **Envoyer** pour envoyer le cas.

Lorsque vous envoyez un cas live, le service vérifie d’abord que la plateforme est toujours la version approuvée. S’il ne peut pas le confirmer, **aucun résultat n’est affiché**. Vous voyez **Service indisponible** avec la raison, par exemple que la plateforme ne correspond pas à la version approuvée. **Relancer la vérification** répète uniquement la vérification ; cela ne renvoie jamais votre cas.

*À noter : le libellé « ASSESSMENT BLOCKED » de la plateforme, que vous pouvez voir dans un résultat complet pour un cas incomplet (section 10), est différent. Ce résultat affiche encore le sous-type, les lignes de traitement et les biomarqueurs ; seul le risque est retenu.*

---

## 10. Lire le résultat

L’écran **Résultat de l’évaluation** affiche, de haut en bas :

1. **Résumé clinique :** **Sous-type moléculaire** et **Risque**. Le risque est un mot dans votre langue : ÉLEVÉ, INTERMÉDIAIRE ou FAIBLE. Rouge signifie élevé, vert faible, bleu autre chose. Une ligne indique l’origine du résultat (plateforme live vérifiée, ou résultat synthétique enregistré auparavant).
2. **Évaluation complète non atteinte** (cas incomplets uniquement ; voir ci-dessous).
3. **Avertissements et contexte :** les messages propres à la plateforme, affichés tels quels, en anglais.
4. **Complétude des informations :** le niveau de complétude et les valeurs manquantes, avec leurs numéros d’écran.
5. **Options de traitement renvoyées :** exactement telles que la plateforme les a écrites.
6. **Résultats de biomarqueurs renvoyés.**
7. **Confiance de classification :** affichée lorsque l’amélioration bayésienne est ON. Lisez la liste de revue et de test, section C7, avant de vous fier à ce chiffre : il peut se rapporter à un sous-type différent de celui affiché.
8. **Détails techniques :** règles déclenchées, trace de raisonnement, valeurs brutes et version de la plateforme.

### Lorsqu’un cas est incomplet
Si vous avez omis une valeur dont la plateforme a besoin :
- **Évaluation complète non atteinte** nomme les valeurs manquantes et leurs écrans, par exemple *« Taille de la tumeur (écran 4 sur 5) »*.
- **Risque** indique *« retenu — nécessite … »*.
- Le sous-type, les options de traitement et les biomarqueurs sont **toujours affichés**.
- Appuyez sur **Compléter les champs manquants**. L’application ouvre l’écran avec la première valeur manquante, **en conservant tout ce que vous avez saisi**. Ajoutez la valeur, allez dans **Revue** et envoyez à nouveau.

### Le résultat n’est pas enregistré
Le résultat n’existe que tant que l’écran est ouvert. Rien n’est écrit dans le stockage du téléphone. Si vous avez besoin d’un enregistrement, notez les valeurs à la main, ou prenez une capture d’écran si votre organisation l’autorise.

---

## 11. Commencer une autre évaluation

Appuyez sur **Nouvelle évaluation** ou **Terminé**. Toutes les saisies sont effacées et l’application revient à **Accès à l’évaluation**, toujours connectée. Appuyez sur **Suivant** pour commencer.

---

## 12. Se déconnecter

Sur **Accès à l’évaluation**, appuyez sur **Déconnecter l’accès**. L’application demande confirmation : *« Vous devrez saisir à nouveau le code d’invitation. »* Appuyez sur **Déconnecter**. Ne faites cela que si CRIL vous le demande, ou si vous confiez le téléphone à quelqu’un d’autre.

---

## 13. Messages et que faire

| Ce que vous voyez | Ce que cela signifie | Que faire |
|---|---|---|
| **Vérification…** | L’application contacte le service | Attendez environ 10 secondes |
| **Connecté sur cet appareil** — *« En attente du serveur… »* | Vous êtes appairé, mais le service est inaccessible | Vérifiez votre internet ; appuyez sur **Relancer la vérification**. Aucun code d’invitation n’est nécessaire |
| **Serveur non connecté** | Le service d’évaluation ACR est hors ligne | Réessayez plus tard, ou informez CRIL. Vous pouvez encore utiliser **Démonstration synthétique** si elle est proposée |
| **Passerelle connectée — plateforme Live hors ligne** | Le service est actif mais la plateforme ACR ne l’est pas | Utilisez **Démonstration synthétique**, ou réessayez plus tard |
| **Service indisponible** / **NON CORRESPONDANTE** | La plateforme n’est pas la version approuvée | Ne continuez pas les tests live ; informez CRIL |
| *« Appareil incorrect utilisé. »* | Le code est appairé avec un autre téléphone | Utilisez votre téléphone appairé, ou demandez un nouveau code à CRIL |
| *« Code d’invitation expiré. Demandez-en un nouveau. »* | Les 30 jours sont écoulés | Demandez un nouveau code à CRIL |
| **Cas de démonstration modifié** (rouge) | Une valeur de démonstration a été modifiée | Remettez-la, ou passez à **Plateforme live** |
| **La fixture synthétique vérifiée est indisponible.** | Aucune démonstration enregistrée n’est disponible | Utilisez **Plateforme live** ; ou, sur un téléphone appairé, **Parcourir les cinq écrans** pour voir les écrans sans résultat |
| *« Trop de requêtes… »* | Trop de tentatives en peu de temps | Attendez quelques minutes |
| *« Le résultat de l’évaluation est incertain. »* | La réponse n’est pas arrivée clairement | Ne renvoyez pas plusieurs fois ; notez l’heure et informez CRIL |

---

## 14. Vos données et confidentialité

- Le code d’invitation n’est jamais stocké. Votre session et un identifiant d’installation aléatoire sont conservés uniquement dans le magasin sécurisé du téléphone et sont supprimés lorsque vous vous déconnectez.
- Les saisies de cas et les résultats sont conservés en mémoire uniquement, et effacés à la fin de l’évaluation.
- L’application n’a ni analyse ni publicité, et ne peut pas être mise à jour à distance : chaque changement est une nouvelle version revue.
- Le service enregistre des événements techniques (par exemple, heure et résultat d’une requête) pour assurer sa sécurité ; il n’enregistre pas les valeurs cliniques.

---

## 15. Mention légale : RGPD et cookies

*Concerne uniquement cette application. Le site de la plateforme ACR a sa propre mention.*

### Cookies
Cette application n’utilise aucun cookie, pixel espion ou technologie de suivi.

### Protection des données
Responsable : Cornerstone Research International Ltd (CRIL), c/o NovaUCD, Belfield Innovation Park, University College Dublin, Dublin 4, D04 V2P1, Irlande. E-mail : info@acragent.com · www.acragent.com

- Données collectées : libellé d’invitation et étiquette d’organisation ; identifiant d’appareil aléatoire créé par l’application (conservé uniquement sous forme hachée) ; dates d’appairage et d’expiration ; version de l’application ; événements de sécurité et enregistrements de requêtes (heure, route, résultat — jamais le contenu).
- Données réseau : votre adresse IP est traitée par notre fournisseur réseau, Cloudflare, pour fournir et protéger le service.
- Non collectées : votre nom ou vos coordonnées, ni aucune donnée patient. Les saisies de cas synthétiques sont traitées uniquement pour renvoyer un résultat et ne sont pas stockées.
- Finalité : exécuter et sécuriser cette évaluation sur invitation.
- Base légale : à confirmer par revue juridique.
- Destinataires : Cloudflare, Inc., qui peut traiter des données en dehors de votre pays.
- Conservation : l’accès se termine 30 jours après l’appairage, ou lors de la révocation ; les enregistrements sont supprimés 30 jours après la fin de l’évaluation. CRIL peut modifier cette période.
- Vos droits : accès, rectification, effacement, limitation et opposition — contactez CRIL (section 16). UE/EEE/UK : vous pouvez déposer une plainte auprès de votre autorité de protection des données.

*Politique de confidentialité complète disponible auprès de CRIL sur demande.*

---

## 16. Signaler un problème ou un commentaire

Veuillez envoyer vos conclusions à CRIL avec :
- le modèle de téléphone et la version du système d’exploitation ;
- la version de l’application (**À propos**) ;
- la langue utilisée ;
- la date et l’heure ;
- ce que vous avez saisi (valeurs synthétiques uniquement), ce que vous attendiez et ce que vous avez vu ;
- une capture d’écran, si utile.

Les commentaires cliniques sur les règles elles-mêmes appartiennent à la *liste de revue et de test*.

---

## 17. Termes utilisés

| Terme | Signification |
|---|---|
| Plateforme ACR | Le serveur qui contient le modèle de connaissances médicales et les règles, et qui produit les résultats |
| Passerelle | Le service sécurisé entre l’application et la plateforme ACR |
| Référence / attestation | La vérification que la plateforme est exactement la version approuvée |
| Niveau | Le degré de complétude du cas : 1 ou 2 signifie que le risque est retenu ; 3 est une évaluation complète |
| Synthétique | Données de test inventées, issues d’aucun patient |
| Amélioration bayésienne | Une estimation de probabilité facultative ajoutée au résultat basé sur des règles |