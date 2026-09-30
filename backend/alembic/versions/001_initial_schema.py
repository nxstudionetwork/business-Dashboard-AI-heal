"""initial_schema

Revision ID: 001
Revises: 
Create Date: 2026-07-14

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), server_default='user'),
        sa.Column('avatar', sa.String(500), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # leads
    op.create_table(
        'leads',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('lead_number', sa.String(50), unique=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('company', sa.String(255), nullable=True),
        sa.Column('source', sa.String(100), nullable=True),
        sa.Column('status', sa.String(50), server_default='New'),
        sa.Column('value', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('assigned_to', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('converted_to_client_id', sa.String(36), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_leads_status', 'leads', ['status'])
    op.create_index('ix_leads_assigned_to', 'leads', ['assigned_to'])

    # clients
    op.create_table(
        'clients',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('client_number', sa.String(50), unique=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('alternate_phone', sa.String(50), nullable=True),
        sa.Column('company', sa.String(255), nullable=True),
        sa.Column('designation', sa.String(255), nullable=True),
        sa.Column('website', sa.String(500), nullable=True),
        sa.Column('gst', sa.String(50), nullable=True),
        sa.Column('pan', sa.String(50), nullable=True),
        sa.Column('business_type', sa.String(100), nullable=True),
        sa.Column('industry', sa.String(100), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('state', sa.String(100), nullable=True),
        sa.Column('pincode', sa.String(20), nullable=True),
        sa.Column('country', sa.String(100), server_default='India'),
        sa.Column('status', sa.String(50), server_default='Active'),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_vip', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('is_favorite', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_clients_status', 'clients', ['status'])

    # projects
    op.create_table(
        'projects',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_number', sa.String(50), unique=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('client_id', sa.String(36), sa.ForeignKey('clients.id'), nullable=False),
        sa.Column('client_name', sa.String(255), nullable=True),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('status', sa.String(50), server_default='Planning'),
        sa.Column('priority', sa.String(50), server_default='Medium'),
        sa.Column('budget', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('actual_cost', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('profit_margin', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('health', sa.String(20), server_default='On Track'),
        sa.Column('risk_level', sa.String(20), server_default='Low'),
        sa.Column('progress', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_pinned', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_projects_client_id', 'projects', ['client_id'])
    op.create_index('ix_projects_status', 'projects', ['status'])

    # project_milestones
    op.create_table(
        'project_milestones',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(50), server_default='Pending'),
        sa.Column('is_completed', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_project_milestones_project_id', 'project_milestones', ['project_id'])

    # quotations
    op.create_table(
        'quotations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('quotation_number', sa.String(50), unique=True, nullable=False),
        sa.Column('client_id', sa.String(36), sa.ForeignKey('clients.id'), nullable=True),
        sa.Column('client_name', sa.String(255), nullable=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id'), nullable=True),
        sa.Column('project_name', sa.String(255), nullable=True),
        sa.Column('issue_date', sa.Date(), nullable=True),
        sa.Column('valid_until', sa.Date(), nullable=True),
        sa.Column('status', sa.String(50), server_default='Draft'),
        sa.Column('subtotal', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('tax_rate', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('tax_amount', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('total', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_quotations_client_id', 'quotations', ['client_id'])
    op.create_index('ix_quotations_project_id', 'quotations', ['project_id'])
    op.create_index('ix_quotations_status', 'quotations', ['status'])

    # quotation_items
    op.create_table(
        'quotation_items',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('quotation_id', sa.String(36), sa.ForeignKey('quotations.id'), nullable=False),
        sa.Column('description', sa.String(500), nullable=False),
        sa.Column('quantity', sa.Float(), server_default=sa.text('1.0')),
        sa.Column('unit_price', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('amount', sa.Float(), server_default=sa.text('0.0')),
    )
    op.create_index('ix_quotation_items_quotation_id', 'quotation_items', ['quotation_id'])

    # invoices
    op.create_table(
        'invoices',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('invoice_number', sa.String(50), unique=True, nullable=False),
        sa.Column('client_id', sa.String(36), sa.ForeignKey('clients.id'), nullable=True),
        sa.Column('client_name', sa.String(255), nullable=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id'), nullable=True),
        sa.Column('project_name', sa.String(255), nullable=True),
        sa.Column('issue_date', sa.Date(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(50), server_default='Pending'),
        sa.Column('subtotal', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('tax_rate', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('tax_amount', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('total', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('amount_paid', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('balance_due', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_invoices_client_id', 'invoices', ['client_id'])
    op.create_index('ix_invoices_project_id', 'invoices', ['project_id'])
    op.create_index('ix_invoices_status', 'invoices', ['status'])

    # invoice_items
    op.create_table(
        'invoice_items',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('invoice_id', sa.String(36), sa.ForeignKey('invoices.id'), nullable=False),
        sa.Column('description', sa.String(500), nullable=False),
        sa.Column('quantity', sa.Float(), server_default=sa.text('1.0')),
        sa.Column('unit_price', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('amount', sa.Float(), server_default=sa.text('0.0')),
    )
    op.create_index('ix_invoice_items_invoice_id', 'invoice_items', ['invoice_id'])

    # payments
    op.create_table(
        'payments',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('payment_number', sa.String(50), unique=True, nullable=False),
        sa.Column('invoice_id', sa.String(36), sa.ForeignKey('invoices.id'), nullable=True),
        sa.Column('invoice_number', sa.String(50), nullable=True),
        sa.Column('client_id', sa.String(36), nullable=True),
        sa.Column('client_name', sa.String(255), nullable=True),
        sa.Column('amount', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('method', sa.String(100), nullable=True),
        sa.Column('reference', sa.String(255), nullable=True),
        sa.Column('date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(50), server_default='Completed'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_payments_invoice_id', 'payments', ['invoice_id'])

    # expenses
    op.create_table(
        'expenses',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('expense_number', sa.String(50), unique=True, nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('amount', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('date', sa.Date(), nullable=True),
        sa.Column('vendor', sa.String(255), nullable=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id'), nullable=True),
        sa.Column('project_name', sa.String(255), nullable=True),
        sa.Column('payment_method', sa.String(100), nullable=True),
        sa.Column('receipt', sa.String(500), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_expenses_project_id', 'expenses', ['project_id'])
    op.create_index('ix_expenses_category', 'expenses', ['category'])

    # documents
    op.create_table(
        'documents',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('document_number', sa.String(50), unique=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('folder', sa.String(255), nullable=True),
        sa.Column('file_type', sa.String(50), nullable=True),
        sa.Column('file_size', sa.Float(), server_default=sa.text('0.0')),
        sa.Column('file_path', sa.String(500), nullable=True),
        sa.Column('client_id', sa.String(36), sa.ForeignKey('clients.id'), nullable=True),
        sa.Column('client_name', sa.String(255), nullable=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id'), nullable=True),
        sa.Column('project_name', sa.String(255), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('version', sa.String(20), server_default='v1'),
        sa.Column('is_favorite', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_documents_client_id', 'documents', ['client_id'])
    op.create_index('ix_documents_project_id', 'documents', ['project_id'])

    # calendar_events
    op.create_table(
        'calendar_events',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('time', sa.Time(), nullable=True),
        sa.Column('end_time', sa.Time(), nullable=True),
        sa.Column('event_type', sa.String(50), server_default='Meeting'),
        sa.Column('related_to', sa.String(100), nullable=True),
        sa.Column('related_id', sa.String(36), nullable=True),
        sa.Column('color', sa.String(50), nullable=True),
        sa.Column('is_all_day', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_calendar_events_date', 'calendar_events', ['date'])

    # notes
    op.create_table(
        'notes',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('type', sa.String(50), server_default='General'),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('color', sa.String(50), nullable=True),
        sa.Column('is_pinned', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('is_favorite', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('type', sa.String(100), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('related_to', sa.String(100), nullable=True),
        sa.Column('related_id', sa.String(36), nullable=True),
        sa.Column('is_read', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])

    # activities
    op.create_table(
        'activities',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('entity_type', sa.String(100), nullable=True),
        sa.Column('entity_id', sa.String(36), nullable=True),
        sa.Column('activity_metadata', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_activities_user_id', 'activities', ['user_id'])
    op.create_index('ix_activities_entity', 'activities', ['entity_type', 'entity_id'])

    # tags
    op.create_table(
        'tags',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(100), unique=True, nullable=False),
        sa.Column('color', sa.String(50), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # entity_tags
    op.create_table(
        'entity_tags',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tag_id', sa.String(36), sa.ForeignKey('tags.id'), nullable=False),
        sa.Column('entity_type', sa.String(100), nullable=False),
        sa.Column('entity_id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_entity_tags_tag_id', 'entity_tags', ['tag_id'])
    op.create_index('ix_entity_tags_entity', 'entity_tags', ['entity_type', 'entity_id'])

    # settings
    op.create_table(
        'settings',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('key', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('value', sa.Text(), nullable=True),
        sa.Column('group', sa.String(100), server_default='general'),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('settings')
    op.drop_table('entity_tags')
    op.drop_table('tags')
    op.drop_table('activities')
    op.drop_table('notifications')
    op.drop_table('notes')
    op.drop_table('calendar_events')
    op.drop_table('documents')
    op.drop_table('expenses')
    op.drop_table('payments')
    op.drop_table('invoice_items')
    op.drop_table('invoices')
    op.drop_table('quotation_items')
    op.drop_table('quotations')
    op.drop_table('project_milestones')
    op.drop_table('projects')
    op.drop_table('clients')
    op.drop_table('leads')
    op.drop_table('users')
