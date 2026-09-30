from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time


class CalendarEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: date
    time: Optional[time] = None
    end_time: Optional[time] = None
    event_type: str = "Meeting"
    related_to: Optional[str] = None
    related_id: Optional[str] = None
    color: Optional[str] = None
    is_all_day: bool = False


class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: date
    time: Optional[time] = None
    end_time: Optional[time] = None
    event_type: str = "Meeting"
    related_to: Optional[str] = None
    related_id: Optional[str] = None
    color: Optional[str] = None
    is_all_day: bool = False


class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    time: Optional[time] = None
    end_time: Optional[time] = None
    event_type: Optional[str] = None
    related_to: Optional[str] = None
    related_id: Optional[str] = None
    color: Optional[str] = None
    is_all_day: Optional[bool] = None


class CalendarEventResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    date: date
    time: Optional[time] = None
    end_time: Optional[time] = None
    event_type: str
    related_to: Optional[str] = None
    related_id: Optional[str] = None
    color: Optional[str] = None
    is_all_day: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
