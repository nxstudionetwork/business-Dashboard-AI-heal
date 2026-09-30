from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse
from app.api.v1.base_crud import create_crud_router

router = create_crud_router(
    model=Payment,
    schema_create=PaymentCreate,
    schema_update=PaymentUpdate,
    schema_response=PaymentResponse,
    id_prefix="PAY",
    number_field="payment_number",
)
