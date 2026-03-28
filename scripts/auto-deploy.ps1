#!/usr/bin/env pwsh
try {
  Set-StrictMode -Version Latest
  $cwd = Get-Location
  Write-Host "Auto-deploy helper — running from $cwd"

  # Determine current branch
  $branch = (git rev-parse --abbrev-ref HEAD).Trim()
  Write-Host "Current branch: $branch"

  # Ensure working tree is clean or commit changes
  $status = git status --porcelain
  if ($status) {
    Write-Host "Working tree has changes — adding and committing them."
    git add --all
    $msg = Read-Host "Enter commit message (or press Enter for default)"
    if (-not $msg) { $msg = "Auto-deploy: commit local changes" }
    git commit -m $msg
  } else {
    Write-Host "Working tree is clean."
  }

  # Push current branch
  Write-Host "Pushing branch $branch to origin"
  git push origin $branch

  if ($branch -eq 'main') {
    Write-Host "On main — building and publishing via Vercel"
    npm ci
    npm run deploy
    Write-Host "Local publish finished."
  } else {
    Write-Host "Not on main. To trigger CI deploy, open a PR or merge $branch into main and push."
  }
} catch {
  Write-Error "Auto-deploy failed: $_"
  exit 1
}
