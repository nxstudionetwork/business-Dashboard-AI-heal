from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TagBase(BaseModel):
    name: str
    color: Optional[str] = None


class TagCreate(BaseModel):
    name: str
    color: Optional[str] = None


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class TagResponse(BaseModel):
    id: str
    name: str
    color: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class EntityTagCreate(BaseModel):
    tag_id: str
    entity_type: str
    entity_id: str


class EntityTagResponse(BaseModel):
    id: str
    tag_id: str
    entity_type: str
    entity_id: str
    created_at: datetime

    class Config:
        from_attributes = True
