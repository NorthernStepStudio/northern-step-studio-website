param(
    [int]$PostgresPort = 54339,
    [string]$PostgresUser = "nexusbuild",
    [string]$PostgresPassword = "nexusbuild_dev_pw",
    [string]$DatabaseName = "nexusbuild",
    [int]$BackendPort = 3000,
    [switch]$ForceEnv
)

$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $rootDir "apps\backend"
$localPgDir = Join-Path $rootDir ".local-pg"
$dataDir = Join-Path $localPgDir "data"
$logDir = Join-Path $localPgDir "logs"
$passwordFile = Join-Path $localPgDir "postgres-password.txt"
$envFile = Join-Path $backendDir ".env"

function Resolve-PostgresBin {
    if ($env:PG_BIN_DIR -and (Test-Path (Join-Path $env:PG_BIN_DIR "pg_ctl.exe"))) {
        return $env:PG_BIN_DIR
    }

    $candidates = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending

    foreach ($candidate in $candidates) {
        $binDir = Join-Path $candidate.FullName "bin"
        if (Test-Path (Join-Path $binDir "pg_ctl.exe")) {
            return $binDir
        }
    }

    throw "Could not find PostgreSQL binaries. Install PostgreSQL or set PG_BIN_DIR."
}

$pgBin = Resolve-PostgresBin
$pgCtl = Join-Path $pgBin "pg_ctl.exe"
$initdb = Join-Path $pgBin "initdb.exe"
$psql = Join-Path $pgBin "psql.exe"
$createdb = Join-Path $pgBin "createdb.exe"
$logFile = Join-Path $logDir "postgres.log"

New-Item -ItemType Directory -Force -Path $localPgDir, $logDir | Out-Null
$PostgresPassword | Set-Content -Path $passwordFile -NoNewline

if (-not (Test-Path (Join-Path $dataDir "PG_VERSION"))) {
    & $initdb -D $dataDir -U $PostgresUser --auth=scram-sha-256 --pwfile=$passwordFile | Out-Host
}

$listener = Get-NetTCPConnection -LocalPort $PostgresPort -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
    & $pgCtl -D $dataDir -l $logFile -o "-p $PostgresPort" start | Out-Host
    Start-Sleep -Seconds 3
}

$env:PGPASSWORD = $PostgresPassword
$dbExists = & $psql -h 127.0.0.1 -p $PostgresPort -U $PostgresUser -d postgres -t -A -c "SELECT 1 FROM pg_database WHERE datname = '$DatabaseName';"
if ($dbExists.Trim() -ne "1") {
    & $createdb -h 127.0.0.1 -p $PostgresPort -U $PostgresUser $DatabaseName | Out-Host
}

if ($ForceEnv -or -not (Test-Path $envFile)) {
    @"
DATABASE_URL="postgresql://${PostgresUser}:${PostgresPassword}@127.0.0.1:$PostgresPort/$DatabaseName?schema=public"

JWT_SECRET="nexusbuild-local-dev-secret"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="30d"

PORT=$BackendPort
NODE_ENV="development"

FRONTEND_URL="http://localhost:5173"
MOBILE_URL="http://localhost:8081"

SMTP_SERVER=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
ADMIN_EMAIL="admin@nexusbuild.app"

MAX_FILE_SIZE=5242880
UPLOAD_DIR="uploads"
"@ | Set-Content -Path $envFile
}

Push-Location $backendDir
try {
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) {
        throw "Prisma migrate deploy failed."
    }

    npx prisma generate 1>$null 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Prisma generate failed, usually because another backend process is holding the client DLL. Restart the backend after bootstrap if needed."
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Local NexusBuild backend bootstrap complete."
Write-Host "Postgres: postgresql://${PostgresUser}:${PostgresPassword}@127.0.0.1:$PostgresPort/${DatabaseName}?schema=public"
Write-Host "Backend env: $envFile"
Write-Host "Next:"
Write-Host "  npm run dev:api"
Write-Host "  node .\scripts\smoke-backend.mjs --base-url http://127.0.0.1:$BackendPort/api"
