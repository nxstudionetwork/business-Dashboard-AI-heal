from fastapi import APIRouter
from app.api.v1 import auth, users, leads, clients, projects, quotations, invoices, payments, expenses, documents, calendar, notes, reports, dashboard, notifications, tags, activities, settings

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(leads.router, prefix="/leads", tags=["Leads"])
api_router.include_router(clients.router, prefix="/clients", tags=["Clients"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(quotations.router, prefix="/quotations", tags=["Quotations"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["Calendar"])
api_router.include_router(notes.router, prefix="/notes", tags=["Notes"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(tags.router, prefix="/tags", tags=["Tags"])
api_router.include_router(activities.router, prefix="/activities", tags=["Activities"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
