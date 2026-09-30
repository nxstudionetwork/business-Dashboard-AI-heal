from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.tag import Tag, EntityTag
from app.models.user import User
from app.schemas.tag import TagCreate, TagUpdate, TagResponse, EntityTagCreate, EntityTagResponse
from app.api.v1.base_crud import create_crud_router, get_current_user

base_router = create_crud_router(
    model=Tag,
    schema_create=TagCreate,
    schema_update=TagUpdate,
    schema_response=TagResponse,
    id_prefix="TAG",
)

router = APIRouter()
router.include_router(base_router)


@router.post("/assign", response_model=EntityTagResponse, status_code=status.HTTP_201_CREATED)
async def assign_tag(
    data: EntityTagCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tag = db.query(Tag).filter(Tag.id == data.tag_id, Tag.is_active == True).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    existing = db.query(EntityTag).filter(
        EntityTag.tag_id == data.tag_id,
        EntityTag.entity_type == data.entity_type,
        EntityTag.entity_id == data.entity_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tag already assigned")
    entity_tag = EntityTag(**data.model_dump())
    db.add(entity_tag)
    db.commit()
    db.refresh(entity_tag)
    return entity_tag


@router.get("/entity/{entity_type}/{entity_id}", response_model=list[TagResponse])
async def get_entity_tags(
    entity_type: str,
    entity_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entity_tags = db.query(EntityTag).filter(
        EntityTag.entity_type == entity_type,
        EntityTag.entity_id == entity_id,
    ).all()
    tag_ids = [et.tag_id for et in entity_tags]
    if not tag_ids:
        return []
    tags = db.query(Tag).filter(Tag.id.in_(tag_ids), Tag.is_active == True).all()
    return tags


@router.delete("/assign/{entity_tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_tag_assignment(
    entity_tag_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entity_tag = db.query(EntityTag).filter(EntityTag.id == entity_tag_id).first()
    if not entity_tag:
        raise HTTPException(status_code=404, detail="Tag assignment not found")
    db.delete(entity_tag)
    db.commit()
    return None
