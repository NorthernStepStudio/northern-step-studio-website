$marker = [Guid]::NewGuid().ToString()
$body = @{ appName='pasoscore'; keystorePassword=$marker; keyPassword=$marker; remember=$false } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:4545/api/secrets/save' -Method POST -ContentType 'application/json' -Body $body | Out-Null
$secrets = Invoke-RestMethod -Uri 'http://localhost:4545/api/secrets' -Method GET
Write-Output 'SESSION VAULT KEYS:'
$secrets.Keys | ForEach-Object { Write-Output " - $_" }
$appsJsonPath = 'd:\dev\Northern Step Studio\tools\android-build-center\apps.json'
$found = Select-String -Path $appsJsonPath -Pattern $marker -SimpleMatch -Quiet
if ($found) { Write-Output 'APPS.JSON_LEAK: FAIL - marker found in apps.json' } else { Write-Output 'APPS.JSON_LEAK: PASS - marker not found in apps.json' }
