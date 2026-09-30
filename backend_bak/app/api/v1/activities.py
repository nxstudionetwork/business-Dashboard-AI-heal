from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.activity import Activity
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse
from app.api.v1.base_crud import create_crud_router, get_current_user

base_router = create_crud_router(
    model=Activity,
    schema_create=ActivityCreate,
    schema_update=ActivityUpdate,
    schema_response=ActivityResponse,
    id_prefix="ACT",
)

router = APIRouter()
router.include_router(base_router)


@router.get("/entity/{entity_type}/{entity_id}", response_model=list[ActivityResponse])
async def get_entity_activities(
    entity_type: str,
    entity_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from sqlalchemy import desc
    activities = (
        db.query(Activity)
        .filter(Activity.entity_type == entity_type, Activity.entity_id == entity_id, Activity.is_active == True)
        .order_by(desc(Activity.created_at))
        .all()
    )
    return activities
