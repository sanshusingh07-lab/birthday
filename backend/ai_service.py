import os
import random
import httpx
from typing import List, Dict, Any, Optional

READY_MADE_WISHES = {
    "emotional": [
        "May the upcoming year hold as much warmth, peace, and quiet joy as you bring into my life every single day.",
        "Here's to celebrating the rare, beautiful soul that you are. You deserve all the good things the universe has to offer.",
        "Watching you grow, dream, and overcome has been one of the greatest privileges of my life. Happy Birthday!",
        "May every door you open this year lead to happiness, love, and fulfillment beyond what you could have imagined.",
        "Thank you for being the constant anchor, the bright spark, and the heart of so many unforgettable moments.",
        "Today is a reminder of how blessed the world is to have had you in it for another wonderful year."
    ],
    "funny": [
        "Happy Birthday! I was going to make a joke about your age, but I respect my elders.",
        "Congratulations on surviving another 365 days of tolerating me. You deserve an award (and definitely more cake)!",
        "May your day be filled with lots of love, laughter, and zero unwanted phone calls from numbers you don't know.",
        "Don't worry about getting older—you're just leveling up in wisdom and getting closer to those sweet senior discounts!",
        "Another year older, none the wiser, but twice as fun! Let's eat way too much frosting.",
        "Happy Birthday to someone who is smart, gorgeous, funny, and reminds me a lot of myself!"
    ],
    "romantic": [
        "Every single moment spent by your side makes life feel like poetry. Happy Birthday to the love of my life.",
        "You are my favourite person to wake up to, laugh with, and dream alongside. Happy Birthday, my heart.",
        "The world became infinitely more vibrant and magical on the day you were born. I cherish you deeply.",
        "May this year wrap you in the same tenderness and endless devotion that you inspire in me every day.",
        "No gift could ever measure up to the gift of having your smile in my world. Happy Birthday, my love.",
        "Here is to another year of holding hands, late-night conversations, and making forever memories together."
    ]
}

def generate_fallback_letter(
    recipient: str,
    sender: str,
    relationship: str,
    style: str,
    memories_or_notes: Optional[str] = None,
    answers: Optional[Dict[str, str]] = None
) -> str:
    """Generate a rich, deeply personalized birthday letter when AI API is unavailable."""
    rel = relationship.lower()
    mem = memories_or_notes.strip() if memories_or_notes else ""

    # Extract answers if available
    special = ""
    favourite_memory = ""
    love_most = ""
    three_words = ""
    wish = ""
    if answers:
        special = answers.get("special", "")
        favourite_memory = answers.get("memory", "")
        love_most = answers.get("love_most", "")
        three_words = answers.get("three_words", "")
        wish = answers.get("wish", "")

    if style == "funny":
        intro = f"Dearest {recipient},\n\nFirst things first: Happy Birthday! Let's pause and appreciate that you have officially completed another trip around the sun and somehow haven't lost your mind (well, not completely)."
        
        middle_paragraphs = []
        if rel in ["friend", "best friend"]:
            middle_paragraphs.append(f"Having you as my {rel} is an absolute adventure. From our completely unfiltered conversations to the questionable life choices we laugh about later, there is truly no one else I'd rather cause mild chaos with.")
        elif rel in ["partner"]:
            middle_paragraphs.append(f"Being with you is proof that patience is a virtue—mostly yours, but occasionally mine! You make life so much more fun, exciting, and wonderfully unpredictable.")
        else:
            middle_paragraphs.append(f"As my wonderful {rel}, you've brought endless laughter and great stories into my life. I couldn't ask for someone cooler to share this journey with.")

        if favourite_memory:
            middle_paragraphs.append(f"I still laugh every time I remember {favourite_memory}. Moments like that remind me why life is never boring when you're around.")
        elif mem:
            middle_paragraphs.append(f"Thinking about {mem} still puts an instant smile on my face.")

        if three_words:
            middle_paragraphs.append(f"If anyone asked me to describe you in three words, they'd definitely be: {three_words}.")

        closing = f"May your day be packed with cake, zero responsibilities, and people showering you with the compliments you know you deserve.\n\nHere's to getting older, hotter, and even more unstoppable!\n\nWith all my love and questionable humor,\n{sender} 🎈"
        
        return f"{intro}\n\n" + "\n\n".join(middle_paragraphs) + f"\n\n{closing}"

    elif style == "romantic":
        intro = f"My dearest {recipient},\n\nHappy Birthday to the one who makes my entire world gentler, brighter, and infinitely more beautiful."
        
        middle_paragraphs = []
        middle_paragraphs.append(f"Every day with you feels like an answered prayer. You have this quiet, radiant way of turning ordinary moments into memories that I want to hold onto forever.")

        if love_most:
            middle_paragraphs.append(f"What I love most about you is {love_most}. It’s in the way you laugh, the warmth in your eyes, and how safe you make my heart feel.")
        
        if favourite_memory:
            middle_paragraphs.append(f"Whenever I think back to {favourite_memory}, my heart skips a beat. You are my home, my calm, and my favorite adventure.")
        elif mem:
            middle_paragraphs.append(f"Remembering {mem} fills me with so much gratitude that our paths crossed.")

        if wish:
            middle_paragraphs.append(f"On your special day, my deepest wish for you is that {wish}. You deserve a love that surrounds you like a warm embrace.")

        closing = f"Thank you for being you, for loving me, and for filling my life with so much wonder. Today and every single day, I celebrate you with everything I have.\n\nForever and always yours,\n{sender} ❤️"

        return f"{intro}\n\n" + "\n\n".join(middle_paragraphs) + f"\n\n{closing}"

    else: # emotional / heartfelt (default)
        intro = f"Dearest {recipient},\n\nHappy Birthday. Today is all about celebrating you—the rare, kind-hearted, and incredible person who brings so much light into the lives of everyone around you."

        middle_paragraphs = []
        middle_paragraphs.append(f"Words often fall short when trying to express just how much you mean to me as my {rel}. You have been a source of strength, pure joy, and inspiration in ways you might not even realize.")

        if special:
            middle_paragraphs.append(f"What makes you so truly special is {special}. Your presence alone has a way of making any room feel warmer and every heavy day feel lighter.")

        if favourite_memory:
            middle_paragraphs.append(f"One of my most cherished memories is {favourite_memory}. I will always hold onto that moment with so much fondness and gratitude.")
        elif mem:
            middle_paragraphs.append(f"I was just thinking about {mem}, and it reminded me of just how lucky I am to have you in my corner.")

        if wish:
            middle_paragraphs.append(f"As you step into this new year of your life, my prayer and wish for you is {wish}.")
        else:
            middle_paragraphs.append("May this year ahead bring you profound peace, exhilarating adventures, good health, and the fulfillment of the dreams you hold closest to your heart.")

        closing = f"Never forget how deeply loved, valued, and appreciated you are today and every day.\n\nWith all my love and warmest wishes,\n{sender} ✨"

        return f"{intro}\n\n" + "\n\n".join(middle_paragraphs) + f"\n\n{closing}"


