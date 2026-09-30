# Business OS — Development Setup Script
# Run from the repository root

Write-Host "=== Business OS Setup ===" -ForegroundColor Green

# Backend setup
Write-Host "`n[1/3] Setting up Python backend..." -ForegroundColor Cyan
Set-Location backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green

# Database migrations
Write-Host "`n[2/3] Running database migrations..." -ForegroundColor Cyan
.venv\Scripts\alembic upgrade head
Write-Host "  ✓ Migrations applied" -ForegroundColor Green

Set-Location ..

# Frontend setup
Write-Host "`n[3/3] Frontend ready" -ForegroundColor Cyan
Write-Host "  ✓ Frontend is static HTML/CSS/JS — no build step needed" -ForegroundColor Green

Write-Host "`n=== Setup complete! ===" -ForegroundColor Green
Write-Host "Run: cd backend && .venv\Scripts\uvicorn app.main:app --reload --port 8000"
Write-Host "Open: frontend/pages/login.html in your browser"
