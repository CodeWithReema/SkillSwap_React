# Diagnostic script to check why users aren't showing in discover
# This will help identify the issue

Write-Host "`n=== Diagnosing Discover Page Issue ===" -ForegroundColor Cyan
Write-Host ""

# Check if users exist
Write-Host "1. Checking test users in database..." -ForegroundColor Yellow
$userQuery = "SELECT user_id, email, first_name, last_name FROM users WHERE email LIKE '%@university.edu' ORDER BY user_id;"
docker exec skillswap-db psql -U postgres -d skillswap -c $userQuery

Write-Host "`n2. Checking profiles for test users..." -ForegroundColor Yellow
$profileQuery = @"
SELECT 
    u.user_id,
    u.email,
    p.profile_id,
    p.major,
    p.year,
    p.profile_complete
FROM users u
LEFT JOIN profile p ON u.user_id = p.user_id
WHERE u.email LIKE '%@university.edu'
ORDER BY u.user_id;
"@
docker exec skillswap-db psql -U postgres -d skillswap -c $profileQuery

Write-Host "`n3. Checking profile_photo table..." -ForegroundColor Yellow
$photoQuery = @"
SELECT 
    u.email,
    pp.photo_id,
    pp.photo_url,
    pp.is_primary
FROM users u
JOIN profile p ON u.user_id = p.user_id
LEFT JOIN profile_photo pp ON p.profile_id = pp.profile_id
WHERE u.email LIKE '%@university.edu'
ORDER BY u.user_id;
"@
docker exec skillswap-db psql -U postgres -d skillswap -c $photoQuery

Write-Host "`n4. Checking total user count..." -ForegroundColor Yellow
$countQuery = "SELECT COUNT(*) as total_users FROM users;"
docker exec skillswap-db psql -U postgres -d skillswap -c $countQuery

Write-Host "`n5. Checking if profiles have user relationship..." -ForegroundColor Yellow
$relationshipQuery = @"
SELECT 
    p.profile_id,
    p.user_id,
    u.email
FROM profile p
JOIN users u ON p.user_id = u.user_id
WHERE u.email LIKE '%@university.edu'
LIMIT 5;
"@
docker exec skillswap-db psql -U postgres -d skillswap -c $relationshipQuery

Write-Host "`n=== Diagnostic Complete ===" -ForegroundColor Cyan
Write-Host "`nCommon Issues:" -ForegroundColor Yellow
Write-Host "  - If users exist but profiles don't: Profiles might not be linked correctly" -ForegroundColor Gray
Write-Host "  - If profiles exist but no photos: Photo URLs might be incorrect" -ForegroundColor Gray
Write-Host "  - If everything exists: Check browser console for API errors" -ForegroundColor Gray
Write-Host ""
