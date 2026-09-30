from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SettingCreate(BaseModel):
    key: str
    value: Optional[str] = None
    group: Optional[str] = "general"


class SettingUpdate(BaseModel):
    key: Optional[str] = None
    value: Optional[str] = None
    group: Optional[str] = None


class SettingResponse(BaseModel):
    id: str
    key: str
    value: Optional[str] = None
    group: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
