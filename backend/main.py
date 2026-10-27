from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
import sys

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from routes.properties import router as properties_router
from routes.analytics import router as analytics_router
from routes.metro import router as metro_router
from routes.comparison import router as comparison_router
from services.data_service import data_service
from services.fairness_service import fairness_service

# Pre-calculate baseline evaluations for instant responses
fairness_service.warm_cache()

app = FastAPI(
    title="Bengaluru Rental Intelligence API",
    description="Geospatial Business Intelligence API for Bengaluru Rental Markets, Rental Fairness Scoring, and Micro-market Analytics",
    version="1.0.0"
)


# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(properties_router)
app.include_router(analytics_router)
app.include_router(metro_router)
app.include_router(comparison_router)

@app.get("/api/health", tags=["Health"])
def health_check():
    df = data_service.get_all_properties()
    metro_stations = data_service.get_all_metro_stations()
    return {
        "status": "healthy",
        "service": "Bengaluru Rental Intelligence API",
        "timestamp": datetime.now().isoformat(),
        "total_properties": len(df),
        "total_metro_stations": len(metro_stations),
        "localities_covered": int(df["locality"].nunique())
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Bengaluru Rental Intelligence Geospatial API",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
