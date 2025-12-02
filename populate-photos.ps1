# Script to populate profile photos for test users
# This script will copy placeholder images or use existing images from a source directory
# and assign them to test user profiles

param(
    [string]$SourceDir = "sample-photos",  # Directory containing sample photos
    [string]$UploadsDir = "uploads"        # Uploads directory
)

# Create uploads directory if it doesn't exist
if (-not (Test-Path $UploadsDir)) {
    New-Item -ItemType Directory -Path $UploadsDir -Force | Out-Null
    Write-Host "Created $UploadsDir directory" -ForegroundColor Green
}

# Photo mapping: user email -> photo filename
$photoMapping = @{
    'alice.johnson@university.edu' = 'alice-profile.jpg'
    'bob.smith@university.edu' = 'bob-profile.jpg'
    'charlie.brown@university.edu' = 'charlie-profile.jpg'
    'diana.prince@university.edu' = 'diana-profile.jpg'
    'emma.watson@university.edu' = 'emma-profile.jpg'
    'frank.miller@university.edu' = 'frank-profile.jpg'
    'grace.hopper@university.edu' = 'grace-profile.jpg'
    'henry.ford@university.edu' = 'henry-profile.jpg'
}

Write-Host "`n=== Populating Profile Photos ===" -ForegroundColor Cyan
Write-Host "Source Directory: $SourceDir" -ForegroundColor Gray
Write-Host "Uploads Directory: $UploadsDir`n" -ForegroundColor Gray

$copied = 0
$skipped = 0

foreach ($email in $photoMapping.Keys) {
    $targetFilename = $photoMapping[$email]
    $targetPath = Join-Path $UploadsDir $targetFilename
    
    # Check if target already exists
    if (Test-Path $targetPath) {
        Write-Host "  ✓ $targetFilename already exists (skipping)" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    # Try to find source file
    $sourceFiles = @()
    if (Test-Path $SourceDir) {
        $sourceFiles = Get-ChildItem -Path $SourceDir -File -Include *.jpg,*.jpeg,*.png | Select-Object -First 1
    }
    
    if ($sourceFiles.Count -gt 0) {
        # Copy from source directory
        $sourceFile = $sourceFiles[0]
        Copy-Item -Path $sourceFile.FullName -Destination $targetPath -Force
        Write-Host "  ✓ Copied $($sourceFile.Name) -> $targetFilename" -ForegroundColor Green
        $copied++
    } else {
        # Create a placeholder text file (you can replace this with actual images)
        $placeholderText = @"
Placeholder image for $email
Replace this file with an actual photo named: $targetFilename
"@
        Set-Content -Path $targetPath -Value $placeholderText
        Write-Host "  ⚠ Created placeholder: $targetFilename (replace with actual photo)" -ForegroundColor Yellow
        $copied++
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "  Copied/Created: $copied" -ForegroundColor Green
Write-Host "  Skipped (already exists): $skipped" -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Replace placeholder files in $UploadsDir with actual photos" -ForegroundColor White
Write-Host "  2. Ensure photos are named exactly as shown in test-data.sql" -ForegroundColor White
Write-Host "  3. Run the test-data.sql script to link photos to profiles" -ForegroundColor White
