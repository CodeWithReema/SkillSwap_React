# Quick Start: Populate Test Data for Presentation

This is a quick reference guide for populating your SkillSwap app with test data before a presentation.

## 🚀 Quick Setup (3 Steps)

### Step 1: Clear Old Uploads
**Windows:**
```powershell
.\clear-uploads.ps1
```

**Linux/Mac:**
```bash
chmod +x clear-uploads.sh populate-photos.sh
./clear-uploads.sh
```

### Step 2: Add Profile Photos (Optional but Recommended)

**Option A: Use Helper Script**
```powershell
# Windows
.\populate-photos.ps1 -SourceDir "path/to/your/photos"
```

```bash
# Linux/Mac
./populate-photos.sh "path/to/your/photos"
```

**Option B: Manually Add Photos**
1. Copy 8 photos to the `uploads/` directory
2. Rename them to:
   - `alice-profile.jpg`
   - `bob-profile.jpg`
   - `charlie-profile.jpg`
   - `diana-profile.jpg`
   - `emma-profile.jpg`
   - `frank-profile.jpg`
   - `grace-profile.jpg`
   - `henry-profile.jpg`

### Step 3: Populate Database

**Windows (PowerShell):**
```powershell
.\run-test-data.ps1
```

**Linux/Mac:**
```bash
docker exec -i skillswap-db psql -U postgres -d skillswap < src/main/resources/test-data.sql
```

**Or manually (PowerShell):**
```powershell
Get-Content src/main/resources/test-data.sql | docker exec -i skillswap-db psql -U postgres -d skillswap
```

## ✅ What You'll Get

After running the SQL script, you'll have:

- **8 Test Users** with emails like `alice.johnson@university.edu`
- **8 Complete Profiles** with bios, majors, locations
- **24 Skills** (3 per user - offering/seeking)
- **24 Interests** (3 per user)
- **16 Organizations** (2 per user)
- **8 Profile Photos** (linked to profiles)

## 📝 Test User Credentials

All test users have password hash `hashed123`. You'll need to update this with actual password hashes if you want to log in as these users.

**Test Users:**
1. Alice Johnson - Computer Science, Junior
2. Bob Smith - Business Administration, Senior
3. Charlie Brown - Graphic Design, Sophomore
4. Diana Prince - Mechanical Engineering, Freshman
5. Emma Watson - Computer Science, Junior
6. Frank Miller - Business Administration, Senior
7. Grace Hopper - Graphic Design, Sophomore
8. Henry Ford - Mechanical Engineering, Freshman

## 🔄 Reset Everything

To start fresh:

```bash
# 1. Clear uploads
./clear-uploads.sh  # or .\clear-uploads.ps1

# 2. Drop and recreate database (if needed)
docker exec -it skillswap-db psql -U postgres -d skillswap -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker exec -i skillswap-db psql -U postgres -d skillswap < src/main/resources/schema.sql

# 3. Populate test data
# Windows:
.\run-test-data.ps1
# Linux/Mac:
docker exec -i skillswap-db psql -U postgres -d skillswap < src/main/resources/test-data.sql
```

## 📚 More Details

See `populate-test-data.md` for detailed instructions and all available options.
