import os
import uuid
import re
import shutil
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import engine, Base, get_db
import models
import schemas
from ai_service import generate_letter_with_ai, READY_MADE_WISHES

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

# Upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="Birthday Surprise API",
    description="Backend API for creating and sharing personalized birthday surprises",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

def generate_slug(name: str) -> str:
    cleaned = re.sub(r'[^a-zA-Z0-9]', '-', name.lower().strip())
    cleaned = re.sub(r'-+', '-', cleaned).strip('-')
    random_suffix = uuid.uuid4().hex[:6]
    return f"{cleaned or 'surprise'}-{random_suffix}"


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Birthday Surprise API"}


@app.post("/api/birthday/create", response_model=schemas.BirthdaySurpriseOut, status_code=status.HTTP_201_CREATED)
def create_birthday_surprise(surprise_in: schemas.BirthdaySurpriseCreate, db: Session = Depends(get_db)):
    """Create a new birthday surprise experience with all wishes, memories, and settings."""
    slug = generate_slug(surprise_in.recipient_name)
    
    # Ensure slug uniqueness
    while db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.unique_slug == slug).first():
        slug = generate_slug(surprise_in.recipient_name)

    surprise = models.BirthdaySurprise(
        unique_slug=slug,
        recipient_name=surprise_in.recipient_name,
        sender_name=surprise_in.sender_name,
        relationship=surprise_in.relationship,
        birth_date=surprise_in.birth_date,
        celebration_date=surprise_in.celebration_date,
        birthday_message=surprise_in.birthday_message,
        birthday_letter=surprise_in.birthday_letter
    )
    db.add(surprise)
    db.flush()

    # Add wishes
    if surprise_in.wishes:
        for w in surprise_in.wishes:
            wish = models.BirthdayWish(
                surprise_id=surprise.id,
                question=w.question,
                answer=w.answer
            )
            db.add(wish)

    # Add memories
    if surprise_in.memories:
        for m in surprise_in.memories:
            memory = models.Memory(
                surprise_id=surprise.id,
                image_url=m.image_url,
                caption=m.caption
            )
            db.add(memory)

    # Add settings
    setting_data = surprise_in.settings or schemas.SettingCreate()
    setting = models.Setting(
        surprise_id=surprise.id,
        music_enabled=setting_data.music_enabled,
        selected_theme=setting_data.selected_theme,
        animation_enabled=setting_data.animation_enabled,
        selected_music=getattr(setting_data, "selected_music", "happy-birthday") or "happy-birthday"
    )
    db.add(setting)

    db.commit()
    db.refresh(surprise)
    return surprise


@app.get("/api/birthday/{id}", response_model=schemas.BirthdaySurpriseOut)
def get_birthday_surprise(id: int, db: Session = Depends(get_db)):
    """Retrieve surprise details by ID."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")
    return surprise


@app.get("/api/birthday/share/{slug}", response_model=schemas.BirthdaySurpriseOut)
def get_shared_birthday_surprise(slug: str, db: Session = Depends(get_db)):
    """Retrieve surprise experience by unique public slug."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.unique_slug == slug).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found for this link")
    return surprise


@app.put("/api/birthday/{id}", response_model=schemas.BirthdaySurpriseOut)
def update_birthday_surprise(id: int, update_data: schemas.BirthdaySurpriseUpdate, db: Session = Depends(get_db)):
    """Update an existing birthday surprise."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")

    update_dict = update_data.model_dump(exclude_unset=True)

    # Simple scalar field updates
    for field in ["recipient_name", "sender_name", "relationship", "birth_date", "celebration_date", "birthday_message", "birthday_letter"]:
        if field in update_dict and update_dict[field] is not None:
            setattr(surprise, field, update_dict[field])

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

    # Update settings if provided
    if "settings" in update_dict and update_dict["settings"] is not None:
        setting = db.query(models.Setting).filter(models.Setting.surprise_id == surprise.id).first()
        s_data = update_dict["settings"]
        if setting:
            setting.music_enabled = s_data.get("music_enabled", setting.music_enabled)
            setting.selected_theme = s_data.get("selected_theme", setting.selected_theme)
            setting.animation_enabled = s_data.get("animation_enabled", setting.animation_enabled)
            setting.selected_music = s_data.get("selected_music", getattr(setting, "selected_music", "happy-birthday"))
        else:
            db.add(models.Setting(
                surprise_id=surprise.id,
                music_enabled=s_data.get("music_enabled", True),
                selected_theme=s_data.get("selected_theme", "cosmic-purple"),
                animation_enabled=s_data.get("animation_enabled", True),
                selected_music=s_data.get("selected_music", "happy-birthday")
            ))

    db.commit()
    db.refresh(surprise)
    return surprise


@app.delete("/api/birthday/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_birthday_surprise(id: int, db: Session = Depends(get_db)):
    """Delete a birthday surprise and its associated memories/wishes."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")
    db.delete(surprise)
    db.commit()
    return None


