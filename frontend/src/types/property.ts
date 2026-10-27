export interface MetroStation {
  station_name: string;
  line: string;
  latitude: number;
  longitude: number;
  status: string;
}


export interface FactorBreakdown {
  baseline_sqft_rate: number;
  area_sqft: number;
  furnishing_multiplier: number;
  metro_proximity_multiplier: number;
  peer_count: number;
  confidence_level: string;
  match_criteria: string;
  nearest_metro_km: number;
}

export interface ScoreBreakdown {
  verdict_badge: string;
  verdict_narrative: string;
  deposit_assessment: string;
  expected_rent: number;
  diff_amount: number;
  premium_pct: number;
  factors: FactorBreakdown;
}

export interface PropertyItem {
  property_id: string;
  locality: string;
  sub_locality: string;
  latitude: number;
  longitude: number;
  rent: number;
  deposit: number;
  bhk: number;
  area_sqft: number;
  furnishing: string;
  property_type: string;
  amenities: string;
  property_age: number;
  facing?: string;
  metro_distance_km: number;
  nearest_metro_station: string;
  listing_source: string;
  listing_date: string;
  last_checked_date: string;
  availability_status: string;
  rent_per_sqft: number;
  deposit_to_rent_ratio: number;
  expected_rent: number;
  diff_amount: number;
  premium_pct: number;
  fairness_score: number;
  price_category: 'Below Benchmark' | 'Near Benchmark' | 'Above Benchmark';
  score_breakdown: ScoreBreakdown;
}

export interface OverviewMetrics {
  total_listings: number;
  median_rent: number;
  median_rent_per_sqft: number;
  pct_above_benchmark: number;
  pct_below_benchmark: number;
  pct_near_benchmark: number;
  avg_metro_distance_km: number;
  student_budget_listings_pct: number;
  median_deposit: number;
  total_localities: number;
}

export interface LocalitySummary {
  locality: string;
  latitude: number;
  longitude: number;
  listing_count: number;
  median_rent: number;
  median_rent_per_sqft: number;
  avg_metro_distance_km: number;
  min_rent: number;
  max_rent: number;
  median_deposit: number;
}

export interface FilterState {
  locality: string;
  min_rent?: number;
  max_rent?: number;
  bhk?: number;
  furnishing?: string;
  min_area?: number;
  max_metro_dist?: number;
  price_category?: string;
  search?: string;
}

export interface ComparisonItem {
  property: PropertyItem;
  value_score: number;
  highlights: string[];
  drawbacks: string[];
}

export interface ComparisonResponse {
  properties: ComparisonItem[];
  best_value_property_id: string;
  recommendation_summary: string;
}
