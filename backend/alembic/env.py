# Important Points
# sys.path.append(os.getcwd()): This is critical. It adds your project's root directory to the Python path so that
# Alembic can find your database.py and model definitions. If you do not do this Alembic will not be able to locate your files!

# Import Base and Models: Ensure that you are importing the Base class and all of your SQLAlchemy model classes (e.g., User, UserProfile).
# Alembic needs to know about these models to track changes.

# Target Metadata: Check and make sure that target_metadata = Base.metadata is uncommented so it generates the proper version

# DATABASE_URL: Check and make sure that you can connect to your database.

# target_metadata = Base.metadata: This tells Alembic to track the metadata defined by your Base class (i.e., your database schema).

from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
import os
import sys
from logging.config import fileConfig

from sqlalchemy import create_engine
from sqlalchemy import pool

from alembic import context

# Add the project root directory to the Python path
sys.path.append(os.getcwd())  # This is crucial!

# Import your SQLAlchemy Base and model definitions
# Import Base
from database.database import Base
# UPDATE THIS WITH DATA MODELS AS NEEDED!!!
from app.datamodels.datamodels import User, UserProfile, Session
from database.database import DATABASE_URL

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
#config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
# remove this since we will manually be using
# this configuration from the database directory
#if config.config_file_name is not None:
#    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
# get the value of 'target_metadata' from the Alembic configuration.
# this is the thing that Alembic compares against when generating revisions.
#
# We added import of models to use in the metadata
target_metadata = Base.metadata
#target_metadata = None

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = create_engine(DATABASE_URL)

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
