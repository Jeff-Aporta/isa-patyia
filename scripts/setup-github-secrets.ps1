# Secretos GitHub — isa-patyia (Cloudflare Pages dev)
# Requiere: gh auth login · token Cloudflare con permiso Pages Write
param(
  [string]$Repo = "Jeff-Aporta/isa-patyia"
)

$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$settings = Join-Path $root "local.settings.json"
if (-not (Test-Path $settings)) {
  $settings = Join-Path (Split-Path $root -Parent) "local.settings.json"
}
if (-not (Test-Path $settings)) {
  Write-Host "No se encontró local.settings.json (Personal/apps)." -ForegroundColor Yellow
  exit 1
}

$v = Get-Content $settings -Raw | ConvertFrom-Json
$cf = $env:CLOUDFLARE_API_TOKEN
if (-not $cf) { $cf = $v.Values.CLOUDFLARE_WORKERS_API_TOKEN }
if (-not $cf) { $cf = $v.Values.FILESTORE_API_TOKEN }
$acc = $v.Values.FILESTORE_ACCOUNT_ID
if (-not $cf -or -not $acc) {
  Write-Host "Faltan CLOUDFLARE_WORKERS_API_TOKEN y FILESTORE_ACCOUNT_ID en local.settings.json." -ForegroundColor Yellow
  exit 1
}

$cf | gh secret set CLOUDFLARE_API_TOKEN -R $Repo
$acc | gh secret set CLOUDFLARE_ACCOUNT_ID -R $Repo
Write-Host "OK secretos en $Repo (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)" -ForegroundColor Green
