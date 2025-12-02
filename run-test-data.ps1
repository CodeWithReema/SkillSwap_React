# PowerShell script to run test-data.sql in the database
# This script handles the file input correctly for PowerShell

$sqlFile = "src/main/resources/test-data.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "Error: $sqlFile not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Running test-data.sql in database..." -ForegroundColor Cyan
Write-Host "File: $sqlFile" -ForegroundColor Gray
Write-Host ""

# Use Get-Content to read the file and pipe it to docker exec
Get-Content $sqlFile | docker exec -i skillswap-db psql -U postgres -d skillswap

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Test data loaded successfully!" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Error loading test data. Check the error messages above." -ForegroundColor Red
    exit $LASTEXITCODE
}
