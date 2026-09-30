# Business OS — API Documentation

## Overview
The Business OS API is built with FastAPI (Python 3.12+) and follows RESTful conventions. It provides full CRUD operations for all business entities along with authentication, reporting, and dashboard endpoints.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All endpoints except `/auth/login` and `/auth/register` require a JWT bearer token.

```
Authorization: Bearer <token>
```

### Login
```
POST /auth/login
Body: { "email": "admin@company.com", "password": "admin123" }
Response: { "access_token": "...", "token_type": "bearer" }
```

## Endpoints

### Entities (Generic CRUD pattern)
Each entity follows the same CRUD pattern:

| Method | Endpoint                | Description         |
|--------|-------------------------|---------------------|
| GET    | /{entity}               | List (paginated)   |
| POST   | /{entity}               | Create             |
| GET    | /{entity}/{id}          | Get by ID          |
| PUT    | /{entity}/{id}          | Update             |
| DELETE | /{entity}/{id}          | Soft-delete        |

### Available Entities
- `/users` — User management
- `/clients` — Client management
- `/leads` — Sales leads
- `/projects` — Projects & milestones
- `/quotations` — Quotations & line items
- `/invoices` — Invoices & line items
- `/payments` — Payment records
- `/expenses` — Expense tracking
- `/documents` — Document management
- `/calendar` — Calendar events
- `/notes` — Notes
- `/notifications` — Notifications (includes `/me`, `/read-all`)
- `/activities` — Activity log (includes `/entity/{type}/{id}`)
- `/tags` — Tags (includes `/entity/{type}/{id}`)
- `/settings` — Application settings

### Special Endpoints

#### Dashboard
```
GET /dashboard/stats           — Aggregated business statistics
GET /dashboard/lead-sources    — Lead source breakdown
GET /dashboard/project-status  — Project status distribution
GET /dashboard/revenue-chart   — Revenue chart data (?months=6)
```

#### Reports
```
GET /reports/revenue      — Revenue report (?months=12)
GET /reports/expenses     — Expense report (?months=12)
GET /reports/projects     — Project summary
GET /reports/clients      — Client activity report
GET /reports/profit-loss  — Profit & loss statement (?months=12)
```

## Pagination
Query parameters: `?page=1&page_size=20`
Response includes: `items`, `total`, `page`, `page_size`, `total_pages`

## ID Format
- Human-readable IDs: `CLI-2026-000001-A3F2`, `PRO-2026-000042-BE1E`
- Prefixes: CLI (clients), PRO (projects), INV (invoices), LEA (leads), QTN (quotations), PAY (payments), EXP (expenses), DOC (documents), EVT (events), NOT (notes)
