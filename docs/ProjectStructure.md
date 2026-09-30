# Business OS — Project Structure

```
business-os/
├── frontend/                    # Frontend application (SPA)
│   ├── pages/                   # HTML entry points
│   │   ├── index.html          # SPA shell with hash routing
│   │   ├── login.html          # Standalone login page
│   │   ├── dashboard.html      # Dashboard (standalone entry)
│   │   ├── clients.html        # Client management
│   │   ├── leads.html          # Lead tracking
│   │   ├── projects.html       # Project management
│   │   ├── quotations.html     # Quote generation
│   │   ├── invoices.html       # Invoice management
│   │   ├── payments.html       # Payment tracking
│   │   ├── expenses.html       # Expense tracking
│   │   ├── documents.html      # Document management
│   │   ├── calendar.html       # Event calendar
│   │   ├── reports.html        # Analytics & reports
│   │   ├── notes.html          # Notes
│   │   └── settings.html       # Application settings
│   └── assets/
│       ├── css/                # Modular stylesheets (15 files)
│       │   ├── theme.css       # CSS variables, dark theme
│       │   ├── global.css      # Reset, base styles
│       │   ├── layout.css      # App shell grid
│       │   ├── sidebar.css     # Navigation sidebar
│       │   ├── navbar.css      # Top header bar
│       │   ├── components.css  # Shared components (badges, buttons)
│       │   ├── cards.css       # Card components
│       │   ├── tables.css      # Data tables
│       │   ├── forms.css       # Form controls
│       │   ├── modal.css       # Modal dialogs
│       │   ├── drawer.css      # Detail slide-out drawer
│       │   ├── dashboard.css   # Dashboard-specific styles
│       │   ├── pages.css       # Page layout styles
│       │   ├── animations.css  # Micro-interactions, transitions
│       │   └── responsive.css  # Responsive breakpoints
│       ├── js/                 # Modular JavaScript (22 files)
│       │   ├── utils.js        # Shared utilities
│       │   ├── storage.js      # LocalStorage data layer
│       │   ├── auth.js         # Authentication logic
│       │   ├── ui.js           # UI system: toast, skeleton, sidebar
│       │   ├── modal.js        # Generic CRUD modal
│       │   ├── drawer.js       # Detail slide-out drawer
│       │   ├── router.js       # Hash-based SPA router
│       │   ├── search.js       # Global search & command palette
│       │   ├── notifications.js # Notification system
│       │   ├── app.js          # Application initialization
│       │   ├── dashboard.js    # Dashboard page module
│       │   ├── clients.js      # Client management module
│       │   ├── leads.js        # Lead tracking module
│       │   ├── projects.js     # Project management module
│       │   ├── quotations.js   # Quotation module
│       │   ├── invoices.js     # Invoice module
│       │   ├── payments.js     # Payments & expenses module
│       │   ├── documents.js    # Document management module
│       │   ├── calendar.js     # Calendar module
│       │   ├── notes.js        # Notes module
│       │   ├── reports.js      # Analytics module
│       │   └── settings.js     # Settings module
│       ├── images/             # Static images (empty)
│       ├── icons/              # Icon assets (empty)
│       └── fonts/              # Font files (empty)
│
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI application entry
│   │   ├── api/
│   │   │   └── v1/            # API version 1 routes (19 routers)
│   │   │       ├── base_crud.py    # CRUD route factory
│   │   │       ├── auth.py         # Authentication endpoints
│   │   │       ├── users.py        # User management
│   │   │       ├── clients.py      # Client CRUD
│   │   │       ├── leads.py        # Lead CRUD
│   │   │       ├── projects.py     # Project CRUD
│   │   │       ├── quotations.py   # Quotation CRUD
│   │   │       ├── invoices.py     # Invoice CRUD
│   │   │       ├── payments.py     # Payment CRUD
│   │   │       ├── expenses.py     # Expense CRUD
│   │   │       ├── documents.py    # Document CRUD
│   │   │       ├── calendar.py     # Calendar CRUD
│   │   │       ├── notes.py        # Notes CRUD
│   │   │       ├── notifications.py # Notification CRUD
│   │   │       ├── activities.py   # Activity log CRUD
│   │   │       ├── tags.py         # Tag CRUD
│   │   │       ├── dashboard.py    # Dashboard stats
│   │   │       ├── reports.py      # Reporting endpoints
│   │   │       └── settings.py     # Settings CRUD
│   │   ├── models/            # SQLAlchemy ORM models (16 files)
│   │   ├── schemas/           # Pydantic validation schemas
│   │   ├── services/          # Business logic layer
│   │   ├── repositories/      # Data access layer
│   │   ├── middleware/        # FastAPI middleware
│   │   ├── auth/              # JWT & password utilities
│   │   ├── core/              # Configuration
│   │   ├── database/          # DB session management
│   │   └── utils/             # Shared utilities
│   ├── alembic/               # Database migrations
│   ├── logs/                  # Application logs
│   ├── uploads/               # File uploads
│   ├── alembic.ini
│   └── requirements.txt
│
├── database/                  # Database resources
│   ├── schema/               # Schema documentation
│   ├── backups/              # Database backups
│   └── seeds/                # Seed data scripts
│
├── docs/                     # Documentation
│   ├── API.md               # API documentation
│   └── ProjectStructure.md  # This file
│
├── scripts/                  # Utility scripts
│   ├── setup.ps1            # Development setup
│   └── start.ps1            # Development server
│
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── requirements.txt          # Python dependencies (root-level link)
└── README.md                 # Project overview
```
