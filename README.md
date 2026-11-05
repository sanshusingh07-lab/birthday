# 🎁 Birthday Surprise ✨ Interactive Personalized Experience

A premium, interactive, personalized digital birthday experience builder that allows anyone to create a memorable birthday surprise for their friends, partners, family members, or loved ones.

---

## 🌟 Highlights & Features

### 1. Step-by-Step Creation Journey
- **Page 1: Welcome Screen**
  - "Make Their Birthday Unforgettable"
  - Floating hearts, stars, and animated 3D birthday gift illustrations
  - Direct CTA to start creating or explore a live finished sample
  - 3-step interactive feature cards
- **Page 2: Who's the Birthday Star?**
  - Recipient's name, sender's name, relationship badges (Friend, Best Friend, Partner, Sister, Brother, Mother, Father, Other)
  - Date of birth & celebration date pickers with validation
  - Progress tracker
- **Page 3: Fill the Balloons**
  - 5 interactive question cards with selectable suggestions + custom answers
  - Real-time animated floating balloon tracker: balloons bounce and inflate as answers are entered
  - Progress tracker ("5 of 5 balloons filled with love")
- **Page 4: Hang Up Some Memories**
  - Drag-and-drop photo uploader with multiple image support
  - Polaroid-style cards with rotation, shadows, and editable handwritten captions
  - Quick "Add 3 Sample Photos" preset option
  - Option to continue with or without photos
- **Page 5: Write Your Birthday Letter**
  - 3 writing styles: *Emotional & Heartfelt*, *Funny & Playful*, and *Sweet & Romantic*
  - AI letter generation with OpenAI / Gemini API support and personalized smart fallback engine
  - Vintage parchment paper card with wax seal badge and live word/character counts
  - Ready-made birthday wishes shelf for 1-click appending
- **Page 6: Review Your Birthday Surprise**
  - Comprehensive summary with instant shortcuts to edit any section
  - Prominent **"Create The Magic ✨"** button
  - Dreamy multi-stage loading sequence ("Collecting beautiful memories...", "Preparing your birthday surprise...", "Adding a little magic...", "Almost ready!")

---

### 2. The Final Magical Birthday Experience (`/surprise/:slug`)
A cosmic deep-purple atmosphere (`#170D2D`) with animated stars, floating light particles, and interactive audio:
1. **Scene 1: Birthday Reveal**
   - Floating heart balloon arrangement rising gracefully
   - Glowing typography: *"It's officially your day!"* and *"Happy Birthday, [Name]!"*
   - Dual-cannon confetti explosion & celebration fanfare
2. **Scene 2: Pop the Balloons**
   - 3D styled glossy pastel balloons floating gently
   - Clicking a balloon plays a realistic pop sound effect, bursts confetti from the balloon coordinates, and reveals a secret personalized wish inside a floating modal card
   - Tracks popped progress
3. **Scene 3: Birthday Letter Reveal**
   - Elegant vintage illuminated parchment card with wax seal
   - Typewriter animation typing out the letter paragraph by paragraph with play/skip options
   - Handwritten closing signature: *"With all my love, [Sender] ❤️"*
4. **Scene 4: Memory Gallery**
   - Polaroid-style photo cards pinned like memories on a clothesline
   - Gentle tilt and handwritten captions
   - Lightbox modal with full-size photo preview
5. **Scene 5: Final Birthday Celebration**
   - Interactive 3D birthday cake with flickering candle flames
   - Tap cake to *"Make a Wish & Blow Out the Candles!"* (extinguishes flames, triggers smoke puff, and erupts continuous fireworks & falling confetti)
   - Final quote: *"May your life always be filled with happiness, laughter, and beautiful memories."*
   - Action buttons:
     - 🔄 **Replay Birthday Surprise** (smooth scroll to top and re-trigger reveal)
     - 🔗 **Share Birthday Surprise** (opens modal with share link, 1-click copy, WhatsApp share, Twitter/X share, and QR code)
     - 🎁 **Create Another Surprise**

---

### 3. Audio & Music Engine (Web Audio API)
- Zero external audio file 404 dependencies!
- **Sound Effects**: Realistic bandpass-filtered balloon pop sound, crystalline pentatonic sparkle chimes, festive celebration fanfare chords, and subtle tactile UI clicks.
- **Ambient Dreamy Music Synthesizer**: Polyphonic warm synth chord progression (Fmaj7 - G6 - Em7 - Am7) with gentle arpeggio melodies.
- Ambient music play/pause toggle and sound mute button in navbar and floating controls.

---

### 4. Admin Dashboard (`/admin`)
- Accessible via the Shield icon in the navigation bar
- Total surprises created, memories uploaded, and balloon wishes answered
- Search by recipient, sender, or relationship
- Quick preview link to open any surprise experience
- Delete inappropriate or unauthorized content
- "Seed Sample Surprise" button for instant testing

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide React, Canvas Confetti
- **Audio**: Web Audio API (real-time sound synthesis & ambient music generation)
- **Backend**: Python FastAPI, Uvicorn
- **Database**: SQLite (default, zero configuration) / PostgreSQL (configured via `DATABASE_URL`) with SQLAlchemy ORM
- **AI Integration**: OpenAI API (`gpt-4o-mini`) / Gemini API with smart template fallback engine

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # On Windows (or source venv/bin/activate on Mac/Linux)
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API runs on `http://127.0.0.1:8000` (Docs available at `/docs`).

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://127.0.0.1:5173` in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/birthday/create` | Create a new birthday surprise experience |
| `GET` | `/api/birthday/{id}` | Retrieve surprise by ID |
| `GET` | `/api/birthday/share/{slug}` | Retrieve publicly shared surprise by unique slug |
| `PUT` | `/api/birthday/{id}` | Update birthday surprise information |
| `DELETE` | `/api/birthday/{id}` | Delete a birthday surprise |
| `POST` | `/api/birthday/{id}/upload` | Upload photograph associated with surprise |
| `POST` | `/api/birthday/upload-temp` | Upload temporary photograph during creation flow |
| `POST` | `/api/birthday/generate-letter` | Generate personalized letter using AI / template engine |
| `GET` | `/api/admin/stats` | Retrieve platform statistics and recent creations |
| `POST` | `/api/admin/seed` | Seed a demo surprise for instant testing |
| `GET` | `/api/health` | Health check endpoint |

