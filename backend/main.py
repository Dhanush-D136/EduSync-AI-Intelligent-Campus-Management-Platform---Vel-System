from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from db.database import Base, engine
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
import models.models

from routers import camera, students, dashboard, reports

# Safely create all tables for local dev testing
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Should be restricted in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME
    }

app.include_router(camera.router, prefix="/api/camera", tags=["Camera"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
