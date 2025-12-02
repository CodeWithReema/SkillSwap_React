# SkillSwap - Quick Setup Guide for Team Members

This guide will help you get the SkillSwap application running on your local machine in minutes.

## 🎯 Two Setup Options

Choose the option that works best for you:

- **Option 1 (Recommended):** Database in Docker, App runs locally
  - ✅ Fast development with hot-reload
  - ✅ Easy to debug
  - ✅ No Docker image rebuilds needed

- **Option 2:** Everything in Docker
  - ✅ Production-like environment
  - ✅ Consistent across all machines
  - ⚠️ Slower for development (requires rebuilds)

---

## 🚀 Option 1: Database in Docker, App Locally (Recommended)

### Prerequisites Check

Make sure you have:
- ✅ Java 21 installed (`java -version`)
- ✅ Docker Desktop running
- ✅ Maven (or use `mvnw.cmd` included in project)

### Step-by-Step Instructions

#### 1. Start the Database

Open PowerShell/Command Prompt in the project directory and run:

```powershell
docker-compose up -d db
```

**What this does:**
- Starts PostgreSQL database in a Docker container
- Database will be available at `localhost:5432`
- Creates database `skillswap` automatically
- Runs schema initialization on first startup

**Verify it's running:**
```powershell
docker ps
# You should see: skillswap-db
```

#### 2. Run the Spring Boot Application

In the same terminal (or a new one), run:

```powershell
.\mvnw.cmd spring-boot:run
```

**What this does:**
- Compiles the Java code
- Starts the Spring Boot application
- Connects to the database
- Serves the frontend and API

**Wait for this message:**
```
Started SkillswapApplication
```

#### 3. Access the Application

Open your browser and go to:
- **Homepage:** http://localhost:8080
- **Discover Page:** http://localhost:8080/discover.html
- **Profile Page:** http://localhost:8080/profile.html

#### 4. Stop the Application

- **Stop Spring Boot:** Press `Ctrl + C` in the terminal
- **Stop Database (optional):** `docker stop skillswap-db`

---

## 🐳 Option 2: Everything in Docker

### Prerequisites Check

Make sure you have:
- ✅ Docker Desktop running

### Step-by-Step Instructions

#### 1. Build and Start All Services

```powershell
docker-compose up --build
```

**What this does:**
- Builds the Spring Boot application Docker image
- Starts PostgreSQL database
- Starts Redis
- Starts MailHog (email testing)
- Starts the Spring Boot application

**Wait for all services to start** (this may take a few minutes the first time)

#### 2. Access the Application

Open your browser and go to:
- **Application:** http://localhost:8080
- **MailHog UI:** http://localhost:8025 (for testing emails)

#### 3. Stop All Services

```powershell
# Stop all containers
docker-compose down

# Stop and remove volumes (⚠️ This deletes database data)
docker-compose down -v
```

---

## 📝 Daily Workflow (Option 1 - Recommended)

### Starting Your Day

1. **Start Docker Desktop** (if not already running)

2. **Start the database:**
   ```powershell
   docker start skillswap-db
   # Or if it's not running: docker-compose up -d db
   ```

3. **Run the application:**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

4. **Open browser:** http://localhost:8080

### During Development

- **Frontend changes:** Just refresh your browser (no rebuild needed)
- **Backend changes:** Spring Boot DevTools will auto-reload
- **Database changes:** May require restart

### Ending Your Day

1. **Stop Spring Boot:** Press `Ctrl + C`
2. **Stop database (optional):** `docker stop skillswap-db`

---

## 🧪 Quick Test

After starting the application:

1. **Register a user:**
   - Go to http://localhost:8080/register.html
   - Fill in the form and submit

2. **Login:**
   - Go to http://localhost:8080/login.html
   - Enter your email (password not verified yet)

3. **Create profile:**
   - Go to http://localhost:8080/profile.html
   - Fill in your information and save

4. **Discover users:**
   - Go to http://localhost:8080/discover.html
   - Browse and swipe on profiles

---

## 🐛 Common Issues & Solutions

### Issue: "Port 8080 already in use"

**Solution:**
```powershell
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill the process (replace <PID> with the number from above)
taskkill /PID <PID> /F
```

### Issue: "Connection refused" or database errors

**Solution:**
```powershell
# Check if database is running
docker ps

# If not, start it
docker-compose up -d db

# Check database logs
docker logs skillswap-db
```

### Issue: Application won't start

**Solution:**
```powershell
# Clean and rebuild
.\mvnw.cmd clean compile

# Then run again
.\mvnw.cmd spring-boot:run
```

### Issue: "User not found" when saving profile

**Solution:** Make sure you're logged in first:
1. Go to http://localhost:8080/login.html
2. Enter your email
3. Then try saving your profile

---

## 📚 Useful Commands Reference

### Database Commands
```powershell
docker start skillswap-db          # Start database
docker stop skillswap-db           # Stop database
docker ps                          # List running containers
docker logs skillswap-db           # View database logs
docker exec -it skillswap-db psql -U postgres -d skillswap  # Access database CLI
```

### Application Commands
```powershell
.\mvnw.cmd clean compile           # Clean and compile
.\mvnw.cmd spring-boot:run        # Run application
.\mvnw.cmd clean spring-boot:run  # Clean, compile, and run
```

### Docker Compose Commands
```powershell
docker-compose up -d db           # Start only database
docker-compose up --build         # Build and start all services
docker-compose down               # Stop all services
docker-compose down -v            # Stop and remove volumes (⚠️ deletes data)
```

---

## 🆘 Need Help?

1. **Check the full README.md** for detailed information
2. **Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)** for detailed troubleshooting guides
3. **Check [FRONTEND.md](FRONTEND.md)** for frontend-specific documentation
4. **Check console/terminal** for error messages
5. **Verify prerequisites** are installed correctly
6. **Ensure Docker Desktop is running**
7. **Try cleaning and rebuilding:** `.\mvnw.cmd clean compile`

---

## ✅ Checklist for First-Time Setup

- [ ] Java 21 installed (`java -version`)
- [ ] Docker Desktop installed and running
- [ ] Cloned the repository
- [ ] Started database: `docker-compose up -d db`
- [ ] Ran application: `.\mvnw.cmd spring-boot:run`
- [ ] Opened http://localhost:8080 in browser
- [ ] Successfully registered a test user
- [ ] Successfully logged in
- [ ] Created a profile

**You're all set! 🎉**

---

**Questions?** Check the main README.md or ask your team lead.

