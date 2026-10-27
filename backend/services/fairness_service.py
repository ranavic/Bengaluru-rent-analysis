import pandas as pd
import numpy as np
from typing import Dict, Any, List

try:
    from services.data_service import data_service
    from services.rent_estimator import rent_estimator
except ImportError:
    from backend.services.data_service import data_service
    from backend.services.rent_estimator import rent_estimator


class FairnessService:
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    def warm_cache(self, dataset: pd.DataFrame = None):
        if dataset is None:
            dataset = data_service.get_all_properties()
        for _, row in dataset.iterrows():
            pid = str(row["property_id"])
            if pid not in self._cache:
                self._cache[pid] = self._compute_evaluation(row, dataset)

    def evaluate_property(self, property_row: pd.Series, dataset: pd.DataFrame = None) -> Dict[str, Any]:
        pid = str(property_row.get("property_id", ""))
        if pid and pid in self._cache:
            return self._cache[pid]

        if dataset is None:
            dataset = data_service.get_all_properties()

        res = self._compute_evaluation(property_row, dataset)
        if pid:
            self._cache[pid] = res
        return res

    def _compute_evaluation(self, property_row: pd.Series, dataset: pd.DataFrame) -> Dict[str, Any]:
        asking_rent = int(property_row["rent"])
        deposit = int(property_row["deposit"])
        area_sqft = int(property_row["area_sqft"])
        rent_per_sqft = round(float(asking_rent / area_sqft), 2)
        deposit_to_rent_ratio = round(float(deposit / asking_rent), 1)

        expected_rent, factor_breakdown = rent_estimator.estimate_expected_rent(property_row, dataset)
        diff_amount = asking_rent - expected_rent
        premium_pct = round(((asking_rent - expected_rent) / expected_rent) * 100.0, 2)

        # Transparent Fairness Score (0-100)
        if premium_pct <= -15.0:
            fairness_score = min(100, int(round(95 + (abs(premium_pct) - 15) * 0.25)))
            price_category = "Below Benchmark"
            verdict_badge = "Exceptional Value Deal"
            verdict_narrative = f"Asking rent is ₹{abs(diff_amount):,} ({abs(premium_pct)}%) below comparable market expectation. High value for students and young professionals."
        elif premium_pct < -5.0:
            fairness_score = int(round(88 + abs(premium_pct)))
            price_category = "Below Benchmark"
            verdict_badge = "Good Value"
            verdict_narrative = f"Priced ₹{abs(diff_amount):,} ({abs(premium_pct)}%) below benchmark peers in {property_row['locality']}."
        elif -5.0 <= premium_pct <= 5.0:
            deviation_penalty = abs(premium_pct) * 1.2
            fairness_score = int(round(90 - deviation_penalty))
            price_category = "Near Benchmark"
            verdict_badge = "Fair Market Price"
            verdict_narrative = f"Asking rent is closely aligned with prevailing micro-market rates within {abs(premium_pct)}%."
        elif 5.0 < premium_pct <= 18.0:
            fairness_score = int(round(80 - (premium_pct - 5) * 1.7))
            price_category = "Above Benchmark"
            verdict_badge = "Slightly Overpriced"
            verdict_narrative = f"Asking rent carries a ₹{diff_amount:,} (+{premium_pct}%) premium above peer median. Negotiate down."
        elif 18.0 < premium_pct <= 35.0:
            fairness_score = int(round(58 - (premium_pct - 18) * 1.2))
            price_category = "Above Benchmark"
            verdict_badge = "Significantly Overpriced"
            verdict_narrative = f"Significant premium of ₹{diff_amount:,} (+{premium_pct}%) compared to equivalent listings in the neighbourhood."
        else:
            fairness_score = max(18, int(round(38 - (premium_pct - 35) * 0.5)))
            price_category = "Above Benchmark"
            verdict_badge = "Severely Overpriced"
            verdict_narrative = f"Substantial mark-up of +{premium_pct}% above comparable market rates. Reconsider or request rent revision."

        deposit_assessment = "Standard"
        if deposit_to_rent_ratio > 7.0:
            deposit_assessment = "High Deposit Requirement"
        elif deposit_to_rent_ratio <= 3.5:
            deposit_assessment = "Tenant-Friendly Low Deposit"

        score_breakdown = {
            "verdict_badge": verdict_badge,
            "verdict_narrative": verdict_narrative,
            "deposit_assessment": deposit_assessment,
            "expected_rent": expected_rent,
            "diff_amount": diff_amount,
            "premium_pct": premium_pct,
            "factors": factor_breakdown
        }

        # Python native dict conversion to ensure clean fast JSON serialization
        res = {
            "property_id": str(property_row["property_id"]),
            "locality": str(property_row["locality"]),
            "sub_locality": str(property_row["sub_locality"]),
            "latitude": float(property_row["latitude"]),
            "longitude": float(property_row["longitude"]),
            "rent": int(asking_rent),
            "deposit": int(deposit),
            "bhk": int(property_row["bhk"]),
            "area_sqft": int(area_sqft),
            "furnishing": str(property_row["furnishing"]),
            "property_type": str(property_row["property_type"]),
            "amenities": str(property_row["amenities"]),
            "property_age": int(property_row["property_age"]),
            "facing": str(property_row.get("facing", "East")),
            "metro_distance_km": float(property_row["metro_distance_km"]),
            "nearest_metro_station": str(property_row["nearest_metro_station"]),
            "listing_source": str(property_row["listing_source"]),
            "listing_date": str(property_row["listing_date"]),
            "last_checked_date": str(property_row["last_checked_date"]),
            "availability_status": str(property_row["availability_status"]),
            "rent_per_sqft": rent_per_sqft,
            "deposit_to_rent_ratio": deposit_to_rent_ratio,
            "expected_rent": expected_rent,
            "diff_amount": diff_amount,
            "premium_pct": premium_pct,
            "fairness_score": int(fairness_score),
            "price_category": price_category,
            "score_breakdown": score_breakdown
        }
        return res

    def get_comparable_properties(self, prop_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        dataset = data_service.get_all_properties()
        target = dataset[dataset["property_id"] == prop_id]
        if target.empty:
            return []
        
        target_row = target.iloc[0]
        locality = target_row["locality"]
        bhk = target_row["bhk"]
        area = target_row["area_sqft"]

        candidates = dataset[dataset["property_id"] != prop_id].copy()

        def closeness_score(row):
            score = 0.0
            if row["locality"] == locality:
                score += 50.0
            score -= abs(row["bhk"] - bhk) * 20.0
            sqft_diff_pct = abs(row["area_sqft"] - area) / max(area, 1)
            score -= sqft_diff_pct * 30.0
            if row["furnishing"] == target_row["furnishing"]:
                score += 10.0
            return score

        candidates["closeness"] = candidates.apply(closeness_score, axis=1)
        top_peers = candidates.sort_values(by="closeness", ascending=False).head(limit)

        results = []
        for _, row in top_peers.iterrows():
            results.append(self.evaluate_property(row, dataset))
        return results

fairness_service = FairnessService()
