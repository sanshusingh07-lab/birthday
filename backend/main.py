import os
import uuid
import re
import shutil
import secrets
import hashlib
import datetime
import json
import base64
import mimetypes
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status, Header
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import engine, Base, get_db, run_auto_migrations
import models
import schemas
from ai_service import generate_letter_with_ai, READY_MADE_WISHES

# Ensure database tables and columns exist across Render/PostgreSQL/SQLite
run_auto_migrations(engine)

# Upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
VOICE_DIR = os.path.join(UPLOAD_DIR, "voice")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VOICE_DIR, exist_ok=True)

# Optional Cloudinary Support
CLOUDINARY_CONFIGURED = False
try:
    import cloudinary
    import cloudinary.uploader
    cloudinary_url = os.getenv("CLOUDINARY_URL")
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    if cloudinary_url or cloud_name:
        if cloud_name:
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=os.getenv("CLOUDINARY_API_KEY"),
                api_secret=os.getenv("CLOUDINARY_API_SECRET"),
                secure=True
            )
        CLOUDINARY_CONFIGURED = True
except Exception as e:
    print(f"Cloudinary notice: {e}")

app = FastAPI(
    title="Birthday Surprise Platform API",
    description="Backend API for creating, customizing, and sharing personalized birthday surprises with voice messages and custom themes",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def save_persistent_media(filename: str, media_type: str, content_type: str, raw_bytes: bytes, db: Session) -> str:
    """Save raw media bytes to local disk cache AND PostgreSQL PersistentMedia table for 100% durability across Render restarts."""
    target_dir = VOICE_DIR if media_type == "voice" else UPLOAD_DIR
    os.makedirs(target_dir, exist_ok=True)
    file_path = os.path.join(target_dir, filename)
    try:
        with open(file_path, "wb") as f:
            f.write(raw_bytes)
    except Exception as e:
        print(f"Disk cache write notice: {e}")

    b64_str = base64.b64encode(raw_bytes).decode("utf-8")
    existing = db.query(models.PersistentMedia).filter(models.PersistentMedia.filename == filename).first()
    if existing:
        existing.data_base64 = b64_str
        existing.content_type = content_type
        existing.media_type = media_type
    else:
        new_pm = models.PersistentMedia(
            filename=filename,
            media_type=media_type,
            content_type=content_type,
            data_base64=b64_str
        )
        db.add(new_pm)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"PersistentMedia commit notice: {e}")
    return b64_str


@app.get("/uploads/{media_path:path}")
async def serve_uploaded_media(media_path: str, db: Session = Depends(get_db)):
    """Dynamically serve uploaded photos and voice recordings from disk cache or PostgreSQL persistent storage."""
    file_path = os.path.join(UPLOAD_DIR, media_path)
    if os.path.isfile(file_path):
        mtype, _ = mimetypes.guess_type(file_path)
        return FileResponse(file_path, media_type=mtype or "application/octet-stream")

    fname = os.path.basename(media_path)
    # 1. Check PersistentMedia table
    pm = db.query(models.PersistentMedia).filter(models.PersistentMedia.filename == fname).first()
    if pm and pm.data_base64:
        try:
            raw_bytes = base64.b64decode(pm.data_base64)
            try:
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, "wb") as f:
                    f.write(raw_bytes)
            except Exception:
                pass
            return Response(
                content=raw_bytes,
                media_type=pm.content_type or "application/octet-stream",
                headers={"Cache-Control": "public, max-age=86400"}
            )
        except Exception as e:
            print(f"Error serving persistent media {fname}: {e}")

    # 2. Check Memory image_data
    mem = db.query(models.Memory).filter(models.Memory.image_url.like(f"%{fname}%")).first()
    if mem and mem.image_data:
        try:
            raw_data = mem.image_data.split(",", 1)[1] if "," in mem.image_data else mem.image_data
            raw_bytes = base64.b64decode(raw_data)
            return Response(content=raw_bytes, media_type="image/jpeg", headers={"Cache-Control": "public, max-age=86400"})
        except Exception:
            pass

    # 3. Check VoiceMessage audio_data
    vm = db.query(models.VoiceMessage).filter(models.VoiceMessage.audio_url.like(f"%{fname}%")).first()
    if vm and vm.audio_data:
        try:
            raw_data = vm.audio_data.split(",", 1)[1] if "," in vm.audio_data else vm.audio_data
            raw_bytes = base64.b64decode(raw_data)
            return Response(content=raw_bytes, media_type=vm.audio_format or "audio/webm", headers={"Cache-Control": "public, max-age=86400"})
        except Exception:
            pass

    raise HTTPException(status_code=404, detail="Media file not found")


# ==========================================
# HELPER FUNCTIONS
# ==========================================
def generate_secure_slug(prefix: Optional[str] = None) -> str:
    """Generate a clean, secure, random non-guessable slug (e.g. 8f7k2m9x)."""
    alphabet = "abcdefghjkmnpqrstuvwxyz23456789"
    random_str = "".join(secrets.choice(alphabet) for _ in range(8))
    if prefix:
        clean_prefix = re.sub(r'[^a-zA-Z0-9]', '', prefix.lower().strip())[:10]
        if clean_prefix:
            return f"{clean_prefix}-{random_str}"
    return random_str

