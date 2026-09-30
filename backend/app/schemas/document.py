from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class DocumentBase(BaseModel):
    document_number: str
    name: str
    category: Optional[str] = None
    folder: Optional[str] = None
    file_type: Optional[str] = None
    file_size: float = 0.0
    file_path: Optional[str] = None
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    tags: Optional[Any] = None
    version: str = "v1"
    is_favorite: bool = False


class DocumentCreate(BaseModel):
    name: str
    category: Optional[str] = None
    folder: Optional[str] = None
    file_type: Optional[str] = None
    file_size: float = 0.0
    file_path: Optional[str] = None
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    tags: Optional[Any] = None
    version: str = "v1"


class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    folder: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[float] = None
    file_path: Optional[str] = None
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    tags: Optional[Any] = None
    version: Optional[str] = None
    is_favorite: Optional[bool] = None


class DocumentResponse(BaseModel):
    id: str
    document_number: str
    name: str
    category: Optional[str] = None
    folder: Optional[str] = None
    file_type: Optional[str] = None
    file_size: float
    file_path: Optional[str] = None
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    tags: Optional[Any] = None
    version: str
    is_favorite: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
