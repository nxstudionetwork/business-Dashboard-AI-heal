import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from app.database.session import Base

class Tag(Base):
    __tablename__ = "tags"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, unique=True)
    color = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class EntityTag(Base):
    __tablename__ = "entity_tags"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tag_id = Column(String(36), ForeignKey("tags.id"), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