def hash_password(password: str) -> str:
    """Salted SHA-256 hash for password protection."""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password: str, stored_hash: Optional[str]) -> bool:
    """Verify password against salted hash."""
    if not stored_hash or ":" not in stored_hash:
        return False
    salt, hashed = stored_hash.split(":", 1)
    test_hashed = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return test_hashed == hashed

AUTH_SECRET = os.getenv("SECRET_KEY", "birthday_magic_secret_9837482910")

def create_user_token(user_id: int) -> str:
    """Generate stateless, secure signed session token."""
    ts = int(datetime.datetime.utcnow().timestamp())
    raw = f"{user_id}:{ts}"
    signature = hashlib.sha256(f"{raw}:{AUTH_SECRET}".encode()).hexdigest()
    return f"{raw}:{signature}"

def verify_user_token(token: str) -> Optional[int]:
    """Verify signed session token and return user_id."""
    try:
        parts = token.strip().split(":")
        if len(parts) != 3:
            return None
        user_id = int(parts[0])
        ts = int(parts[1])
        signature = parts[2]
        expected = hashlib.sha256(f"{user_id}:{ts}:{AUTH_SECRET}".encode()).hexdigest()
        if signature == expected:
            return user_id
    except Exception:
        return None
    return None

def get_current_user_optional(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[models.User]:
    """Extract authenticated user if Authorization header present."""
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "").strip()
    user_id = verify_user_token(token)
    if not user_id:
        return None
    return db.query(models.User).filter(models.User.id == user_id).first()

def serialize_surprise_out(surprise: models.BirthdaySurprise) -> dict:
    """Serialize full BirthdaySurprise including has_password indicator."""
    return {
        "id": surprise.id,
        "creator_id": surprise.creator_id,
        "unique_slug": surprise.unique_slug,
        "recipient_name": surprise.recipient_name,
        "sender_name": surprise.sender_name,
        "relationship": surprise.relationship,
        "birth_date": surprise.birth_date,
        "celebration_date": surprise.celebration_date,
        "birthday_message": surprise.birthday_message,
        "birthday_letter": surprise.birthday_letter,
        "status": surprise.status or "published",
        "visibility": surprise.visibility or "unlisted",
        "is_active": surprise.is_active if surprise.is_active is not None else True,
        "has_password": bool(surprise.password_hash),
        "expires_at": surprise.expires_at,
        "view_count": surprise.view_count or 0,
        "last_viewed_at": surprise.last_viewed_at,
        "created_at": surprise.created_at,
        "updated_at": surprise.updated_at,
        "wishes": surprise.wishes,
        "memories": surprise.memories,
        "settings": surprise.settings,
        "voice_message": surprise.voice_message,
        "custom_theme": surprise.custom_theme
    }


# ==========================================
# HEALTH CHECK
# ==========================================
@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Birthday Surprise Platform v2.0"}


