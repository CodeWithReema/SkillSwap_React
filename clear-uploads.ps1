# Script to clear all uploaded files from the uploads directory
# This will delete all files in the uploads folder

$uploadsDir = "uploads"

if (Test-Path $uploadsDir) {
    Write-Host "Clearing all files from $uploadsDir..." -ForegroundColor Yellow
    
    $files = Get-ChildItem -Path $uploadsDir -File
    $count = $files.Count
    
    if ($count -gt 0) {
        $files | Remove-Item -Force
        Write-Host "Deleted $count file(s) from $uploadsDir" -ForegroundColor Green
    } else {
        Write-Host "No files found in $uploadsDir" -ForegroundColor Gray
    }
} else {
    Write-Host "Uploads directory not found. Creating it..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $uploadsDir -Force | Out-Null
    Write-Host "Created $uploadsDir directory" -ForegroundColor Green
}

Write-Host "`nDone! Uploads directory is now empty." -ForegroundColor Green
