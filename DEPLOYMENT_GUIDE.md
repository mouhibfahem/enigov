# UniGov - Deployment & Execution Guide

Follow these steps to get the UniGov platform running on your local machine.

## Prerequisites
- Java 17 or higher
- Node.js 18.x or higher
- MySQL Server (Running on localhost:3306)

## 1. Backend Setup (Spring Boot)
1. **Database Configuration**:
   - Ensure MySQL is running.
   - The application will automatically create `unigov_db` if it doesn't exist (configured in `application.properties`).
   - Default user is `root` with no password. Edit `backend/src/main/resources/application.properties` if your MySQL setup differs.

2. **Run the Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   - API will be available at: `http://localhost:8080`
   - Swagger UI: `http://localhost:8080/swagger-ui.html`

## 2. Frontend Setup (React + Vite)
1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run the Frontend**:
   ```bash
   npm run dev
   ```
   - Application will be available at: `http://localhost:5173`

## 3. Initial Setup & Roles
- **Registration**: Navigate to `/register` to create accounts.
- **Roles**:
  - `STUDENT`: Can submit complaints, view announcements, and vote in polls.
  - `DELEGUE`: Can view all complaints, update statuses, post announcements, and create polls.
  - `ADMIN`: Full access to system configurations.

## Production Deployment Principles
- **Backend**: Package as a JAR (`mvn clean package`) and deploy to a cloud provider (AWS, Heroku, or a VPS).
- **Frontend**: Build for production (`npm run build`) and host on Vercel, Netlify, or AWS S3 + CloudFront.
- **Security**: Update `jwtSecret` in production and use environment variables for database credentials.
