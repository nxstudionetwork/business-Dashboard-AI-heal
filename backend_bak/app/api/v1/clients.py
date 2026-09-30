from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.client import Client
from app.models.user import User
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from app.api.v1.base_crud import create_crud_router, get_current_user

router = create_crud_router(
    model=Client,
    schema_create=ClientCreate,
    schema_update=ClientUpdate,
    schema_response=ClientResponse,
    id_prefix="CLI",
    number_field="client_number",
)