# ==========================================
# MODULE 1 & 6: BIRTHDAY SURPRISE CRUD
# ==========================================
@app.post("/api/birthday/create", response_model=schemas.BirthdaySurpriseOut, status_code=status.HTTP_201_CREATED)
def create_birthday_surprise(
    surprise_in: schemas.BirthdaySurpriseCreate, 
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Create a new birthday surprise experience with custom theme, voice message, wishes, and memories."""
    try:
        slug = generate_secure_slug(surprise_in.recipient_name)
        while db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.unique_slug == slug).first():
            slug = generate_secure_slug(surprise_in.recipient_name)

        # Password hashing if provided
        pwd_hash = hash_password(surprise_in.password) if surprise_in.password else None
        
        # Expiry parsing if provided
        exp_date = None
        if surprise_in.expires_at:
            try:
                exp_date = datetime.datetime.fromisoformat(surprise_in.expires_at.replace("Z", "+00:00"))
            except Exception:
                exp_date = None

        creator_identifier = f"user_{current_user.id}" if current_user else (surprise_in.creator_id or secrets.token_hex(16))

        surprise = models.BirthdaySurprise(
            creator_id=creator_identifier,
            unique_slug=slug,
            recipient_name=surprise_in.recipient_name,
            sender_name=surprise_in.sender_name,
            relationship=surprise_in.relationship,
            birth_date=surprise_in.birth_date,
            celebration_date=surprise_in.celebration_date,
            birthday_message=surprise_in.birthday_message,
            birthday_letter=surprise_in.birthday_letter,
            status="published",
            visibility=surprise_in.visibility or ("password_protected" if pwd_hash else "unlisted"),
            password_hash=pwd_hash,
            expires_at=exp_date,
            is_active=True,
            view_count=0
        )
        db.add(surprise)
        db.flush()

        # Add wishes
        if surprise_in.wishes:
            for w in surprise_in.wishes:
                if w.answer and str(w.answer).strip():
                    wish = models.BirthdayWish(
                        surprise_id=surprise.id,
                        question=w.question,
                        answer=w.answer
                    )
                    db.add(wish)

        # Add memories with persistent backup
        if surprise_in.memories:
            for m in surprise_in.memories:
                img_url = m.image_url
                img_data = getattr(m, 'image_data', None)
                if img_url and img_url.startswith("data:image"):
                    ext = ".png" if "data:image/png" in img_url else ".webp" if "data:image/webp" in img_url else ".jpg"
                    fname = f"memory_b64_{uuid.uuid4().hex[:10]}{ext}"
                    b64_content = img_url.split(",", 1)[1] if "," in img_url else img_url
                    try:
                        raw_b = base64.b64decode(b64_content)
                        save_persistent_media(fname, "image", f"image/{ext.lstrip('.')}", raw_b, db)
                        img_url = f"/uploads/{fname}"
                        img_data = b64_content
                    except Exception as e:
                        print(f"Error persisting base64 memory image: {e}")
                elif img_url and img_url.startswith("/uploads/"):
                    fname = os.path.basename(img_url)
                    pm = db.query(models.PersistentMedia).filter(models.PersistentMedia.filename == fname).first()
                    if pm:
                        img_data = pm.data_base64

                memory = models.Memory(
                    surprise_id=surprise.id,
                    image_url=img_url,
                    image_data=img_data,
                    caption=m.caption
                )
                db.add(memory)

        # Add Voice Message if provided with persistent backup
        if surprise_in.voice_message:
            aud_url = surprise_in.voice_message.audio_url
            aud_data = getattr(surprise_in.voice_message, 'audio_data', None)
            aud_format = surprise_in.voice_message.audio_format or "audio/webm"

            if aud_url and aud_url.startswith("data:audio"):
                ext = ".mp4" if "mp4" in aud_url or "m4a" in aud_url else ".webm"
                fname = f"voice_b64_{uuid.uuid4().hex[:10]}{ext}"
                b64_content = aud_url.split(",", 1)[1] if "," in aud_url else aud_url
                try:
                    raw_b = base64.b64decode(b64_content)
                    save_persistent_media(fname, "voice", aud_format, raw_b, db)
                    aud_url = f"/uploads/voice/{fname}"
                    aud_data = b64_content
                except Exception as e:
                    print(f"Error persisting base64 voice message: {e}")
            elif aud_url and aud_url.startswith("/uploads/"):
                fname = os.path.basename(aud_url)
                pm = db.query(models.PersistentMedia).filter(models.PersistentMedia.filename == fname).first()
                if pm:
                    aud_data = pm.data_base64

            vm = models.VoiceMessage(
                surprise_id=surprise.id,
                audio_url=aud_url,
                audio_data=aud_data,
                audio_format=aud_format,
                duration=surprise_in.voice_message.duration or 0.0,
                title=surprise_in.voice_message.title or "A special voice message for you ❤️",
                cover_image_url=surprise_in.voice_message.cover_image_url
            )
            db.add(vm)

        # Add Custom Theme if provided
        ct_data = surprise_in.custom_theme or schemas.CustomThemeCreate()
        
        anim_settings_val = ct_data.animation_settings
        if isinstance(anim_settings_val, (dict, list)):
            anim_settings_str = json.dumps(anim_settings_val)
        elif isinstance(anim_settings_val, str) and anim_settings_val.strip():
            anim_settings_str = anim_settings_val
        else:
            anim_settings_str = '{"balloons":true,"hearts":true,"confetti":true,"fireworks":true,"sparkles":true,"stars":true,"typewriter":true,"glow":true,"intensity":"medium"}'

        custom_settings_val = ct_data.custom_settings
        if isinstance(custom_settings_val, (dict, list)):
            custom_settings_str = json.dumps(custom_settings_val)
        elif isinstance(custom_settings_val, str) and custom_settings_val.strip():
            custom_settings_str = custom_settings_val
        else:
            custom_settings_str = "{}"

        custom_theme = models.CustomTheme(
            surprise_id=surprise.id,
            theme_name=ct_data.theme_name or "dark-galaxy",
            primary_color=ct_data.primary_color or "#E85B32",
            secondary_color=ct_data.secondary_color or "#FFBFA8",
            background_color=ct_data.background_color or "#170D2D",
            text_color=ct_data.text_color or "#FFFFFF",
            accent_color=ct_data.accent_color or "#FFD166",
            card_background=ct_data.card_background or "rgba(255, 255, 255, 0.08)",
            heading_font=ct_data.heading_font or "Playfair Display",
            body_font=ct_data.body_font or "Poppins",
            background_type=ct_data.background_type or "starry",
            background_value=ct_data.background_value or "radial-gradient(circle at 50% 20%, #2b1055 0%, #170d2d 100%)",
            animation_settings=anim_settings_str,
            music_url=ct_data.music_url or "happy-birthday",
            custom_settings=custom_settings_str
        )
        db.add(custom_theme)

        # Legacy Setting support
        setting = models.Setting(
            surprise_id=surprise.id,
            music_enabled=True,
            selected_theme=ct_data.theme_name,
            animation_enabled=True,
            selected_music=ct_data.music_url or "happy-birthday"
        )
        db.add(setting)

        # Create initial ShareLink entry
        share_link = models.ShareLink(
            surprise_id=surprise.id,
            unique_slug=slug,
            is_active=True,
            password_protected=bool(pwd_hash),
            expires_at=exp_date
        )
        db.add(share_link)

        db.commit()
        db.refresh(surprise)
        return serialize_surprise_out(surprise)
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not create birthday surprise: {str(e)}"
        )


@app.get("/api/birthday/{id}", response_model=schemas.BirthdaySurpriseOut)
def get_birthday_surprise(id: int, db: Session = Depends(get_db)):
    """Retrieve full surprise details for the authorized creator."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")
    return serialize_surprise_out(surprise)


