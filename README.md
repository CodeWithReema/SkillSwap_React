# SkillSwap - University Skill Exchange Platform

A Spring Boot application that connects university students and faculty to exchange skills, similar to Tinder but for skill-sharing.

## 🎯 Overview

SkillSwap is a platform where university students and faculty can:
- Create detailed profiles with skills, interests, and career information
- Discover other users based on filters (year, interests, skills)
- Swipe right to like or left to pass on profiles
- Message matched users
- Manage their profile with languages, skills, organizations, and more

## 🛠️ Tech Stack

- **Backend:** Spring Boot 3.3.4 (Java 21)
- **Database:** PostgreSQL 16
- **Frontend:** 
  - React Web Application (see `FRONTEND.md`)
  - React Native Mobile App with Expo 54 (see `FRONTEND.md`)
  - Legacy: HTML, CSS, JavaScript (Vanilla) in `src/main/resources/static/`
- **Build Tool:** Maven
- **Containerization:** Docker & Docker Compose
- **Additional Services:** Redis, MailHog (for email testing)

> **Note:** For detailed frontend documentation, see [`FRONTEND.md`](FRONTEND.md)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java 21** (JDK) - [Download here](https://adoptium.net/)
- **Maven 3.6+** (or use the included Maven wrapper `mvnw.cmd`)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download here](https://git-scm.com/downloads)

## 🚀 Quick Start - Two Options

### Option 1: Database in Docker, App Locally (Recommended for Development)

This is the **recommended approach** for active development as it provides:
- Fast hot-reload for frontend changes
- Fast hot-reload for backend changes (with Spring Boot DevTools)
- Easy database management via Docker
- No need to rebuild Docker images for code changes

#### Step 1: Start the Database

```powershell
# Start only the database container
docker-compose up -d db
```

This will:
- Start PostgreSQL on `localhost:5432`
- Create the database `skillswap` automatically
- Run the schema initialization script on first startup
- Keep your data persistent in a Docker volume

#### Step 2: Verify Database is Running

```powershell
# Check if container is running
docker ps

# You should see: skillswap-db
```

#### Step 3: Run the Spring Boot Application

```powershell
# Clean, compile, and run
.\mvnw.cmd clean spring-boot:run
```

Or in two steps:
```powershell
# Step 1: Clean and compile
.\mvnw.cmd clean compile

# Step 2: Run the application
.\mvnw.cmd spring-boot:run
```

#### Step 4: Access the Application

- **Frontend:** http://localhost:8080
- **Homepage:** http://localhost:8080/index.html
- **API Base:** http://localhost:8080/api

The application will be available at `http://localhost:8080` once you see:
```
Started SkillswapApplication
```

#### Step 5: Stop the Application

- Press `Ctrl + C` in the terminal where Spring Boot is running
- To stop the database: `docker stop skillswap-db`

---

### Option 2: Everything in Docker (Production-like)

This approach runs everything in Docker containers. Useful for:
- Testing the full production setup
- Ensuring consistency across environments
- CI/CD pipelines

#### Step 1: Build and Start All Services

```powershell
# Build and start all containers (app, db, redis, mailhog)
docker-compose up --build
```

This will:
- Build the Spring Boot application Docker image
- Start PostgreSQL database
- Start Redis
- Start MailHog (email testing)
- Start the Spring Boot application

#### Step 2: Access the Application

- **Frontend:** http://localhost:8080
- **API Base:** http://localhost:8080/api
- **MailHog UI:** http://localhost:8025 (for testing emails)

#### Step 3: Stop All Services

```powershell
# Stop all containers
docker-compose down

# Stop and remove volumes (⚠️ This deletes database data)
docker-compose down -v
```

---

## 📁 Project Structure

```
SkillSwapSpringbootApp/
├── src/
│   ├── main/
│   │   ├── java/com/example/skillswap/
│   │   │   ├── controller/      # REST API controllers
│   │   │   ├── model/           # JPA entities
│   │   │   ├── repository/      # Spring Data repositories
│   │   │   ├── config/          # Configuration classes (CORS, etc.)
│   │   │   └── SkillswapApplication.java
│   │   └── resources/
│   │       ├── static/          # Legacy frontend files (HTML, CSS, JS)
│   │       │   ├── index.html
│   │       │   ├── discover.html
│   │       │   ├── profile.html
│   │       │   ├── matches.html
│   │       │   ├── messages.html
│   │       │   ├── login.html
│   │       │   ├── register.html
│   │       │   ├── view-profile.html
│   │       │   ├── css/
│   │       │   └── js/
│   │       ├── schema.sql       # Database schema
│   │       ├── application.properties
│   │       └── migration-*.sql  # Database migration scripts
│   └── test/                    # Test files
├── frontend-web/                # React web application
│   ├── src/                     # React source code
│   └── package.json
├── frontend-mobile/             # React Native mobile app (Expo)
│   ├── app/                     # Expo Router pages
│   ├── src/                     # React Native source code
│   └── package.json
├── docker-compose.yml           # Docker services configuration
├── Dockerfile                   # Spring Boot app Docker image
├── pom.xml                      # Maven dependencies
├── README.md                    # This file
├── FRONTEND.md                  # Frontend documentation
├── TROUBLESHOOTING.md           # Troubleshooting guide
├── CHANGELOG.md                 # Update history
└── SETUP_GUIDE.md               # Quick setup guide
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts (email, password, name, university)
- **profile** - User profiles (bio, major, year, location, career info, etc.)
- **user_skill** - Skills users offer or seek
- **user_interest** - User interests
- **user_organization** - Organizations/clubs users belong to
- **user_language** - Languages users speak
- **swipe** - Swipe actions (like/pass)
- **match** - Matched users
- **message** - Messages between matched users

See `src/main/resources/schema.sql` for the complete schema.

## 🔧 Configuration

### Database Connection

The application connects to PostgreSQL. Configuration is in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/skillswap
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### Docker Database Connection

If running the database in Docker (Option 1), the connection is:
- **Host:** localhost
- **Port:** 5432
- **Database:** skillswap
- **Username:** postgres
- **Password:** postgres

## 🧪 Testing the Application

### 1. Register a New User

1. Navigate to http://localhost:8080/register.html
2. Fill in the registration form
3. Submit to create your account

### 2. Login

1. Navigate to http://localhost:8080/login.html
2. Enter your email (password validation is not yet implemented)
3. You'll be redirected to the Discover page

### 3. Create Your Profile

1. Go to http://localhost:8080/profile.html
2. Fill in your information:
   - Name (First & Last)
   - Bio
   - Major & Year
   - Location
   - Career Goals
   - Skills (add multiple)
   - Interests (add multiple)
   - Organizations
   - Languages
   - Career, Experience, Research, Awards
   - Social Links (LinkedIn, GitHub, Portfolio)
3. Click "Save Profile"

### 4. Discover Other Users

1. Go to http://localhost:8080/discover.html
2. Use filters to find users
3. Click "View Full Profile" to see details
4. Use ❤️ to like or ✕ to pass

### 5. View Matches

1. Go to http://localhost:8080/matches.html
2. See users you've matched with

### 6. Send Messages

1. Go to http://localhost:8080/messages.html
2. Select a match
3. Send messages

## 🐛 Troubleshooting

### Port 8080 Already in Use

If you get an error that port 8080 is already in use:

```powershell
# Find the process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

### Database Connection Errors

**Error:** `Connection refused` or `Connection timed out`

**Solutions:**
1. Make sure the database container is running:
   ```powershell
   docker ps
   # Should show skillswap-db
   ```

2. If not running, start it:
   ```powershell
   docker-compose up -d db
   ```

3. Check if PostgreSQL is accessible:
   ```powershell
   docker exec -it skillswap-db psql -U postgres -d skillswap
   ```

### "User not found" Error on Profile Save

**Solution:** Make sure you're logged in. Go to http://localhost:8080/login.html and log in first.

### Schema Errors on Startup

If you see errors about tables already existing:

1. The schema uses `CREATE TABLE IF NOT EXISTS` for most tables
2. If you still get errors, you can reset the database:
   ```powershell
   # Stop and remove the database container and volume
   docker-compose down -v
   
   # Start fresh
   docker-compose up -d db
   ```

### Application Won't Start

1. **Check Java version:**
   ```powershell
   java -version
   # Should be Java 21
   ```

2. **Clean and rebuild:**
   ```powershell
   .\mvnw.cmd clean compile
   ```

3. **Check for compilation errors** in the console output

4. **Verify database is running** (see Database Connection Errors above)

## 📝 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/{id}` - Get profile by ID
- `POST /api/profiles` - Create profile
- `PUT /api/profiles/{id}` - Update profile

### Skills
- `GET /api/user-skills` - Get all user skills
- `POST /api/user-skills` - Add user skill

### Interests
- `GET /api/interests` - Get all interests
- `POST /api/interests` - Add interest
- `DELETE /api/interests/{id}` - Delete interest

### Languages
- `GET /api/languages` - Get all languages
- `POST /api/languages` - Add language
- `DELETE /api/languages/{id}` - Delete language

### Organizations
- `GET /api/organizations` - Get all organizations
- `POST /api/organizations` - Add organization
- `DELETE /api/organizations/{id}` - Delete organization

### Swipes
- `GET /api/swipes` - Get all swipes
- `GET /api/swipes/user/{userId}` - Get swipes by user
- `POST /api/swipes` - Create swipe (like/pass)

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/{id}` - Get match by ID

### Messages
- `GET /api/messages` - Get all messages
- `GET /api/messages/match/{matchId}` - Get messages for a match
- `POST /api/messages` - Send message

## 🔐 Authentication

**Current Status:** Basic authentication is implemented using localStorage. Password verification is not yet implemented (will be added with JWT authentication).

**How it works:**
1. User logs in with email
2. System finds user by email
3. User object is stored in localStorage
4. All subsequent requests use the stored user ID

**Future:** JWT-based authentication will be implemented for secure password verification and session management.

## 🚧 Known Limitations / TODO

- [ ] Password verification (currently only checks if email exists)
- [ ] JWT authentication
- [ ] Profile photo upload (AWS S3 integration)
- [ ] Real-time messaging (WebSocket)
- [ ] Email verification
- [ ] Advanced filtering (backend implementation)
- [ ] Swipe gestures (drag left/right on profile cards)

## 👥 For Team Members

### First Time Setup

1. **Clone the repository:**
   ```powershell
   git clone <repository-url>
   cd SkillSwapSpringbootApp
   ```

2. **Choose your setup option** (see Quick Start above):
   - **Option 1 (Recommended):** Database in Docker, app locally
   - **Option 2:** Everything in Docker

3. **Start the database:**
   ```powershell
   docker-compose up -d db
   ```

4. **Run the application:**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

5. **Access the app:** http://localhost:8080

### Daily Development Workflow

1. **Start the database** (if not already running):
   ```powershell
   docker start skillswap-db
   # Or: docker-compose up -d db
   ```

2. **Run the application:**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

3. **Make changes** to code - Spring Boot DevTools will auto-reload

4. **Refresh browser** to see frontend changes

5. **Stop when done:**
   - Press `Ctrl + C` to stop Spring Boot
   - `docker stop skillswap-db` to stop database (optional)

### Database Migrations

If new database fields are added:

1. **Check for migration files** in `src/main/resources/`
2. **Run the migration:**
   ```powershell
   Get-Content src/main/resources/migration-*.sql | docker exec -i skillswap-db psql -U postgres -d skillswap
   ```

### Common Commands Reference

```powershell
# Database
docker start skillswap-db          # Start database
docker stop skillswap-db           # Stop database
docker ps                          # List running containers
docker logs skillswap-db           # View database logs

# Application
.\mvnw.cmd clean compile           # Clean and compile
.\mvnw.cmd spring-boot:run         # Run application
.\mvnw.cmd clean spring-boot:run  # Clean, compile, and run

# Docker Compose
docker-compose up -d db            # Start only database
docker-compose up --build          # Build and start all services
docker-compose down                # Stop all services
docker-compose down -v             # Stop and remove volumes (⚠️ deletes data)
```

## 📞 Support

If you encounter issues:
1. Check the **Troubleshooting section** above
2. Check [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) for detailed troubleshooting guides
3. Check [`FRONTEND.md`](FRONTEND.md) for frontend-specific documentation
4. Check the console/terminal for error messages
5. Verify all prerequisites are installed
6. Ensure the database container is running
7. Try cleaning and rebuilding: `.\mvnw.cmd clean compile`

## 📚 Additional Documentation

- **[FRONTEND.md](FRONTEND.md)** - Complete frontend documentation (web & mobile)
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Comprehensive troubleshooting guide
- **[CHANGELOG.md](CHANGELOG.md)** - Update history and changelog
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Quick setup guide for team members

## 📄 License

[Add your license information here]

---

**Happy Coding! 🚀**
