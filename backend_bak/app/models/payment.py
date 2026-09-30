import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.database.session import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    payment_number = Column(String(50), unique=True, nullable=False)
    invoice_id = Column(String(36), ForeignKey("invoices.id"), nullable=True)
    invoice_number = Column(String(50), nullable=True)
    client_id = Column(String(36), nullable=True)
    client_name = Column(String(255), nullable=True)
    amount = Column(Float, default=0.0)
    method = Column(String(100), nullable=True)
    reference = Column(String(255), nullable=True)
    date = Column(Date, nullable=True)
    status = Column(String(50), default="Completed")
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    invoice = relationship("Invoice", back_populates="payments")
