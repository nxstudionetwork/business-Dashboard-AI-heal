from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class QuotationItemBase(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price: float = 0.0
    amount: float = 0.0


class QuotationItemCreate(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price: float = 0.0
    amount: float = 0.0


class QuotationItemResponse(BaseModel):
    id: str
    quotation_id: str
    description: str
    quantity: float
    unit_price: float
    amount: float

    class Config:
        from_attributes = True


class QuotationBase(BaseModel):
    quotation_number: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    issue_date: Optional[date] = None
    valid_until: Optional[date] = None
    status: str = "Draft"
    subtotal: float = 0.0
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total: float = 0.0
    notes: Optional[str] = None


class QuotationCreate(BaseModel):
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    issue_date: Optional[date] = None
    valid_until: Optional[date] = None
    status: str = "Draft"
    subtotal: float = 0.0
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total: float = 0.0
    notes: Optional[str] = None
    items: Optional[List[QuotationItemCreate]] = None


class QuotationUpdate(BaseModel):
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    issue_date: Optional[date] = None
    valid_until: Optional[date] = None
    status: Optional[str] = None
    subtotal: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    total: Optional[float] = None
    notes: Optional[str] = None


class QuotationResponse(BaseModel):
    id: str
    quotation_number: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    issue_date: Optional[date] = None
    valid_until: Optional[date] = None
    status: str
    subtotal: float
    tax_rate: float
    tax_amount: float
    total: float
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    items: List[QuotationItemResponse] = []

    class Config:
        from_attributes = True
