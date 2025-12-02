# How to Populate Test Data

This guide will help you populate your SkillSwap database with test data including users, profiles, skills, interests, organizations, and profile photos.

## Step 1: Clear Old Uploads (Optional but Recommended)

Before populating new test data, you may want to clear old uploaded files:

**Windows (PowerShell):**
```powershell
.\clear-uploads.ps1
```

**Linux/Mac:**
```bash
chmod +x clear-uploads.sh
./clear-uploads.sh
```

## Step 2: Populate Profile Photos

The test data includes profile photo entries, but you need to add actual image files to the `uploads/` directory.

### Option A: Use the Helper Script

**Windows (PowerShell):**
```powershell
# If you have a folder with sample photos:
.\populate-photos.ps1 -SourceDir "path/to/your/photos"

# Or just create placeholders:
.\populate-photos.ps1
```

**Linux/Mac:**
```bash
chmod +x populate-photos.sh
# If you have a folder with sample photos:
./populate-photos.sh "path/to/your/photos"

# Or just create placeholders:
./populate-photos.sh
```

### Option B: Manually Add Photos

1. Copy your photo files to the `uploads/` directory
2. Rename them to match the expected filenames:
   - `alice-profile.jpg` (for Alice Johnson)
   - `bob-profile.jpg` (for Bob Smith)
   - `charlie-profile.jpg` (for Charlie Brown)
   - `diana-profile.jpg` (for Diana Prince)
   - `emma-profile.jpg` (for Emma Watson)
   - `frank-profile.jpg` (for Frank Miller)
   - `grace-profile.jpg` (for Grace Hopper)
   - `henry-profile.jpg` (for Henry Ford)

**Note:** Photos should be in JPG, JPEG, or PNG format. Recommended size: 400x400px or larger (square aspect ratio works best).

## Step 3: Populate Database with Test Data

### Option 1: Run SQL directly in PostgreSQL

1. Connect to your database:
```bash
docker exec -it skillswap-db psql -U postgres -d skillswap
```

2. Copy and paste the contents of `src/main/resources/test-data.sql`

3. Or run it from file:

**Windows (PowerShell):**
```powershell
.\run-test-data.ps1
```

**Or manually:**
```powershell
Get-Content src/main/resources/test-data.sql | docker exec -i skillswap-db psql -U postgres -d skillswap
```

**Linux/Mac:**
```bash
docker exec -i skillswap-db psql -U postgres -d skillswap < src/main/resources/test-data.sql
```

### Option 2: Add to schema.sql (for automatic loading)

Add the test data SQL to the end of `src/main/resources/schema.sql` and restart the database.

### Option 3: Use Spring Boot SQL initialization

The test-data.sql file is ready to use. You can add it to your application.properties:

```properties
spring.sql.init.data-locations=classpath:test-data.sql
spring.sql.init.mode=always
```

**Note:** This will run every time the app starts, so you might want to use Option 1 or 2 instead.

## Step 4: Verify Test Data

After running the SQL, you should have:
- 8 test users (alice.johnson@university.edu through henry.ford@university.edu)
- 8 profiles with bios, majors, and locations
- 24 user skills (3 per user)
- 24 user interests (3 per user)
- 16 user organizations (2 per user)
- 8 profile photos (1 per user)

All test users have the password hash `hashed123` (you'll need to update this with actual password hashes if you want to log in as these users).

## Quick Start for Presentations

For a quick setup before a presentation:

```bash
# 1. Clear old uploads
./clear-uploads.sh  # or .\clear-uploads.ps1 on Windows

# 2. Add photos (if you have them)
./populate-photos.sh "path/to/photos"  # or .\populate-photos.ps1

# 3. Populate database
docker exec -i skillswap-db psql -U postgres -d skillswap < src/main/resources/test-data.sql
```

That's it! Your database should now be populated with test data ready for your presentation.

