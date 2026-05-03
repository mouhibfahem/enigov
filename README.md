# EniGov — Plateforme du Délégué Étudiant

> Plateforme numérique de gouvernance étudiante pour l'École Nationale d'Ingénieurs de Carthage (ENICarthage).

---

## C'est quoi EniGov ?

**EniGov** est la plateforme officielle du délégué de l'ENICarthage. C'est un espace centralisé où le délégué peut communiquer avec tous les étudiants : publier des annonces, gérer les réclamations, créer des sondages, partager des décisions et échanger par messagerie.

**En résumé :** le délégué est le "propriétaire" de la plateforme. Les étudiants y accèdent pour interagir avec lui.

---

## Les 2 rôles

| Rôle | Qui ? | Que peut-il faire ? |
|------|-------|---------------------|
| **DÉLÉGUÉ** | Un seul compte — le délégué élu | Tout : créer des annonces, gérer les réclamations, publier des sondages, des décisions, des événements, des règlements et documents, voir les statistiques, envoyer des messages à n'importe quel étudiant |
| **ÉTUDIANT** | Tous les inscrits avec un email `@enicar.ucar.tn` | Consulter les annonces, soumettre des réclamations (privées ou publiques), voter sur les sondages et réclamations publiques, envoyer des messages au délégué uniquement |

> **Il n'y a pas de rôle administration.** Le délégué est l'admin.

---

## Fonctionnalités

