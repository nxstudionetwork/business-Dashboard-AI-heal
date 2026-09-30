from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class ExpenseBase(BaseModel):
    expense_number: str
    category: str
    description: Optional[str] = None
    amount: float = 0.0
    date: Optional[date] = None
    vendor: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    payment_method: Optional[str] = None
    receipt: Optional[str] = None
    notes: Optional[str] = None


class ExpenseCreate(BaseModel):
    category: str
    description: Optional[str] = None
    amount: float = 0.0
    date: Optional[date] = None
    vendor: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    payment_method: Optional[str] = None
    receipt: Optional[str] = None
    notes: Optional[str] = None


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[date] = None
    vendor: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    payment_method: Optional[str] = None
    receipt: Optional[str] = None
    notes: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: str
    expense_number: str
    category: str
    description: Optional[str] = None
    amount: float
    date: Optional[date] = None
    vendor: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    payment_method: Optional[str] = None
    receipt: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
