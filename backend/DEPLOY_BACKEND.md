# Guide de Déploiement Backend (API Spring Boot) 🚀

Pour déployer votre backend UniGov en production, voici les étapes recommandées :

## 1. Préparation de la Base de Données (MongoDB Atlas)
1.  Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Créez un Cluster gratuit (Shared).
3.  Dans **Network Access**, ajoutez `0.0.0.0/0` (pour autoriser l'accès depuis n'importe où).
4.  Dans **Database Access**, créez un utilisateur avec mot de passe.
5.  Récupérez votre **Connection String** (ex: `mongodb+srv://user:pass@cluster.mongodb.net/unigov`).

## 2. Déploiement sur Railway (Recommandé)
1.  Connectez votre dépôt GitHub à [Railway.app](https://railway.app).
2.  Ajoutez un nouveau service via votre dépôt.
3.  **Variables d'Environnement** :
    - `MONGODB_URI` : Votre connection string Atlas.
    - `JWT_SECRET` : Une phrase longue et complexe (ex: `votre_super_secret_unique_pour_unigov_2026`).
    - `ALLOWED_ORIGINS` : L'URL de votre frontend sur Vercel (ex: `https://unigov.vercel.app`).
    - `SERVER_PORT` : `8081` (Railway détecte généralement le port automatiquement, mais c'est plus sûr).

## 3. Déploiement via Docker
Le `Dockerfile` que j'ai créé permet de déployer sur n'importe quelle plateforme supportant Docker (Render, Fly.io, etc.).
- Le build se fait en deux étapes : une pour compiler le code (Maven) et une pour l'exécution (JRE légère).

## 4. Notes sur les Fichiers (Uploads)
> [!WARNING]
> Les fichiers envoyés (images de profil, pièces jointes) sont stockés localement dans le dossier `/uploads`. 
> Sur Railway/Render, ces fichiers sont **supprimés à chaque redémarrage** du serveur.
> Pour une persistence réelle, il faudra un jour migrer vers un stockage cloud comme **Cloudinary** ou **AWS S3**.

---
**Besoin d'aide pour configurer MongoDB Atlas ?** Je peux vous expliquer comment faire étape par étape !
