from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.api.v1.base_crud import create_crud_router

router = create_crud_router(
    model=Note,
    schema_create=NoteCreate,
    schema_update=NoteUpdate,
    schema_response=NoteResponse,
    id_prefix="NTE",
)
