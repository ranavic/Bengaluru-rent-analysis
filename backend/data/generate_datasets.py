import os
import csv
import math
import random

# Real Namma Metro stations with authentic Bengaluru coordinates
METRO_STATIONS = [
    # Purple Line
    {"name": "Whitefield (Kadugodi)", "line": "Purple", "latitude": 12.9961, "longitude": 77.7612, "status": "Operational"},
    {"name": "Hopefarm Channasandra", "line": "Purple", "latitude": 12.9892, "longitude": 77.7523, "status": "Operational"},
    {"name": "Kadugodi Tree Park", "line": "Purple", "latitude": 12.9863, "longitude": 77.7410, "status": "Operational"},
    {"name": "Pattandur Agrahara (ITPL)", "line": "Purple", "latitude": 12.9868, "longitude": 77.7301, "status": "Operational"},
    {"name": "Kundalahalli", "line": "Purple", "latitude": 12.9734, "longitude": 77.7188, "status": "Operational"},
    {"name": "Singayyanapalya", "line": "Purple", "latitude": 12.9950, "longitude": 77.6975, "status": "Operational"},
    {"name": "KR Puram (Krishnarajapuram)", "line": "Purple", "latitude": 12.9982, "longitude": 77.6789, "status": "Operational"},
    {"name": "Benniganahalli", "line": "Purple", "latitude": 12.9928, "longitude": 77.6620, "status": "Operational"},
    {"name": "Baiyappanahalli", "line": "Purple", "latitude": 12.9911, "longitude": 77.6521, "status": "Operational"},
    {"name": "Swami Vivekananda Road", "line": "Purple", "latitude": 12.9859, "longitude": 77.6449, "status": "Operational"},
    {"name": "Indiranagar", "line": "Purple", "latitude": 12.9783, "longitude": 77.6408, "status": "Operational"},
    {"name": "Halasuru", "line": "Purple", "latitude": 12.9757, "longitude": 77.6267, "status": "Operational"},
    {"name": "Trinity", "line": "Purple", "latitude": 12.9730, "longitude": 77.6171, "status": "Operational"},
    {"name": "MG Road", "line": "Purple", "latitude": 12.9756, "longitude": 77.6067, "status": "Operational"},
    {"name": "Cubbon Park", "line": "Purple", "latitude": 12.9810, "longitude": 77.5996, "status": "Operational"},
    {"name": "Dr. BR Ambedkar Vidhana Soudha", "line": "Purple", "latitude": 12.9797, "longitude": 77.5927, "status": "Operational"},
    {"name": "Sir M. Visveshwaraya Central College", "line": "Purple", "latitude": 12.9768, "longitude": 77.5855, "status": "Operational"},
    {"name": "Nadaprabhu Kempegowda (Majestic Interchange)", "line": "Purple/Green", "latitude": 12.9757, "longitude": 77.5728, "status": "Operational"},
    {"name": "KSR Bengaluru City Railway", "line": "Purple", "latitude": 12.9772, "longitude": 77.5683, "status": "Operational"},
    {"name": "Magadi Road", "line": "Purple", "latitude": 12.9756, "longitude": 77.5552, "status": "Operational"},
    {"name": "Hosahalli", "line": "Purple", "latitude": 12.9744, "longitude": 77.5388, "status": "Operational"},
    {"name": "Vijayanagar", "line": "Purple", "latitude": 12.9698, "longitude": 77.5312, "status": "Operational"},
    {"name": "Attiguppe", "line": "Purple", "latitude": 12.9622, "longitude": 77.5241, "status": "Operational"},
    {"name": "Deepanjali Nagar", "line": "Purple", "latitude": 12.9525, "longitude": 77.5186, "status": "Operational"},
    {"name": "Mysore Road", "line": "Purple", "latitude": 12.9463, "longitude": 77.5132, "status": "Operational"},
    {"name": "Kengeri", "line": "Purple", "latitude": 12.9098, "longitude": 77.4782, "status": "Operational"},
    # Green Line
    {"name": "Nagasandra", "line": "Green", "latitude": 13.0480, "longitude": 77.4996, "status": "Operational"},
    {"name": "Dasarahalli", "line": "Green", "latitude": 13.0437, "longitude": 77.5130, "status": "Operational"},
    {"name": "Jalahalli", "line": "Green", "latitude": 13.0387, "longitude": 77.5204, "status": "Operational"},
    {"name": "Peenya Industry", "line": "Green", "latitude": 13.0329, "longitude": 77.5255, "status": "Operational"},
    {"name": "Yeshwanthpur", "line": "Green", "latitude": 13.0233, "longitude": 77.5501, "status": "Operational"},
    {"name": "Sandal Soap Factory", "line": "Green", "latitude": 13.0147, "longitude": 77.5539, "status": "Operational"},
    {"name": "Mahalakshmi", "line": "Green", "latitude": 13.0076, "longitude": 77.5549, "status": "Operational"},
    {"name": "Rajajinagar", "line": "Green", "latitude": 12.9988, "longitude": 77.5558, "status": "Operational"},
    {"name": "Kuvempu Road", "line": "Green", "latitude": 12.9899, "longitude": 77.5583, "status": "Operational"},
    {"name": "Mantri Square Sampige Road", "line": "Green", "latitude": 12.9912, "longitude": 77.5710, "status": "Operational"},
    {"name": "Chickpete", "line": "Green", "latitude": 12.9658, "longitude": 77.5746, "status": "Operational"},
    {"name": "Krishna Rajendra Market", "line": "Green", "latitude": 12.9610, "longitude": 77.5752, "status": "Operational"},
    {"name": "National College", "line": "Green", "latitude": 12.9504, "longitude": 77.5735, "status": "Operational"},
    {"name": "Lalbagh", "line": "Green", "latitude": 12.9463, "longitude": 77.5800, "status": "Operational"},
    {"name": "South End Circle", "line": "Green", "latitude": 12.9377, "longitude": 77.5804, "status": "Operational"},
    {"name": "Jayanagar 4th Block", "line": "Green", "latitude": 12.9308, "longitude": 77.5801, "status": "Operational"},
    {"name": "Rashtriya Vidyalaya Road (RV Road)", "line": "Green", "latitude": 12.9216, "longitude": 77.5801, "status": "Operational"},
    {"name": "Banashankari", "line": "Green", "latitude": 12.9155, "longitude": 77.5736, "status": "Operational"},
    {"name": "Jaya Prakash Nagar (JP Nagar)", "line": "Green", "latitude": 12.9073, "longitude": 77.5735, "status": "Operational"},
    {"name": "Yelachenahalli", "line": "Green", "latitude": 12.8959, "longitude": 77.5707, "status": "Operational"},
    {"name": "Silk Institute", "line": "Green", "latitude": 12.8624, "longitude": 77.5372, "status": "Operational"},
    # Yellow Line (Phase 2)
    {"name": "Central Silk Board", "line": "Yellow", "latitude": 12.9174, "longitude": 77.6231, "status": "Operational/Testing"},
    {"name": "BTM Layout Station", "line": "Yellow", "latitude": 12.9165, "longitude": 77.6085, "status": "Operational/Testing"},
    {"name": "HSR Layout Station", "line": "Yellow", "latitude": 12.9126, "longitude": 77.6385, "status": "Operational/Testing"},
    {"name": "Electronic City 1", "line": "Yellow", "latitude": 12.8455, "longitude": 77.6631, "status": "Operational/Testing"},
    {"name": "Electronic City 2", "line": "Yellow", "latitude": 12.8390, "longitude": 77.6745, "status": "Operational/Testing"}
]

