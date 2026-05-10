param(
  [Parameter(Mandatory=$true)]
  [string]$AppName,
  [Parameter(Mandatory=$true)]
  [string]$StorePassword
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path "$PSScriptRoot\..\..").Path
$ConfigPath = Join-Path $PSScriptRoot "apps.json"
$Config = Get-Content $ConfigPath | ConvertFrom-Json

if (-not $Config.$AppName) {
  throw "Unknown app '$AppName'. Check tools/android-build-center/apps.json"
}

$ResetDir = Join-Path $Root "private-keys/android/$AppName-reset"
if (!(Test-Path $ResetDir)) {
  New-Item -ItemType Directory -Path $ResetDir -Force | Out-Null
}

$KeystorePath = Join-Path $ResetDir "reset-upload-key.jks"
$PemPath = Join-Path $ResetDir "upload_certificate.pem"
$Alias = "upload-reset"

if (Test-Path $KeystorePath) {
  Remove-Item $KeystorePath -Force
}
if (Test-Path $PemPath) {
  Remove-Item $PemPath -Force
}

Write-Host "Generating new reset upload key for $AppName..." -ForegroundColor Cyan

# Generate keypair
& keytool -genkeypair `
  -v `
  -storetype PKCS12 `
  -keystore $KeystorePath `
  -alias $Alias `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -storepass $StorePassword `
  -keypass $StorePassword `
  -dname "CN=NStep Reset, OU=Northern Step Studio, O=Northern Step Studio, L=Local, S=Local, C=US"

Write-Host "Exporting upload certificate PEM..." -ForegroundColor Yellow

# Export PEM
& keytool -export -rfc `
  -keystore $KeystorePath `
  -alias $Alias `
  -file $PemPath `
  -storepass $StorePassword

Write-Host ""
Write-Host "Reset key generated successfully!" -ForegroundColor Green
Write-Host "Keystore: $KeystorePath"
Write-Host "PEM:      $PemPath" -ForegroundColor Green
Write-Host ""
Write-Host "UPLOAD_PEM_PATH:$PemPath"
