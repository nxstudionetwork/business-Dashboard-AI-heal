from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SettingBase(BaseModel):
    key: str
    value: Optional[str] = None
    group: str = "general"


class SettingCreate(BaseModel):
    key: str
    value: Optional[str] = None
    group: str = "general"


class SettingUpdate(BaseModel):
    value: Optional[str] = None
    group: Optional[str] = None


class SettingResponse(BaseModel):
    id: str
    key: str
    value: Optional[str] = None
    group: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
