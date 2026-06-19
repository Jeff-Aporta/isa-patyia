# Crea el proyecto Cloudflare Pages isa-patyia-dev (rama dev)
param(
  [string]$ProjectName = "isa-patyia-dev",
  [string]$ProductionBranch = "dev"
)

$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$settings = Join-Path $root "local.settings.json"
if (-not (Test-Path $settings)) {
  $settings = Join-Path (Split-Path $root -Parent) "local.settings.json"
}
$v = Get-Content $settings -Raw | ConvertFrom-Json
$cfToken = $env:CLOUDFLARE_API_TOKEN
if (-not $cfToken) { $cfToken = $v.Values.CLOUDFLARE_WORKERS_API_TOKEN }
$cfAcc = $env:CLOUDFLARE_ACCOUNT_ID
if (-not $cfAcc) { $cfAcc = $v.Values.FILESTORE_ACCOUNT_ID }
$env:CLOUDFLARE_API_TOKEN = $cfToken
$env:CLOUDFLARE_ACCOUNT_ID = $cfAcc
if (-not $env:CLOUDFLARE_API_TOKEN -or -not $env:CLOUDFLARE_ACCOUNT_ID) {
  Write-Host "Faltan credenciales Cloudflare en local.settings.json." -ForegroundColor Yellow
  exit 1
}

Push-Location $PSScriptRoot\..
$exists = npx --yes wrangler pages project list 2>$null | Select-String -Pattern $ProjectName -Quiet
if ($exists) {
  Write-Host "Proyecto $ProjectName ya existe en Cloudflare Pages." -ForegroundColor Cyan
} else {
  npx --yes wrangler pages project create $ProjectName --production-branch=$ProductionBranch
  Write-Host "Proyecto $ProjectName creado (production-branch=$ProductionBranch)." -ForegroundColor Green
}
Pop-Location
