import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text, ForeignKey, Date
from app.database.session import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    expense_number = Column(String(50), unique=True, nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(Float, default=0.0)
    date = Column(Date, nullable=True)
    vendor = Column(String(255), nullable=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True)
    project_name = Column(String(255), nullable=True)
    payment_method = Column(String(100), nullable=True)
    receipt = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
