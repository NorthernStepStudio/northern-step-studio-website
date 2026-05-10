param(
  [Parameter(Mandatory=$true)]
  [string]$AppName
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path "$PSScriptRoot\..\..").Path
$ConfigPath = Join-Path $PSScriptRoot "apps.json"
$Config = Get-Content $ConfigPath | ConvertFrom-Json

if (-not $Config.$AppName) {
  throw "Unknown app '$AppName'. Check tools/android-build-center/apps.json"
}

$App = $Config.$AppName
$KeystorePath = Join-Path $Root $App.keystorePath
$KeystoreDir = Split-Path $KeystorePath -Parent

if (!(Test-Path $KeystoreDir)) {
  Write-Host "Creating keystore directory: $KeystoreDir" -ForegroundColor Yellow
  New-Item -ItemType Directory -Path $KeystoreDir -Force | Out-Null
}

if (Test-Path $KeystorePath) {
  throw "Keystore already exists: $KeystorePath"
}

# Verify keytool is available
if (!(Get-Command keytool -ErrorAction SilentlyContinue)) {
    throw "Java 'keytool' not found in PATH. Please ensure OpenJDK is installed and in your environment variables."
}

Write-Host "Creating upload keystore for $AppName..." -ForegroundColor Green
Write-Host "Output: $KeystorePath"

keytool -genkeypair `
  -v `
  -storetype PKCS12 `
  -keystore $KeystorePath `
  -alias $App.keyAlias `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000

Write-Host ""
Write-Host "Keystore created:" -ForegroundColor Green
Write-Host $KeystorePath -ForegroundColor Green
Write-Host ""
Write-Host "Back this file up. Do not commit it to GitHub." -ForegroundColor Yellow
