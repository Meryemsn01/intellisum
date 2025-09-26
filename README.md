# IntelliSum : Console d'Analyse de Contenu IA 🚀

![React](https://img.shields.io/badge/React-Next.js-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=for-the-badge&logo=docker)
![Jest](https://img.shields.io/badge/Tests-Jest-red?style=for-the-badge&logo=jest)

IntelliSum est une application web Full-Stack (MERN) conçue comme un puissant tableau de bord pour l'analyse de contenu. Elle permet aux utilisateurs authentifiés de soumettre des URLs d'articles pour en obtenir un résumé généré par une IA, de consulter leur historique et de bénéficier d'une expérience utilisateur moderne et réactive.

Le projet met en œuvre une architecture backend robuste, entièrement conteneurisée avec Docker, incluant une base de données, un cache de performance, des tests automatisés et une flexibilité pour intégrer différents fournisseurs d'IA.

[GIF of IntelliSum in action]

## 📋 Fonctionnalités Clés

* **Authentification JWT :** Système complet d'inscription et de connexion avec des tokens sécurisés.
* **Résumé de Contenu via API IA :** Intégration flexible avec des services d'IA comme Hugging Face pour générer des résumés.
* **Historique Personnel :** Chaque résumé généré est sauvegardé et lié au compte de l'utilisateur.
* **Cache de Performance :** Utilisation de Redis pour mettre en cache les résultats et fournir des réponses quasi-instantanées pour les URLs déjà analysées.
* **Interface Réactive et Animée :** Un frontend moderne construit avec Next.js, Tailwind CSS et Framer Motion pour une expérience utilisateur fluide et esthétique.
* **Entièrement Conteneurisé :** Utilisation de Docker et Docker Compose pour créer un environnement de développement et de déploiement fiable et reproductible.

---

## 🛠️ Architecture Technique (Stack)

### Frontend
* **Framework :** Next.js (React)
* **Style :** Tailwind CSS
* **Animation :** Framer Motion
* **Requêtes HTTP :** Axios
* **Gestion d'état :** React Context API

### Backend
* **Runtime :** Node.js
* **Framework :** Express.js
* **Base de Données :** MongoDB avec Mongoose (ODM)
* **Cache :** Redis
* **Authentification :** JSON Web Tokens (JWT), bcryptjs
* **Web Scraping :** Cheerio, Axios
* **Tests :** Jest & Supertest

### DevOps
* **Conteneurisation :** Docker & Docker Compose

---

## 🚀 Installation et Lancement

Ce projet est conçu pour être lancé avec Docker Compose pour une simplicité maximale.

### Prérequis
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et en cours d'exécution.
* [Git](https://git-scm.com/) pour cloner le projet.

### Étapes

1.  **Cloner le repository :**
    ```bash
    git clone [https://github.com/Meryemsn01/intellisum.git](https://github.com/Meryemsn01/intellisum.git)
    cd intellisum
    ```

2.  **Configurer les variables d'environnement :**
    * Naviguez dans le dossier `backend` : `cd backend`.
    * Créez un fichier `.env` en copiant l'exemple : `cp .env.example .env`.
    * Ouvrez le fichier `.env` et remplissez les variables, notamment `HUGGINGFACE_TOKEN` et `JWT_SECRET`.

3.  **Lancer l'application :**
    * Toujours à la racine du dossier `backend`, lancez Docker Compose :
        ```bash
        docker-compose up --build
        ```
    * Cette commande va construire l'image de votre backend, télécharger les images pour MongoDB et Redis, et démarrer les trois conteneurs.

4.  **Accéder à l'application :**
    * **Frontend :** Ouvrez votre navigateur et allez sur `http://localhost:3000`. (N'oubliez pas de lancer le serveur de développement du frontend dans un autre terminal : `cd frontend` puis `npm run dev`).
    * **Backend API :** L'API est accessible sur `http://localhost:5001`.

---

## 🧠 Flexibilité du Moteur IA

Ce projet a été conçu pour être agnostique vis-à-vis du fournisseur d'IA. La configuration par défaut utilise **Hugging Face** car c'est l'option gratuite la plus stable que nous ayons trouvée.

Cependant, le code contient des exemples (commentés) pour intégrer facilement d'autres services comme **Google Gemini** ou **OpenAI**.

### Pour utiliser un autre fournisseur :

1.  **Ajoutez la clé API** correspondante dans votre fichier `backend/.env` :
    ```env
    # Pour Google Gemini
    GEMINI_API_KEY="VOTRE_CLÉ_GEMINI"

    # Pour OpenAI
    OPENAI_API_KEY="VOTRE_CLÉ_OPENAI"
    ```

2.  **Modifiez le fichier `backend/routes/summaryRoutes.js`** pour décommenter le bloc de code correspondant au service que vous souhaitez utiliser et commentez les autres. *N'oubliez pas d'installer la dépendance correspondante (`@google/generative-ai` ou `openai`)*.

---

## 📜 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.
