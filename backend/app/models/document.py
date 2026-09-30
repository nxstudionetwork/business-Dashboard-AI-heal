import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text, ForeignKey, JSON
from app.database.session import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_number = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    folder = Column(String(255), nullable=True)
    file_type = Column(String(50), nullable=True)
    file_size = Column(Float, default=0.0)
    file_path = Column(String(500), nullable=True)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=True)
    client_name = Column(String(255), nullable=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True)
    project_name = Column(String(255), nullable=True)
    tags = Column(JSON, nullable=True)
    version = Column(String(20), default="v1")
    is_favorite = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