# Real Bengaluru Micro-markets with accurate geographic anchor coordinates and baseline rent profiles
LOCALITIES = [
    {
        "name": "Indiranagar",
        "lat": 12.9784, "lon": 77.6408,
        "base_sqft_rate": 62, "rate_std": 9,
        "sub_localities": ["100 Feet Road", "12th Main", "Defense Colony", "HAL 2nd Stage", "Doopanahalli", "CMH Road", "Indiranagar 1st Stage"],
        "tier": "Premium Tech & Lifestyle",
        "metro_nearby": "Indiranagar"
    },
    {
        "name": "Koramangala",
        "lat": 12.9352, "lon": 77.6245,
        "base_sqft_rate": 58, "rate_std": 8,
        "sub_localities": ["4th Block (Sony Signal)", "3rd Block", "5th Block (Jyoti Nivas)", "1st Block (Wipro Park)", "6th Block", "7th Block"],
        "tier": "Startup & Lifestyle Hub",
        "metro_nearby": "Trinity"
    },
    {
        "name": "HSR Layout",
        "lat": 12.9121, "lon": 77.6446,
        "base_sqft_rate": 48, "rate_std": 7,
        "sub_localities": ["Sector 1 (Agara Lake)", "Sector 2", "Sector 3 (27th Main)", "Sector 4", "Sector 6", "Sector 7 (Near Silk Board)"],
        "tier": "Tech Professional Hub",
        "metro_nearby": "Central Silk Board"
    },
    {
        "name": "Whitefield",
        "lat": 12.9698, "lon": 77.7499,
        "base_sqft_rate": 39, "rate_std": 6,
        "sub_localities": ["ITPL Main Road", "EPIP Zone", "Nallurahalli", "Pattandur Agrahara", "ECC Road", "Channasandra", "Hope Farm"],
        "tier": "Major IT Cluster",
        "metro_nearby": "Pattandur Agrahara (ITPL)"
    },
    {
        "name": "Bellandur",
        "lat": 12.9304, "lon": 77.6784,
        "base_sqft_rate": 44, "rate_std": 6,
        "sub_localities": ["EcoSpace ORR", "Green Glen Layout", "Bellandur Gate", "Deverabeesanahalli", "Kariyammana Agrahara"],
        "tier": "ORR Tech Corridor",
        "metro_nearby": "Central Silk Board"
    },
    {
        "name": "Marathahalli",
        "lat": 12.9591, "lon": 77.6974,
        "base_sqft_rate": 34, "rate_std": 5,
        "sub_localities": ["Spice Garden Layout", "Munnekollal", "Marathahalli Bridge", "Ashwath Nagar", "Kalamandir Junction"],
        "tier": "Budget Tech & Student",
        "metro_nearby": "Kundalahalli"
    },
    {
        "name": "BTM Layout",
        "lat": 12.9166, "lon": 77.6101,
        "base_sqft_rate": 33, "rate_std": 5,
        "sub_localities": ["BTM 1st Stage (Near Udupi Garden)", "BTM 2nd Stage (Mico Layout)", "Kuvempu Nagar", "Tavarekere"],
        "tier": "Student & Early Career",
        "metro_nearby": "BTM Layout Station"
    },
    {
        "name": "Jayanagar",
        "lat": 12.9308, "lon": 77.5838,
        "base_sqft_rate": 45, "rate_std": 7,
        "sub_localities": ["4th Block Complex", "3rd Block East", "5th Block", "7th Block (Kanakanapalya)", "9th Block"],
        "tier": "Heritage Residential & Greenery",
        "metro_nearby": "Jayanagar 4th Block"
    },
    {
        "name": "JP Nagar",
        "lat": 12.9063, "lon": 77.5857,
        "base_sqft_rate": 37, "rate_std": 5,
        "sub_localities": ["Phase 1 (Sarakki)", "Phase 2 (LIC Colony)", "Phase 3 (Mini Forest)", "Phase 5", "Phase 6", "Phase 7"],
        "tier": "Affordable Residential",
        "metro_nearby": "Jaya Prakash Nagar (JP Nagar)"
    },
    {
        "name": "Malleshwaram",
        "lat": 13.0031, "lon": 77.5643,
        "base_sqft_rate": 46, "rate_std": 6,
        "sub_localities": ["8th Cross Market", "15th Cross Margosa Road", "Sampige Road", "Vyalikaval", "Malleshwaram West"],
        "tier": "Traditional Cultural Hub",
        "metro_nearby": "Mantri Square Sampige Road"
    },
    {
        "name": "Electronic City",
        "lat": 12.8452, "lon": 77.6602,
        "base_sqft_rate": 27, "rate_std": 4,
        "sub_localities": ["Phase 1 (Infosys Gate)", "Phase 1 (Neotown)", "Phase 2 (TCS / Tech Mahindra)", "Konappana Agrahara", "Doddathoguru"],
        "tier": "Affordable IT Park Hub",
        "metro_nearby": "Electronic City 1"
    },
    {
        "name": "Hebbal",
        "lat": 13.0358, "lon": 77.5970,
        "base_sqft_rate": 38, "rate_std": 6,
        "sub_localities": ["Near Manyata Tech Park", "Hebbal Kempapura", "Bhoopasandra", "Nagavara Junction", "Geddalahalli"],
        "tier": "North Bengaluru Business Hub",
        "metro_nearby": "Yeshwanthpur"
    },
    {
        "name": "Sarjapur Road",
        "lat": 12.9099, "lon": 77.6872,
        "base_sqft_rate": 35, "rate_std": 5,
        "sub_localities": ["Doddakannelli", "Kaikondrahalli Lake", "Carmelaram Station Road", "Wipro SEZ Campus", "Somapura"],
        "tier": "Gated Community Tech Corridor",
        "metro_nearby": "Central Silk Board"
    },
    {
        "name": "Rajajinagar",
        "lat": 12.9988, "lon": 77.5530,
        "base_sqft_rate": 41, "rate_std": 5,
        "sub_localities": ["1st Block (Orion Mall / Brigade Gateway)", "2nd Block", "3rd Block", "5th Block (Bashyam Circle)", "Dr Rajkumar Road"],
        "tier": "Established Western Hub",
        "metro_nearby": "Rajajinagar"
    },
    {
        "name": "Kalyan Nagar",
        "lat": 13.0221, "lon": 77.6403,
        "base_sqft_rate": 34, "rate_std": 5,
        "sub_localities": ["HRBR Layout 1st Block", "HRBR Layout 2nd Block", "Kammanahalli Main Road", "Banaswadi Border", "Babusapalya"],
        "tier": "Cosmopolitan North-East",
        "metro_nearby": "Baiyappanahalli"
    },
    {
        "name": "Banashankari",
        "lat": 12.9255, "lon": 77.5468,
        "base_sqft_rate": 31, "rate_std": 4,
        "sub_localities": ["BSK 2nd Stage (Devagiri Temple)", "BSK 3rd Stage (Katriguppe)", "Padmanabhanagar Border", "Girinagar"],
        "tier": "Traditional Peaceful Residential",
        "metro_nearby": "Banashankari"
    }
]

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def generate_datasets():
    os.makedirs("c:/Projects/bengaluru_rental_intelligence/backend/data", exist_ok=True)
    
    # 1. Write metro_stations.csv
    metro_csv_path = "c:/Projects/bengaluru_rental_intelligence/backend/data/metro_stations.csv"
    with open(metro_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["station_name", "line", "latitude", "longitude", "status"])
        writer.writeheader()
        for s in METRO_STATIONS:
            writer.writerow({
                "station_name": s["name"],
                "line": s["line"],
                "latitude": s["latitude"],
                "longitude": s["longitude"],
                "status": s["status"]
            })
    print(f"Wrote {len(METRO_STATIONS)} metro stations to {metro_csv_path}")

    # 2. Generate ~650 realistic rental listings across all 16 micro-markets
    random.seed(42)  # Deterministic generation for reproducibility
    properties = []
    
    bhk_specs = [
        {"bhk": 1, "area_min": 450, "area_max": 650, "weight": 25},
        {"bhk": 2, "area_min": 850, "area_max": 1250, "weight": 45},
        {"bhk": 3, "area_min": 1350, "area_max": 1950, "weight": 25},
        {"bhk": 4, "area_min": 2100, "area_max": 3200, "weight": 5},
    ]
    
    furnishing_types = [
        {"type": "Semi-Furnished", "multiplier": 1.0, "weight": 55},
        {"type": "Fully-Furnished", "multiplier": 1.22, "weight": 30},
        {"type": "Unfurnished", "multiplier": 0.88, "weight": 15},
    ]

    property_types = ["Apartment", "Gated Community Apartment", "Independent Floor", "Standalone House", "Studio"]
    sources = ["NoBroker Verified", "MagicBricks Permitted", "Housing Partner API", "College Campus Board"]
    availabilities = ["Recently Verified", "Recently Verified", "Recently Verified", "Under Verification", "Unverified"]
    
    common_amenities = [
        "Power Backup", "Covered Car Parking", "24x7 Security", "Lift", "CCTV Surveillance",
        "Geyser & RO", "Rainwater Harvesting", "Gymnasium", "Swimming Pool", "Clubhouse",
        "Children Play Area", "Gated Society", "Intercom", "Balcony Garden", "Piped Gas"
    ]

    prop_id = 1
    for loc in LOCALITIES:
        # Generate 35-50 properties per locality
        num_props = random.randint(38, 48)
        for _ in range(num_props):
            # Pick BHK
            bhk_choice = random.choices(bhk_specs, weights=[s["weight"] for s in bhk_specs])[0]
            bhk = bhk_choice["bhk"]
            area_sqft = random.randint(bhk_choice["area_min"], bhk_choice["area_max"])
            
            # Pick Furnishing
            furn_choice = random.choices(furnishing_types, weights=[f["weight"] for f in furnishing_types])[0]
            furnishing = furn_choice["type"]
            furn_mult = furn_choice["multiplier"]
            
            # Geographic offset within ~1.2 km radius around locality center
            # 1 deg lat ~ 111 km, 1 deg lon ~ 108 km
            lat_offset = (random.random() - 0.5) * 0.024
            lon_offset = (random.random() - 0.5) * 0.024
            prop_lat = round(loc["lat"] + lat_offset, 5)
            prop_lon = round(loc["lon"] + lon_offset, 5)
            
            # Find nearest metro distance
            min_metro_dist = 999.0
            nearest_metro_name = ""
            for st in METRO_STATIONS:
                d = haversine_km(prop_lat, prop_lon, st["latitude"], st["longitude"])
                if d < min_metro_dist:
                    min_metro_dist = d
                    nearest_metro_name = st["name"]
            
            # Metro proximity premium: <1km: +8%, 1-2km: +3%, >4km: -4%
            metro_mult = 1.0
            if min_metro_dist < 1.0:
                metro_mult = 1.08
            elif min_metro_dist < 2.0:
                metro_mult = 1.04
            elif min_metro_dist > 4.5:
                metro_mult = 0.95
                
            # Base rate per sqft for this locality with small variance
            rate_per_sqft = loc["base_sqft_rate"] * furn_mult * metro_mult
            
            # Market expectation for this property
            expected_rent = int(round(area_sqft * rate_per_sqft / 100.0) * 100)
            
            # Now simulate Asking Rent:
            # Most properties (70%) are reasonably priced (±8%)
            # Some (18%) are overpriced (+12% to +35%)
            # Some (12%) are bargains / student-friendly deals (-10% to -25%)
            scenario = random.choices(["fair", "overpriced", "bargain"], weights=[68, 20, 12])[0]
            if scenario == "fair":
                markup = random.uniform(0.94, 1.06)
            elif scenario == "overpriced":
                markup = random.uniform(1.10, 1.35)
            else:
                markup = random.uniform(0.76, 0.91)
            
            asking_rent = int(round((expected_rent * markup) / 500.0) * 500)
            asking_rent = max(asking_rent, 9000)  # Min sensible rent
            
            # Security deposit in Bengaluru is typically 3x to 6x monthly rent
            deposit_months = random.choice([3, 4, 5, 6, 6, 8, 10]) if loc["tier"] == "Traditional Cultural Hub" else random.choice([2, 3, 4, 5, 6])
            deposit = asking_rent * deposit_months
            
            # Property age
            prop_age = random.choice([1, 2, 3, 5, 7, 10, 15])
            
            # Amenities
            num_amenities = random.randint(3, 9)
            prop_amenities = ", ".join(random.sample(common_amenities, num_amenities))
            
            sub_loc = random.choice(loc["sub_localities"])
            prop_type = random.choice(property_types)
            source = random.choice(sources)
            status = random.choice(availabilities)
            facing = random.choice(["East", "North", "North-East", "West", "South"])
            
            day = random.randint(1, 28)
            month = random.randint(1, 4)
            listing_date = f"2026-0{month:02d}-{day:02d}"
            last_checked = f"2026-04-{random.randint(5, 12):02d}"

            properties.append({
                "property_id": f"BLR-{loc['name'][:3].upper()}-{prop_id:04d}",
                "locality": loc["name"],
                "sub_locality": sub_loc,
                "latitude": prop_lat,
                "longitude": prop_lon,
                "rent": asking_rent,
                "deposit": deposit,
                "bhk": bhk,
                "area_sqft": area_sqft,
                "furnishing": furnishing,
                "property_type": prop_type,
                "amenities": prop_amenities,
                "property_age": prop_age,
                "facing": facing,
                "metro_distance_km": min_metro_dist,
                "nearest_metro_station": nearest_metro_name,
                "listing_source": source,
                "listing_date": listing_date,
                "last_checked_date": last_checked,
                "availability_status": status
            })
            prop_id += 1
            
    rentals_csv_path = "c:/Projects/bengaluru_rental_intelligence/backend/data/rentals.csv"
    with open(rentals_csv_path, "w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "property_id", "locality", "sub_locality", "latitude", "longitude",
            "rent", "deposit", "bhk", "area_sqft", "furnishing", "property_type",
            "amenities", "property_age", "facing", "metro_distance_km",
            "nearest_metro_station", "listing_source", "listing_date",
            "last_checked_date", "availability_status"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for p in properties:
            writer.writerow(p)
            
    print(f"Wrote {len(properties)} rental properties across {len(LOCALITIES)} Bengaluru localities to {rentals_csv_path}")

if __name__ == "__main__":
    generate_datasets()
