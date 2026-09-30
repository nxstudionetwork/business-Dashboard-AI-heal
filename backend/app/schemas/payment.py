from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class PaymentBase(BaseModel):
    payment_number: str
    invoice_id: Optional[str] = None
    invoice_number: Optional[str] = None
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    amount: float = 0.0
    method: Optional[str] = None
    reference: Optional[str] = None
    date: Optional[date] = None
    status: str = "Completed"
    notes: Optional[str] = None


class PaymentCreate(BaseModel):
    invoice_id: Optional[str] = None
    invoice_number: Optional[str] = None
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    amount: float = 0.0
    method: Optional[str] = None
    reference: Optional[str] = None
    date: Optional[date] = None
    status: str = "Completed"
    notes: Optional[str] = None


class PaymentUpdate(BaseModel):
    invoice_id: Optional[str] = None
    invoice_number: Optional[str] = None
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    amount: Optional[float] = None
    method: Optional[str] = None
    reference: Optional[str] = None
    date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    id: str
    payment_number: str
    invoice_id: Optional[str] = None
    invoice_number: Optional[str] = None
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    amount: float
    method: Optional[str] = None
    reference: Optional[str] = None
    date: Optional[date] = None
    status: str
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
