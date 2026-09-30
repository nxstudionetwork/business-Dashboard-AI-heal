import math
from typing import Optional, Type, TypeVar, Any, Callable
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.api.v1.auth import oauth2_scheme
from app.auth.jwt import verify_token
from app.models.user import User
from app.utils.id_generator import IDGenerator

T = TypeVar("T")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def create_crud_router(
    model: Type,
    schema_create: Type[BaseModel],
    schema_update: Type[BaseModel],
    schema_response: Type[BaseModel],
    id_prefix: str,
    number_field: Optional[str] = None,
    nested_creator: Optional[Callable] = None,
) -> APIRouter:
    router = APIRouter()

    @router.get("/", response_model=dict)
    async def list_items(
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        search: Optional[str] = Query(None),
        sort_by: str = Query("created_at"),
        sort_order: str = Query("desc"),
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        query = db.query(model).filter(model.is_active == True)
        if search:
            searchable_cols = [
                c for c in model.__table__.columns
                if c.type.__class__.__name__ in ("String", "Text")
            ]
            if searchable_cols:
                search_filters = []
                for col in searchable_cols:
                    search_filters.append(col.ilike(f"%{search}%"))
                from sqlalchemy import or_
                query = query.filter(or_(*search_filters))
        total = query.count()
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        sort_col = getattr(model, sort_by, None)
        if sort_col is None:
            sort_col = model.created_at
        if sort_order == "desc":
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(sort_col)
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return {
            "items": [schema_response.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    @router.post("/", response_model=schema_response, status_code=status.HTTP_201_CREATED)
    async def create_item(
        data: schema_create,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        item_data = data.model_dump()
        if number_field:
            item_data[number_field] = IDGenerator.generate(id_prefix)
        item = model(**item_data)
        if nested_creator:
            nested_creator(db, item, data, str(current_user.id))
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @router.get("/{item_id}", response_model=schema_response)
    async def get_item(
        item_id: str,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        item = db.query(model).filter(model.id == item_id, model.is_active == True).first()
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        return item

    @router.put("/{item_id}", response_model=schema_response)
    async def update_item(
        item_id: str,
        data: schema_update,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        item = db.query(model).filter(model.id == item_id, model.is_active == True).first()
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(item, key, value)
        db.commit()
        db.refresh(item)
        return item

    @router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def delete_item(
        item_id: str,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        item = db.query(model).filter(model.id == item_id, model.is_active == True).first()
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        item.is_active = False
        db.commit()
        return None

    return router