@app.post("/api/birthday/{id}/upload", response_model=schemas.MemoryOut)
async def upload_birthday_photo(
    id: int,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload a photograph for a birthday surprise."""
    surprise = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.id == id).first()
    if not surprise:
        raise HTTPException(status_code=404, detail="Birthday surprise not found")

    # Validate file extension
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid image format. Supported formats: JPG, PNG, WEBP, GIF.")

    # Generate unique filename
    filename = f"memory_{id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    image_url = f"/uploads/{filename}"
    memory = models.Memory(
        surprise_id=surprise.id,
        image_url=image_url,
        caption=caption
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)
    return memory


@app.post("/api/birthday/upload-temp")
async def upload_temp_photo(
    file: UploadFile = File(...)
):
    """Upload photo prior to surprise creation (returns image URL to store in client state)."""
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid image format. Supported formats: JPG, PNG, WEBP, GIF.")

    filename = f"temp_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    return {"image_url": f"/uploads/{filename}"}


@app.post("/api/birthday/generate-letter", response_model=schemas.LetterGenerateResponse)
async def generate_letter(payload: schemas.LetterGenerateRequest):
    """Generate a personalized birthday letter using AI or personalized high-grade templates."""
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


@app.get("/api/admin/stats", response_model=schemas.AdminStats)
def get_admin_stats(db: Session = Depends(get_db)):
    """Retrieve site analytics and recent surprise creations for admin dashboard."""
    total_surprises = db.query(models.BirthdaySurprise).count()
    total_memories = db.query(models.Memory).count()
    total_wishes = db.query(models.BirthdayWish).count()
    latest = db.query(models.BirthdaySurprise).order_by(desc(models.BirthdaySurprise.created_at)).limit(15).all()

    return schemas.AdminStats(
        total_surprises=total_surprises,
        total_memories=total_memories,
        total_wishes=total_wishes,
        latest_surprises=latest
    )


@app.get("/api/admin/surprises", response_model=List[schemas.BirthdaySurpriseOut])
def get_all_surprises(db: Session = Depends(get_db)):
    """List all created surprises for administration."""
    return db.query(models.BirthdaySurprise).order_by(desc(models.BirthdaySurprise.created_at)).all()


@app.post("/api/admin/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    """Seeds a rich demonstration surprise for instant testing."""
    existing = db.query(models.BirthdaySurprise).filter(models.BirthdaySurprise.unique_slug == "maya-birthday-magic").first()
    if existing:
        return {"message": "Demo data already exists", "slug": existing.unique_slug}

    demo = models.BirthdaySurprise(
        unique_slug="maya-birthday-magic",
        recipient_name="Maya",
        sender_name="Alex",
        relationship="Best Friend",
        birth_date="2000-08-14",
        celebration_date="2026-11-06",
        birthday_message="To the person who makes every day brighter!",
        birthday_letter="Dearest Maya,\n\nHappy Birthday! Today is all about celebrating you—the rare, kind-hearted, and incredible person who brings so much light into the lives of everyone around you.\n\nWords often fall short when trying to express just how much you mean to me as my best friend. You have been a continuous source of strength, pure joy, and inspiration in ways you might not even realize.\n\nWhat makes you so truly special is your boundless empathy and infectious laugh. Your presence alone has a way of making any room feel warmer and every heavy day feel lighter.\n\nOne of my most cherished memories is our midnight road trip to the coast, singing along to awful 2000s pop music until our voices gave out. I will always hold onto that moment with so much fondness and gratitude.\n\nMay this year ahead bring you profound peace, exhilarating adventures, good health, and the fulfillment of the dreams you hold closest to your heart.\n\nWith all my love and warmest wishes,\nAlex ✨"
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

    # Add sample memories
    memories = [
        ("https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80", "That unforgettable sunset picnic by the cliffs"),
        ("https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80", "Laughing until our stomachs hurt in the coffee shop"),
        ("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80", "The celebration where we danced until 3 AM!")
    ]
    for url, cap in memories:
        db.add(models.Memory(surprise_id=demo.id, image_url=url, caption=cap))

    db.add(models.Setting(
        surprise_id=demo.id,
        music_enabled=True,
        selected_theme="cosmic-purple",
        animation_enabled=True,
        selected_music="happy-birthday"
    ))

    db.commit()
    db.refresh(demo)
    return {"message": "Demo surprise created successfully", "slug": demo.unique_slug}


@app.on_event("startup")
def on_startup():
    """Ensure database has initial sample data on launch."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        seed_demo_data(db)
    except Exception as e:
        print("Startup seed warning:", e)
    finally:
        db.close()


# Serve compiled frontend build in production (Render single-service deployment)
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


