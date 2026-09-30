from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database.session import get_db
from app.api.v1.base_crud import get_current_user
from app.models.user import User
from app.models.lead import Lead
from app.models.client import Client
from app.models.project import Project
from app.models.invoice import Invoice
from app.models.payment import Payment
from app.models.expense import Expense
from app.models.quotation import Quotation
from app.models.document import Document

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_leads = db.query(func.count(Lead.id)).filter(Lead.is_active == True).scalar() or 0
    total_clients = db.query(func.count(Client.id)).filter(Client.is_active == True).scalar() or 0
    total_projects = db.query(func.count(Project.id)).filter(Project.is_active == True).scalar() or 0
    active_projects = db.query(func.count(Project.id)).filter(Project.is_active == True, Project.status != "Completed").scalar() or 0
    completed_projects = db.query(func.count(Project.id)).filter(Project.is_active == True, Project.status == "Completed").scalar() or 0
    total_invoices = db.query(func.count(Invoice.id)).filter(Invoice.is_active == True).scalar() or 0
    total_revenue = db.query(func.sum(Payment.amount)).filter(Payment.is_active == True).scalar() or 0.0
    total_expenses = db.query(func.sum(Expense.amount)).filter(Expense.is_active == True).scalar() or 0.0
    pending_invoices = db.query(func.count(Invoice.id)).filter(Invoice.is_active == True, Invoice.status == "Pending").scalar() or 0
    overdue_invoices = db.query(func.count(Invoice.id)).filter(Invoice.is_active == True, Invoice.status == "Overdue").scalar() or 0
    total_quotations = db.query(func.count(Quotation.id)).filter(Quotation.is_active == True).scalar() or 0
    total_documents = db.query(func.count(Document.id)).filter(Document.is_active == True).scalar() or 0

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_leads_30d = db.query(func.count(Lead.id)).filter(Lead.is_active == True, Lead.created_at >= thirty_days_ago).scalar() or 0
    new_clients_30d = db.query(func.count(Client.id)).filter(Client.is_active == True, Client.created_at >= thirty_days_ago).scalar() or 0
    revenue_30d = db.query(func.sum(Payment.amount)).filter(Payment.is_active == True, Payment.created_at >= thirty_days_ago).scalar() or 0.0
    expenses_30d = db.query(func.sum(Expense.amount)).filter(Expense.is_active == True, Expense.created_at >= thirty_days_ago).scalar() or 0.0

    return {
        "total_leads": total_leads,
        "total_clients": total_clients,
        "total_projects": total_projects,
        "active_projects": active_projects,
        "completed_projects": completed_projects,
        "total_invoices": total_invoices,
        "pending_invoices": pending_invoices,
        "overdue_invoices": overdue_invoices,
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "net_profit": total_revenue - total_expenses,
        "total_quotations": total_quotations,
        "total_documents": total_documents,
        "last_30_days": {
            "new_leads": new_leads_30d,
            "new_clients": new_clients_30d,
            "revenue": revenue_30d,
            "expenses": expenses_30d,
            "net_profit": revenue_30d - expenses_30d,
        },
    }


@router.get("/revenue-chart")
async def get_revenue_chart(
    months: int = Query(default=6, ge=1, le=24),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = []
    for i in range(months - 1, -1, -1):
        date = datetime.utcnow() - timedelta(days=30 * i)
        month_start = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if i > 0:
            month_end = (datetime.utcnow() - timedelta(days=30 * (i - 1))).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            month_end = datetime.utcnow()
        revenue = db.query(func.sum(Payment.amount)).filter(
            Payment.is_active == True,
            Payment.created_at >= month_start,
            Payment.created_at < month_end,
        ).scalar() or 0.0
        expenses = db.query(func.sum(Expense.amount)).filter(
            Expense.is_active == True,
            Expense.created_at >= month_start,
            Expense.created_at < month_end,
        ).scalar() or 0.0
        results.append({
            "month": month_start.strftime("%Y-%m"),
            "revenue": revenue,
            "expenses": expenses,
            "profit": revenue - expenses,
        })
    return results


@router.get("/project-status")
async def get_project_status_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    statuses = db.query(Project.status, func.count(Project.id)).filter(
        Project.is_active == True
    ).group_by(Project.status).all()
    return {status: count for status, count in statuses}


@router.get("/lead-sources")
async def get_lead_sources(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sources = db.query(Lead.source, func.count(Lead.id)).filter(
        Lead.is_active == True, Lead.source.isnot(None)
    ).group_by(Lead.source).all()
    return {source: count for source, count in sources}
