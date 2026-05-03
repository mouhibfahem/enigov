# EniGov — Plans d'amélioration (retour professeur)

> Document destiné à l'équipe pour discuter et choisir avant implémentation.

## Contexte

La plateforme EniGov est fonctionnelle (Spring Boot + PostgreSQL côté backend, React + Tailwind + Recharts côté frontend). Lors de la revue, le professeur a soulevé deux points :

1. **Étendre les connexions du délégué** — « vous vous êtes concentrés sur la relation délégué ↔ étudiants, mais la plateforme doit aussi permettre au délégué de communiquer avec les **professeurs** et l'**administration** ».
2. **Innovation data** — « vous avez des données sur la plateforme, pourquoi ne pas en faire une **analyse** ? Faites quelque chose qui sort du simple front/back/DB, une vraie innovation ».

Ci-dessous, deux plans **indépendants** pour répondre à ces deux retours. Ils peuvent être implémentés en parallèle ou l'un après l'autre.

### Décisions déjà prises

- **Création des comptes prof/admin** : le délégué gère une **whitelist d'emails**. Quand un prof ou un admin s'inscrit via le formulaire normal, le backend détecte son email dans la whitelist et lui assigne le bon rôle automatiquement. Pas de dropdown de rôle à l'inscription.
- **Messagerie** : le **délégué parle à tous**, et **tous les autres (étudiants, profs, admin) ne parlent qu'au délégué**. Le délégué reste le **hub central unique**.
- **Analytics** : trois approches possibles — on présente les trois, l'équipe choisit.

### Ce qu'il reste à décider

- [ ] Approche Analytics : **A** (data pure), **B** (+ NLP sentiment), ou **C** (+ prédictions ML) ?
- [ ] Qui prend le Plan 1 / qui prend le Plan 2 ?
- [ ] Timeline : en parallèle ou séquentiel ?

---

# Plan 1 — Rôles PROFESSEUR + ADMINISTRATION (whitelist email)

**Objectif** : permettre à 2 nouveaux types d'utilisateurs (profs, admin) de se connecter, consulter les contenus publics, et messager le délégué.

**Estimation** : ~1.5 à 2 jours pour un dev (1j backend + 0.5j frontend + 0.25j tests).

## Checklist Backend

### 1. Enum `Role.java` — ajouter 2 valeurs

```java
public enum Role {
    ROLE_ETUDIANT,
    ROLE_DELEGUE,
    ROLE_PROFESSEUR,      // NEW
    ROLE_ADMINISTRATION   // NEW
}
```

### 2. Nouvelle entité `AllowedEmail.java`

```java
@Entity
@Table(name = "allowed_emails",
       uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class AllowedEmail {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String email; // stocké en lowercase

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // ROLE_PROFESSEUR ou ROLE_ADMINISTRATION

    @Column(name = "added_by_user_id")
    private String addedByUserId;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;
}
```

### 3. Repository

```java
public interface AllowedEmailRepository extends JpaRepository<AllowedEmail, String> {
    Optional<AllowedEmail> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
```

### 4. Service + Controller + DTOs

- `AllowedEmailService.java` — CRUD, normalisation lowercase, validation format email
- `AllowedEmailController.java` — tous les endpoints protégés par `@PreAuthorize("hasRole('DELEGUE')")` :
  - `GET /api/admin/allowed-emails` → liste
  - `POST /api/admin/allowed-emails` → body `{ email, role }`
  - `DELETE /api/admin/allowed-emails/{id}`
- `AllowedEmailDtos.java` — Request / Response

### 5. Modifier `AuthController.java` — signup (ligne ~165)

Actuellement :
```java
user.setRole(Role.ROLE_ETUDIANT);
```

Remplacer par :
```java
Role assignedRole = allowedEmailRepository
    .findByEmailIgnoreCase(request.getEmail())
    .map(AllowedEmail::getRole)
    .orElse(Role.ROLE_ETUDIANT);
user.setRole(assignedRole);
```

Injecter `AllowedEmailRepository` dans le constructeur.

### 6. Modifier `MessageService.java` — `sendMessage()` (lignes 37-39)

Avant :
```java
if (sender.getRole() == Role.ROLE_ETUDIANT && recipient.getRole() == Role.ROLE_ETUDIANT) {
    throw new RuntimeException("Les étudiants ne peuvent envoyer des messages qu'au délégué");
}
```

