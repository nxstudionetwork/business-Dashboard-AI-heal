import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text, Date, Time
from app.database.session import Base

class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    event_type = Column(String(50), default="Meeting")
    related_to = Column(String(100), nullable=True)
    related_id = Column(String(36), nullable=True)
    color = Column(String(50), nullable=True)
    is_all_day = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
