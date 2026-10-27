from fastapi import APIRouter, Query, Body, HTTPException
from typing import List, Dict, Any, Optional

try:
    from services.comparison_service import comparison_service
except ImportError:
    from backend.services.comparison_service import comparison_service


router = APIRouter(prefix="/api/properties/compare", tags=["Comparison"])

@router.get("", response_model=Dict[str, Any])
def compare_properties_get(ids: str = Query(..., description="Comma-separated property IDs e.g. 'BLR-IND-0001,BLR-KOR-0045'")):
    property_ids = [p.strip() for p in ids.split(",") if p.strip()]
    if not property_ids:
        raise HTTPException(status_code=400, detail="Please provide at least one property ID")
    return comparison_service.compare_properties(property_ids)

@router.post("", response_model=Dict[str, Any])
def compare_properties_post(payload: Dict[str, List[str]] = Body(...)):
    property_ids = payload.get("property_ids", [])
    if not property_ids:
        raise HTTPException(status_code=400, detail="Please provide property_ids list")
    return comparison_service.compare_properties(property_ids)
