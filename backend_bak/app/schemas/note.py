from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    type: str = "General"
    tags: Optional[Any] = None
    color: Optional[str] = None
    is_pinned: bool = False
    is_favorite: bool = False


class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    type: str = "General"
    tags: Optional[Any] = None
    color: Optional[str] = None
    is_pinned: bool = False


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = None
    tags: Optional[Any] = None
    color: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_favorite: Optional[bool] = None


class NoteResponse(BaseModel):
    id: str
    title: str
    content: Optional[str] = None
    type: str
    tags: Optional[Any] = None
    color: Optional[str] = None
    is_pinned: bool
    is_favorite: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
