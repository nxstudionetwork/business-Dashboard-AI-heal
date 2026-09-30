# Business OS — Start Development Server
param(
    [int]$Port = 8000
)

Write-Host "=== Starting Business OS Backend ===" -ForegroundColor Cyan
Write-Host "Port: $Port" -ForegroundColor Gray

Set-Location "$PSScriptRoot\..\backend"
.venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port $Port

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start. Run scripts/setup.ps1 first." -ForegroundColor Red
}
