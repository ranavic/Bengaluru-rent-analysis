from fastapi import APIRouter
from typing import List, Dict, Any

try:
    from services.data_service import data_service
except ImportError:
    from backend.services.data_service import data_service


router = APIRouter(prefix="/api/metro-stations", tags=["Metro"])

@router.get("", response_model=List[Dict[str, Any]])
def get_metro_stations():
    return data_service.get_all_metro_stations()
