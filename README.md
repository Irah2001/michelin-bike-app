# 🚴‍♂️ Michelin Bike App

## 🛠 Stack Technique

- Frontend (Mobile-First) : React, Vite, TypeScript, Tailwind CSS v4

- Backend (API REST) : NestJS, TypeScript

- Base de Données : PostgreSQL

- Infrastructure locale : Docker, Docker Compose

- Gestionnaire d'exécution : Concurrently (pour lancer tout l'environnement via un seul terminal)

## 📂 Structure du Projet

```
michelin-bike-app/
│
├── frontend/               # Application Web (React + Vite)
│   ├── src/                # Code source des composants et vues
│   └── package.json        # Dépendances front (Tailwind, etc.)
│
├── backend/                # API Serveur (NestJS)
│   ├── src/                # Modules, Contrôleurs et Services
│   └── package.json        # Dépendances back
│
├── docker-compose.yml      # Configuration de la base de données PostgreSQL locale
├── package.json            # Scripts globaux de lancement du monorepo
└── README.md               # Documentation du projet
```

## 🚀 Lancement du Projet

### Prérequis

- Node.js (version 18 ou supérieure recommandée)
- Docker et Docker Compose (pour la base de données PostgreSQL)

### Étapes pour Lancer l'Environnement de Développement

1. **Cloner le dépôt** : `git clone <URL_DU_DEPOT>`
2. **Installer les dépendances** : `npm install`
3. **Lancer l'environnement de développement** : `npm run dev` (ce script utilise Concurrently pour démarrer à la fois le frontend, le backend et la base de données PostgreSQL via Docker Compose)
4. **Accéder à l'application** : Ouvrez votre navigateur et rendez-vous sur `http://localhost:5173/` pour voir le frontend en action.
5. **API Backend** : La documentation de l'API NestJS sera accessible sur `http://localhost:3001/api`.
