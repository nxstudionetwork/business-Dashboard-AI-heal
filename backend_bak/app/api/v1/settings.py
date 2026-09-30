from fastapi import APIRouter
from app.models.settings import Setting
from app.schemas.settings import SettingCreate, SettingUpdate, SettingResponse
from app.api.v1.base_crud import create_crud_router

base_router = create_crud_router(
    model=Setting,
    schema_create=SettingCreate,
    schema_update=SettingUpdate,
    schema_response=SettingResponse,
    id_prefix="SET",
)

router = APIRouter()
router.include_router(base_router)
