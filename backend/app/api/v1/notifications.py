from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationCreate, NotificationUpdate, NotificationResponse
from app.api.v1.base_crud import create_crud_router, get_current_user

base_router = create_crud_router(
    model=Notification,
    schema_create=NotificationCreate,
    schema_update=NotificationUpdate,
    schema_response=NotificationResponse,
    id_prefix="NTF",
)

router = APIRouter()


@router.get("/me", response_model=dict)
async def list_my_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import math
    from sqlalchemy import desc
    query = db.query(Notification).filter(
        Notification.user_id == str(current_user.id),
        Notification.is_active == True,
    )
    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    items = query.order_by(desc(Notification.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [NotificationResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == str(current_user.id),
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@router.put("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from datetime import datetime
    db.query(Notification).filter(
        Notification.user_id == str(current_user.id),
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}


router.include_router(base_router)
