import React, { useState } from 'react';
import type { PropertyItem } from '../../types/property';
import { formatINR } from '../../utils/formatters';
import { 
  Building2, 
  Search, 
  ArrowUpDown, 
  MapPin, 
  CheckCircle
} from 'lucide-react';

interface PropertyDirectoryProps {
  properties: PropertyItem[];
  onSelectProperty: (property: PropertyItem) => void;
  onNavigateToAnalyzer: (property: PropertyItem) => void;
  onNavigateToMap: () => void;
}

export const PropertyDirectory: React.FC<PropertyDirectoryProps> = ({
  properties,
  onSelectProperty,
  onNavigateToAnalyzer,
  onNavigateToMap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'rent' | 'rent_per_sqft' | 'fairness_score' | 'area_sqft'>('fairness_score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filtered = properties
    .filter((p) => {
      if (categoryFilter !== 'All' && p.price_category !== categoryFilter) return false;
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        p.property_id.toLowerCase().includes(s) ||
        p.locality.toLowerCase().includes(s) ||
        p.sub_locality.toLowerCase().includes(s) ||
        p.amenities.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      return sortAsc ? valA - valB : valB - valA;
    });

  const toggleSort = (field: 'rent' | 'rent_per_sqft' | 'fairness_score' | 'area_sqft') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Listing Verification Directory</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Bengaluru Rental Listings ({filtered.length} listings)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial dataset compiled from verified listing sources with fairness indicators.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search locality, ID, amenities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 text-xs font-semibold text-slate-700 py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="All">All Categories</option>
            <option value="Below Benchmark">Below Benchmark (Bargains)</option>
            <option value="Near Benchmark">Near Benchmark (Fair)</option>
            <option value="Above Benchmark">Above Benchmark (Overpriced)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Property ID</th>
                <th className="py-3 px-4">Locality & Zone</th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('rent')}>
                  <div className="flex items-center space-x-1">
                    <span>Rent / Mo</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('area_sqft')}>
                  <div className="flex items-center space-x-1">
                    <span>BHK / Area</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('rent_per_sqft')}>
                  <div className="flex items-center space-x-1">
                    <span>Rate / sqft</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Expected Rent</th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('fairness_score')}>
                  <div className="flex items-center space-x-1">
                    <span>Fairness</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Metro Dist</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.slice(0, 100).map((prop) => (
                <tr key={prop.property_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{prop.property_id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{prop.locality}</div>
                    <div className="text-[10px] text-slate-400">{prop.sub_locality}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatINR(prop.rent)}</td>
                  <td className="py-3 px-4">
                    <div>{prop.bhk} BHK</div>
                    <div className="text-[10px] text-slate-400">{prop.area_sqft} sqft • {prop.furnishing}</div>
                  </td>
                  <td className="py-3 px-4 font-medium">₹{prop.rent_per_sqft}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-700">{formatINR(prop.expected_rent)}</div>
                    <div className={`text-[10px] font-semibold ${prop.premium_pct > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {prop.premium_pct > 0 ? `+${prop.premium_pct}%` : `${prop.premium_pct}%`}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-brand-700">{prop.fairness_score}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        prop.price_category === 'Below Benchmark'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prop.price_category === 'Above Benchmark'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {prop.price_category === 'Below Benchmark' ? 'Bargain' : prop.price_category === 'Above Benchmark' ? 'Overpriced' : 'Fair'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-purple-700 font-medium">{prop.metro_distance_km} km</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-[11px] font-medium text-slate-700">{prop.listing_source}</div>
                    <div className="text-[10px] text-emerald-600 flex items-center space-x-1">
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>{prop.availability_status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => {
                        onSelectProperty(prop);
                        onNavigateToMap();
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition-colors"
                      title="View on Map"
                    >
                      <MapPin className="w-3 h-3 inline mr-0.5" />
                      Map
                    </button>
                    <button
                      onClick={() => {
                        onSelectProperty(prop);
                        onNavigateToAnalyzer(prop);
                      }}
                      className="px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[10px] font-semibold transition-colors"
                      title="Audit Fairness"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
