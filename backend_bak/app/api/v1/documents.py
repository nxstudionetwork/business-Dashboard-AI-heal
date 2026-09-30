from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse
from app.api.v1.base_crud import create_crud_router

router = create_crud_router(
    model=Document,
    schema_create=DocumentCreate,
    schema_update=DocumentUpdate,
    schema_response=DocumentResponse,
    id_prefix="DOC",
    number_field="document_number",
)
