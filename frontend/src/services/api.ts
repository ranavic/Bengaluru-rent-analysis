import axios from 'axios';
import type { 
  PropertyItem, 
  OverviewMetrics, 
  LocalitySummary, 
  FilterState, 
  MetroStation, 
  ComparisonResponse 
} from '../types/property';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const api = {
  getHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  },

  getOverview: async (filters?: FilterState): Promise<OverviewMetrics> => {
    const params: Record<string, any> = {};
    if (filters?.locality && filters.locality !== 'All') params.locality = filters.locality;
    if (filters?.min_rent) params.min_rent = filters.min_rent;
    if (filters?.max_rent) params.max_rent = filters.max_rent;
    if (filters?.bhk && filters.bhk > 0) params.bhk = filters.bhk;
    if (filters?.furnishing && filters.furnishing !== 'All') params.furnishing = filters.furnishing;

    const res = await client.get('/analytics/overview', { params });
    return res.data;
  },

  getProperties: async (filters?: FilterState, limit: number = 200, offset: number = 0): Promise<{ total: number; properties: PropertyItem[] }> => {
    const params: Record<string, any> = { limit, offset };
    if (filters?.locality && filters.locality !== 'All') params.locality = filters.locality;
    if (filters?.min_rent) params.min_rent = filters.min_rent;
    if (filters?.max_rent) params.max_rent = filters.max_rent;
    if (filters?.bhk && filters.bhk > 0) params.bhk = filters.bhk;
    if (filters?.furnishing && filters.furnishing !== 'All') params.furnishing = filters.furnishing;
    if (filters?.min_area) params.min_area = filters.min_area;
    if (filters?.max_metro_dist) params.max_metro_dist = filters.max_metro_dist;
    if (filters?.price_category && filters.price_category !== 'All') params.price_category = filters.price_category;
    if (filters?.search) params.search = filters.search;

    const res = await client.get('/properties', { params });
    return res.data;
  },

  getPropertyById: async (propertyId: string): Promise<PropertyItem> => {
    const res = await client.get(`/properties/${encodeURIComponent(propertyId)}`);
    return res.data;
  },

  getComparables: async (propertyId: string, limit: number = 5): Promise<PropertyItem[]> => {
    const res = await client.get(`/properties/${encodeURIComponent(propertyId)}/comparables`, {
      params: { limit },
    });
    return res.data;
  },

  getLocalities: async (filters?: FilterState): Promise<LocalitySummary[]> => {
    const params: Record<string, any> = {};
    if (filters?.min_rent) params.min_rent = filters.min_rent;
    if (filters?.max_rent) params.max_rent = filters.max_rent;
    if (filters?.bhk && filters.bhk > 0) params.bhk = filters.bhk;
    if (filters?.furnishing && filters.furnishing !== 'All') params.furnishing = filters.furnishing;

    const res = await client.get('/analytics/localities', { params });
    return res.data;
  },

  getRentDistribution: async (locality?: string) => {
    const params: Record<string, any> = {};
    if (locality && locality !== 'All') params.locality = locality;
    const res = await client.get('/analytics/rent-distribution', { params });
    return res.data;
  },

  getAreaRentScatter: async (locality?: string, bhk?: number) => {
    const params: Record<string, any> = {};
    if (locality && locality !== 'All') params.locality = locality;
    if (bhk && bhk > 0) params.bhk = bhk;
    const res = await client.get('/analytics/scatter', { params });
    return res.data;
  },

  getMetroPremium: async (locality?: string) => {
    const params: Record<string, any> = {};
    if (locality && locality !== 'All') params.locality = locality;
    const res = await client.get('/analytics/metro-premium', { params });
    return res.data;
  },

  getMetroStations: async (): Promise<MetroStation[]> => {
    const res = await client.get('/metro-stations');
    return res.data;
  },

  compareProperties: async (propertyIds: string[]): Promise<ComparisonResponse> => {
    const res = await client.post('/properties/compare', { property_ids: propertyIds });
    return res.data;
  },
};