Après :
```java
if (sender.getRole() != Role.ROLE_DELEGUE && recipient.getRole() != Role.ROLE_DELEGUE) {
    throw new RuntimeException("Seul le délégué est le hub de communication. Vous ne pouvez contacter que le délégué.");
}
```

### 7. Modifier `MessageService.java` — `getAvailableContacts()` (lignes 129-139)

Remplacer le bloc par :
```java
if (currentUser.getRole() != Role.ROLE_DELEGUE) {
    contacts = userRepository.findAll().stream()
        .filter(u -> u.getRole() == Role.ROLE_DELEGUE)
        .collect(Collectors.toList());
} else {
    contacts = userRepository.findAll().stream()
        .filter(u -> !u.getId().equals(currentUser.getId()))
        .collect(Collectors.toList());
}
```

### 8. Autres permissions — inchangées

Les `@PreAuthorize` existants (`hasRole('DELEGUE')`, `hasRole('ETUDIANT')`) restent valides. Profs et admin peuvent :
- Se connecter
- Consulter annonces, événements, décisions, règlements et documents
- Messager **le délégué uniquement**
- Recevoir des notifications

Ils ne peuvent **pas** créer de réclamations (propre aux étudiants) ni d'annonces/sondages/décisions (propre au délégué). Le délégué reste le seul point d'entrée administratif.

### 9. `DataInitializer.java` — seeds de démo

Ajouter pour la démo :
```java
seedAllowedEmailIfMissing("prof.test@enicar.ucar.tn", Role.ROLE_PROFESSEUR);
seedAllowedEmailIfMissing("admin.test@enicar.ucar.tn", Role.ROLE_ADMINISTRATION);
```

Les comptes seront créés automatiquement au signup avec le bon rôle → démontre le flow complet.

## Checklist Frontend

### 1. Nouvelle page `AllowedEmailsPage.jsx`

- Route `/admin/emails`, accessible uniquement à `ROLE_DELEGUE`
- Tableau : Email | Rôle | Ajouté par | Date | Actions (Supprimer)
- Formulaire : input email + dropdown rôle (Professeur / Administration) + bouton
- Appelle `GET/POST/DELETE /api/admin/allowed-emails`

### 2. `Sidebar.jsx`

Ajouter entrée « Emails autorisés » conditionnelle sur `isDelegue`, icône `UserCog` (Lucide).

### 3. `App.jsx` — nouvelle route protégée

```jsx
<Route path="/admin/emails" element={
  <RoleProtectedRoute allowedRoles={['ROLE_DELEGUE']}>
    <AllowedEmailsPage />
  </RoleProtectedRoute>
} />
```

### 4. `RegisterPage.jsx` — aucun changement

Le rôle est 100% géré côté backend via la whitelist.

### 5. `MessagingPage.jsx` — aucun changement

L'API alimente déjà la bonne liste de contacts.

## Fichiers impactés (récap)

**Nouveaux (6)** :
- `backend/src/main/java/com/unigov/entity/AllowedEmail.java`
- `backend/src/main/java/com/unigov/repository/AllowedEmailRepository.java`
- `backend/src/main/java/com/unigov/service/AllowedEmailService.java`
- `backend/src/main/java/com/unigov/controller/AllowedEmailController.java`
- `backend/src/main/java/com/unigov/dto/AllowedEmailDtos.java`
- `frontend/src/pages/AllowedEmailsPage.jsx`

**Modifiés (6)** :
- `backend/src/main/java/com/unigov/entity/Role.java`
- `backend/src/main/java/com/unigov/controller/AuthController.java`
- `backend/src/main/java/com/unigov/service/MessageService.java`
- `backend/src/main/java/com/unigov/DataInitializer.java`
- `frontend/src/App.jsx`
- `frontend/src/components/Sidebar.jsx`

## Tests de validation

