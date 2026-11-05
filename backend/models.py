import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship as orm_relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class BirthdaySurprise(Base):
    __tablename__ = "birthday_surprises"

    id = Column(Integer, primary_key=True, index=True)
    unique_slug = Column(String(100), unique=True, index=True, nullable=False)
    recipient_name = Column(String(120), nullable=False)
    sender_name = Column(String(120), nullable=False)
    relationship = Column(String(60), nullable=False)
    birth_date = Column(String(50), nullable=True)
    celebration_date = Column(String(50), nullable=True)
    birthday_message = Column(Text, nullable=True)
    birthday_letter = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    wishes = orm_relationship("BirthdayWish", back_populates="surprise", cascade="all, delete-orphan")
    memories = orm_relationship("Memory", back_populates="surprise", cascade="all, delete-orphan")
    settings = orm_relationship("Setting", back_populates="surprise", uselist=False, cascade="all, delete-orphan")


class BirthdayWish(Base):
    __tablename__ = "birthday_wishes"

    id = Column(Integer, primary_key=True, index=True)
    surprise_id = Column(Integer, ForeignKey("birthday_surprises.id", ondelete="CASCADE"), nullable=False)
    question = Column(String(255), nullable=False)
    answer = Column(Text, nullable=False)

    surprise = orm_relationship("BirthdaySurprise", back_populates="wishes")


class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    surprise_id = Column(Integer, ForeignKey("birthday_surprises.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    caption = Column(String(255), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    surprise = orm_relationship("BirthdaySurprise", back_populates="memories")


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    surprise_id = Column(Integer, ForeignKey("birthday_surprises.id", ondelete="CASCADE"), nullable=False)
    music_enabled = Column(Boolean, default=True)
    selected_theme = Column(String(60), default="cosmic-purple")
    animation_enabled = Column(Boolean, default=True)
    selected_music = Column(String(60), default="happy-birthday")

    surprise = orm_relationship("BirthdaySurprise", back_populates="settings")