### Authentification
- Inscription avec email `@enicar.ucar.tn` uniquement (les étudiants s'inscrivent, le délégué est pré-créé)
- Vérification email obligatoire avant connexion
- Connexion sécurisée avec JWT
- Mot de passe oublié (lien de réinitialisation par email)
- Verrouillage du compte après 5 tentatives échouées (15 minutes)
- Mot de passe : min 8 caractères, 1 majuscule, 1 chiffre

### Réclamations (2 modes)
- **Réclamation privée** : l'étudiant envoie directement au délégué. Seuls eux deux la voient.
- **Réclamation publique** : visible par tous les étudiants. Les autres peuvent voter pour (upvote) ou contre (downvote) — comme sur Reddit. Le nom de l'étudiant est toujours visible.
- Le délégué répond et change le statut : `En attente` → `En cours` → `Résolue` ou `Rejetée`
- Seul l'étudiant qui crée la réclamation décide si elle est publique ou privée

### Annonces
- Le délégué publie des annonces (titre, contenu, pièce jointe optionnelle)
- Les étudiants lisent — pas de commentaires, pas de réactions

### Sondages
- Le délégué crée un sondage avec plusieurs options
- Les étudiants votent (1 seul vote par sondage, impossible de changer)
- Le délégué voit qui a voté quoi — les étudiants voient seulement les totaux/pourcentages

### Décisions
- Le délégué publie une décision **liée à une réclamation ou un sondage**
- Exemple : "Suite à la réclamation #42 sur le WiFi, nous avons décidé d'upgrader les routeurs du Bâtiment B"
- Les étudiants voient la décision et peuvent naviguer vers sa source

### Messagerie
- Communication directe **étudiant ↔ délégué uniquement**
- Les étudiants ne peuvent PAS s'envoyer de messages entre eux
- Statut lu/non lu

### Événements
- Le délégué ajoute des événements (titre, description, date, lieu)
- Les étudiants consultent le calendrier

### Règlements et documents
- Le délégué upload des PDFs avec une description (ex: "Aller au secteur 9 pour les attestations")
- Les étudiants consultent et téléchargent

### Notifications (in-app)
- Icône cloche dans le header avec badge de notifications non lues
- Déclencheurs : nouvelle annonce, changement de statut de réclamation, nouveau sondage, nouvelle décision, nouveau message, nouvel événement

### Tableau de bord
- **Étudiants** : fil d'activité (annonces récentes, sondages actifs, mises à jour de réclamations, événements)
- **Délégué** : statistiques (nombre d'étudiants, réclamations par statut, participation aux sondages, graphiques)

### Profil & Paramètres
- Modifier le nom complet
- Photo de profil (JPG/PNG/WebP, max 5 Mo)
- Changer le mot de passe
- Thème clair/sombre

---

## Détails techniques des fonctionnalités implémentées

### Réclamations — Système complet (Phase 3)

**Modèle de données :**
- `Complaint` : id, title, description, isPublic (boolean), status (enum), studentId, studentName, delegateResponse, attachmentPath, upvotes (Set), downvotes (Set), createdAt, updatedAt
- Statuts possibles : `PENDING` → `IN_PROGRESS` → `RESOLVED` | `REJECTED`
- Le vote score = nombre d'upvotes − nombre de downvotes

**Création d'une réclamation (étudiant) :**
- Endpoint `POST /api/complaints` en `multipart/form-data`
- Paramètres : `title`, `description`, `isPublic` (booléen), `file` (optionnel)
- Le fichier joint est stocké sur le serveur dans le dossier configuré par `file.upload-dir`

**Réclamation privée vs publique :**
- **Privée** (`isPublic=false`) : visible uniquement par l'étudiant qui l'a créée et le délégué
- **Publique** (`isPublic=true`) : visible par tous les étudiants authentifiés
  - Les autres étudiants peuvent voter (upvote/downvote)
  - Un clic sur upvote retire le downvote (et inversement) — toggle automatique
  - Le nom de l'étudiant est toujours affiché

**Vue étudiant (frontend) :**
- Deux onglets : "Mes Réclamations" et "Réclamations Publiques"
- Formulaire de création avec toggle Privée/Publique et upload de fichier
- Boutons de vote (flèches haut/bas) sur les réclamations publiques avec score affiché
- Indicateur coloré du vote de l'utilisateur (vert = upvote, rouge = downvote)

**Vue délégué (frontend) :**
- Liste de toutes les réclamations (privées + publiques)
- Filtre par statut (Tous / En attente / En cours / Résolue / Rejetée)
- Formulaire inline pour répondre : sélecteur de statut + champ de réponse texte
- Bouton de suppression

### Événements — Système complet (Phase 8)

**Modèle de données :**
- `Event` : id, title, description, date, location, createdAt
- Simplifié : un seul champ `date` (pas de startTime/endTime), pas d'EventType

**Endpoints :**
- `POST /api/events` — créer (délégué)
- `GET /api/events` — tous les événements triés par date
- `GET /api/events/upcoming` — événements à venir uniquement
- `GET /api/events/{id}` — détail
- `DELETE /api/events/{id}` — supprimer (délégué)

**Vue frontend :**
- Liste avec bloc de date visuel (mois + jour), titre, heure, lieu
- Événements passés affichés en grisé avec badge "Passé"
- Délégué : modale de création (titre, description, date/heure, lieu) + suppression

### Règlements et documents — Système complet (Phase 8)

**Modèle de données :**
- `Regulation` : id, title, description, filePath, createdAt
- Le fichier PDF est stocké via FileStorageService dans le dossier uploads

**Endpoints :**
- `POST /api/regulations` — upload PDF + métadonnées (multipart, délégué)
- `GET /api/regulations` — liste triée par date
- `GET /api/regulations/{id}` — détail
- `DELETE /api/regulations/{id}` — supprimer (délégué, supprime aussi le fichier)

**Vue frontend :**
- Liste de règlements et documents avec icône PDF, titre, description, date, bouton "Télécharger"
- Délégué : modale d'upload (titre, description, sélecteur de fichier PDF) + suppression
- Étudiants : consultation et téléchargement

---

### Messagerie — Système complet (Phase 7)

**Modèle de données :**
- `Message` : id, senderId, senderName, recipientId, recipientName, content, isRead, timestamp
- Pas de `@DBRef` — les noms sont stockés directement pour la performance

**Règle métier :**
- **Étudiant ↔ Délégué uniquement** — les étudiants ne peuvent PAS s'envoyer de messages entre eux
- Le délégué peut contacter n'importe quel étudiant
- Statut lu/non lu avec indicateur visuel (✓ / ✓✓)

**Endpoints :**
- `POST /api/messages` — envoyer un message (content + recipientId)
- `GET /api/messages/conversations` — liste des conversations avec dernier message + compteur non lu
- `GET /api/messages/history/{userId}` — historique d'une conversation (marque les messages comme lus)
- `GET /api/messages/contacts` — contacts disponibles (étudiant voit le délégué, délégué voit tous les étudiants)

**Vue frontend :**
- Panneau gauche : liste des conversations avec avatar, dernier message, heure, badge non lu
- Panneau droit : fenêtre de chat avec bulles de messages, horodatage, indicateur lu
- Bouton "+" pour démarrer une nouvelle conversation (liste de contacts filtrée par rôle)
- Recherche dans les conversations et contacts

---

### Décisions — Système complet (Phase 6)

**Modèle de données :**
- `Decision` : id, title, content, sourceType (COMPLAINT/POLL), sourceId, createdAt
- Chaque décision est liée à une réclamation ou un sondage via `sourceType` + `sourceId`
- Le titre de la source est résolu automatiquement dans la réponse API

**Création (délégué uniquement) :**
- Endpoint `POST /api/decisions` avec JSON : title, content, sourceType, sourceId
- Le lien source est optionnel — une décision peut exister sans source
- La modale de création charge les réclamations et sondages existants pour les sélectionner

**Vue frontend :**
- Liste de décisions avec icône, titre, date, lien vers la source (Réclamation ou Sondage)
- Contenu tronqué par défaut avec "Voir plus / Voir moins"
- Délégué : bouton "Nouvelle Décision" + modale avec sélecteur de source (toggle Réclamation/Sondage + dropdown) + suppression
- Étudiants : lecture seule avec navigation vers la source liée

---

### Sondages & Votes — Système complet (Phase 5)

**Modèle de données :**
- `Poll` : id, question, options (embarquées), deadline, active, creatorId, creatorName, createdAt
- `PollOptionEmbed` : text, voterIds (Set) — embarqué dans Poll, pas de collection séparée
- Chaque option stocke l'ensemble des IDs des votants → empêche le double vote et permet au délégué de voir qui a voté

**Création (délégué uniquement) :**
- Endpoint `POST /api/polls` avec JSON : question, options (liste de textes), deadline (optionnelle)
- Minimum 2 options requises

**Vote (étudiants uniquement) :**
- Endpoint `POST /api/polls/{id}/vote` avec JSON : `{ optionIndex: 0 }`
- Un seul vote par sondage par étudiant — impossible de changer de vote
- Vérifie que le sondage est actif et la deadline non dépassée

**Visibilité des résultats :**
- **Étudiants** : voient les totaux et pourcentages de chaque option après avoir voté
- **Délégué** : voit les totaux + la liste des noms des votants par option (dépliable)

**Gestion (délégué) :**
- `PUT /api/polls/{id}/close` — clôturer le sondage
- `DELETE /api/polls/{id}` — supprimer le sondage

**Vue frontend :**
- Étudiants : voir sondages, voter en un clic, badge "Voté" si déjà participé, barre de progression par option
- Délégué : créer via modale, voir les votants par option (liste dépliable), clôturer, supprimer

---

### Notifications in-app — Système complet (Phase 9)

**Modèle de données :**
- `Notification` : id, userId, type (enum), message, referenceId, isRead, createdAt
- Types : `NEW_ANNOUNCEMENT`, `COMPLAINT_STATUS_CHANGED`, `NEW_POLL`, `NEW_DECISION`, `NEW_MESSAGE`, `NEW_EVENT`

**Déclencheurs automatiques :**
- Nouvelle annonce → notifie tous les étudiants
- Changement de statut de réclamation → notifie l'étudiant concerné
- Nouveau sondage → notifie tous les étudiants
- Nouvelle décision → notifie tous les étudiants
- Nouveau message → notifie le destinataire
- Nouvel événement → notifie tous les étudiants

**Endpoints :**
- `GET /api/notifications` — liste des notifications de l'utilisateur (50 max)
- `GET /api/notifications/unread-count` — nombre de notifications non lues
- `PUT /api/notifications/{id}/read` — marquer une notification comme lue
- `PUT /api/notifications/read-all` — marquer toutes comme lues

**Vue frontend (Header) :**
- Icône cloche avec badge rouge (compteur non lues)
- Dropdown avec liste de notifications, icône colorée par type
- Clic → navigation vers la page concernée + marque comme lu
- Bouton "Tout marquer lu"
- Polling automatique toutes les 30 secondes

---

### Tableau de bord délégué — Système complet (Phase 9)

**Endpoint stats :**
- `GET /api/stats` — données agrégées pour le dashboard (délégué uniquement)
- Retourne : totalStudents, totalComplaints, pendingComplaints, inProgressComplaints, resolvedComplaints, rejectedComplaints, totalPolls, activePolls, totalAnnouncements, totalDecisions, upcomingEvents, unreadMessages

**Vue frontend :**
- 8 cartes statistiques : étudiants, réclamations, en attente, sondages actifs, annonces, décisions, événements, messages non lus
- Répartition des réclamations par statut avec barres de progression et pourcentages
- Liste des 5 réclamations les plus récentes avec indicateur de statut
- Quick actions : nouvelle annonce, sondage, événement, décision

---

### Tableau de bord étudiant — Système complet (Phase 9)

**Vue frontend (page d'accueil) :**
- Message de bienvenue personnalisé
- Quick actions : nouvelle réclamation, voir sondages, contacter délégué
- Grille 2×2 : annonces récentes, sondages actifs (avec nombre de votes), événements à venir (avec lieu), dernières décisions (avec source liée)
- Chaque section est cliquable et redirige vers la page complète

---

### Annonces — Système complet (Phase 4)

**Modèle de données :**
- `Announcement` : id, title, content, attachmentPath, delegateId, delegateName, createdAt
- Pas de `@DBRef` — le nom du délégué est stocké directement (performance)

**Création (délégué uniquement) :**
- Endpoint `POST /api/announcements` en `multipart/form-data`
- Paramètres : `title`, `content`, `file` (optionnel)
- Seul le rôle `ROLE_DELEGUE` peut créer ou supprimer une annonce

**Lecture (tous les utilisateurs authentifiés) :**
- `GET /api/announcements` — liste triée par date (plus récente d'abord)
- `GET /api/announcements/{id}` — détail d'une annonce
- Pas de commentaires, pas de réactions — lecture seule pour les étudiants

**Vue frontend :**
- Liste d'annonces avec icône, titre, date, nom du délégué, lien pièce jointe
- Contenu tronqué par défaut, clic pour "Voir plus / Voir moins"
- Délégué : bouton "Nouvelle Annonce" + modale de création + bouton suppression
- Étudiants : lecture seule

---

## Stack Technique

### Backend
| Technologie | Rôle |
|-------------|------|
| Java 17 | Langage |
| Spring Boot 3.2 | Framework |
| Spring Security + JWT | Authentification |
| PostgreSQL | Base de données relationnelle |
| Spring Data JPA + Hibernate | ORM / couche de persistance |
| Spring Mail (Brevo SMTP) | Emails (vérification, reset) |
| SpringDoc OpenAPI | Documentation API (Swagger) |
| Maven | Gestion des dépendances |

### Frontend
| Technologie | Rôle |
|-------------|------|
| React 18 | Framework UI |
| Vite 5 | Build tool |
| React Router v6 | Navigation |
| Tailwind CSS 3.4 | Styles |
| Axios | Client HTTP |
| Framer Motion | Animations |
| Recharts | Graphiques |
| Lucide React | Icônes |

---

## Installation

### Prérequis
- **Java 17+** (vérifier avec `java -version`)
- **Node.js 18+** (vérifier avec `node -v`)
- **PostgreSQL 14+** installé localement (créer la base avec `createdb enigov` ou `psql -c "CREATE DATABASE enigov"`)
- **Maven** (vérifier avec `mvn -version`)

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd unigov-platform
```

### 2. Lancer le Backend
```bash
cd backend
```

Créer un fichier `.env` à la racine du dossier `backend/` avec ces variables :
```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/enigov
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
JWT_SECRET=une_phrase_longue_et_complexe_minimum_32_caracteres
JWT_EXPIRATION=86400000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
SMTP_USERNAME=votre_username_brevo
SMTP_PASSWORD=votre_password_brevo
FRONTEND_URL=http://localhost:5174
FROM_EMAIL=votre_email@exemple.com
PORT=8081
```

Hibernate crée automatiquement le schéma (13 tables) au premier démarrage grâce à `spring.jpa.hibernate.ddl-auto=update`.

Puis lancer :
```bash
mvn spring-boot:run
```

Le backend démarre sur `http://localhost:8081`. La documentation API est accessible sur `http://localhost:8081/swagger-ui.html`.

> **Note :** Au premier lancement, un compte délégué est automatiquement créé :
> - Email : `delegue@enicar.ucar.tn`
> - Mot de passe : `Delegue2026`
> - **Changez ce mot de passe immédiatement après le premier login !**

### 3. Lancer le Frontend
```bash
cd frontend
npm install
```

Créer un fichier `.env` à la racine du dossier `frontend/` :
```env
VITE_API_URL=http://localhost:8081/api
```

Puis lancer :
```bash
npm run dev
```

Le frontend démarre sur `http://localhost:5174`.

---

## Structure du Projet

```
unigov-platform/
├── backend/                        # API Spring Boot
│   └── src/main/java/com/unigov/
│       ├── controller/             # Endpoints REST (Auth, User, Complaint, etc.)
│       ├── entity/                 # Entités JPA (User, Complaint, Poll, PollOption, etc.)
│       ├── dto/                    # Objets de transfert (requêtes/réponses)
│       ├── repository/             # Couche données Spring Data JPA (PostgreSQL)
│       ├── service/                # Logique métier
│       ├── security/               # JWT, filtres, config Spring Security
│       ├── config/                 # Swagger, WebSocket, MVC
│       └── exception/              # Gestion globale des erreurs
│
├── frontend/                       # Application React
│   └── src/
│       ├── pages/                  # Pages (Login, Complaints, Polls, etc.)
│       ├── components/             # Composants (Sidebar, Header, Layout)
│       ├── context/                # AuthContext, ThemeContext
│       ├── services/               # Client API Axios
│       └── styles/                 # Tailwind CSS
│
└── plan.md                         # Plan de développement détaillé
```

---

## Endpoints API principaux

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| POST | `/api/auth/signup` | Inscription étudiant | Public |
| POST | `/api/auth/signin` | Connexion | Public |
| GET | `/api/auth/verify?token=` | Vérification email | Public |
| POST | `/api/auth/forgot-password` | Demander reset mot de passe | Public |
| POST | `/api/auth/reset-password` | Réinitialiser mot de passe | Public |
| GET | `/api/users/me` | Profil utilisateur connecté | Authentifié |
| PUT | `/api/users/profile` | Modifier profil | Authentifié |
| POST | `/api/users/photo` | Upload photo de profil | Authentifié |
| PUT | `/api/users/password` | Changer mot de passe | Authentifié |
| GET | `/api/complaints/my` | Mes réclamations | Étudiant |
| GET | `/api/complaints/public` | Réclamations publiques | Authentifié |
| GET | `/api/complaints` | Toutes les réclamations | Délégué |
| GET | `/api/complaints/{id}` | Détail d'une réclamation | Authentifié |
| POST | `/api/complaints` | Créer réclamation (multipart) | Étudiant |
| PUT | `/api/complaints/{id}/status` | Changer statut + réponse | Délégué |
| POST | `/api/complaints/{id}/upvote` | Voter pour (toggle) | Authentifié |
| POST | `/api/complaints/{id}/downvote` | Voter contre (toggle) | Authentifié |
| DELETE | `/api/complaints/{id}` | Supprimer réclamation | Délégué |
| GET | `/api/announcements` | Lister annonces | Authentifié |
| POST | `/api/announcements` | Créer annonce | Délégué |
| GET | `/api/polls` | Lister sondages | Authentifié |
| GET | `/api/polls/{id}` | Détail d'un sondage | Authentifié |
| POST | `/api/polls` | Créer sondage | Délégué |
| POST | `/api/polls/{id}/vote` | Voter (1 seul vote) | Étudiant |
| PUT | `/api/polls/{id}/close` | Clôturer sondage | Délégué |
| DELETE | `/api/polls/{id}` | Supprimer sondage | Délégué |
| GET | `/api/decisions` | Lister décisions | Authentifié |
| GET | `/api/decisions/{id}` | Détail d'une décision | Authentifié |
| POST | `/api/decisions` | Créer décision (liée à source) | Délégué |
| DELETE | `/api/decisions/{id}` | Supprimer décision | Délégué |
| GET | `/api/messages/conversations` | Mes conversations | Authentifié |
| POST | `/api/messages` | Envoyer message | Authentifié |
| GET | `/api/events` | Lister événements | Authentifié |
| GET | `/api/events/upcoming` | Événements à venir | Authentifié |
| GET | `/api/events/{id}` | Détail événement | Authentifié |
| POST | `/api/events` | Créer événement | Délégué |
| DELETE | `/api/events/{id}` | Supprimer événement | Délégué |
| GET | `/api/regulations` | Lister règlements et documents | Authentifié |
| GET | `/api/regulations/{id}` | Détail règlement ou document | Authentifié |
| POST | `/api/regulations` | Upload règlement ou document (PDF) | Délégué |
| DELETE | `/api/regulations/{id}` | Supprimer règlement ou document | Délégué |
| GET | `/api/notifications` | Mes notifications | Authentifié |
| GET | `/api/notifications/unread-count` | Nombre non lues | Authentifié |
| PUT | `/api/notifications/{id}/read` | Marquer lue | Authentifié |
| PUT | `/api/notifications/read-all` | Tout marquer lu | Authentifié |
| GET | `/api/stats` | Stats dashboard | Délégué |

Pour la documentation complète avec tous les paramètres, consultez Swagger : `http://localhost:8081/swagger-ui.html`

---

## Sécurité

- **JWT** avec expiration configurable (défaut : 24h)
- **Vérification email** obligatoire à l'inscription
- **Domaine email restreint** : seuls les `@enicar.ucar.tn` peuvent s'inscrire
- **Verrouillage de compte** après 5 tentatives échouées (15 minutes)
- **Mot de passe fort** : min 8 caractères, 1 majuscule, 1 chiffre
- **BCrypt** pour le hashage des mots de passe
- **CORS** configuré (origines autorisées via variable d'environnement)
- **Validation des uploads** : type de fichier + taille max
- **Secrets externalisés** : aucun secret hardcodé, tout passe par des variables d'environnement

---

## Avancement du développement

| Phase | Description | Statut |
|-------|-------------|--------|
| Phase 0 | Foundation & Nettoyage | Fait |
| Phase 1 | Authentification (polish) | Fait |
| Phase 2 | Layout & Navigation | Fait |
| Phase 3 | Réclamations (refonte majeure) | Fait |
| Phase 4 | Annonces | Fait |
| Phase 5 | Sondages & Votes | Fait |
| Phase 6 | Décisions | Fait |
| Phase 7 | Messagerie | Fait |
| Phase 8 | Événements, Règlements et documents, Profil | Fait |
| Phase 9 | Notifications & Tableaux de bord | Fait |

Consultez `plan.md` pour le plan détaillé de chaque phase.

---

## Équipe

Projet réalisé par des étudiants de l'ENICarthage, 2026.
