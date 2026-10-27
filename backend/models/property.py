from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class MetroStation(BaseModel):
    station_name: str
    line: str
    latitude: float
    longitude: float
    status: str

class PropertyBase(BaseModel):
    property_id: str
    locality: str
    sub_locality: str
    latitude: float
    longitude: float
    rent: int
    deposit: int
    bhk: int
    area_sqft: int
    furnishing: str
    property_type: str
    amenities: str
    property_age: int
    facing: Optional[str] = "East"
    metro_distance_km: float
    nearest_metro_station: str
    listing_source: str
    listing_date: str
    last_checked_date: str
    availability_status: str

class PropertyAnalysis(BaseModel):
    property_id: str
    locality: str
    sub_locality: str
    latitude: float
    longitude: float
    rent: int
    deposit: int
    bhk: int
    area_sqft: int
    furnishing: str
    property_type: str
    amenities: str
    property_age: int
    facing: Optional[str] = "East"
    metro_distance_km: float
    nearest_metro_station: str
    listing_source: str
    listing_date: str
    last_checked_date: str
    availability_status: str
    rent_per_sqft: float
    expected_rent: int
    diff_amount: int
    premium_pct: float
    fairness_score: int
    price_category: str  # "Below Benchmark", "Near Benchmark", "Above Benchmark"
    deposit_to_rent_ratio: float
    score_breakdown: Dict[str, Any]

class OverviewMetrics(BaseModel):
    total_listings: int
    median_rent: int
    median_rent_per_sqft: float
    pct_above_benchmark: float
    pct_below_benchmark: float
    pct_near_benchmark: float
    avg_metro_distance_km: float
    student_budget_listings_pct: float  # rent <= 20,000
    median_deposit: int
    total_localities: int

class LocalitySummary(BaseModel):
    locality: str
    latitude: float
    longitude: float
    listing_count: int
    median_rent: int
    median_rent_per_sqft: float
    avg_metro_distance_km: float
    min_rent: int
    max_rent: int
    tier: str

class CompareRequest(BaseModel):
    property_ids: List[str]

class ComparisonItem(BaseModel):
    property: PropertyAnalysis
    value_score: float
    highlights: List[str]
    drawbacks: List[str]

class ComparisonResponse(BaseModel):
    properties: List[ComparisonItem]
    best_value_property_id: str
    recommendation_summary: str