@app.put("/api/birthday/{id}", response_model=schemas.BirthdaySurpriseOut)
def update_birthday_surprise(id: int, update_data: schemas.BirthdaySurpriseUpdate, db: Session = Depends(get_db)):
    """Update birthday surprise details, memories, wishes, and theme."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")

    update_dict = update_data.model_dump(exclude_unset=True)

    for field in ["recipient_name", "sender_name", "relationship", "birth_date", "celebration_date", "birthday_message", "birthday_letter", "visibility", "is_active"]:
        if field in update_dict and update_dict[field] is not None:
            setattr(surprise, field, update_dict[field])

    if "password" in update_dict and update_dict["password"] is not None:
        if update_dict["password"]:
            surprise.password_hash = hash_password(update_dict["password"])
            surprise.visibility = "password_protected"
        else:
            surprise.password_hash = None
            if surprise.visibility == "password_protected":
                surprise.visibility = "unlisted"

    if "expires_at" in update_dict and update_dict["expires_at"] is not None:
        try:
            surprise.expires_at = datetime.datetime.fromisoformat(update_dict["expires_at"].replace("Z", "+00:00"))
        except Exception:
            surprise.expires_at = None

    # Update wishes if provided
    if "wishes" in update_dict and update_dict["wishes"] is not None:
        db.query(models.BirthdayWish).filter(models.BirthdayWish.surprise_id == surprise.id).delete()
        for w in update_dict["wishes"]:
            db.add(models.BirthdayWish(surprise_id=surprise.id, question=w["question"], answer=w["answer"]))

    # Update memories if provided
    if "memories" in update_dict and update_dict["memories"] is not None:
        db.query(models.Memory).filter(models.Memory.surprise_id == surprise.id).delete()
        for m in update_dict["memories"]:
            db.add(models.Memory(surprise_id=surprise.id, image_url=m["image_url"], caption=m.get("caption")))

    # Update custom theme if provided
    if "custom_theme" in update_dict and update_dict["custom_theme"] is not None:
        ct_dict = update_dict["custom_theme"]
        ct = db.query(models.CustomTheme).filter(models.CustomTheme.surprise_id == surprise.id).first()
        if not ct:
            ct = models.CustomTheme(surprise_id=surprise.id)
            db.add(ct)
        for k, v in ct_dict.items():
            if hasattr(ct, k) and v is not None:
                if k in ("animation_settings", "custom_settings") and isinstance(v, (dict, list)):
                    v = json.dumps(v)
                setattr(ct, k, v)

    surprise.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(surprise)
    return serialize_surprise_out(surprise)


@app.delete("/api/birthday/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_birthday_surprise(id: int, db: Session = Depends(get_db)):
    """Delete a birthday surprise completely."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")
    db.delete(surprise)
    db.commit()
    return None


# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================
@app.post("/api/auth/register", response_model=schemas.AuthResponse)
def register_user(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    """Register a new creator account."""
    email_clean = payload.email.lower().strip()
    existing = db.query(models.User).filter(models.User.email == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in.")
    
    pwd_hash = hash_password(payload.password)
    user = models.User(
        name=payload.name.strip(),
        email=email_clean,
        password_hash=pwd_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_user_token(user.id)
    return {
        "token": token,
        "user": user,
        "message": f"Welcome, {user.name}! Your account has been created ✨"
    }


@app.post("/api/auth/login", response_model=schemas.AuthResponse)
def login_user(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    """Log in to an existing creator account."""
    email_clean = payload.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email_clean).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password. Please try again.")

    token = create_user_token(user.id)
    return {
        "token": token,
        "user": user,
        "message": f"Welcome back, {user.name}! ✨"
    }


@app.get("/api/auth/me")
def get_auth_me(user: Optional[models.User] = Depends(get_current_user_optional)):
    """Verify session token and retrieve current user."""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at
        }
    }


# ==========================================
# CREATOR DASHBOARD: LIST SURPRISES
# ==========================================
@app.get("/api/creator/surprises", response_model=List[schemas.BirthdaySurpriseOut])
def get_creator_surprises(
    creator_id: Optional[str] = None, 
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """List surprises created by this creator (or all recent if creator_id not passed)."""
    query = db.query(models.BirthdaySurprise)

    user_identifiers = []
    if current_user:
        user_identifiers.append(f"user_{current_user.id}")
        user_identifiers.append(current_user.email)
    if creator_id:
        user_identifiers.append(creator_id)

    if user_identifiers:
        surprises = query.filter(models.BirthdaySurprise.creator_id.in_(user_identifiers)).order_by(desc(models.BirthdaySurprise.created_at)).all()
        if not surprises:
            # Fallback to latest so creators never lose work across browser restarts
            surprises = query.order_by(desc(models.BirthdaySurprise.created_at)).limit(20).all()
    else:
        surprises = query.order_by(desc(models.BirthdaySurprise.created_at)).limit(20).all()

    return [serialize_surprise_out(s) for s in surprises]


# ==========================================
# MODULE 1: VOICE RECORDING ENDPOINTS
# ==========================================
@app.post("/api/birthday/voice-temp")
async def upload_temp_voice(
    file: UploadFile = File(...),
    duration: Optional[float] = Form(0.0),
    title: Optional[str] = Form("A special voice message for you ❤️"),
    db: Session = Depends(get_db)
):
    """Upload voice recording prior to surprise creation (returns audio URL)."""
    allowed_exts = {".webm", ".mp3", ".wav", ".m4a", ".ogg", ".mp4", ".aac"}
    filename = file.filename or "recording.webm"
    ext = os.path.splitext(filename)[1].lower()
    if not ext or ext not in allowed_exts:
        ext = ".webm"

    unique_name = f"voice_temp_{uuid.uuid4().hex}{ext}"
    content_type = file.content_type or f"audio/{ext.lstrip('.')}"
    raw_bytes = await file.read()

    audio_url = f"/uploads/voice/{unique_name}"
    if CLOUDINARY_CONFIGURED:
        try:
            result = cloudinary.uploader.upload(
                raw_bytes,
                resource_type="video",
                folder="birthday_surprises/voice"
            )
            if result.get("secure_url"):
                audio_url = result["secure_url"]
        except Exception as e:
            print(f"Cloudinary voice upload error, using DB fallback: {e}")

    save_persistent_media(unique_name, "voice", content_type, raw_bytes, db)

    return {
        "audio_url": audio_url,
        "audio_format": content_type,
        "duration": duration or 0.0,
        "title": title or "A special voice message for you ❤️"
    }


@app.post("/api/birthday/{id}/voice", response_model=schemas.VoiceMessageOut)
async def upload_birthday_voice(
    id: int,
    file: UploadFile = File(...),
    duration: Optional[float] = Form(0.0),
    title: Optional[str] = Form("A special voice message for you ❤️"),
    db: Session = Depends(get_db)
):
    """Upload or attach recorded voice message to a specific surprise."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")

    allowed_exts = {".webm", ".mp3", ".wav", ".m4a", ".ogg", ".mp4", ".aac"}
    filename = file.filename or "recording.webm"
    ext = os.path.splitext(filename)[1].lower() or ".webm"
    if ext not in allowed_exts:
        ext = ".webm"

    unique_name = f"voice_{id}_{uuid.uuid4().hex[:8]}{ext}"
    content_type = file.content_type or f"audio/{ext.lstrip('.')}"
    raw_bytes = await file.read()

    audio_url = f"/uploads/voice/{unique_name}"
    if CLOUDINARY_CONFIGURED:
        try:
            result = cloudinary.uploader.upload(
                raw_bytes,
                resource_type="video",
                folder="birthday_surprises/voice"
            )
            if result.get("secure_url"):
                audio_url = result["secure_url"]
        except Exception as e:
            print(f"Cloudinary voice upload error, using DB fallback: {e}")

    b64_data = save_persistent_media(unique_name, "voice", content_type, raw_bytes, db)

    # Upsert VoiceMessage
    vm = db.query(models.VoiceMessage).filter(models.VoiceMessage.surprise_id == surprise.id).first()
    if vm:
        vm.audio_url = audio_url
        vm.audio_format = content_type
        vm.duration = duration or vm.duration
        vm.title = title or vm.title
        vm.audio_data = b64_data
    else:
        vm = models.VoiceMessage(
            surprise_id=surprise.id,
            audio_url=audio_url,
            audio_format=content_type,
            duration=duration or 0.0,
            title=title or "A special voice message for you ❤️",
            audio_data=b64_data
        )
        db.add(vm)

    db.commit()
    db.refresh(vm)
    return vm


@app.delete("/api/birthday/{id}/voice", status_code=status.HTTP_204_NO_CONTENT)
def delete_birthday_voice(id: int, db: Session = Depends(get_db)):
    """Delete voice message attached to surprise."""
    vm = db.query(models.VoiceMessage).filter(models.VoiceMessage.surprise_id == id).first()
    if not vm:
        raise HTTPException(status_code=404, detail="Voice message not found")
    db.delete(vm)
    db.commit()
    return None


# ==========================================
# MODULE 2: CUSTOM THEME STUDIO ENDPOINTS
# ==========================================
@app.post("/api/birthday/{id}/theme", response_model=schemas.CustomThemeOut)
def save_custom_theme(id: int, theme_in: schemas.CustomThemeCreate, db: Session = Depends(get_db)):
    """Save custom theme settings for a birthday surprise."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")

    ct = db.query(models.CustomTheme).filter(models.CustomTheme.surprise_id == surprise.id).first()
    if not ct:
        ct = models.CustomTheme(surprise_id=surprise.id)
        db.add(ct)

    for k, v in theme_in.model_dump().items():
        if hasattr(ct, k) and v is not None:
            setattr(ct, k, v)

    # Sync with legacy Setting model
    setting = db.query(models.Setting).filter(models.Setting.surprise_id == surprise.id).first()
    if setting:
        setting.selected_theme = ct.theme_name
        setting.selected_music = ct.music_url or "happy-birthday"

    db.commit()
    db.refresh(ct)
    return ct


@app.get("/api/birthday/{id}/theme", response_model=schemas.CustomThemeOut)
def get_custom_theme(id: int, db: Session = Depends(get_db)):
    """Retrieve saved theme for a birthday surprise."""
    ct = db.query(models.CustomTheme).filter(models.CustomTheme.surprise_id == id).first()
    if not ct:
        raise HTTPException(status_code=404, detail="Custom theme not found")
    return ct


# ==========================================
# MODULE 3: SHAREABLE URL & QR CODE SYSTEM
# ==========================================
@app.post("/api/birthday/{id}/publish")
def publish_birthday_surprise(id: int, db: Session = Depends(get_db)):
    """Publish birthday surprise, ensure active share link and return share URL."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")

    surprise.status = "published"
    surprise.is_active = True
    db.commit()

    return {
        "message": "Surprise published successfully",
        "unique_slug": surprise.unique_slug,
        "share_url": f"/s/{surprise.unique_slug}"
    }


@app.post("/api/birthday/{id}/share")
def update_share_settings(id: int, payload: schemas.ShareSettingsUpdate, db: Session = Depends(get_db)):
    """Update visibility, password protection, and expiry for shareable link."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")

    if payload.visibility is not None:
        surprise.visibility = payload.visibility

    if payload.password is not None:
        if payload.password.strip():
            surprise.password_hash = hash_password(payload.password.strip())
            surprise.visibility = "password_protected"
        else:
            surprise.password_hash = None
            if surprise.visibility == "password_protected":
                surprise.visibility = "unlisted"

    if payload.expires_at is not None:
        if payload.expires_at.strip():
            try:
                surprise.expires_at = datetime.datetime.fromisoformat(payload.expires_at.replace("Z", "+00:00"))
            except Exception:
                pass
        else:
            surprise.expires_at = None

    if payload.is_active is not None:
        surprise.is_active = payload.is_active

    db.commit()
    db.refresh(surprise)
    return {
        "message": "Share settings updated successfully",
        "unique_slug": surprise.unique_slug,
        "visibility": surprise.visibility,
        "is_active": surprise.is_active,
        "has_password": bool(surprise.password_hash),
        "expires_at": surprise.expires_at
    }


