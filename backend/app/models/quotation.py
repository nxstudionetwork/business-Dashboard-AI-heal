import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text, ForeignKey, Date, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quotation_number = Column(String(50), unique=True, nullable=False)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=True)
    client_name = Column(String(255), nullable=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True)
    project_name = Column(String(255), nullable=True)
    issue_date = Column(Date, nullable=True)
    valid_until = Column(Date, nullable=True)
    status = Column(String(50), default="Draft")
    subtotal = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("QuotationItem", back_populates="quotation", cascade="all, delete-orphan")

class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quotation_id = Column(String(36), ForeignKey("quotations.id"), nullable=False)
    description = Column(String(500), nullable=False)
    quantity = Column(Float, default=1.0)
    unit_price = Column(Float, default=0.0)
    amount = Column(Float, default=0.0)

    quotation = relationship("Quotation", back_populates="items")
