# Business OS

A comprehensive business operating system with client management, project tracking, invoicing, and financial reporting.

## Architecture

- **Frontend**: Pure HTML/CSS/JS single-page application with hash routing. No framework — lightweight and fast.
- **Backend**: Python FastAPI with SQLAlchemy 2.x ORM, MySQL 8+, JWT authentication.
- **Design**: Dark-themed glassmorphic UI with micro-interactions and full responsiveness.

## Quick Start

### Prerequisites
- Python 3.12+
- MySQL 8+ (or SQLite for local dev)
- Node.js (optional, for frontend validation)

### Setup
```bash
# Clone and navigate
cd business-os

# Backend setup
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000

# Frontend
# Open frontend/pages/login.html in your browser
```

### Or use the setup script
```powershell
.\scripts\setup.ps1
.\scripts\start.ps1
```

## Default Credentials
- **Email**: admin@company.com
- **Password**: admin123

## Project Structure
See `docs/ProjectStructure.md` for a complete breakdown.

## API Documentation
Once the backend is running, visit `http://localhost:8000/docs` for interactive Swagger documentation.
See `docs/API.md` for endpoint reference.

## Key Features
- CRM: Leads, clients, activity tracking
- Projects: Milestones, task management
- Finance: Invoices, payments, expenses, quotations
- Operations: Documents, calendar, notes
- Analytics: Dashboard, revenue charts, reports
- System: User management, notifications, search (Ctrl+K)

## Tech Stack
| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+)     |
| Backend  | Python 3.13, FastAPI               |
| Database | MySQL 8+, SQLAlchemy 2.x           |
| Auth     | JWT (PyJWT), bcrypt                |
| Migrations | Alembic                         |