1. `./mvnw clean compile` → 0 erreur
2. Démarrage → Hibernate crée la table `allowed_emails` (vérifier avec `psql -U postgres -d enigov -c "\dt"`)
3. Scénario end-to-end :
   - Login délégué (`delegue@enicar.ucar.tn / Delegue2026`)
   - `POST /api/admin/allowed-emails { email: "prof1@enicar.ucar.tn", role: "ROLE_PROFESSEUR" }` → 201
   - Signup avec `prof1@enicar.ucar.tn` → user créé avec `role = ROLE_PROFESSEUR`
   - Login prof1 → JWT OK
   - `GET /api/messages/contacts` depuis prof1 → retourne uniquement le délégué
   - `POST /api/messages` de prof1 vers un étudiant → erreur attendue
   - `POST /api/messages` de prof1 vers le délégué → OK
4. UI : délégué voit « Emails autorisés » en sidebar, peut ajouter/supprimer

---

# Plan 2 — Dashboard Analytics « innovation »

**Objectif** : nouvelle page `/analytics` (délégué seulement) avec **6 visualisations riches** exploitant les données existantes de la plateforme. Donner l'effet « wow » attendu par le professeur.

**Bonne nouvelle** : **Recharts 2.10.4 est déjà installé** dans le frontend — aucune dépendance UI à ajouter.

## Trois approches — à choisir ensemble

On commence par l'**approche A** (MVP solide, zéro risque). Si le temps le permet, on enrichit avec **B** ou **C**.

| Approche | Description | Dépendances | Effet « wow » | Temps |
|----------|-------------|-------------|---------------|-------|
| **A — Data pure** | 6 charts via JPQL + aggregations SQL | Aucune | ★★★★ (visuellement riche) | 2-3 j |
| **B — Data + NLP sentiment** | A + analyse de sentiment FR sur réclamations/messages | Stanford CoreNLP FR (~500 Mo) **ou** API HuggingFace | ★★★★★ (moodmap émotionnelle) | 4-5 j |
| **C — Data + prédictions ML** | A + prédiction ETA de résolution via régression sur historique | Tribuo (Oracle, JVM-native) **ou** Weka | ★★★★★ (badge « IA » sur chaque réclamation) | 4-6 j |

**Recommandation** : **commencer par A** pour avoir quelque chose de démontrable rapidement. Ajouter B ou C à la fin si le planning le permet.

## Les 6 visualisations (A, B et C)

| # | Nom | Source | Chart Recharts | Insight livré |
|---|-----|--------|----------------|----------------|
| 1 | **Heatmap temporelle réclamations** | `Complaint.createdAt` + `.status` par jour/heure | ScatterChart ou AreaChart | Pics d'activité (« lundi 9h = rush ») |
| 2 | **Health score par réclamation** | `upvotes - downvotes` normalisé | BarChart dégradé vert↔rouge | Top sujets soutenus vs controversés |
| 3 | **Trends topics** | Regex keywords sur `Complaint.title` (chauffage, nourriture, examens, wifi…) | LineChart multi-séries | Évolution des sujets dans le temps |
| 4 | **Taux de participation** | `COUNT DISTINCT` users qui ont réclamé / voté / messagé vs total | PieChart + 3 gauges | « 42% votent, 8% réclament » → canaux |
| 5 | **Latence décisions** | `Decision.createdAt - Complaint.createdAt` via `Decision.sourceId` | ComposedChart (bar + ligne) | Temps moyen réclamation → décision |
| 6 | **Réseau messagerie** | `Message.senderId` + `.recipientId` + `.isRead` | Tableau interactif ou Chord | Qui est actif, taux de lecture par conv |

**Bonus approche B** : 7ᵉ chart « Mood map » — sentiment moyen (−1 à +1) par semaine.

**Bonus approche C** : sur chaque réclamation ouverte, badge coloré « ETA estimé 4 jours » calculé par le modèle prédictif.

## Checklist Backend (approche A)

### Nouveaux fichiers

- `controller/AnalyticsController.java`
- `service/AnalyticsService.java`
- `dto/AnalyticsDtos.java`

(Approche B) : `service/SentimentService.java`
(Approche C) : `service/PredictionService.java`

### Endpoints (tous `@PreAuthorize("hasRole('DELEGUE')")`)

```
GET /api/analytics/complaints/timeline      → #1 heatmap
GET /api/analytics/complaints/health        → #2 health scores
GET /api/analytics/complaints/trends        → #3 keywords par période
GET /api/analytics/participation            → #4 taux engagement
GET /api/analytics/decisions/latency        → #5 latence
GET /api/analytics/messages/network         → #6 graphe messagerie
GET /api/analytics/sentiment                → (B) moodmap
GET /api/analytics/predictions              → (C) ETA résolutions
```

