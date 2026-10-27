import pandas as pd
from typing import List, Dict, Any

try:
    from services.data_service import data_service
    from services.fairness_service import fairness_service
except ImportError:
    from backend.services.data_service import data_service
    from backend.services.fairness_service import fairness_service


class ComparisonService:
    def __init__(self):
        pass

    def compare_properties(self, property_ids: List[str]) -> Dict[str, Any]:
        dataset = data_service.get_all_properties()
        evaluated_props = []

        for pid in property_ids[:4]:  # Max 4 properties
            match = dataset[dataset["property_id"] == pid]
            if not match.empty:
                prop_data = fairness_service.evaluate_property(match.iloc[0], dataset)
                
                # Derive value score (composite of fairness score, metro accessibility, and rent/sqft efficiency)
                # Value score out of 100
                fairness_component = prop_data["fairness_score"] * 0.45
                
                # Metro proximity component: <1km = 20pts, 1-3km = 14pts, >3km = 8pts
                metro_dist = prop_data["metro_distance_km"]
                metro_pts = max(5, 20 - int(metro_dist * 3))
                
                # Space & Furnishing efficiency component: max 25pts
                amenities_count = len(str(prop_data["amenities"]).split(","))
                amenity_pts = min(15, amenities_count * 2)
                
                deposit_penalty = 0
                if prop_data["deposit_to_rent_ratio"] > 6.0:
                    deposit_penalty = 10
                
                composite_val_score = round(min(100, max(20, fairness_component + metro_pts + amenity_pts + 10 - deposit_penalty)), 1)

                # Formulate highlights and drawbacks
                highlights = []
                drawbacks = []

                if prop_data["premium_pct"] <= -5:
                    highlights.append(f"Priced ₹{abs(prop_data['diff_amount']):,} below estimated market benchmark")
                elif prop_data["premium_pct"] <= 5:
                    highlights.append("Fair market pricing aligned with locality standard")
                else:
                    drawbacks.append(f"Asking rent is {prop_data['premium_pct']}% above estimated benchmark")

                if prop_data["metro_distance_km"] <= 1.2:
                    highlights.append(f"Walkable to metro ({prop_data['metro_distance_km']} km to {prop_data['nearest_metro_station']})")
                elif prop_data["metro_distance_km"] > 4.0:
                    drawbacks.append(f"Distant from nearest metro ({prop_data['metro_distance_km']} km)")

                if prop_data["deposit_to_rent_ratio"] <= 4.0:
                    highlights.append(f"Low deposit requirement ({prop_data['deposit_to_rent_ratio']} months)")
                elif prop_data["deposit_to_rent_ratio"] >= 7.0:
                    drawbacks.append(f"High security deposit demanded ({prop_data['deposit_to_rent_ratio']} months)")

                if "Power Backup" in str(prop_data["amenities"]):
                    highlights.append("Includes 24/7 power backup")

                evaluated_props.append({
                    "property": prop_data,
                    "value_score": composite_val_score,
                    "highlights": highlights,
                    "drawbacks": drawbacks
                })

        if not evaluated_props:
            return {
                "properties": [],
                "best_value_property_id": "",
                "recommendation_summary": "No matching properties found."
            }

        # Pick best value property based on composite value score
        sorted_by_val = sorted(evaluated_props, key=lambda x: x["value_score"], reverse=True)
        best = sorted_by_val[0]
        best_id = best["property"]["property_id"]
        best_title = f"{best['property']['bhk']} BHK in {best['property']['locality']} ({best['property']['property_id']})"

        summary = (
            f"Analytical recommendation: {best_title} provides the highest holistic value score ({best['value_score']}/100) "
            f"balancing fair asking rent (₹{best['property']['rent']:,}/mo), "
            f"metro proximity ({best['property']['metro_distance_km']} km), and {best['property']['furnishing']} standard."
        )

        return {
            "properties": evaluated_props,
            "best_value_property_id": best_id,
            "recommendation_summary": summary
        }

comparison_service = ComparisonService()
