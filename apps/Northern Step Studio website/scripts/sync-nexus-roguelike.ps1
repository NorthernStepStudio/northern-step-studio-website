param(
  [string]$SourceRoot = ""
)

$ErrorActionPreference = "Stop"

function Resolve-SourceRoot {
  param([string]$InputPath)
  if ($InputPath -and $InputPath.Trim().Length -gt 0) {
    return (Resolve-Path $InputPath).Path
  }
  $defaultPath = Join-Path $PSScriptRoot "..\..\roguelike game"
  return (Resolve-Path $defaultPath).Path
}

$src = Resolve-SourceRoot -InputPath $SourceRoot
$websiteRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$dest = Join-Path $websiteRoot "public\games\nexus-roguelike"

Write-Host "Syncing Nexus Roguelike..."
Write-Host "Source: $src"
Write-Host "Dest:   $dest"

if (Test-Path $dest) {
  Remove-Item -LiteralPath $dest -Recurse -Force
}
New-Item -ItemType Directory -Path $dest -Force | Out-Null

$rootFiles = @(
  "index.html",
  "manifest.webmanifest",
  "smoke_title.png",
  "smoke_after_start.png"
)

foreach ($file in $rootFiles) {
  $from = Join-Path $src $file
  if (-not (Test-Path $from)) {
    throw "Missing required file: $from"
  }
  Copy-Item -LiteralPath $from -Destination (Join-Path $dest $file) -Force
}

$dirs = @(
  "css\app",
  "js\app",
  "assets"
)

foreach ($dir in $dirs) {
  $from = Join-Path $src $dir
  if (-not (Test-Path $from)) {
    throw "Missing required directory: $from"
  }
  $to = Join-Path $dest $dir
  New-Item -ItemType Directory -Path $to -Force | Out-Null
  Copy-Item -Path (Join-Path $from "*") -Destination $to -Recurse -Force
}

$stamp = [DateTimeOffset]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$manifest = @{
  game = "nexus-roguelike"
  deployedAtUtc = $stamp
  source = $src
  files = @(
    "index.html",
    "manifest.webmanifest",
    "smoke_title.png",
    "smoke_after_start.png",
    "css/app/*",
    "js/app/*",
    "assets/icons/*"
  )
} | ConvertTo-Json -Depth 4

Set-Content -LiteralPath (Join-Path $dest "deploy-manifest.json") -Value $manifest -Encoding UTF8

Write-Host "Sync complete."
