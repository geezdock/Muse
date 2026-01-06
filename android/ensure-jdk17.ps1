$ErrorActionPreference = 'Stop'

# Downloads a local JDK 17 into android/.jdk and runs Gradle using it.
# This avoids relying on system Java (often Java 8) or Android Studio's embedded JBR (often Java 21).

$androidDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $androidDir

$jdkRoot = Join-Path $androidDir '.jdk'
$jdkHome = Join-Path $jdkRoot 'jdk-17'
$marker = Join-Path $jdkHome 'bin\java.exe'

if (-not (Test-Path $marker)) {
  New-Item -ItemType Directory -Force -Path $jdkRoot | Out-Null

  $zipPath = Join-Path $jdkRoot 'temurin-17.zip'
  $extractTmp = Join-Path $jdkRoot 'tmp'

  if (Test-Path $extractTmp) { Remove-Item -Recurse -Force $extractTmp }
  New-Item -ItemType Directory -Force -Path $extractTmp | Out-Null

  # Adoptium API: latest GA Temurin JDK 17 for Windows x64 (HotSpot) as ZIP
  $url = 'https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk'
  Write-Host "Downloading JDK 17 from $url" -ForegroundColor Cyan
  Invoke-WebRequest -Uri $url -OutFile $zipPath

  Write-Host 'Extracting JDK...' -ForegroundColor Cyan
  Expand-Archive -Path $zipPath -DestinationPath $extractTmp -Force

  $extracted = Get-ChildItem -Path $extractTmp -Directory | Select-Object -First 1
  if (-not $extracted) {
    throw "JDK extract failed: no directory found in $extractTmp"
  }

  if (Test-Path $jdkHome) { Remove-Item -Recurse -Force $jdkHome }
  Move-Item -Path $extracted.FullName -Destination $jdkHome

  Remove-Item -Force $zipPath -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force $extractTmp -ErrorAction SilentlyContinue
}

$env:JAVA_HOME = $jdkHome
$env:Path = (Join-Path $jdkHome 'bin') + ';' + $env:Path

Write-Host "Using JAVA_HOME=$env:JAVA_HOME" -ForegroundColor Green
& (Join-Path $jdkHome 'bin\java.exe') -version

# Run a Gradle command passed via -Args; default to assembleRelease
if ($args.Count -eq 0) {
  $gradleArgs = @(':app:assembleRelease')
} else {
  $gradleArgs = $args
}

Write-Host "Running: .\\gradlew $($gradleArgs -join ' ')" -ForegroundColor Green
& .\gradlew @gradleArgs
