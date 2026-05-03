# Guide de Déploiement Frontend sur Vercel 🚀

Pour déployer votre frontend UniGov sur Vercel et le connecter à votre backend, suivez ces étapes :

## 1. Préparation du Projet
J'ai déjà configuré les éléments suivants pour vous :
- **`vercel.json`** : Gère les redirections pour une application React (SPA).
- **Variables d'environnement** : Le code utilise désormais `VITE_API_URL` pour la connexion au backend.

## 2. Déploiement via le Dashboard Vercel
1.  Connectez votre dépôt GitHub/GitLab à [Vercel](https://vercel.com).
2.  Sélectionnez le dossier `frontend` comme racine du projet (Root Directory).
3.  **Framework Preset** : Choisissez `Vite`.
4.  **Variables d'Environnement** : C'est l'étape CRUCIALE. Ajoutez la variable suivante :
    - `VITE_API_URL` : L'URL de votre backend (ex: `https://votre-backend-unigov.railway.app/api`).

## 3. Déploiement via Vercel CLI
Si vous préférez la ligne de commande :
1.  Installez l'outil : `npm i -g vercel`
2.  Connectez-vous : `vercel login`
3.  Dans le dossier `frontend`, lancez : `vercel`
4.  Configurez la variable `VITE_API_URL` dans les réglages du projet sur le site de Vercel après le premier déploiement.

## 4. Notes Importantes
- **CORS** : Assurez-vous que votre backend accepte les requêtes provenant de votre domaine Vercel (l'URL fournie par Vercel comme `unigov.vercel.app`).
- **Mixed Content** : Si votre frontend est en `https` (Vercel le fait par défaut), votre backend DOIT aussi être en `https` pour que le navigateur ne bloque pas les requêtes.

---
**Besoin d'aide pour le backend ?** Je peux aussi vous aider à préparer le déploiement de l'API Spring Boot si nécessaire !
