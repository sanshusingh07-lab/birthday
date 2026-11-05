import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

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


class SettingBase(BaseModel):
    music_enabled: bool = True
    selected_theme: str = "cosmic-purple"
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


class BirthdaySurpriseBase(BaseModel):
    recipient_name: str = Field(..., min_length=1)
    sender_name: str = Field(..., min_length=1)
    relationship: str = Field(..., min_length=1)
    birth_date: Optional[str] = None
    celebration_date: Optional[str] = None
    birthday_message: Optional[str] = None
    birthday_letter: Optional[str] = None

class BirthdaySurpriseCreate(BirthdaySurpriseBase):
    wishes: Optional[List[WishCreate]] = []
    memories: Optional[List[MemoryCreate]] = []
    settings: Optional[SettingCreate] = None

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

class BirthdaySurpriseOut(BirthdaySurpriseBase):
    id: int
    unique_slug: str
    created_at: datetime.datetime
    wishes: List[WishOut] = []
    memories: List[MemoryOut] = []
    settings: Optional[SettingOut] = None

    class Config:
        from_attributes = True


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


class AdminStats(BaseModel):
    total_surprises: int
    total_memories: int
    total_wishes: int
    latest_surprises: List[BirthdaySurpriseOut]
