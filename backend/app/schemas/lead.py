from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LeadBase(BaseModel):
    lead_number: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    status: str = "New"
    value: float = 0.0
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    converted_to_client_id: Optional[str] = None


class LeadCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    status: str = "New"
    value: float = 0.0
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    value: Optional[float] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    converted_to_client_id: Optional[str] = None


class LeadResponse(BaseModel):
    id: str
    lead_number: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    status: str
    value: float
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    converted_to_client_id: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
