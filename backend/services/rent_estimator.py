try:
    from services.data_service import data_service
except ImportError:
    from backend.services.data_service import data_service


class RentEstimatorService:
    def __init__(self):
        pass

    def estimate_expected_rent(self, property_row: pd.Series, dataset: pd.DataFrame = None) -> Tuple[int, Dict[str, Any]]:
        """
        Calculates the expected comparable-market rent baseline based on empirical
        peer properties in the active dataset matching Locality, BHK, Area, and Furnishing.
        """
        if dataset is None:
            dataset = data_service.get_all_properties()

        locality = property_row["locality"]
        bhk = property_row["bhk"]
        furnishing = property_row["furnishing"]
        area_sqft = property_row["area_sqft"]
        prop_id = property_row.get("property_id")

        # Exclude the property itself from peer calculation
        peers = dataset[dataset["property_id"] != prop_id] if prop_id in peers_pool(dataset, prop_id) else dataset

        # 1. Primary peer group: Same Locality + Same BHK + Same Furnishing
        exact_peers = peers[(peers["locality"] == locality) & (peers["bhk"] == bhk) & (peers["furnishing"] == furnishing)]

        # 2. Relaxed peer group 1: Same Locality + Same BHK
        loc_bhk_peers = peers[(peers["locality"] == locality) & (peers["bhk"] == bhk)]

        # 3. Relaxed peer group 2: Same Locality
        loc_peers = peers[peers["locality"] == locality]

        # 4. Fallback: Entire dataset Same BHK
        bhk_peers = peers[peers["bhk"] == bhk]

        confidence_level = "High"
        match_criteria = "Locality + BHK + Furnishing"

        if len(exact_peers) >= 4:
            peer_median_sqft = exact_peers["rent_per_sqft"].median()
            peer_count = len(exact_peers)
        elif len(loc_bhk_peers) >= 4:
            peer_median_sqft = loc_bhk_peers["rent_per_sqft"].median()
            peer_count = len(loc_bhk_peers)
            confidence_level = "Medium"
            match_criteria = "Locality + BHK"
        elif len(loc_peers) >= 4:
            peer_median_sqft = loc_peers["rent_per_sqft"].median()
            peer_count = len(loc_peers)
            confidence_level = "Moderate"
            match_criteria = "Locality-wide"
        elif len(bhk_peers) >= 4:
            peer_median_sqft = bhk_peers["rent_per_sqft"].median()
            peer_count = len(bhk_peers)
            confidence_level = "Citywide BHK Baseline"
            match_criteria = "Citywide BHK"
        else:
            peer_median_sqft = dataset["rent_per_sqft"].median()
            peer_count = len(dataset)
            confidence_level = "Citywide Baseline"
            match_criteria = "Citywide"

        # If we fell back to a broader group, apply furnishing adjustments
        furnishing_mult = 1.0
        if match_criteria in ["Locality + BHK", "Locality-wide", "Citywide BHK", "Citywide"]:
            if furnishing == "Fully-Furnished":
                furnishing_mult = 1.15
            elif furnishing == "Unfurnished":
                furnishing_mult = 0.90

        # Proximity adjustment factor
        metro_dist = property_row.get("metro_distance_km", 2.0)
        metro_adj = 1.0
        if metro_dist < 1.0:
            metro_adj = 1.04
        elif metro_dist > 4.0:
            metro_adj = 0.96

        calculated_expected_rent = int(round((area_sqft * peer_median_sqft * furnishing_mult * metro_adj) / 100.0) * 100)

        # Sanity floor
        calculated_expected_rent = max(calculated_expected_rent, 8000)

        factor_breakdown = {
            "baseline_sqft_rate": round(float(peer_median_sqft), 2),
            "area_sqft": int(area_sqft),
            "furnishing_multiplier": furnishing_mult,
            "metro_proximity_multiplier": metro_adj,
            "peer_count": int(peer_count),
            "confidence_level": confidence_level,
            "match_criteria": match_criteria,
            "nearest_metro_km": float(metro_dist)
        }

        return calculated_expected_rent, factor_breakdown

def peers_pool(df: pd.DataFrame, prop_id: Any) -> set:
    if "property_id" in df.columns:
        return set(df["property_id"].values)
    return set()

rent_estimator = RentEstimatorService()
