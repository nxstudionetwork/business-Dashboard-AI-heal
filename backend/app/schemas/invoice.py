from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class InvoiceItemBase(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price: float = 0.0
    amount: float = 0.0


class InvoiceItemCreate(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price: float = 0.0
    amount: float = 0.0


class InvoiceItemResponse(BaseModel):
    id: str
    invoice_id: str
    description: str
    quantity: float
    unit_price: float
    amount: float

    class Config:
        from_attributes = True


class InvoiceBase(BaseModel):
    invoice_number: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    status: str = "Pending"
    subtotal: float = 0.0
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total: float = 0.0
    amount_paid: float = 0.0
    balance_due: float = 0.0
    notes: Optional[str] = None


class InvoiceCreate(BaseModel):
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    status: str = "Pending"
    subtotal: float = 0.0
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total: float = 0.0
    notes: Optional[str] = None
    items: Optional[List[InvoiceItemCreate]] = None


class InvoiceUpdate(BaseModel):
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    subtotal: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    total: Optional[float] = None
    amount_paid: Optional[float] = None
    balance_due: Optional[float] = None
    notes: Optional[str] = None


class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    status: str
    subtotal: float
    tax_rate: float
    tax_amount: float
    total: float
    amount_paid: float
    balance_due: float
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    items: List[InvoiceItemResponse] = []

    class Config:
        from_attributes = True
