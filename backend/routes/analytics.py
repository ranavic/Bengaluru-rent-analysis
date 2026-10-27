from fastapi import APIRouter, Query
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np

try:
    from services.data_service import data_service
    from services.fairness_service import fairness_service
except ImportError:
    from backend.services.data_service import data_service
    from backend.services.fairness_service import fairness_service


router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview", response_model=Dict[str, Any])
def get_overview_metrics(
    locality: Optional[str] = Query(None),
    min_rent: Optional[int] = Query(None),
    max_rent: Optional[int] = Query(None),
    bhk: Optional[int] = Query(None),
    furnishing: Optional[str] = Query(None)
):
    df = data_service.filter_properties(
        locality=locality,
        min_rent=min_rent,
        max_rent=max_rent,
        bhk=bhk,
        furnishing=furnishing
    )

    all_dataset = data_service.get_all_properties()

    if df.empty:
        return {
            "total_listings": 0,
            "median_rent": 0,
            "median_rent_per_sqft": 0.0,
            "pct_above_benchmark": 0.0,
            "pct_below_benchmark": 0.0,
            "pct_near_benchmark": 0.0,
            "avg_metro_distance_km": 0.0,
            "student_budget_listings_pct": 0.0,
            "median_deposit": 0,
            "total_localities": 0
        }

    total_listings = len(df)
    median_rent = int(df["rent"].median())
    median_rent_per_sqft = round(float(df["rent_per_sqft"].median()), 2)
    median_deposit = int(df["deposit"].median())
    avg_metro_dist = round(float(df["metro_distance_km"].mean()), 2)
    student_listings = int((df["rent"] <= 20000).sum())
    student_budget_pct = round((student_listings / total_listings) * 100.0, 1)
    total_localities = int(df["locality"].nunique())

    # Calculate benchmark comparisons for current subset
    above_count = 0
    below_count = 0
    near_count = 0

    for _, row in df.iterrows():
        evaluated = fairness_service.evaluate_property(row, all_dataset)
        cat = evaluated["price_category"]
        if cat == "Above Benchmark":
            above_count += 1
        elif cat == "Below Benchmark":
            below_count += 1
        else:
            near_count += 1

    pct_above = round((above_count / total_listings) * 100.0, 1)
    pct_below = round((below_count / total_listings) * 100.0, 1)
    pct_near = round((near_count / total_listings) * 100.0, 1)

    return {
        "total_listings": total_listings,
        "median_rent": median_rent,
        "median_rent_per_sqft": median_rent_per_sqft,
        "pct_above_benchmark": pct_above,
        "pct_below_benchmark": pct_below,
        "pct_near_benchmark": pct_near,
        "avg_metro_distance_km": avg_metro_dist,
        "student_budget_listings_pct": student_budget_pct,
        "median_deposit": median_deposit,
        "total_localities": total_localities
    }

@router.get("/localities", response_model=List[Dict[str, Any]])
def get_locality_analytics(
    min_rent: Optional[int] = Query(None),
    max_rent: Optional[int] = Query(None),
    bhk: Optional[int] = Query(None),
    furnishing: Optional[str] = Query(None)
):
    df = data_service.filter_properties(
        min_rent=min_rent,
        max_rent=max_rent,
        bhk=bhk,
        furnishing=furnishing
    )

    if df.empty:
        return []

    localities_stats = []
    for loc, group in df.groupby("locality"):
        localities_stats.append({
            "locality": loc,
            "latitude": round(float(group["latitude"].mean()), 5),
            "longitude": round(float(group["longitude"].mean()), 5),
            "listing_count": len(group),
            "median_rent": int(group["rent"].median()),
            "median_rent_per_sqft": round(float(group["rent_per_sqft"].median()), 2),
            "avg_metro_distance_km": round(float(group["metro_distance_km"].mean()), 2),
            "min_rent": int(group["rent"].min()),
            "max_rent": int(group["rent"].max()),
            "median_deposit": int(group["deposit"].median())
        })

    # Sort by median rent descending
    localities_stats.sort(key=lambda x: x["median_rent"], reverse=True)
    return localities_stats

@router.get("/rent-distribution", response_model=Dict[str, Any])
def get_rent_distribution(
    locality: Optional[str] = Query(None),
    min_rent: Optional[int] = Query(None),
    max_rent: Optional[int] = Query(None)
):
    df = data_service.filter_properties(
        locality=locality,
        min_rent=min_rent,
        max_rent=max_rent
    )

    if df.empty:
        return {"by_bhk": [], "by_furnishing": []}

    # 1. By BHK
    bhk_data = []
    for bhk_val, group in df.groupby("bhk"):
        bhk_data.append({
            "bhk": f"{bhk_val} BHK",
            "bhk_num": int(bhk_val),
            "count": len(group),
            "median_rent": int(group["rent"].median()),
            "min_rent": int(group["rent"].min()),
            "max_rent": int(group["rent"].max()),
            "avg_area_sqft": int(group["area_sqft"].mean()),
            "median_rent_per_sqft": round(float(group["rent_per_sqft"].median()), 2)
        })
    bhk_data.sort(key=lambda x: x["bhk_num"])

    # 2. By Furnishing
    furn_data = []
    for furn_val, group in df.groupby("furnishing"):
        furn_data.append({
            "furnishing": furn_val,
            "count": len(group),
            "median_rent": int(group["rent"].median()),
            "median_rent_per_sqft": round(float(group["rent_per_sqft"].median()), 2),
            "avg_area_sqft": int(group["area_sqft"].mean())
        })
    furn_data.sort(key=lambda x: x["median_rent"], reverse=True)

    return {
        "by_bhk": bhk_data,
        "by_furnishing": furn_data
    }

@router.get("/scatter", response_model=List[Dict[str, Any]])
def get_area_rent_scatter(
    locality: Optional[str] = Query(None),
    bhk: Optional[int] = Query(None),
    limit: int = Query(250)
):
    df = data_service.filter_properties(locality=locality, bhk=bhk)
    if df.empty:
        return []

    sample_df = df.head(limit)
    scatter_data = []
    for _, row in sample_df.iterrows():
        scatter_data.append({
            "property_id": row["property_id"],
            "locality": row["locality"],
            "area_sqft": int(row["area_sqft"]),
            "rent": int(row["rent"]),
            "bhk": int(row["bhk"]),
            "furnishing": row["furnishing"],
            "rent_per_sqft": float(row["rent_per_sqft"])
        })
    return scatter_data

@router.get("/metro-premium", response_model=List[Dict[str, Any]])
def get_metro_premium_analysis(locality: Optional[str] = Query(None)):
    df = data_service.filter_properties(locality=locality)
    if df.empty:
        return []

    # Distance buckets
    bins = [0, 1.0, 2.0, 3.5, 5.0, 100.0]
    labels = ["< 1.0 km (Walking)", "1.0 - 2.0 km", "2.0 - 3.5 km", "3.5 - 5.0 km", "> 5.0 km"]
    df = df.copy()
    df["metro_bucket"] = pd.cut(df["metro_distance_km"], bins=bins, labels=labels, right=False)

    bucket_stats = []
    for bucket_name, group in df.groupby("metro_bucket", observed=False):
        if len(group) > 0:
            bucket_stats.append({
                "distance_range": str(bucket_name),
                "count": len(group),
                "median_rent": int(group["rent"].median()),
                "median_rent_per_sqft": round(float(group["rent_per_sqft"].median()), 2),
                "avg_rent": int(group["rent"].mean())
            })
    return bucket_stats