### Custom queries JPQL à ajouter

`ComplaintRepository` :
```java
@Query("SELECT FUNCTION('DATE', c.createdAt), c.status, COUNT(c) " +
       "FROM Complaint c GROUP BY FUNCTION('DATE', c.createdAt), c.status " +
       "ORDER BY FUNCTION('DATE', c.createdAt)")
List<Object[]> countByDayAndStatus();
```

`MessageRepository` :
```java
@Query("SELECT m.senderId, m.recipientId, COUNT(m), " +
       "SUM(CASE WHEN m.isRead = true THEN 1 ELSE 0 END) " +
       "FROM Message m GROUP BY m.senderId, m.recipientId")
List<Object[]> countMessagesByEdge();
```

(Requêtes similaires pour les autres endpoints.)

## Checklist Frontend (approche A)

### Nouveaux fichiers

```
frontend/src/pages/AnalyticsDashboard.jsx
frontend/src/components/analytics/
  ComplaintTimeline.jsx        (#1)
  HealthScoreChart.jsx         (#2)
  TrendTopicsChart.jsx         (#3)
  ParticipationMetrics.jsx     (#4)
  DecisionLatencyChart.jsx     (#5)
  MessageNetwork.jsx           (#6)
  SentimentMoodMap.jsx         (B, optionnel)
  PredictionsList.jsx          (C, optionnel)
frontend/src/api/analytics.js  (wrapper axios)
```

### Modifications

- `frontend/src/App.jsx` : route `/analytics` protégée `ROLE_DELEGUE`
- `frontend/src/components/Sidebar.jsx` : nouvelle entrée « Analytics » (icône `BarChart3` Lucide)

### Design UI

- Layout : `DashboardLayout` existant (sidebar + header)
- Grille de 6 cards (2 colonnes desktop, 1 colonne mobile)
- Chaque card : titre + sous-titre insight + chart + footer date range
- Loading : skeleton existant (`components/ui/Skeleton.jsx`)
- Animations : Framer Motion (déjà installé)

## Fichiers impactés (récap, approche A)

**Nouveaux (11)** :
- 3 backend (controller + service + dtos)
- 8 frontend (1 page + 6 charts + 1 wrapper API)

**Modifiés** :
- `App.jsx`, `Sidebar.jsx`
- 4-5 repositories (ajout de custom `@Query`)

**Si approche B** : +1 service backend, +1 dépendance ou API, +1 chart frontend
**Si approche C** : +1 service backend, +1 dépendance (Tribuo/Weka), +1 composant frontend

## Tests de validation

1. `./mvnw clean compile` → 0 erreur
2. Seeder quelques réclamations / polls / messages si la base est vide
3. Swagger UI : chaque endpoint `/api/analytics/*` renvoie 200 OK avec JSON cohérent
4. Frontend : `npm run dev` → `/analytics`
   - Tous les charts rendent (ou skeleton si données vides)
   - Console browser : 0 erreur
   - Responsive mobile (grille 1 colonne)
5. UX : navigation sidebar, retour sur `/analytics`, re-render sans bug

---

## Ordre proposé

1. **Plan 1** (rôles + whitelist) — débloque les 4 rôles pour la démo (1.5-2j)
2. **Plan 2 approche A** — les 6 visualisations (2-3j)
3. **Plan 2 approche B ou C** — si le temps le permet (2-3j supplémentaires)

Total minimum (Plan 1 + Plan 2-A) : **~4-5 jours**. Possibilité d'implémenter les deux plans en parallèle si on est deux devs.

## Questions ouvertes pour l'équipe

- [ ] Qui prend Plan 1 ? Qui prend Plan 2 ?
- [ ] Approche Analytics : A, B, ou C ?
- [ ] Si B : Stanford CoreNLP (lourd mais offline) ou API HuggingFace (léger mais coût / limite) ?
- [ ] Si C : Tribuo (léger, Oracle) ou Weka (plus ancien mais mieux documenté) ?
- [ ] Faut-il prévoir un 3ᵉ plan « Phase ultérieure » pour donner aux profs/admin des permissions supplémentaires (répondre aux réclamations par matière, voir stats filtrées, etc.) ?
