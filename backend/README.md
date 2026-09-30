# Business OS Backend

## Tech Stack
- Python 3.12+
- FastAPI
- MySQL 8+
- SQLAlchemy 2.x
- Alembic
- JWT Authentication

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Create MySQL database:
```bash
mysql -u root -p -e "CREATE DATABASE business_os CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

5. Run migrations:
```bash
alembic upgrade head
```

6. Start server:
```bash
uvicorn app.main:app --reload --port 8000
```

## API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure
```
backend/
├── app/
│   ├── api/v1/         # API routes
│   ├── auth/           # JWT, password hashing
│   ├── core/           # Config
│   ├── database/       # Session, engine
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic
│   └── utils/          # Helpers
├── migrations/         # Alembic
├── uploads/            # File uploads
├── logs/               # Application logs
└── main.py
```

## API Endpoints
- `GET /health` - Health check
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Modules
- `/api/v1/leads` - Lead management
- `/api/v1/clients` - Client management
- `/api/v1/projects` - Project management
- `/api/v1/quotations` - Quotation management
- `/api/v1/invoices` - Invoice management
- `/api/v1/payments` - Payment management
- `/api/v1/expenses` - Expense management
- `/api/v1/documents` - Document management
- `/api/v1/calendar` - Calendar events
- `/api/v1/notes` - Notes management
- `/api/v1/reports` - Reports & analytics
- `/api/v1/dashboard` - Dashboard data
- `/api/v1/notifications` - Notifications
- `/api/v1/tags` - Tag management
- `/api/v1/activities` - Activity log
