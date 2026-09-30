import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.dialects.mysql import CHAR
from app.database.session import Base

class BaseModelMixin:
    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(CHAR(36), nullable=True)
    updated_by = Column(CHAR(36), nullable=True)

    def soft_delete(self):
        self.deleted_at = datetime.utcnow()
        self.is_active = False
