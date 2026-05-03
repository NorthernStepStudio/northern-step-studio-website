param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,

    [string]$Region = "us-central1",
    [string]$ServiceName = "provly-backend",
    [string]$EnvFile = "cloud-run.env.yaml",
    [string]$SupabaseAnonKeySecret = "provly-supabase-anon-key",
    [string]$SupabaseServiceRoleKeySecret = "provly-supabase-service-role-key",
    [string]$GeminiApiKeySecret = "",
    [string]$RevenueCatApiKeySecret = "",
    [switch]$NoAllowUnauthenticated
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    throw "gcloud is required. Install the Google Cloud CLI first."
}

if (-not (Test-Path "Dockerfile")) {
    throw "Run this script from the ProvLy backend directory so Cloud Run can build the Dockerfile."
}

$secretMappings = [System.Collections.Generic.List[string]]::new()
$secretMappings.Add("SUPABASE_ANON_KEY=$SupabaseAnonKeySecret:latest")
$secretMappings.Add("SUPABASE_SERVICE_ROLE_KEY=$SupabaseServiceRoleKeySecret:latest")

if ($GeminiApiKeySecret) {
    $secretMappings.Add("GOOGLE_GENERATIVE_AI_API_KEY=$GeminiApiKeySecret:latest")
}

if ($RevenueCatApiKeySecret) {
    $secretMappings.Add("REVENUECAT_API_KEY=$RevenueCatApiKeySecret:latest")
}

$deployArgs = [System.Collections.Generic.List[string]]::new()
$deployArgs.AddRange(@(
        "run", "deploy", $ServiceName,
        "--source", ".",
        "--project", $ProjectId,
        "--region", $Region,
        "--platform", "managed",
        "--port", "8080",
        "--cpu", "1",
        "--memory", "1Gi"
    ))

if ($secretMappings.Count -gt 0) {
    $deployArgs.AddRange(@("--set-secrets", ($secretMappings -join ",")))
}

if (Test-Path $EnvFile) {
    $deployArgs.AddRange(@("--env-vars-file", $EnvFile))
}

if (-not $NoAllowUnauthenticated) {
    $deployArgs.Add("--allow-unauthenticated")
}

Write-Host "Deploying Cloud Run service $ServiceName to project $ProjectId ($Region)..."
& gcloud @deployArgs

if ($LASTEXITCODE -ne 0) {
    throw "Cloud Run deploy failed."
}

Write-Host "Done."