@app.post("/api/birthday/{id}/regenerate-link")
def regenerate_share_link(id: int, db: Session = Depends(get_db)):
    """Generate a new unique random slug. The previous link becomes immediately invalid."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")

    new_slug = generate_secure_slug(surprise.recipient_name)
    while db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.unique_slug == new_slug).first():
        new_slug = generate_secure_slug(surprise.recipient_name)

    # Deactivate any previous share link records
    db.query(models.ShareLink).filter(models.ShareLink.surprise_id == surprise.id).update({"is_active": False})

    surprise.unique_slug = new_slug
    # Add new active share link
    share_link = models.ShareLink(
        surprise_id=surprise.id,
        unique_slug=new_slug,
        is_active=True,
        password_protected=bool(surprise.password_hash),
        expires_at=surprise.expires_at
    )
    db.add(share_link)

    db.commit()
    return {
        "message": "New link generated successfully. Previous link is now invalid.",
        "unique_slug": new_slug,
        "share_url": f"/s/{new_slug}"
    }


@app.post("/api/birthday/{id}/disable-link")
def toggle_share_link(id: int, db: Session = Depends(get_db)):
    """Toggle sharing access (disable / enable existing link)."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")

    surprise.is_active = not bool(surprise.is_active)
    db.commit()
    return {
        "message": "Link enabled" if surprise.is_active else "Link disabled",
        "is_active": surprise.is_active,
        "unique_slug": surprise.unique_slug
    }


