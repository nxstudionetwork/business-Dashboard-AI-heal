from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.api.v1.base_crud import create_crud_router

router = create_crud_router(
    model=Expense,
    schema_create=ExpenseCreate,
    schema_update=ExpenseUpdate,
    schema_response=ExpenseResponse,
    id_prefix="EXP",
    number_field="expense_number",
)
