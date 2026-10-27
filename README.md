# Bengaluru Rental Intelligence — Geospatial Business Intelligence Dashboard

> **College Group Mini-Project for Business Intelligence (BI)**  
> Demonstrating data cleaning, descriptive analytics, rental price comparison, geospatial visualization, and explainable decision support across Bengaluru's rental micro-markets.

---

## 1. Project Overview

**Bengaluru Rental Intelligence** is an interactive Business Intelligence application designed to help students and early-career software professionals understand rental markets, evaluate whether asking rents are reasonable, analyze neighborhood affordability, and discover better-value housing alternatives.

The user interface follows a modern, uncluttered geospatial BI layout featuring:

- **Dashboard & Map**:
  - **Interactive GIS Map**: Live Leaflet cartography of Bengaluru featuring 690 rental listings, 52 operational Namma Metro stations across Purple and Green lines, animated focus rings, and benchmark-coded markers (Green: Bargain, Sky: Fair Market, Red: Premium/Overpriced).
  - **4 Spacious Market Stats**: Clean cards showing Median Monthly Rent, Median Rate per Sq.Ft, Bargain Listings percentage, and Average Transit Distance.
  - **Unified Property Spotlight Card**: Instant summary of any selected listing displaying asking rent vs. peer benchmark, fairness score (0–100), walkable metro distance, furnishing, deposit ratio, and a direct one-click audit trigger.
  - **Median Rent by Configuration Chart**: Real, intuitive bar chart comparing 1, 2, 3, and 4 BHK median rental rates across the active micro-market.

- **Fairness Audit (Analyzer)**:
  - Property evaluation engine computing the transparent equation `Variance (%) = ((Asking Rent - Expected Rent) / Expected Rent) × 100`.
  - Detailed factor multipliers: Locality baseline rate, furnishing weight, metro transit allowance, and security deposit ratio.
  - Full attribute verification and peer comparable listings in the same micro-market.

- **All Listings (Directory)**:
  - Clean, searchable, and sortable directory of 690 verified properties with instant search by locality, configuration, or ID, plus quick actions to view on the map or audit fairness.

- **Methodology & Viva Guide (Modal)**:
  - Accessible on demand from the sidebar or header without cluttering navigation tabs.
  - Covers problem statement, empirical benchmark formulation, Haversine transit calculation, and dataset coverage.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom brand lime palette (`#84cc16`), soft slate surfaces, and glassmorphism cards
- **Interactive Map**: Leaflet & React Leaflet with custom SVG markers, radar rings, and station popups
- **Analytical Charts**: Recharts (Responsive bar charts with customized tooltips)
- **Icons**: Lucide React
- **API Client**: Axios

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Data Engine**: Pandas & NumPy for data cleaning, deduplication, and statistical baseline modeling
- **Validation**: Pydantic v2
- **Server**: Uvicorn ASGI

### Data Storage
- Structured CSV files in `backend/data/`:
  - `rentals.csv`: 690 cleaned properties across 16 authentic Bengaluru micro-markets.
  - `metro_stations.csv`: 52 real Namma Metro stations with geographic coordinates.

---

## 3. Mathematical Formulation of the Fairness Model

### A. Expected Market Rent Baseline
Peer properties in the active dataset are matched using a hierarchical fallback heuristic:
1. **Primary Peer Group**: Same Locality + Same BHK + Same Furnishing
2. **Secondary Peer Group**: Same Locality + Same BHK (furnishing adjustment applied)
3. **Tertiary Peer Group**: Locality Median
4. **Citywide Fallback**: Citywide BHK Baseline

```
Expected Rent = Area(sqft) × PeerMedianSqftRate × FurnishingMultiplier × MetroProximityFactor
```

### B. Percentage Variance Formula
```
Variance (%) = ((Asking Rent - Expected Rent) / Expected Rent) × 100
```

### C. Explainable Fairness Score (0 to 100)
- **Variance ≤ -15%**: Score **95–100** (*Exceptional Value Bargain*)
- **-15% < Variance ≤ 0%**: Score **88–94** (*Good Value*)
- **0% < Variance ≤ 5%**: Score **84–90** (*Fair Market Equilibrium*)
- **5% < Variance ≤ 18%**: Score **60–80** (*Slightly Overpriced*)
- **Variance > 18%**: Score **< 60** (*Significantly Overpriced*)

---

## 4. Quick Start (Running Locally)

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Step 1: Start the FastAPI Backend
```bash
# From project root
cd backend
..\venv\Scripts\activate
# If dependencies need to be installed:
pip install fastapi uvicorn pandas numpy pydantic

# Run the API server
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
- API runs at: `http://127.0.0.1:8000`  
- Interactive Swagger docs: `http://127.0.0.1:8000/docs`
.
### Step 2: Start the Frontend Application
```bash
# In a new terminal, navigate to frontend
cd frontend
npm install
npm run dev
```
- Frontend runs at: `http://localhost:5173/`

---

## 5. Running Tests & Production Build

### Backend Tests
```bash
# From backend directory
..\venv\Scripts\python -m unittest tests/test_api.py
```
Validates data integrity across 690 listings, expected rent peer median formulas, fairness score boundaries, and transit distance calculations.

### Frontend Production Build
```bash
# From frontend directory
npm run build
```
Validates strict TypeScript types and generates production client bundles via Vite.

---

## 6. Directory Structure

```
bengaluru_rental_intelligence/
├── backend/
│   ├── main.py                     # FastAPI entry point & CORS configuration
│   ├── routes/
│   │   ├── properties.py           # /api/properties endpoints & filtering
│   │   ├── analytics.py            # /api/analytics endpoints & overviews
│   │   └── metro.py                # /api/metro-stations endpoint
│   ├── services/
│   │   ├── data_service.py         # CSV loading, validation, and filtering
│   │   ├── rent_estimator.py       # Peer-median expected rent baseline
│   │   └── fairness_service.py     # Fairness score & transparent factors
│   ├── models/
│   │   └── property.py             # Pydantic schemas
│   ├── data/
│   │   ├── rentals.csv             # 690 cleaned Bengaluru listings
│   │   ├── metro_stations.csv      # 52 Namma Metro stations
│   │   └── generate_datasets.py    # Deterministic generation script
│   └── tests/
│       └── test_api.py             # Unittest test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx             # 3-tab navigation + methodology button
│   │   │   │   ├── Header.tsx              # Locality selector + quick BHK pills
│   │   │   │   └── MethodologyModal.tsx    # Tabbed viva coursework modal
│   │   │   ├── dashboard/
│   │   │   │   ├── MainDashboard.tsx       # Clean split screen map + intelligence pane
│   │   │   │   ├── CleanKeyMetrics.tsx     # 4 spacious market stat cards
│   │   │   │   ├── PropertySpotlightCard.tsx # Unified selected listing card
│   │   │   │   └── LocalityBhkChart.tsx    # BHK configuration rent comparison
│   │   │   ├── map/
│   │   │   │   └── BengaluruMap.tsx        # Leaflet map with metro toggle & pins
│   │   │   ├── analyzer/
│   │   │   │   └── FairnessAnalyzer.tsx    # Detailed property audit & math breakdown
│   │   │   └── listings/
│   │   │       └── PropertyDirectory.tsx   # Searchable & sortable directory
│   │   ├── services/
│   │   │   └── api.ts              # Axios API service client
│   │   ├── types/
│   │   │   └── property.ts         # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── formatters.ts       # INR currency & unit formatting
│   │   ├── App.tsx                 # Main application layout
│   │   └── main.tsx                # React root mount
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```
