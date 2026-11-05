import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

# ==========================================
# WISH SCHEMAS
# ==========================================
class WishBase(BaseModel):
    question: str
    answer: str

class WishCreate(WishBase):
    pass

class WishOut(WishBase):
    id: int
    surprise_id: int

    class Config:
        from_attributes = True


# ==========================================
# MEMORY SCHEMAS
# ==========================================
class MemoryBase(BaseModel):
    image_url: str
    caption: Optional[str] = None

class MemoryCreate(MemoryBase):
    pass

class MemoryOut(MemoryBase):
    id: int
    surprise_id: int
    uploaded_at: datetime.datetime

    class Config:
        from_attributes = True


# ==========================================
# VOICE MESSAGE SCHEMAS
# ==========================================
class VoiceMessageBase(BaseModel):
    audio_url: str
    audio_format: Optional[str] = "audio/webm"
    duration: Optional[float] = 0.0
    title: Optional[str] = "A special voice message for you ❤️"
    cover_image_url: Optional[str] = None

class VoiceMessageCreate(VoiceMessageBase):
    pass

class VoiceMessageOut(VoiceMessageBase):
    id: int
    surprise_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ==========================================
# CUSTOM THEME SCHEMAS
# ==========================================
class CustomThemeBase(BaseModel):
    theme_name: str = "dark-galaxy"
    primary_color: str = "#E85B32"
    secondary_color: str = "#FFBFA8"
    background_color: str = "#170D2D"
    text_color: str = "#FFFFFF"
    accent_color: str = "#FFD166"
    card_background: str = "rgba(255, 255, 255, 0.08)"
    heading_font: str = "Playfair Display"
    body_font: str = "Poppins"
    background_type: str = "starry"
    background_value: str = "radial-gradient(circle at 50% 20%, #2b1055 0%, #170d2d 100%)"
    animation_settings: Optional[str] = '{"balloons":true,"hearts":true,"confetti":true,"fireworks":true,"sparkles":true,"stars":true,"typewriter":true,"glow":true,"intensity":"medium"}'
    music_url: Optional[str] = "happy-birthday"
    custom_settings: Optional[str] = "{}"

class CustomThemeCreate(CustomThemeBase):
    pass

class CustomThemeOut(CustomThemeBase):
    id: int
    surprise_id: int

    class Config:
        from_attributes = True


# ==========================================
# SETTING SCHEMAS (Legacy & compatibility)
# ==========================================
class SettingBase(BaseModel):
    music_enabled: bool = True
    selected_theme: str = "dark-galaxy"
    animation_enabled: bool = True
    selected_music: Optional[str] = "happy-birthday"

class SettingCreate(SettingBase):
    pass

class SettingOut(SettingBase):
    id: int
    surprise_id: int
    selected_music: Optional[str] = "happy-birthday"

    class Config:
        from_attributes = True


# ==========================================
# SHARE LINK & ACCESS SCHEMAS
# ==========================================
class ShareLinkOut(BaseModel):
    id: int
    surprise_id: int
    unique_slug: str
    is_active: bool
    password_protected: bool
    expires_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ShareSettingsUpdate(BaseModel):
    visibility: Optional[str] = "unlisted"  # "unlisted", "password_protected", "private"
    password: Optional[str] = None          # Plain password to be hashed
    expires_at: Optional[str] = None        # ISO string or None
    is_active: Optional[bool] = True

class PasswordVerifyRequest(BaseModel):
    password: str

class AnalyticsOut(BaseModel):
    surprise_id: int
    unique_slug: str
    view_count: int
    last_viewed_at: Optional[datetime.datetime] = None
    is_active: bool
    visibility: str
    expires_at: Optional[datetime.datetime] = None
    is_expired: bool


# ==========================================
# BIRTHDAY SURPRISE SCHEMAS
# ==========================================
class BirthdaySurpriseBase(BaseModel):
    recipient_name: str = Field(..., min_length=1)
    sender_name: str = Field(..., min_length=1)
    relationship: str = Field(..., min_length=1)
    birth_date: Optional[str] = None
    celebration_date: Optional[str] = None
    birthday_message: Optional[str] = None
    birthday_letter: Optional[str] = None

class BirthdaySurpriseCreate(BirthdaySurpriseBase):
    creator_id: Optional[str] = None
    wishes: Optional[List[WishCreate]] = []
    memories: Optional[List[MemoryCreate]] = []
    settings: Optional[SettingCreate] = None
    custom_theme: Optional[CustomThemeCreate] = None
    voice_message: Optional[VoiceMessageCreate] = None
    visibility: Optional[str] = "unlisted"
    password: Optional[str] = None
    expires_at: Optional[str] = None

class BirthdaySurpriseUpdate(BaseModel):
    recipient_name: Optional[str] = None
    sender_name: Optional[str] = None
    relationship: Optional[str] = None
    birth_date: Optional[str] = None
    celebration_date: Optional[str] = None
    birthday_message: Optional[str] = None
    birthday_letter: Optional[str] = None
    wishes: Optional[List[WishCreate]] = None
    memories: Optional[List[MemoryCreate]] = None
    settings: Optional[SettingCreate] = None
    custom_theme: Optional[CustomThemeCreate] = None
    visibility: Optional[str] = None
    password: Optional[str] = None
    expires_at: Optional[str] = None
    is_active: Optional[bool] = None

# Full Creator View (includes everything)
class BirthdaySurpriseOut(BirthdaySurpriseBase):
    id: int
    creator_id: Optional[str] = None
    unique_slug: str
    status: str = "published"
    visibility: str = "unlisted"
    is_active: bool = True
    has_password: bool = False
    expires_at: Optional[datetime.datetime] = None
    view_count: int = 0
    last_viewed_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    wishes: List[WishOut] = []
    memories: List[MemoryOut] = []
    settings: Optional[SettingOut] = None
    voice_message: Optional[VoiceMessageOut] = None
    custom_theme: Optional[CustomThemeOut] = None

    class Config:
        from_attributes = True

# Pure Recipient View (Strictly Clean & Distraction-free)
class RecipientSurpriseOut(BaseModel):
    recipient_name: str
    sender_name: str
    relationship: str
    birth_date: Optional[str] = None
    celebration_date: Optional[str] = None
    birthday_message: Optional[str] = None
    birthday_letter: Optional[str] = None
    wishes: List[WishOut] = []
    memories: List[MemoryOut] = []
    voice_message: Optional[VoiceMessageOut] = None
    custom_theme: Optional[CustomThemeOut] = None
    settings: Optional[SettingOut] = None
    is_password_protected: bool = False

    class Config:
        from_attributes = True


# ==========================================
# AI LETTER GENERATION
# ==========================================
class LetterGenerateRequest(BaseModel):
    recipient_name: str
    sender_name: str
    relationship: str
    style: str = "emotional" # emotional, funny, romantic
    memories_or_notes: Optional[str] = None
    answers: Optional[dict] = None

class LetterGenerateResponse(BaseModel):
    letter: str
    style: str
    suggested_wishes: List[str] = []


# ==========================================
# ADMIN STATS
# ==========================================
class AdminStats(BaseModel):
    total_surprises: int
    total_memories: int
    total_wishes: int
    total_voice_messages: int = 0
    latest_surprises: List[BirthdaySurpriseOut]
