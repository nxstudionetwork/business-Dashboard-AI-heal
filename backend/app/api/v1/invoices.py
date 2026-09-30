from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.invoice import Invoice, InvoiceItem
from app.models.user import User
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceItemCreate, InvoiceItemResponse
from app.api.v1.base_crud import create_crud_router, get_current_user


def create_items(db: Session, invoice: Invoice, data: InvoiceCreate, user_id: str):
    if data.items:
        for item_data in data.items:
            item = InvoiceItem(
                invoice_id=invoice.id,
                description=item_data.description,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                amount=item_data.amount,
            )
            db.add(item)


router = create_crud_router(
    model=Invoice,
    schema_create=InvoiceCreate,
    schema_update=InvoiceUpdate,
    schema_response=InvoiceResponse,
    id_prefix="INV",
    number_field="invoice_number",
    nested_creator=create_items,
)


@router.get("/{invoice_id}/items", response_model=list[InvoiceItemResponse])
async def list_invoice_items(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.is_active == True).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice_id).all()


@router.post("/{invoice_id}/items", response_model=InvoiceItemResponse, status_code=status.HTTP_201_CREATED)
async def add_invoice_item(
    invoice_id: str,
    data: InvoiceItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.is_active == True).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    item = InvoiceItem(invoice_id=invoice_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{invoice_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice_item(
    invoice_id: str,
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(InvoiceItem).filter(
        InvoiceItem.id == item_id, InvoiceItem.invoice_id == invoice_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return None
