from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.quotation import Quotation, QuotationItem
from app.models.user import User
from app.schemas.quotation import QuotationCreate, QuotationUpdate, QuotationResponse, QuotationItemCreate, QuotationItemResponse
from app.api.v1.base_crud import create_crud_router, get_current_user


def create_items(db: Session, quotation: Quotation, data: QuotationCreate, user_id: str):
    if data.items:
        for item_data in data.items:
            item = QuotationItem(
                quotation_id=quotation.id,
                description=item_data.description,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                amount=item_data.amount,
            )
            db.add(item)


router = create_crud_router(
    model=Quotation,
    schema_create=QuotationCreate,
    schema_update=QuotationUpdate,
    schema_response=QuotationResponse,
    id_prefix="QUO",
    number_field="quotation_number",
    nested_creator=create_items,
)


@router.get("/{quotation_id}/items", response_model=list[QuotationItemResponse])
async def list_quotation_items(
    quotation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id, Quotation.is_active == True).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return db.query(QuotationItem).filter(QuotationItem.quotation_id == quotation_id).all()


@router.post("/{quotation_id}/items", response_model=QuotationItemResponse, status_code=status.HTTP_201_CREATED)
async def add_quotation_item(
    quotation_id: str,
    data: QuotationItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id, Quotation.is_active == True).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    item = QuotationItem(quotation_id=quotation_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{quotation_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quotation_item(
    quotation_id: str,
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(QuotationItem).filter(
        QuotationItem.id == item_id, QuotationItem.quotation_id == quotation_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return None
