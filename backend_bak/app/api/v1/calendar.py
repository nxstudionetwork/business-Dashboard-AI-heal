from app.models.calendar import CalendarEvent
from app.schemas.calendar import CalendarEventCreate, CalendarEventUpdate, CalendarEventResponse
from app.api.v1.base_crud import create_crud_router

router = create_crud_router(
    model=CalendarEvent,
    schema_create=CalendarEventCreate,
    schema_update=CalendarEventUpdate,
    schema_response=CalendarEventResponse,
    id_prefix="CAL",
)
