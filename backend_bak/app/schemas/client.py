from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ClientBase(BaseModel):
    client_number: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    website: Optional[str] = None
    gst: Optional[str] = None
    pan: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: str = "India"
    status: str = "Active"
    tags: Optional[Any] = None
    notes: Optional[str] = None
    is_vip: bool = False
    is_favorite: bool = False


class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    website: Optional[str] = None
    gst: Optional[str] = None
    pan: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: str = "India"
    status: str = "Active"
    tags: Optional[Any] = None
    notes: Optional[str] = None
    is_vip: bool = False
    is_favorite: bool = False


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    website: Optional[str] = None
    gst: Optional[str] = None
    pan: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[Any] = None
    notes: Optional[str] = None
    is_vip: Optional[bool] = None
    is_favorite: Optional[bool] = None


class ClientResponse(BaseModel):
    id: str
    client_number: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    website: Optional[str] = None
    gst: Optional[str] = None
    pan: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: str
    status: str
    tags: Optional[Any] = None
    notes: Optional[str] = None
    is_vip: bool
    is_favorite: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
