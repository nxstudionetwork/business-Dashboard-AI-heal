from app.schemas.common import PaginationParams, PaginatedResponse, MessageResponse, ErrorResponse
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectMilestoneCreate, ProjectMilestoneResponse
from app.schemas.quotation import QuotationCreate, QuotationUpdate, QuotationResponse, QuotationItemCreate, QuotationItemResponse
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceItemCreate, InvoiceItemResponse
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse
from app.schemas.calendar import CalendarEventCreate, CalendarEventUpdate, CalendarEventResponse
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.schemas.notification import NotificationCreate, NotificationUpdate, NotificationResponse
from app.schemas.tag import TagCreate, TagUpdate, TagResponse, EntityTagCreate, EntityTagResponse
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.schemas.setting import SettingCreate, SettingUpdate, SettingResponse
