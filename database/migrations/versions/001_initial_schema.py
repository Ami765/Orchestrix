"""Initial schema definition for Orchestrix

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-07-07 03:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Enable UUID Extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # 2. Create update_modified_column helper trigger function
    op.execute("""
    CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """)

    # 3. Create Users Table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='analyst'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_is_active', 'users', ['is_active'])

    # Apply modified trigger to Users
    op.execute("""
    CREATE TRIGGER update_users_modtime
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    """)

    # 4. Create Workflows Table
    op.create_table(
        'workflows',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('is_template', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )
    op.create_index('idx_workflows_created_by', 'workflows', ['created_by'])
    op.create_index('idx_workflows_name', 'workflows', ['name'])
    op.create_index('idx_workflows_metadata', 'workflows', ['metadata'], postgresql_using='gin')

    # Apply modified trigger to Workflows
    op.execute("""
    CREATE TRIGGER update_workflows_modtime
        BEFORE UPDATE ON workflows
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    """)

    # 5. Create Agents Table
    op.create_table(
        'agents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('name', sa.String(length=100), nullable=False, unique=True),
        sa.Column('role', sa.String(length=100), nullable=False),
        sa.Column('base_temperature', sa.Numeric(precision=3, scale=2), nullable=True, server_default='0.20'),
        sa.Column('cognitive_depth', sa.String(length=50), nullable=False, server_default='high'),
        sa.Column('memory_context_size', sa.String(length=50), nullable=False, server_default='128k'),
        sa.Column('system_instruction', sa.Text(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )
    op.create_index('idx_agents_name', 'agents', ['name'])
    op.create_index('idx_agents_is_active', 'agents', ['is_active'])

    # Apply modified trigger to Agents
    op.execute("""
    CREATE TRIGGER update_agents_modtime
        BEFORE UPDATE ON agents
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    """)

    # 6. Create Workflow-Agents Association Table (M2M)
    op.create_table(
        'workflow_agents',
        sa.Column('workflow_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('workflows.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('agents.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('execution_order', sa.Integer(), nullable=False),
        sa.UniqueConstraint('workflow_id', 'execution_order', name='unique_workflow_agent_order')
    )
    op.create_index('idx_workflow_agents_workflow', 'workflow_agents', ['workflow_id'])
    op.create_index('idx_workflow_agents_agent', 'workflow_agents', ['agent_id'])

    # 7. Create Analysis Results Table
    op.create_table(
        'analysis_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('input_text', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('risk_rating', sa.String(length=50), nullable=False, server_default='low'),
        sa.Column('workflow_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('workflows.id', ondelete='SET NULL'), nullable=True),
        sa.Column('executed_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('agent_logs', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('final_report', sa.Text(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'))
    )
    op.create_index('idx_analysis_results_workflow', 'analysis_results', ['workflow_id'])
    op.create_index('idx_analysis_results_executed_by', 'analysis_results', ['executed_by'])
    op.create_index('idx_analysis_results_status', 'analysis_results', ['status'])
    op.create_index('idx_analysis_results_risk', 'analysis_results', ['risk_rating'])
    op.create_index('idx_analysis_results_created_at', 'analysis_results', ['created_at'])
    op.create_index('idx_analysis_results_metadata', 'analysis_results', ['metadata'], postgresql_using='gin')

    # Apply modified trigger to Analysis Results
    op.execute("""
    CREATE TRIGGER update_analysis_results_modtime
        BEFORE UPDATE ON analysis_results
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    """)


def downgrade() -> None:
    # Drop updated_at triggers
    op.execute("DROP TRIGGER IF EXISTS update_analysis_results_modtime ON analysis_results")
    op.execute("DROP TRIGGER IF EXISTS update_workflow_agents_modtime ON workflow_agents")
    op.execute("DROP TRIGGER IF EXISTS update_agents_modtime ON agents")
    op.execute("DROP TRIGGER IF EXISTS update_workflows_modtime ON workflows")
    op.execute("DROP TRIGGER IF EXISTS update_users_modtime ON users")

    # Drop Tables in reverse dependency order
    op.drop_table('analysis_results')
    op.drop_table('workflow_agents')
    op.drop_table('agents')
    op.drop_table('workflows')
    op.drop_table('users')

    # Drop custom functions
    op.execute("DROP FUNCTION IF EXISTS update_modified_column()")
