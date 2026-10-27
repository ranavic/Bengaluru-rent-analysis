import os
import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Any

class DataService:
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        self.data_dir = os.path.abspath(data_dir)
        self.rentals_df: pd.DataFrame = pd.DataFrame()
        self.metro_df: pd.DataFrame = pd.DataFrame()
        self.load_data()

    def load_data(self):
        rentals_file = os.path.join(self.data_dir, "rentals.csv")
        metro_file = os.path.join(self.data_dir, "metro_stations.csv")

        if not os.path.exists(rentals_file) or not os.path.exists(metro_file):
            raise FileNotFoundError(f"Dataset CSV files not found in {self.data_dir}")

        # Load metro stations
        self.metro_df = pd.read_csv(metro_file)
        self.metro_df["latitude"] = pd.to_numeric(self.metro_df["latitude"], errors="coerce")
        self.metro_df["longitude"] = pd.to_numeric(self.metro_df["longitude"], errors="coerce")
        self.metro_df.dropna(subset=["station_name", "latitude", "longitude"], inplace=True)

        # Load rentals
        df = pd.read_csv(rentals_file)
        
        # Data Cleaning & Validation
        df.drop_duplicates(subset=["property_id"], keep="first", inplace=True)
        
        # Convert numeric fields
        numeric_cols = ["rent", "deposit", "bhk", "area_sqft", "latitude", "longitude", "metro_distance_km", "property_age"]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
                
        # Filter valid records: positive rent, positive area, valid coordinates
        df = df[
            (df["rent"] > 1000) & 
            (df["area_sqft"] > 100) & 
            (df["latitude"].between(12.7, 13.3)) & 
            (df["longitude"].between(77.3, 77.9))
        ].copy()

        # Fill missing values
        df["furnishing"] = df["furnishing"].fillna("Semi-Furnished")
        df["amenities"] = df["amenities"].fillna("Basic Utilities")
        df["availability_status"] = df["availability_status"].fillna("Unverified")
        df["listing_source"] = df["listing_source"].fillna("Direct Listing")
        df["facing"] = df["facing"].fillna("East")

        # Computed column: rent_per_sqft
        df["rent_per_sqft"] = (df["rent"] / df["area_sqft"]).round(2)
        
        # Computed deposit to rent ratio
        df["deposit_to_rent_ratio"] = (df["deposit"] / df["rent"]).round(1)

        self.rentals_df = df
        print(f"Loaded {len(self.rentals_df)} cleaned rental records and {len(self.metro_df)} metro stations.")

    def get_all_properties(self) -> pd.DataFrame:
        return self.rentals_df.copy()

    def get_all_metro_stations(self) -> List[Dict[str, Any]]:
        return self.metro_df.to_dict(orient="records")

    def filter_properties(
        self,
        locality: Optional[str] = None,
        min_rent: Optional[int] = None,
        max_rent: Optional[int] = None,
        bhk: Optional[int] = None,
        furnishing: Optional[str] = None,
        min_area: Optional[int] = None,
        max_metro_dist: Optional[float] = None,
        search: Optional[str] = None
    ) -> pd.DataFrame:
        df = self.rentals_df.copy()

        if locality and locality != "All":
            df = df[df["locality"].str.lower() == locality.lower()]

        if min_rent is not None:
            df = df[df["rent"] >= min_rent]

        if max_rent is not None:
            df = df[df["rent"] <= max_rent]

        if bhk is not None and bhk > 0:
            df = df[df["bhk"] == bhk]

        if furnishing and furnishing != "All":
            df = df[df["furnishing"].str.lower() == furnishing.lower()]

        if min_area is not None:
            df = df[df["area_sqft"] >= min_area]

        if max_metro_dist is not None:
            df = df[df["metro_distance_km"] <= max_metro_dist]

        if search:
            s = search.lower().strip()
            mask = (
                df["locality"].str.lower().str.contains(s, na=False) |
                df["sub_locality"].str.lower().str.contains(s, na=False) |
                df["nearest_metro_station"].str.lower().str.contains(s, na=False) |
                df["amenities"].str.lower().str.contains(s, na=False) |
                df["property_id"].str.lower().str.contains(s, na=False)
            )
            df = df[mask]

        return df

# Global singleton
data_service = DataService()
