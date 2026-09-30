import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_number = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    alternate_phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    designation = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    gst = Column(String(50), nullable=True)
    pan = Column(String(50), nullable=True)
    business_type = Column(String(100), nullable=True)
    industry = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    country = Column(String(100), default="India")
    status = Column(String(50), default="Active")
    tags = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    is_vip = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    projects = relationship("Project", back_populates="client")
    invoices = relationship("Invoice", back_populates="client")
