param(
  [Parameter(Mandatory=$true)]
  [string]$AppName
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path "$PSScriptRoot\..\..").Path
$ConfigPath = Join-Path $PSScriptRoot "apps.json"
$Config = Get-Content $ConfigPath | ConvertFrom-Json

function Remove-BuildCopyGeneratedState {
  param(
    [Parameter(Mandatory=$true)]
    [string]$BuildRoot
  )

  $FullBuildRoot = [System.IO.Path]::GetFullPath($BuildRoot).TrimEnd('\')
  $GeneratedDirs = @()
  foreach ($RelPath in @("android\.gradle", "android\build", "android\app\build")) {
    $Candidate = Join-Path $BuildRoot $RelPath
    if (Test-Path -LiteralPath $Candidate) {
      $GeneratedDirs += Get-Item -LiteralPath $Candidate -Force
    }
  }

  $NodeModulesPath = Join-Path $BuildRoot "node_modules"
  if (Test-Path -LiteralPath $NodeModulesPath) {
    $GeneratedDirs += Get-ChildItem -LiteralPath $NodeModulesPath -Recurse -Directory -Force -Filter ".cxx" -ErrorAction SilentlyContinue
    $GeneratedDirs += Get-ChildItem -LiteralPath $NodeModulesPath -Recurse -Directory -Force -Filter "build" -ErrorAction SilentlyContinue |
      Where-Object { $_.FullName -match "\\android\\build$" }
  }

  foreach ($Dir in $GeneratedDirs) {
    $FullDir = [System.IO.Path]::GetFullPath($Dir.FullName)
    if (-not $FullDir.StartsWith($FullBuildRoot + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
      throw "Refusing to remove generated state outside $FullBuildRoot"
    }
    Remove-Item -LiteralPath $FullDir -Recurse -Force
  }
}

if (-not $Config.$AppName) {
  throw "Unknown app '$AppName'. Check tools/android-build-center/apps.json"
}

$App = $Config.$AppName
$AppPath = Join-Path $Root $App.path
$BuildAppPath = $AppPath

Write-Host "== NStep Android Build Center (APK) ==" -ForegroundColor Cyan
Write-Host "App: $AppName"

if (!(Test-Path $AppPath)) {
  throw "App folder not found: $AppPath"
}

if ($App.useBuildCopy -eq $true) {
  $BuildCopyRoot = Join-Path ([System.IO.Path]::GetPathRoot($Root)) "nbw"
  $BuildAppPath = Join-Path $BuildCopyRoot $AppName
  $FullBuildCopyRoot = [System.IO.Path]::GetFullPath($BuildCopyRoot).TrimEnd('\')
  $FullBuildAppPath = [System.IO.Path]::GetFullPath($BuildAppPath)
  if (-not $FullBuildAppPath.StartsWith($FullBuildCopyRoot + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to prepare build copy outside $FullBuildCopyRoot"
  }
  if (!(Test-Path $BuildCopyRoot)) {
    New-Item -ItemType Directory -Path $BuildCopyRoot -Force | Out-Null
  }

  Write-Host "Preparing short build copy: $BuildAppPath" -ForegroundColor Gray
  $RoboArgs = @(
    $AppPath,
    $BuildAppPath,
    "/MIR",
    "/FFT",
    "/R:2",
    "/W:2",
    "/NFL",
    "/NDL",
    "/NJH",
    "/NJS",
    "/NP",
    "/XD",
    ".git",
    ".expo",
    "credentials",
    "android\.gradle",
    "android\build",
    "android\app\build",
    ".cxx",
    "/XF",
    "credentials.json",
    "*.jks",
    "*.keystore"
  )
  & robocopy.exe @RoboArgs | Out-Host
  if ($LASTEXITCODE -ge 8) {
    throw "Build copy failed with robocopy exit code $LASTEXITCODE"
  }

  Write-Host "Removing stale generated native state from build copy..." -ForegroundColor Gray
  Remove-BuildCopyGeneratedState -BuildRoot $BuildAppPath
}

$AndroidPath = Join-Path $BuildAppPath "android"

Push-Location $BuildAppPath
$env:SENTRY_DISABLE_AUTO_UPLOAD = "true"
$env:NODE_ENV = "production"
try {
    if (!(Test-Path $AndroidPath)) {
      Write-Host "android/ folder missing. Running expo prebuild..." -ForegroundColor Yellow
      npx expo prebuild -p android
    }

    $SdkPath = $env:ANDROID_HOME
    if ([string]::IsNullOrWhiteSpace($SdkPath)) { $SdkPath = $env:ANDROID_SDK_ROOT }
    if ([string]::IsNullOrWhiteSpace($SdkPath) -and -not [string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
      $DefaultSdkPath = Join-Path $env:LOCALAPPDATA "Android\Sdk"
      if (Test-Path $DefaultSdkPath) { $SdkPath = $DefaultSdkPath }
    }
    if (-not [string]::IsNullOrWhiteSpace($SdkPath) -and (Test-Path $SdkPath)) {
      $env:ANDROID_HOME = $SdkPath
      $env:ANDROID_SDK_ROOT = $SdkPath
      $LocalPropertiesSdkPath = $SdkPath.Replace('\', '/')
      Set-Content -Path (Join-Path $AndroidPath "local.properties") -Value "sdk.dir=$LocalPropertiesSdkPath"
      Write-Host "Android SDK configured at $SdkPath" -ForegroundColor Gray
    } else {
      throw "Android SDK not found. Set ANDROID_HOME or install the SDK at $env:LOCALAPPDATA\Android\Sdk."
    }

    $AppAndroidPath = Join-Path $AndroidPath "app"
    $PrivateKeystorePath = if ([System.IO.Path]::IsPathRooted($App.keystorePath)) { $App.keystorePath } else { Join-Path $Root $App.keystorePath }
    $TargetKeystorePath = Join-Path $AppAndroidPath $App.keystoreFileName

    if (Test-Path $PrivateKeystorePath) {
        Write-Host "Keystore found. Setting up signing..." -ForegroundColor Yellow
        Copy-Item $PrivateKeystorePath $TargetKeystorePath -Force

        $StorePassword = $env:NSTEP_KEYSTORE_PASSWORD
        $KeyPassword = $env:NSTEP_KEY_PASSWORD

        if (![string]::IsNullOrWhiteSpace($StorePassword) -and ![string]::IsNullOrWhiteSpace($KeyPassword)) {
            $TempSigningPropsPath = Join-Path $AndroidPath "signing.temp.properties"
            $SigningProps = @"
MYAPP_UPLOAD_STORE_FILE=$($App.keystoreFileName)
MYAPP_UPLOAD_KEY_ALIAS=$($App.keyAlias)
MYAPP_UPLOAD_STORE_PASSWORD=$StorePassword
MYAPP_UPLOAD_KEY_PASSWORD=$KeyPassword
"@
            Set-Content -Path $TempSigningPropsPath -Value $SigningProps
            Write-Host "Created temporary signing properties." -ForegroundColor Gray

            Write-Host "Validating credentials..." -ForegroundColor Yellow
            $OldEAP = $ErrorActionPreference
            $ErrorActionPreference = "SilentlyContinue"
            $ValidationOutput = & keytool -list -keystore $TargetKeystorePath -storepass $StorePassword -alias $($App.keyAlias) 2>&1
            $Success = ($LASTEXITCODE -eq 0)
            $ErrorActionPreference = $OldEAP

            if (-not $Success) {
                $Reason = "Keystore validation failed"
                $FullOutput = $ValidationOutput -join "`n"
                if ($FullOutput -match "password was incorrect") { $Reason = "Keystore password incorrect" }
                elseif ($FullOutput -match "Alias.*does not exist") { $Reason = "Alias '$($App.keyAlias)' not found" }
                
                Write-Host "FAILED_PRECHECK: $Reason" -ForegroundColor Red
                throw "FAILED_PRECHECK: $Reason"
            }
            Write-Host "Credentials validated successfully." -ForegroundColor Green
        } else {
            throw "FAILED_PRECHECK: Release signing requires keystore and key passwords."
        }
    }

    Push-Location $AndroidPath
    try {
        $BuildStartTime = Get-Date
        Write-Host "Stopping any running Gradle daemons..." -ForegroundColor Gray
        .\gradlew.bat --stop

        Write-Host "Building APK for $AppName..." -ForegroundColor Green
        
        $GradleArgs = @("app:assembleRelease")
        if (Test-Path "signing.temp.properties") {
            $AbsoluteTempSigningPropsPath = [System.IO.Path]::GetFullPath($TempSigningPropsPath)
            $GradleArgs += "-PsigningPropsFile=$AbsoluteTempSigningPropsPath"
        }

        .\gradlew.bat $GradleArgs
        if ($LASTEXITCODE -ne 0) { throw "Gradle build failed with exit code $LASTEXITCODE" }

        $SearchRoot = Join-Path $AndroidPath "app\build\outputs\apk"
        $ArtifactsRoot = Join-Path $Root "build-artifacts"
        if (!(Test-Path $ArtifactsRoot)) { New-Item -ItemType Directory -Path $ArtifactsRoot -Force }
        
        Write-Host "Verifying artifact in $SearchRoot..." -ForegroundColor Gray
        
        # Relax timestamp check to allow for fast builds or cached outputs
        $GracePeriod = $BuildStartTime.AddMinutes(-5)
        
        $FoundApk = Get-ChildItem -Path $SearchRoot -Recurse -Filter "*.apk" | 
            Where-Object { $_.Length -gt 1MB -and $_.LastWriteTime -ge $GracePeriod } |
            Sort-Object LastWriteTime -Descending | 
            Select-Object -First 1

        if ($FoundApk) {
          Write-Host "Found artifact: $($FoundApk.Name) ($($FoundApk.Length / 1MB) MB)" -ForegroundColor Gray
          # Get Version from package.json
          $PkgPath = Join-Path $AppPath "package.json"
          $Version = "1.0.0"
          if (Test-Path $PkgPath) {
            $Pkg = Get-Content $PkgPath | ConvertFrom-Json
            if ($Pkg.version) { $Version = $Pkg.version }
          }

          $FinalName = "$AppName-v$Version.apk"
          $FinalPath = Join-Path $ArtifactsRoot $FinalName
          
          Write-Host "Moving artifact to: $FinalPath" -ForegroundColor Gray
          if (Test-Path $FinalPath) {
            Write-Host "Destination exists; removing existing artifact before move." -ForegroundColor Gray
            Remove-Item $FinalPath -Force -ErrorAction SilentlyContinue
          }
          Move-Item $FoundApk.FullName $FinalPath -Force
          
          Write-Host ""
          Write-Host "APK created and renamed successfully:" -ForegroundColor Green
          Write-Host $FinalPath -ForegroundColor Green
          Write-Host "ARTIFACT_PATH:$FinalPath"
        } else {
          Write-Host "Standard path search failed. Running Deep Search..." -ForegroundColor Yellow
          
          # 1. Search App Folder
          $DeepFound = Get-ChildItem -Path $AppPath -Recurse -Filter "*.apk" | 
            Where-Object { $_.Length -gt 1MB -and $_.LastWriteTime -ge $GracePeriod } |
            Sort-Object LastWriteTime -Descending | 
            Select-Object -First 1
            
          # 2. Search Workspace Root 'b' Folder (NexusBuild redirection)
          if (!$DeepFound) {
            $RootB = Join-Path $Root "b"
            if (Test-Path $RootB) {
              Write-Host "Searching workspace root 'b' folder..." -ForegroundColor Gray
              $DeepFound = Get-ChildItem -Path $RootB -Recurse -Filter "*.apk" | 
                Where-Object { $_.Length -gt 1MB -and $_.LastWriteTime -ge $GracePeriod } |
                Sort-Object LastWriteTime -Descending | 
                Select-Object -First 1
            }
          }

          if ($DeepFound) {
            Write-Host "Deep Search success: Found at $($DeepFound.FullName)" -ForegroundColor Green
            $PkgPath = Join-Path $AppPath "package.json"
            $Version = "1.0.0"
            if (Test-Path $PkgPath) {
              $Pkg = Get-Content $PkgPath | ConvertFrom-Json
              if ($Pkg.version) { $Version = $Pkg.version }
            }
            $FinalName = "$AppName-v$Version.apk"
            $FinalPath = Join-Path $ArtifactsRoot $FinalName
            if (Test-Path $FinalPath) {
              Write-Host "Destination exists; removing existing artifact before move." -ForegroundColor Gray
              Remove-Item $FinalPath -Force -ErrorAction SilentlyContinue
            }
            Move-Item $DeepFound.FullName $FinalPath -Force
            Write-Host "ARTIFACT_PATH:$FinalPath"
          } else {
            Write-Host "FAILED: Build finished but no valid APK (>1MB) was found." -ForegroundColor Red
            exit 1
          }
        }
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    } finally {
        if (Test-Path "signing.temp.properties") {
            Remove-Item "signing.temp.properties" -Force
            Write-Host "Removed temporary signing properties." -ForegroundColor Gray
        }
        # Final daemon stop to release pipes
        Write-Host "Cleaning up Gradle daemons..." -ForegroundColor Gray
        .\gradlew.bat --stop
        Pop-Location
    }
} finally {
    Pop-Location
}
exit 0
