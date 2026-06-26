# Sirve ISA PatyIA con rutas monorepo (front-shared local).
# URL: http://127.0.0.1:8765/isa-patyia/frontend/?isa_cdn=local
$ErrorActionPreference = "Stop"
$appsRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$port = if ($env:ISA_DEV_PORT) { $env:ISA_DEV_PORT } else { 8765 }
Write-Host "Monorepo root: $appsRoot"
Write-Host "Abrir: http://127.0.0.1:${port}/isa-patyia/frontend/?isa_cdn=local"
Push-Location $appsRoot
try {
  npx --yes http-server -p $port -c-1
} finally {
  Pop-Location
}
