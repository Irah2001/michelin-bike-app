# Spécifications Fonctionnelles et Techniques — Michelin Bike App

> Version 1.0 — basée sur le parcours utilisateur validé

---

## 1. Onboarding (Inscription + Appairage + Tutoriel)

### 1.1 Spécification Fonctionnelle

**Parcours :**
1. L'utilisateur non connecté arrive sur la page Login
2. Il peut s'inscrire via **email/mot de passe** (existant) ou **Strava** (existant)
3. Après inscription (premier login), il est redirigé vers un **flow d'onboarding** :
   - **Slide 1** : "Bienvenue sur Michelin Bike" — présentation du concept (capteur + stats + défis)
   - **Slide 2** : "Appairage capteur BLE" — simulation d'un scan Bluetooth (bouton "Scanner" → animation → "Capteur connecté !")
   - **Slide 3** : "Prêt à rouler" — résumé des fonctionnalités (XP, badges, communauté)
4. Bouton "Commencer" → redirige vers la page **Profil** (accueil principal)

**Règles métier :**
- L'onboarding ne s'affiche qu'à la **première connexion** (flag `has_completed_onboarding` sur l'utilisateur)
- Si l'utilisateur rafraîchit pendant l'onboarding, il reprend au début
- Le skip est possible (lien "Passer" discret en haut à droite)

### 1.2 Spécification Technique

**Frontend :**
- Nouvelle route : `/onboarding`
- Composant : `Onboarding.tsx` — 3 slides en swipe horizontal (état local `currentSlide`)
- Navigation : après register/login, si `user.has_completed_onboarding === false` → redirect `/onboarding`
- Slide BLE : bouton "Scanner" déclenche une animation (faux scan pendant 2s) puis affiche "Capteur connecté ✓"
- Style glass : chaque slide dans un `LiquidGlassCard`, fond `#0B1120`, illustrations avec icônes Lucide

**Backend :**
- Nouveau champ sur `User` entity : `has_completed_onboarding: boolean` (default false)
- Nouveau endpoint : `PATCH /users/me/onboarding` → met `has_completed_onboarding = true`
- Le endpoint `GET /users/me` retourne déjà tous les champs user, il suffit d'ajouter le champ à l'entité

**BDD :**
- Migration : `ALTER TABLE users ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT false;`
- (TypeORM synchronize:true le fera automatiquement en dev)

---

## 2. Page Profil comme accueil principal

### 2.1 Spécification Fonctionnelle

**Changement :** Après login/onboarding, l'utilisateur atterrit sur `/profile` (et non `/dashboard`).

Le Dashboard reste accessible depuis la navigation mais le profil est le **point d'entrée** qui montre :
- Carte utilisateur (avatar, nom, niveau, XP, badge certifié)
- Stats mises à jour (distance, dénivelé, vitesse max, temps en selle) par période
- Badges (débloqués/verrouillés) avec option de **partage**
- Accès rapide au classement

### 2.2 Spécification Technique

**Frontend :**
- Modifier `Login.tsx` : après login réussi, `navigate('/profile')` au lieu de `/dashboard`
- Modifier `StravaCallback.tsx` : idem → `/profile`
- Vérifier dans `App.tsx` que la page Profile existe (✅ déjà le cas)
- Ajouter check onboarding : si `!user.has_completed_onboarding` → `/onboarding`

---

## 3. Partage de badges sur réseaux sociaux

### 3.1 Spécification Fonctionnelle

Depuis la section Badges du profil :
- Chaque badge débloqué a un bouton "Partager" (icône Share2)
- Au clic → utilisation de la **Web Share API** (mobile) ou copie d'un texte prédéfini (desktop)
- Texte partagé : "🏅 J'ai débloqué le badge [nom] sur Michelin Bike ! [emoji] #MichelinBike"

### 3.2 Spécification Technique

