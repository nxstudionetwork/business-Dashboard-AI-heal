from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.lead import Lead
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse
from app.api.v1.base_crud import create_crud_router, get_current_user

router = create_crud_router(
    model=Lead,
    schema_create=LeadCreate,
    schema_update=LeadUpdate,
    schema_response=LeadResponse,
    id_prefix="L",
    number_field="lead_number",
)
