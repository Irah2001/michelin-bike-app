# 🚴‍♂️ Michelin Bike App

<!-- Badges CI & Statut -->
[![CI - Build](https://github.com/Irah2001/michelin-bike-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Irah2001/michelin-bike-app/actions)

<!-- Badges Stack Technique -->
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

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
