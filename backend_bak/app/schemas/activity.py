from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ActivityBase(BaseModel):
    user_id: Optional[str] = None
    action: str
    description: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    activity_metadata: Optional[str] = None


class ActivityCreate(BaseModel):
    action: str
    description: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    activity_metadata: Optional[str] = None


class ActivityUpdate(BaseModel):
    action: Optional[str] = None
    description: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    activity_metadata: Optional[str] = None


class ActivityResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    description: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    activity_metadata: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
