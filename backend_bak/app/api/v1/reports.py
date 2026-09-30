from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional
from app.database.session import get_db
from app.api.v1.base_crud import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.invoice import Invoice
from app.models.payment import Payment
from app.models.expense import Expense
from app.models.lead import Lead
from app.models.client import Client

router = APIRouter()


@router.get("/revenue")
async def get_revenue_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Payment).filter(Payment.is_active == True)
    if start_date:
        query = query.filter(Payment.date >= start_date)
    if end_date:
        query = query.filter(Payment.date <= end_date)
    total = query.with_entities(func.sum(Payment.amount)).scalar() or 0.0
    count = query.count()
    by_method = db.query(Payment.method, func.sum(Payment.amount)).filter(
        Payment.is_active == True
    ).group_by(Payment.method).all()
    return {
        "total_revenue": total,
        "payment_count": count,
        "by_method": {method: amount for method, amount in by_method if method},
    }


@router.get("/expenses")
async def get_expense_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Expense).filter(Expense.is_active == True)
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
    total = query.with_entities(func.sum(Expense.amount)).scalar() or 0.0
    count = query.count()
    by_category = db.query(Expense.category, func.sum(Expense.amount)).filter(
        Expense.is_active == True
    ).group_by(Expense.category).all()
    return {
        "total_expenses": total,
        "expense_count": count,
        "by_category": {cat: amount for cat, amount in by_category},
    }


@router.get("/projects")
async def get_project_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total = db.query(func.count(Project.id)).filter(Project.is_active == True).scalar() or 0
    by_status = db.query(Project.status, func.count(Project.id)).filter(
        Project.is_active == True
    ).group_by(Project.status).all()
    by_priority = db.query(Project.priority, func.count(Project.id)).filter(
        Project.is_active == True
    ).group_by(Project.priority).all()
    total_budget = db.query(func.sum(Project.budget)).filter(Project.is_active == True).scalar() or 0.0
    total_actual = db.query(func.sum(Project.actual_cost)).filter(Project.is_active == True).scalar() or 0.0
    avg_progress = db.query(func.avg(Project.progress)).filter(Project.is_active == True).scalar() or 0.0
    return {
        "total_projects": total,
        "by_status": {s: c for s, c in by_status},
        "by_priority": {p: c for p, c in by_priority},
        "total_budget": total_budget,
        "total_actual_cost": total_actual,
        "budget_variance": total_budget - total_actual,
        "average_progress": round(float(avg_progress), 2),
    }


@router.get("/clients")
async def get_client_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total = db.query(func.count(Client.id)).filter(Client.is_active == True).scalar() or 0
    by_status = db.query(Client.status, func.count(Client.id)).filter(
        Client.is_active == True
    ).group_by(Client.status).all()
    vip_count = db.query(func.count(Client.id)).filter(
        Client.is_active == True, Client.is_vip == True
    ).scalar() or 0
    return {
        "total_clients": total,
        "by_status": {s: c for s, c in by_status},
        "vip_clients": vip_count,
    }


@router.get("/profit-loss")
async def get_profit_loss(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rev_query = db.query(func.sum(Payment.amount)).filter(Payment.is_active == True)
    exp_query = db.query(func.sum(Expense.amount)).filter(Expense.is_active == True)
    if start_date:
        rev_query = rev_query.filter(Payment.date >= start_date)
        exp_query = exp_query.filter(Expense.date >= start_date)
    if end_date:
        rev_query = rev_query.filter(Payment.date <= end_date)
        exp_query = exp_query.filter(Expense.date <= end_date)
    revenue = rev_query.scalar() or 0.0
    expenses = exp_query.scalar() or 0.0
    return {
        "revenue": revenue,
        "expenses": expenses,
        "net_profit": revenue - expenses,
        "profit_margin": round((revenue - expenses) / revenue * 100, 2) if revenue > 0 else 0,
    }