async def generate_letter_with_ai(
    recipient: str,
    sender: str,
    relationship: str,
    style: str,
    memories_or_notes: Optional[str] = None,
    answers: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """Attempt AI generation via OpenAI/Gemini; gracefully fall back to rich customized template."""
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    style_descriptions = {
        "emotional": "deeply touching, heartfelt, poetic, emotional, and grateful",
        "funny": "playful, funny, lighthearted, teasing with warmth, and celebratory",
        "romantic": "intimate, tender, romantic, sweet, and deeply affectionate"
    }
    style_desc = style_descriptions.get(style, "heartfelt and celebratory")

    prompt_details = f"Recipient: {recipient}\nSender: {sender}\nRelationship: {relationship}\nTone/Style: {style_desc}"
    if memories_or_notes:
        prompt_details += f"\nMemories/Notes: {memories_or_notes}"
    if answers:
        prompt_details += f"\nSpecific answers about recipient: {answers}"

    # Try OpenAI if configured
    if openai_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_key}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a master personal letter writer. Write a beautiful, authentic, touching birthday letter that feels human, sincere, and perfectly tailored to the requested tone. Do not use generic placeholders. Output only the letter text."
                            },
                            {
                                "role": "user",
                                "content": f"Write a personalized birthday letter with these details:\n{prompt_details}"
                            }
                        ],
                        "temperature": 0.85
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    letter = data["choices"][0]["message"]["content"].strip()
                    return {
                        "letter": letter,
                        "style": style,
                        "suggested_wishes": READY_MADE_WISHES.get(style, READY_MADE_WISHES["emotional"])
                    }
        except Exception as e:
            print(f"OpenAI generation error: {e}, falling back to template engine.")

    # Try Gemini if configured
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    url,
                    json={
                        "contents": [{
                            "parts": [{"text": f"Write a touching, authentic birthday letter for {recipient} from {sender} ({relationship}) in a {style_desc} tone. Keep it natural, warm, and formatted into beautiful paragraphs. Details:\n{prompt_details}"}]
                        }]
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    letter = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    return {
                        "letter": letter,
                        "style": style,
                        "suggested_wishes": READY_MADE_WISHES.get(style, READY_MADE_WISHES["emotional"])
                    }
        except Exception as e:
            print(f"Gemini generation error: {e}, falling back to template engine.")

    # Fallback to high-fidelity template engine
    fallback = generate_fallback_letter(
        recipient=recipient,
        sender=sender,
        relationship=relationship,
        style=style,
        memories_or_notes=memories_or_notes,
        answers=answers
    )
    return {
        "letter": fallback,
        "style": style,
        "suggested_wishes": READY_MADE_WISHES.get(style, READY_MADE_WISHES["emotional"])
    }

