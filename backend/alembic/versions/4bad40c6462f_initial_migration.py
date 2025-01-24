"""Initial migration

Revision ID: 4bad40c6462f
Revises: 
Create Date: 2025-01-23 12:39:45.407958

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '4bad40c6462f'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('sessions', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('sessions', 'created_at',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.alter_column('sessions', 'expires_at',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=False)
    op.create_index(op.f('ix_sessions_session_id'), 'sessions', ['session_id'], unique=False)
    op.drop_constraint('sessions_user_id_fkey', 'sessions', type_='foreignkey')
    op.create_foreign_key(None, 'sessions', 'users', ['user_id'], ['user_id'])
    op.alter_column('user_profile', 'username',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)
    op.alter_column('user_profile', 'date_joined',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.alter_column('user_profile', 'last_active',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.create_foreign_key(None, 'user_profile', 'users', ['user_id'], ['user_id'])
    op.drop_column('user_profile', 'role')
    op.drop_column('user_profile', 'plan_ip_cnt')
    op.drop_column('user_profile', 'goals')
    op.drop_column('user_profile', 'plan_cnt')
    op.drop_column('user_profile', 'gender')
    op.drop_column('user_profile', 'logon_time')
    op.drop_column('user_profile', 'is_instructor')
    op.drop_column('user_profile', 'sex')
    op.drop_column('user_profile', 'plan_comp_cnt')
    op.drop_column('user_profile', 'is_admin')
    op.alter_column('users', 'created_at',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.alter_column('users', 'updated_at',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.create_index(op.f('ix_users_user_id'), 'users', ['user_id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_users_user_id'), table_name='users')
    op.alter_column('users', 'updated_at',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.alter_column('users', 'created_at',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.add_column('user_profile', sa.Column('is_admin', sa.BOOLEAN(), server_default=sa.text('false'), autoincrement=False, nullable=True))
    op.add_column('user_profile', sa.Column('plan_comp_cnt', sa.INTEGER(), server_default=sa.text('0'), autoincrement=False, nullable=True))
    op.add_column('user_profile', sa.Column('sex', sa.VARCHAR(length=1), autoincrement=False, nullable=True))
    op.add_column('user_profile', sa.Column('is_instructor', sa.BOOLEAN(), server_default=sa.text('false'), autoincrement=False, nullable=True))
    op.add_column('user_profile', sa.Column('logon_time', postgresql.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), autoincrement=False, nullable=True))
    op.add_column('user_profile', sa.Column('gender', sa.VARCHAR(length=10), autoincrement=False, nullable=True))
    op.add_column('user_profile', sa.Column('plan_cnt', sa.INTEGER(), server_default=sa.text('0'), autoincrement=False, nullable=True))
    op.add_column('user_profile', sa.Column('goals', sa.TEXT(), autoincrement=False, nullable=True))
    op.add_column('user_profile', sa.Column('plan_ip_cnt', sa.INTEGER(), server_default=sa.text('0'), autoincrement=False, nullable=True))
    op.add_column('user_profile', sa.Column('role', sa.VARCHAR(length=50), server_default=sa.text("'user'::character varying"), autoincrement=False, nullable=True))
    op.drop_constraint(None, 'user_profile', type_='foreignkey')
    op.alter_column('user_profile', 'last_active',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.alter_column('user_profile', 'date_joined',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.alter_column('user_profile', 'username',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)
    op.drop_constraint(None, 'sessions', type_='foreignkey')
    op.create_foreign_key('sessions_user_id_fkey', 'sessions', 'users', ['user_id'], ['user_id'], ondelete='CASCADE')
    op.drop_index(op.f('ix_sessions_session_id'), table_name='sessions')
    op.alter_column('sessions', 'expires_at',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=False)
    op.alter_column('sessions', 'created_at',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.alter_column('sessions', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    # ### end Alembic commands ###
