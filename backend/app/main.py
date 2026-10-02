from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database.database import Base, engine
from .database import models

from .routes.resume_routes import router as resume_router
from .routes.job_router import router as job_router
from .routes.auth_routes import router as auth_router
from .routes.chat_routes import router as chat_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="AI Resume Intelligence System"
)


# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ai-resume-intelligence-system-eight.vercel.app",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(resume_router)
app.include_router(job_router)
app.include_router(auth_router)
app.include_router(chat_router)


@app.get("/")
def home():
    return {
        "message": "AI Resume Intelligence System API is running"
    }