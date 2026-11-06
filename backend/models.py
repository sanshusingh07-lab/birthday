import datetime
import json
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
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
    creator_id = Column(String(120), index=True, nullable=True)
    unique_slug = Column(String(100), unique=True, index=True, nullable=False)
    recipient_name = Column(String(120), nullable=False)
    sender_name = Column(String(120), nullable=False)
    relationship = Column(String(60), nullable=False)
    birth_date = Column(String(50), nullable=True)
    celebration_date = Column(String(50), nullable=True)
    birthday_message = Column(Text, nullable=True)
    birthday_letter = Column(Text, nullable=True)
    
    # Status & Access Control
    status = Column(String(30), default="published")
    visibility = Column(String(30), default="unlisted")
    password_hash = Column(String(255), nullable=True)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Analytics
    view_count = Column(Integer, default=0)
    last_viewed_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    wishes = orm_relationship("BirthdayWish", back_populates="surprise", cascade="all, delete-orphan")
    memories = orm_relationship("Memory", back_populates="surprise", cascade="all, delete-orphan")
    settings = orm_relationship("Setting", back_populates="surprise", uselist=False, cascade="all, delete-orphan")
    voice_message = orm_relationship("VoiceMessage", back_populates="surprise", uselist=False, cascade="all, delete-orphan")
    custom_theme = orm_relationship("CustomTheme", back_populates="surprise", uselist=False, cascade="all, delete-orphan")
    share_links = orm_relationship("ShareLink", back_populates="surprise", cascade="all, delete-orphan")


class VoiceMessage(Base):
    __tablename__ = "voice_messages"

    id = Column(Integer, primary_key=True, index=True)
    surprise_id = Column(Integer, ForeignKey("birthday_surprises.id", ondelete="CASCADE"), nullable=False, unique=True)
    audio_url = Column(Text, nullable=False)
    audio_format = Column(String(100), default="audio/webm")
    duration = Column(Float, default=0.0)
    title = Column(String(255), default="A special voice message for you ❤️")
    cover_image_url = Column(Text, nullable=True)
    audio_data = Column(Text, nullable=True)  # Base64 persistence in database
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    surprise = orm_relationship("BirthdaySurprise", back_populates="voice_message")


class CustomTheme(Base):
    __tablename__ = "custom_themes"

    id = Column(Integer, primary_key=True, index=True)
    surprise_id = Column(Integer, ForeignKey("birthday_surprises.id", ondelete="CASCADE"), nullable=False, unique=True)
    theme_name = Column(String(60), default="dark-galaxy")
    primary_color = Column(String(30), default="#E85B32")
    secondary_color = Column(String(30), default="#FFBFA8")
    background_color = Column(String(30), default="#170D2D")
    text_color = Column(String(30), default="#FFFFFF")
    accent_color = Column(String(30), default="#FFD166")
    card_background = Column(String(60), default="rgba(255, 255, 255, 0.08)")
    heading_font = Column(String(60), default="Playfair Display")
    body_font = Column(String(60), default="Poppins")
    background_type = Column(String(40), default="starry")
    background_value = Column(String(255), default="radial-gradient(circle at 50% 20%, #2b1055 0%, #170d2d 100%)")
    animation_settings = Column(Text, default='{"balloons":true,"hearts":true,"confetti":true,"fireworks":true,"sparkles":true,"stars":true,"typewriter":true,"glow":true,"intensity":"medium"}')
    music_url = Column(String(255), default="happy-birthday")
    custom_settings = Column(Text, default='{}')

    surprise = orm_relationship("BirthdaySurprise", back_populates="custom_theme")


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
    image_url = Column(Text, nullable=False)
    image_data = Column(Text, nullable=True)  # Base64 persistence in database
    caption = Column(String(255), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    surprise = orm_relationship("BirthdaySurprise", back_populates="memories")


class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(Integer, primary_key=True, index=True)
    surprise_id = Column(Integer, ForeignKey("birthday_surprises.id", ondelete="CASCADE"), nullable=False)
    unique_slug = Column(String(100), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    password_protected = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    surprise = orm_relationship("BirthdaySurprise", back_populates="share_links")


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    surprise_id = Column(Integer, ForeignKey("birthday_surprises.id", ondelete="CASCADE"), nullable=False)
    music_enabled = Column(Boolean, default=True)
    selected_theme = Column(String(60), default="dark-galaxy")
    animation_enabled = Column(Boolean, default=True)
    selected_music = Column(String(60), default="happy-birthday")

    surprise = orm_relationship("BirthdaySurprise", back_populates="settings")


class PersistentMedia(Base):
    __tablename__ = "persistent_media"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), unique=True, index=True, nullable=False)
    media_type = Column(String(50), nullable=False)  # "image", "voice"
    content_type = Column(String(100), nullable=False)
    data_base64 = Column(Text, nullable=False)  # Never lost even on container rebuilds!
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
