import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./birthday.db")

# Render/Supabase compatibility:
# Map postgres:// and plain postgresql:// to postgresql+psycopg2://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

try:
    if DATABASE_URL.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        engine = create_engine(DATABASE_URL, connect_args=connect_args)
    else:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            pool_size=10,
            max_overflow=20
        )
except Exception as e:
    print(f"Warning: Failed to initialize primary database ({e}). Falling back to SQLite.")
    DATABASE_URL = "sqlite:///./birthday.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def run_auto_migrations(target_engine):
    """
    Ensure all columns exist in database tables across PostgreSQL and SQLite.
    Prevents UndefinedColumn errors on deployed environments (e.g. Render)
    where database was created prior to recent schema additions.
    """
    from sqlalchemy import inspect, text
    try:
        # First ensure all tables exist
        Base.metadata.create_all(bind=target_engine)
        
        inspector = inspect(target_engine)
        existing_tables = set(inspector.get_table_names())
        
        column_migrations = [
            ("birthday_surprises", "creator_id", "VARCHAR(120)"),
            ("birthday_surprises", "password_hash", "VARCHAR(255)"),
            ("birthday_surprises", "expires_at", "TIMESTAMP"),
            ("birthday_surprises", "view_count", "INTEGER DEFAULT 0"),
            ("birthday_surprises", "last_viewed_at", "TIMESTAMP"),
            ("birthday_surprises", "status", "VARCHAR(30) DEFAULT 'published'"),
            ("birthday_surprises", "visibility", "VARCHAR(30) DEFAULT 'unlisted'"),
            ("birthday_surprises", "is_active", "BOOLEAN DEFAULT TRUE"),
            ("memories", "image_data", "TEXT"),
            ("memories", "caption", "VARCHAR(255)"),
            ("voice_messages", "audio_data", "TEXT"),
            ("voice_messages", "cover_image_url", "TEXT"),
            ("voice_messages", "audio_format", "VARCHAR(100) DEFAULT 'audio/webm'"),
            ("custom_themes", "custom_settings", "TEXT DEFAULT '{}'"),
            ("custom_themes", "animation_settings", "TEXT DEFAULT '{}'"),
            ("share_links", "password_protected", "BOOLEAN DEFAULT FALSE"),
            ("share_links", "expires_at", "TIMESTAMP"),
            ("share_links", "is_active", "BOOLEAN DEFAULT TRUE"),
            ("users", "password_hash", "VARCHAR(255)")
        ]
        
        with target_engine.begin() as conn:
            for table, col, col_type in column_migrations:
                if table in existing_tables:
                    existing_cols = {c['name'] for c in inspector.get_columns(table)}
                    if col not in existing_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                            print(f"[Migration] Added missing column '{col}' to table '{table}'")
                        except Exception as ex:
                            print(f"[Migration Notice] Column '{col}' in '{table}': {ex}")
    except Exception as e:
        print(f"[Migration Warning] Auto-migration check: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