@app.get("/api/birthday/{id}/analytics", response_model=schemas.AnalyticsOut)
def get_surprise_analytics(id: int, db: Session = Depends(get_db)):
    """Retrieve access statistics for creator dashboard."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")

    now = datetime.datetime.utcnow()
    is_expired = bool(surprise.expires_at and surprise.expires_at < now)

    return schemas.AnalyticsOut(
        surprise_id=surprise.id,
        unique_slug=surprise.unique_slug,
        view_count=surprise.view_count or 0,
        last_viewed_at=surprise.last_viewed_at,
        is_active=bool(surprise.is_active),
        visibility=surprise.visibility or "unlisted",
        expires_at=surprise.expires_at,
        is_expired=is_expired
    )


# ==========================================
# MODULE 4: STRICT SEPARATION - RECIPIENT PUBLIC VIEW
# ==========================================
@app.get("/api/surprise/{slug}")
def get_recipient_surprise(slug: str, db: Session = Depends(get_db)):
    """
    Publicly accessible recipient birthday experience.
    Strictly read-only and distraction-free:
    - Never exposes passwords, hashes, creator IDs, or editing capabilities.
    - If link is inactive or expired -> returns 404 / 403.
    - If password protected -> returns masked object requesting password.
    - Increments view count upon successful access.
    """
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.unique_slug == slug).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="This birthday surprise link is invalid or has expired.")

    # Check if disabled
    if surprise.is_active is False:
        raise HTTPException(status_code=403, detail="This birthday surprise has been disabled by its sender.")

    # Check if expired
    if surprise.expires_at and surprise.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=403, detail="This birthday surprise link has expired.")

    # Check password protection
    if surprise.visibility == "password_protected" and surprise.password_hash:
        return {
            "is_password_protected": True,
            "recipient_name": surprise.recipient_name,
            "sender_name": surprise.sender_name
        }

    # Increment view count
    surprise.view_count = (surprise.view_count or 0) + 1
    surprise.last_viewed_at = datetime.datetime.utcnow()
    db.commit()

    return {
        "is_password_protected": False,
        "recipient_name": surprise.recipient_name,
        "sender_name": surprise.sender_name,
        "relationship": surprise.relationship,
        "birth_date": surprise.birth_date,
        "celebration_date": surprise.celebration_date,
        "birthday_message": surprise.birthday_message,
        "birthday_letter": surprise.birthday_letter,
        "wishes": surprise.wishes,
        "memories": surprise.memories,
        "voice_message": surprise.voice_message,
        "custom_theme": surprise.custom_theme,
        "settings": surprise.settings
    }


@app.post("/api/surprise/{slug}/verify-password")
def verify_recipient_password(slug: str, req: schemas.PasswordVerifyRequest, db: Session = Depends(get_db)):
    """Verify password for password-protected surprise and unlock the full experience."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.unique_slug == slug).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")

    if not verify_password(req.password, surprise.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect secret password. Please ask the sender!")

    # Increment view count
    surprise.view_count = (surprise.view_count or 0) + 1
    surprise.last_viewed_at = datetime.datetime.utcnow()
    db.commit()

    return {
        "is_password_protected": False,
        "recipient_name": surprise.recipient_name,
        "sender_name": surprise.sender_name,
        "relationship": surprise.relationship,
        "birth_date": surprise.birth_date,
        "celebration_date": surprise.celebration_date,
        "birthday_message": surprise.birthday_message,
        "birthday_letter": surprise.birthday_letter,
        "wishes": surprise.wishes,
        "memories": surprise.memories,
        "voice_message": surprise.voice_message,
        "custom_theme": surprise.custom_theme,
        "settings": surprise.settings
    }


# Backward-compatible alias for existing frontend links
@app.get("/api/birthday/share/{slug}")
def get_shared_birthday_surprise_compat(slug: str, db: Session = Depends(get_db)):
    return get_recipient_surprise(slug, db)


# ==========================================
# PHOTO UPLOAD ENDPOINTS
# ==========================================
@app.post("/api/birthday/{id}/upload", response_model=schemas.MemoryOut)
async def upload_birthday_photo(
    id: int,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")

    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if not ext or ext not in allowed_extensions:
        ext = ".jpg"

    filename = f"memory_{id}_{uuid.uuid4().hex[:8]}{ext}"
    content_type = file.content_type or f"image/{ext.lstrip('.')}"
    raw_bytes = await file.read()

    image_url = f"/uploads/{filename}"
    if CLOUDINARY_CONFIGURED:
        try:
            result = cloudinary.uploader.upload(
                raw_bytes,
                resource_type="image",
                folder="birthday_surprises/photos"
            )
            if result.get("secure_url"):
                image_url = result["secure_url"]
        except Exception as e:
            print(f"Cloudinary image upload error, using DB fallback: {e}")

    b64_data = save_persistent_media(filename, "image", content_type, raw_bytes, db)

    memory = models.Memory(
        surprise_id=surprise.id,
        image_url=image_url,
        image_data=b64_data,
        caption=caption
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)
    return memory


@app.post("/api/birthday/upload-temp")
async def upload_temp_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if not ext or ext not in allowed_extensions:
        ext = ".jpg"

    filename = f"temp_{uuid.uuid4().hex}{ext}"
    content_type = file.content_type or f"image/{ext.lstrip('.')}"
    raw_bytes = await file.read()

    image_url = f"/uploads/{filename}"
    if CLOUDINARY_CONFIGURED:
        try:
            result = cloudinary.uploader.upload(
                raw_bytes,
                resource_type="image",
                folder="birthday_surprises/photos"
            )
            if result.get("secure_url"):
                image_url = result["secure_url"]
        except Exception as e:
            print(f"Cloudinary temp image upload error, using DB fallback: {e}")

    save_persistent_media(filename, "image", content_type, raw_bytes, db)

    return {"image_url": image_url}
# ==========================================
# AI LETTER GENERATION
# ==========================================
@app.post("/api/birthday/generate-letter", response_model=schemas.LetterGenerateResponse)
async def generate_letter(payload: schemas.LetterGenerateRequest):
    result = await generate_letter_with_ai(
        recipient=payload.recipient_name,
        sender=payload.sender_name,
        relationship=payload.relationship,
        style=payload.style,
        memories_or_notes=payload.memories_or_notes,
        answers=payload.answers
    )
    return schemas.LetterGenerateResponse(
        letter=result["letter"],
        style=result["style"],
        suggested_wishes=result["suggested_wishes"]
    )


# ==========================================
# ADMIN STATS & SEED
# ==========================================
@app.get("/api/admin/stats", response_model=schemas.AdminStats)
def get_admin_stats(db: Session = Depends(get_db)):
    total_surprises = db.query(models.BirthdaySurprise).count()
    total_memories = db.query(models.Memory).count()
    total_wishes = db.query(models.BirthdayWish).count()
    total_voice_messages = db.query(models.VoiceMessage).count()
    latest = db.query(models.BirthdaySurprise).order_by(desc(models.BirthdaySurprise.created_at)).limit(15).all()

    return schemas.AdminStats(
        total_surprises=total_surprises,
        total_memories=total_memories,
        total_wishes=total_wishes,
        total_voice_messages=total_voice_messages,
        latest_surprises=[serialize_surprise_out(s) for s in latest]
    )


@app.get("/api/admin/surprises", response_model=List[schemas.BirthdaySurpriseOut])
def get_all_surprises(db: Session = Depends(get_db)):
    surprises = db.query(models.BirthdaySurprise).order_by(desc(models.BirthdaySurprise.created_at)).all()
    return [serialize_surprise_out(s) for s in surprises]


@app.post("/api/admin/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    existing = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.unique_slug == "maya-birthday-magic").first()
    if existing:
        return {"message": "Demo data already exists", "slug": existing.unique_slug}

    demo = models.BirthdaySurprise(
        creator_id="demo-creator-alex",
        unique_slug="maya-birthday-magic",
        recipient_name="Maya",
        sender_name="Alex",
        relationship="Best Friend",
        birth_date="2000-08-14",
        celebration_date="2026-11-06",
        birthday_message="To the person who makes every day brighter!",
        birthday_letter="Dearest Maya,\n\nHappy Birthday! Today is all about celebrating you—the rare, kind-hearted, and incredible person who brings so much light into the lives of everyone around you.\n\nWords often fall short when trying to express just how much you mean to me as my best friend. You have been a continuous source of strength, pure joy, and inspiration in ways you might not even realize.\n\nWhat makes you so truly special is your boundless empathy and infectious laugh. Your presence alone has a way of making any room feel warmer and every heavy day feel lighter.\n\nOne of my most cherished memories is our midnight road trip to the coast, singing along to awful 2000s pop music until our voices gave out. I will always hold onto that moment with so much fondness and gratitude.\n\nMay this year ahead bring you profound peace, exhilarating adventures, good health, and the fulfillment of the dreams you hold closest to your heart.\n\nWith all my love and warmest wishes,\nAlex ✨",
        status="published",
        visibility="unlisted",
        is_active=True,
        view_count=12
    )
    db.add(demo)
    db.flush()

    wishes = [
        ("What makes this person special?", "Her radiant empathy, how she listens like you are the only person in the room, and her fearless passion for life."),
        ("What is your favourite memory together?", "The spontaneous midnight road trip to the coast with the windows down and horrible 2000s music blasting."),
        ("What do you love most about them?", "Her honesty, infectious sense of adventure, and the way she can make anyone smile even on their worst day."),
        ("What is one thing you wish for them?", "That this new chapter brings immense peace, career triumphs, and boundless unconditional joy."),
        ("Describe this person in three words.", "Radiant, Fearless, Unforgettable")
    ]
    for q, a in wishes:
        db.add(models.BirthdayWish(surprise_id=demo.id, question=q, answer=a))

    memories = [
        ("https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80", "That unforgettable sunset picnic by the cliffs"),
        ("https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80", "Laughing until our stomachs hurt in the coffee shop"),
        ("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80", "The celebration where we danced until 3 AM!")
    ]
    for url, cap in memories:
        db.add(models.Memory(surprise_id=demo.id, image_url=url, caption=cap))

    db.add(models.CustomTheme(
        surprise_id=demo.id,
        theme_name="dark-galaxy",
        primary_color="#E85B32",
        secondary_color="#FFBFA8",
        background_color="#170D2D",
        text_color="#FFFFFF",
        accent_color="#FFD166",
        card_background="rgba(255, 255, 255, 0.08)",
        heading_font="Playfair Display",
        body_font="Poppins",
        background_type="starry",
        background_value="radial-gradient(circle at 50% 20%, #2b1055 0%, #170d2d 100%)",
        animation_settings='{"balloons":true,"hearts":true,"confetti":true,"fireworks":true,"sparkles":true,"stars":true,"typewriter":true,"glow":true,"intensity":"medium"}',
        music_url="happy-birthday"
    ))

    db.add(models.Setting(
        surprise_id=demo.id,
        music_enabled=True,
        selected_theme="dark-galaxy",
        animation_enabled=True,
        selected_music="happy-birthday"
    ))

    db.add(models.ShareLink(
        surprise_id=demo.id,
        unique_slug="maya-birthday-magic",
        is_active=True,
        password_protected=False
    ))

    db.commit()
    db.refresh(demo)
    return {"message": "Demo surprise created successfully", "slug": demo.unique_slug}


@app.on_event("startup")
def on_startup():
    from database import SessionLocal
    db = SessionLocal()
    try:
        seed_demo_data(db)
    except Exception as e:
        print("Startup seed warning:", e)
    finally:
        db.close()


# Serve compiled frontend build in production
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("uploads"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
