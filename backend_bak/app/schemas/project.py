from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class ProjectMilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: str = "Pending"
    is_completed: bool = False


class ProjectMilestoneCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: str = "Pending"


class ProjectMilestoneResponse(BaseModel):
    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: str
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    project_number: str
    name: str
    description: Optional[str] = None
    client_id: str
    client_name: Optional[str] = None
    category: Optional[str] = None
    status: str = "Planning"
    priority: str = "Medium"
    budget: float = 0.0
    actual_cost: float = 0.0
    profit_margin: float = 0.0
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    health: str = "On Track"
    risk_level: str = "Low"
    progress: float = 0.0
    notes: Optional[str] = None
    is_pinned: bool = False


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    client_id: str
    client_name: Optional[str] = None
    category: Optional[str] = None
    status: str = "Planning"
    priority: str = "Medium"
    budget: float = 0.0
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    health: str = "On Track"
    risk_level: str = "Low"
    notes: Optional[str] = None
    milestones: Optional[List[ProjectMilestoneCreate]] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    budget: Optional[float] = None
    actual_cost: Optional[float] = None
    profit_margin: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    health: Optional[str] = None
    risk_level: Optional[str] = None
    progress: Optional[float] = None
    notes: Optional[str] = None
    is_pinned: Optional[bool] = None


class ProjectResponse(BaseModel):
    id: str
    project_number: str
    name: str
    description: Optional[str] = None
    client_id: str
    client_name: Optional[str] = None
    category: Optional[str] = None
    status: str
    priority: str
    budget: float
    actual_cost: float
    profit_margin: float
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    health: str
    risk_level: str
    progress: float
    notes: Optional[str] = None
    is_pinned: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    milestones: List[ProjectMilestoneResponse] = []

    class Config:
        from_attributes = True
