from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationBase(BaseModel):
    user_id: Optional[str] = None
    type: str
    title: str
    message: Optional[str] = None
    related_to: Optional[str] = None
    related_id: Optional[str] = None


class NotificationCreate(BaseModel):
    user_id: Optional[str] = None
    type: str
    title: str
    message: Optional[str] = None
    related_to: Optional[str] = None
    related_id: Optional[str] = None


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    type: str
    title: str
    message: Optional[str] = None
    related_to: Optional[str] = None
    related_id: Optional[str] = None
    is_read: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