**Frontend :**
- Modifier `BadgeCard.tsx` : ajouter un bouton partage (icône `Share2` de Lucide) sur les badges `unlocked`
- Fonction `handleShare(badge)` :
  ```ts
  if (navigator.share) {
    navigator.share({ title: badge.label, text: `🏅 J'ai débloqué "${badge.label}" sur Michelin Bike ! #MichelinBike` });
  } else {
    navigator.clipboard.writeText(text);
    // toast "Copié !"
  }
  ```
- Style : bouton `bg-white/10 rounded-full p-1.5 border border-white/10` positionné en haut à droite de la card

---

## 4. Classement accessible depuis le Profil

### 4.1 Spécification Fonctionnelle

Depuis la page Profil, un bouton "Voir le classement" en bas de la section stats permet d'accéder à un **modal classement** ou une redirection vers le leaderboard (déjà sur Dashboard).

### 4.2 Spécification Technique

**Frontend :**
- Ajouter un bouton `LiquidGlassCard` sous la grille de stats dans Profile : "🏆 Mon classement" 
- Au clic → affichage d'un **modal classement** (même logique que Dashboard leaderboard)
- Réutiliser l'appel API `users.leaderboard({filter: 'region'})` 
- Highlight la position de l'utilisateur courant en `text-[#FCE500]`

---

## 5. Défis communautaires — Barre de progression LIVE

### 5.1 Spécification Fonctionnelle

Sur la page Challenges :
- Chaque défi affiche une **barre de progression** : `current_km / target_km`
- La progression est visuelle (barre jaune `#FCE500` sur fond `white/10`)
- Affichage du **temps restant** (countdown vers `end_date`)
- Si l'utilisateur a rejoint le défi, un badge "Participant" est affiché

### 5.2 Spécification Technique

**Frontend — Challenges.tsx :**
- Pour chaque challenge card, ajouter :
  - Barre de progression : `<div className="h-2 bg-white/10 rounded-full"><div style={{width: `${pct}%`}} className="h-full bg-[#FCE500] rounded-full" /></div>`
  - Texte : `${challenge.current_km.toFixed(0)} / ${challenge.target_km} km`
  - Countdown : calculer `end_date - now` → afficher "X jours Xh restants"
  - Badge participant : si l'API retourne que l'utilisateur participe

**Backend :**
- Le endpoint `GET /challenges` retourne déjà `current_km` et `target_km` — rien à changer
- Ajouter un champ `is_participant` dans la réponse (vérifier si l'user courant est dans `challenge_participants`)
- Modifier `ChallengesService.findAll()` : prendre l'userId en paramètre et enrichir la réponse avec `is_participant: boolean`

---

## 6. Profil ambassadeur (page publique)

### 6.1 Spécification Fonctionnelle

Depuis un défi communautaire, l'utilisateur peut cliquer sur le nom du créateur pour voir son **profil public** :
- Avatar, nom, badge ambassadeur, stats publiques
- Équipement (pneus Michelin utilisés)
- Défis créés

### 6.2 Spécification Technique

**Frontend :**
- Nouvelle route : `/profile/:id`
- Composant : `PublicProfile.tsx`
- Appel API : `GET /users/:id` (existant) — retourne les stats publiques
- Depuis Challenges, le nom du créateur est un lien `<Link to={/profile/${challenge.created_by}}>` 
- Style : même layout que Profile mais en lecture seule, sans les tabs de période

**Backend :**
- Le endpoint `GET /users/:id` existe déjà — vérifier qu'il retourne suffisamment d'infos (name, avatar, level, xp, is_ambassador, stats)
- Enrichir la réponse avec les défis créés par l'utilisateur : ajouter `challenges_created: Challenge[]` (derniers 5)

---

## 7. Page Usure — Recommandation + Achat

### 7.1 Spécification Fonctionnelle

La page Tires existante est enrichie :
- Quand un pneu a un `wear_score < 30` → affichage d'une **alerte** rouge avec message "Usure avancée — pensez au remplacement"
- Bouton "Voir la recommandation" → ouvre un panel avec :
  - Le pneu recommandé basé sur l'`usage_type` du pneu actuel (appel `/catalog/recommend?usage=...`)
  - Infos du pneu recommandé (nom, image, prix, durée de vie estimée)
  - Bouton "Acheter" → ouvre `purchase_url` dans un nouvel onglet

### 7.2 Spécification Technique

**Frontend — Tires.tsx :**
- Pour chaque pneu avec `wear_score < 30` : 
  - Banner alerte : `bg-red-500/20 border border-red-500/40 rounded-xl p-3`
  - Bouton "💡 Recommandation" qui ouvre un modal
- Modal recommandation :
  - Appel `catalog.recommend(tire.catalog.usage_type)` 
  - Affiche le premier résultat
  - Bouton "🛒 Acheter" → `window.open(recommendation.purchase_url, '_blank')`
  - Style : `LiquidGlassCard` dans un modal glass

**Backend :**
- Endpoint `GET /catalog/recommend?usage=road` existe déjà ✅
- Vérifier que `purchase_url` est bien retourné dans la réponse catalog (✅ il est dans l'entité)

---

## 8. Alerte usure sur le Profil

### 8.1 Spécification Fonctionnelle

Si l'utilisateur a un pneu actif avec `wear_score < 30`, une **notification inline** apparaît en haut de la page Profil :
- Bandeau rouge glass : "⚠️ Usure pneu détectée — Voir recommandation"
- Au clic → navigation vers `/tires`

Cela correspond au chemin "Notif usure pneu" du parcours utilisateur qui part directement du profil.

### 8.2 Spécification Technique

**Frontend — Profile.tsx :**
- Appel `tires.list()` au chargement du profil
- Si un pneu a `wear_score < 30` → affichage d'un bandeau cliquable
- Style : `bg-red-500/15 border border-red-500/30 rounded-xl p-3 flex items-center gap-2`
- Icône `AlertTriangle` (Lucide) en rouge, texte blanc, chevron droit
- `onClick → navigate('/tires')`

---

## 9. Navigation — Ajustements

### 9.1 Spécification Fonctionnelle

La navigation bottom actuelle a 5 items. Ordre actuel : Dashboard, Friends, Ride, Challenges, Profile.

**Pas de changement de structure**, mais :
- Le bouton Profile dans la nav devrait être highlighted par défaut au login (puisque c'est la page d'accueil)
- L'icône active est jaune `#FCE500`

### 9.2 Spécification Technique

- Vérifier dans `MainLayout.tsx` que l'état actif est bien détecté par la route courante (via `useLocation`) — ✅ déjà le cas

---

## Résumé des modifications

| Zone | Modification | Priorité |
|------|-------------|----------|
| Backend - User entity | Ajouter `has_completed_onboarding` | Haute |
| Backend - Users controller | Endpoint `PATCH /users/me/onboarding` | Haute |
| Backend - Challenges service | Ajouter `is_participant` dans la réponse | Haute |
| Backend - Users service | Enrichir `GET /users/:id` avec challenges créés | Moyenne |
| Frontend - Onboarding | Nouvelle page `/onboarding` (3 slides + sim BLE) | Haute |
| Frontend - Login redirect | Changer destination post-login → `/profile` | Haute |
| Frontend - BadgeCard | Bouton partage Web Share API | Moyenne |
| Frontend - Profile | Bouton/modal classement | Moyenne |
| Frontend - Profile | Alerte usure pneu inline | Haute |
| Frontend - Challenges | Barre progression + countdown + badge participant | Haute |
| Frontend - PublicProfile | Nouvelle page `/profile/:id` | Moyenne |
| Frontend - Tires | Alerte usure + modal recommandation + bouton achat | Haute |

---

## Notes de relecture critique

1. **Google/Apple OAuth** — Le parcours utilisateur mentionne inscription Google/Apple. Non implémenté et hors scope hackathon (nécessite app native + config OAuth provider). Reporté en v2.
2. **Notifications push** — Le flowchart mentionne des notifications. Hors scope (nécessite service worker, permission API). On simule via des alertes in-app uniquement.
3. **Appairage BLE réel** — Impossible en hackathon sans hardware. On simule l'animation.
4. **WebSocket pour progression LIVE** — Le backend a déjà Socket.IO. On pourrait l'utiliser pour les défis, mais pour simplifier on utilise des appels REST avec refresh périodique (polling toutes les 30s sur la page Challenges).
5. **Profil ambassadeur** — L'endpoint `GET /users/:id` existe mais ne retourne pas les challenges créés. Ajout minimal nécessaire côté backend.

---

## Conventions UI/UX à respecter

- **Background** : `bg-[#0B1120]`
- **Cards** : `LiquidGlassCard` ou `bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl`
- **Accent** : `#FCE500` (jaune Michelin) pour boutons, barres de progression, états actifs
- **Texte** : blanc pour les titres, `text-slate-300/400` pour le secondaire
- **Boutons principaux** : `bg-[#FCE500] text-black font-semibold rounded-xl`
- **Modals** : `fixed inset-0 bg-black/60 backdrop-blur-sm` + card `bg-[#1a2235] rounded-2xl`
- **Inputs** : `bg-white/10 border border-white/10 rounded-xl`
- **Icônes** : Lucide React
- **Mobile-first** : `max-w-md mx-auto`, `pb-24` pour dégagement nav bottom
