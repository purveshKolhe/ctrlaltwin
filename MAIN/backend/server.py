from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import re
import asyncio
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    LlmChat = None
    UserMessage = None

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'presenter_studio')]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Model config (Universal Key stand-in for AWS Bedrock; swap when AWS creds are added)
TEXT_PROVIDER = "openai"
TEXT_MODEL = "gpt-5.4"
IMAGE_PROVIDER = "gemini"
IMAGE_MODEL = "gemini-3.1-flash-image-preview"

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------- Models ----------
class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=2000)
    slide_count: int = Field(default=6, ge=3, le=8)
    tone: str = Field(default="professional")
    with_images: bool = True


class Slide(BaseModel):
    index: int
    title: str
    subtitle: Optional[str] = ""
    bullets: List[str] = Field(default_factory=list)
    narration: str
    image: Optional[str] = None


class Presentation(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = ""
    prompt: str
    tone: str
    slides: List[Slide]
    created_at: str


# ---------- Helpers ----------
def extract_json(text: str) -> dict:
    if not text:
        raise ValueError("empty response")
    text = text.strip()
    # strip code fences
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no json object found")
    return json.loads(text[start:end + 1])


async def generate_outline(prompt: str, slide_count: int, tone: str) -> dict:
    if LlmChat is None or UserMessage is None:
        raise RuntimeError(
            "The optional emergentintegrations package is not installed; "
            "configure a supported LLM integration before generating presentations."
        )
    system = (
        "You are an award-winning presentation writer that turns a brief into a cinematic "
        "presenter-video script. You always respond with STRICT valid JSON only, no markdown, "
        "no commentary. The JSON shape must be exactly:\n"
        "{\n"
        '  "title": "punchy deck title, max 8 words",\n'
        '  "subtitle": "one compelling line",\n'
        '  "slides": [\n'
        '    { "title": "slide headline", "subtitle": "short supporting line", '
        '"bullets": ["2 to 4 concise points"], '
        '"narration": "2-4 natural sentences meant to be spoken aloud by a narrator", '
        '"image_prompt": "a vivid cinematic visual description for a background image, no text, no words" }\n'
        "  ]\n"
        "}\n"
        f"Produce EXACTLY {slide_count} slides. The first slide is an engaging title/intro slide and the "
        "last slide is a memorable closing/summary slide. Keep bullets short (max 8 words each). "
        f"Tone: {tone}. Do not include real statistics you are unsure about."
    )
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=str(uuid.uuid4()),
        system_message=system,
    ).with_model(TEXT_PROVIDER, TEXT_MODEL)
    user = UserMessage(text=f"Create the presenter-video script for this brief:\n\n{prompt}")
    resp = await chat.send_message(user)
    data = extract_json(str(resp))
    if "slides" not in data or not isinstance(data["slides"], list) or len(data["slides"]) == 0:
        raise ValueError("invalid outline structure")
    return data


async def generate_image(image_prompt: str, tone: str) -> Optional[str]:
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You generate cinematic, premium 16:9 presentation background images.",
        ).with_model(IMAGE_PROVIDER, IMAGE_MODEL).with_params(modalities=["image", "text"])
        msg = UserMessage(
            text=(
                "Cinematic, high-quality, 16:9 widescreen presentation background image. "
                "Dark studio aesthetic, dramatic lighting, subtle depth, premium and modern. "
                "Absolutely no text, no words, no letters, no captions in the image. "
                f"Visual concept: {image_prompt}"
            )
        )
        text, images = await chat.send_message_multimodal_response(msg)
        if images and len(images) > 0:
            img = images[0]
            return f"data:{img['mime_type']};base64,{img['data']}"
    except Exception as exc:
        logger.warning(f"image generation failed: {type(exc).__name__}: {exc}")
    return None


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Presenter Studio API"}


@api_router.post("/presentations", response_model=Presentation)
async def create_presentation(req: GenerateRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "LLM key not configured")
    try:
        outline = await generate_outline(req.prompt, req.slide_count, req.tone)
    except Exception as exc:
        logger.error(f"outline generation failed: {type(exc).__name__}: {exc}")
        raise HTTPException(502, "Failed to generate the presentation script")

    raw_slides = outline.get("slides", [])[: req.slide_count]

    images = [None] * len(raw_slides)
    if req.with_images:
        tasks = [generate_image(s.get("image_prompt", s.get("title", "")), req.tone) for s in raw_slides]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        images = [r if not isinstance(r, Exception) else None for r in results]

    slides = []
    for i, s in enumerate(raw_slides):
        bullets = s.get("bullets", []) or []
        if not isinstance(bullets, list):
            bullets = [str(bullets)]
        slides.append(Slide(
            index=i,
            title=str(s.get("title", f"Slide {i + 1}")),
            subtitle=str(s.get("subtitle", "") or ""),
            bullets=[str(b) for b in bullets][:6],
            narration=str(s.get("narration", "") or s.get("title", "")),
            image=images[i] if i < len(images) else None,
        ))

    pres = Presentation(
        id=str(uuid.uuid4()),
        title=str(outline.get("title", "Untitled Presentation")),
        subtitle=str(outline.get("subtitle", "") or ""),
        prompt=req.prompt,
        tone=req.tone,
        slides=slides,
        created_at=datetime.now(timezone.utc).isoformat(),
    )

    doc = pres.model_dump()
    doc["thumbnail"] = slides[0].image if slides else None
    doc["slide_count"] = len(slides)
    await db.presentations.insert_one({**doc})
    return pres


@api_router.get("/presentations")
async def list_presentations():
    docs = await db.presentations.find(
        {}, {"_id": 0, "slides": 0}
    ).sort("created_at", -1).to_list(100)
    return docs


@api_router.get("/presentations/{pres_id}", response_model=Presentation)
async def get_presentation(pres_id: str):
    doc = await db.presentations.find_one({"id": pres_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Presentation not found")
    return Presentation(**doc)


@api_router.delete("/presentations/{pres_id}")
async def delete_presentation(pres_id: str):
    res = await db.presentations.delete_one({"id": pres_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Presentation not found")
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
