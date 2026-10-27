from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any

try:
    from services.data_service import data_service
    from services.fairness_service import fairness_service
except ImportError:
    from backend.services.data_service import data_service
    from backend.services.fairness_service import fairness_service


router = APIRouter(prefix="/api/properties", tags=["Properties"])

@router.get("", response_model=Dict[str, Any])
def get_properties(
    locality: Optional[str] = Query(None, description="Locality name or 'All'"),
    min_rent: Optional[int] = Query(None, description="Minimum rent in INR"),
    max_rent: Optional[int] = Query(None, description="Maximum rent in INR"),
    bhk: Optional[int] = Query(None, description="BHK count (1, 2, 3, 4)"),
    furnishing: Optional[str] = Query(None, description="Furnishing status"),
    min_area: Optional[int] = Query(None, description="Minimum square footage"),
    max_metro_dist: Optional[float] = Query(None, description="Max distance to metro in km"),
    price_category: Optional[str] = Query(None, description="Below Benchmark, Near Benchmark, Above Benchmark"),
    search: Optional[str] = Query(None, description="Search term across localities, sub-localities, amenities"),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    filtered_df = data_service.filter_properties(
        locality=locality,
        min_rent=min_rent,
        max_rent=max_rent,
        bhk=bhk,
        furnishing=furnishing,
        min_area=min_area,
        max_metro_dist=max_metro_dist,
        search=search
    )

    all_dataset = data_service.get_all_properties()

    # Enrich each property with fairness evaluation
    evaluated_records = []
    for _, row in filtered_df.iterrows():
        eval_prop = fairness_service.evaluate_property(row, all_dataset)
        # Apply price category filter if specified
        if price_category and price_category != "All":
            if eval_prop["price_category"].lower() != price_category.lower():
                continue
        evaluated_records.append(eval_prop)

    total_count = len(evaluated_records)
    paginated = evaluated_records[offset: offset + limit]

    return {
        "total": total_count,
        "offset": offset,
        "limit": limit,
        "properties": paginated
    }

@router.get("/{property_id}", response_model=Dict[str, Any])
def get_property_by_id(property_id: str):
    df = data_service.get_all_properties()
    matched = df[df["property_id"] == property_id]
    if matched.empty:
        raise HTTPException(status_code=404, detail=f"Property {property_id} not found")
    
    return fairness_service.evaluate_property(matched.iloc[0], df)

@router.get("/{property_id}/comparables", response_model=List[Dict[str, Any]])
def get_property_comparables(property_id: str, limit: int = Query(5, ge=1, le=10)):
    comps = fairness_service.get_comparable_properties(property_id, limit=limit)
    if not comps:
        raise HTTPException(status_code=404, detail=f"No comparables found or property {property_id} does not exist")
    return comps
