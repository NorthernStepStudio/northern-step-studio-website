# NexusBuild Version Backup Script
# This script creates a timestamped backup of the project to L:\Winston Things\NexusBuild Project

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$sourcePath = "C:\Users\winst\.gemini\antigravity\scratch\NexusBuild"
$backupBasePath = "L:\Winston Things\NexusBuild Project"
$backupPath = "$backupBasePath\backup_$timestamp"

Write-Host "Creating backup: $backupPath" -ForegroundColor Cyan

# Create backup directory
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# Copy all files except node_modules and other large directories
Write-Host "Copying files (excluding node_modules, .git, etc.)..." -ForegroundColor Yellow

robocopy $sourcePath $backupPath /E /XD node_modules .git .expo dist build __pycache__ .vscode /NFL /NDL /NJH /NJS /nc /ns /np

if ($LASTEXITCODE -le 7) {
    Write-Host "`nBackup completed successfully!" -ForegroundColor Green
    Write-Host "Location: $backupPath" -ForegroundColor Green
    
    # Also update the main backup (overwrite)
    Write-Host "`nUpdating main backup..." -ForegroundColor Yellow
    robocopy $sourcePath $backupBasePath /E /XD node_modules .git .expo dist build __pycache__ .vscode /NFL /NDL /NJH /NJS /nc /ns /np
    
    if ($LASTEXITCODE -le 7) {
        Write-Host "Main backup updated!" -ForegroundColor Green
    }
} else {
    Write-Host "`nBackup failed with error code: $LASTEXITCODE" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
