import React, { useState, useEffect } from 'react';
import type { PropertyItem } from '../../types/property';
import { api } from '../../services/api';
import { formatINR, formatLakh } from '../../utils/formatters';
import { 
  ShieldCheck, 
  Sparkles, 
  Building, 
  Layers, 
  MapPin,
  Search
} from 'lucide-react';

interface FairnessAnalyzerProps {
  properties: PropertyItem[];
  selectedProperty: PropertyItem | null;
  onSelectProperty: (property: PropertyItem) => void;
  onNavigateToMap: () => void;
}

export const FairnessAnalyzer: React.FC<FairnessAnalyzerProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  onNavigateToMap,
}) => {
  const [activeProp, setActiveProp] = useState<PropertyItem | null>(selectedProperty || properties[0] || null);
  const [comparables, setComparables] = useState<PropertyItem[]>([]);
  const [loadingComps, setLoadingComps] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedProperty) {
      setActiveProp(selectedProperty);
    } else if (properties.length > 0 && !activeProp) {
      setActiveProp(properties[0]);
    }
  }, [selectedProperty, properties]);

  useEffect(() => {
    if (activeProp) {
      setLoadingComps(true);
      api.getComparables(activeProp.property_id)
        .then((data) => setComparables(data))
        .catch(() => setComparables([]))
        .finally(() => setLoadingComps(false));
    }
  }, [activeProp]);

  const filteredProperties = properties.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.property_id.toLowerCase().includes(q) ||
      p.locality.toLowerCase().includes(q) ||
      p.sub_locality.toLowerCase().includes(q)
    );
  });

  if (!activeProp) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Loading property analysis...
      </div>
    );
  }

  const isBargain = activeProp.price_category === 'Below Benchmark';
  const isOverpriced = activeProp.price_category === 'Above Benchmark';

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {/* Top Banner & Property Picker */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Rental Fairness Evaluation Engine</span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Fairness Analyzer & Price Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent peer-median benchmark model comparing asking rent against actual market rates.
          </p>
        </div>

        {/* Quick Search & Property Selector */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search ID or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 text-xs text-slate-800 pl-8 pr-3 py-2 rounded-xl border border-slate-200 shadow-sm focus:ring-1 focus:ring-brand-500 focus:outline-none w-44"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="relative min-w-[240px]">
            <select
              value={activeProp.property_id}
              onChange={(e) => {
                const found = properties.find((p) => p.property_id === e.target.value);
                if (found) {
                  setActiveProp(found);
                  onSelectProperty(found);
                }
              }}
              className="w-full bg-slate-50 text-xs font-semibold text-slate-800 py-2 px-3 rounded-xl border border-slate-200 shadow-sm focus:ring-1 focus:ring-brand-500 focus:outline-none cursor-pointer"
            >
              {filteredProperties.slice(0, 80).map((p) => (
                <option key={p.property_id} value={p.property_id}>
                  {p.property_id} — {p.locality} ({p.bhk} BHK, {formatINR(p.rent)})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onNavigateToMap}
            className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Main Score & Metric Highlight Banner (4 clean cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Fairness Score Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Fairness Score
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-extrabold text-brand-600 tracking-tight">
                {activeProp.fairness_score}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <div className="text-xs font-semibold mt-0.5 text-slate-700 truncate">
              {activeProp.score_breakdown.verdict_badge}
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                activeProp.fairness_score >= 80
                  ? 'bg-brand-500'
                  : activeProp.fairness_score >= 60
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${activeProp.fairness_score}%` }}
            />
          </div>
        </div>

        {/* Asking Rent */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Asking Monthly Rent
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatINR(activeProp.rent)}
            </span>
            <span className="text-xs text-slate-400 font-medium"> / mo</span>
            <div className="text-xs text-slate-500 mt-0.5">
              ₹{activeProp.rent_per_sqft}/sq.ft ({activeProp.area_sqft} sq.ft)
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            Deposit: {formatLakh(activeProp.deposit)} ({activeProp.deposit_to_rent_ratio}x)
          </div>
        </div>

        {/* Expected Market Benchmark */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Benchmark Expected
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-700 tracking-tight">
              {formatINR(activeProp.expected_rent)}
            </span>
            <span className="text-xs text-slate-400 font-medium"> / mo</span>
            <div className="text-xs text-slate-500 mt-0.5">
              Based on {activeProp.score_breakdown.factors.peer_count} peers in {activeProp.locality}
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            Confidence: {activeProp.score_breakdown.factors.confidence_level}
          </div>
        </div>

        {/* Price Variance % */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Price Variance
          </div>
          <div className="my-2">
            <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isBargain ? 'text-emerald-600' : isOverpriced ? 'text-rose-600' : 'text-sky-600'
            }`}>
              {activeProp.premium_pct > 0 ? `+${activeProp.premium_pct}%` : `${activeProp.premium_pct}%`}
            </div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">
              {activeProp.diff_amount >= 0 ? `+${formatINR(activeProp.diff_amount)}` : `-${formatINR(Math.abs(activeProp.diff_amount))}`} vs Peer
            </div>
          </div>
          <span className={`self-start px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isBargain
              ? 'bg-emerald-100 text-emerald-800'
              : isOverpriced
              ? 'bg-rose-100 text-rose-800'
              : 'bg-sky-100 text-sky-800'
          }`}>
            {activeProp.price_category}
          </span>
        </div>
      </div>

      {/* Model Transparency & Factors Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: How This Property Was Evaluated */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Calculation Explanation</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {activeProp.score_breakdown.verdict_narrative}
          </p>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 font-mono text-[11px] text-slate-700 space-y-1">
            <div className="text-slate-400 font-sans font-bold text-[10px] uppercase">
              Mathematical Verification:
            </div>
            <div>Variance = ((Asking Rent - Expected Rent) / Expected Rent) × 100</div>
            <div className="text-brand-700 font-semibold">
              = (({activeProp.rent} - {activeProp.expected_rent}) / {activeProp.expected_rent}) × 100 = {activeProp.premium_pct}%
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="text-xs font-bold text-slate-800">Applied Model Factors:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Locality Peer Rate</span>
                <span className="font-bold text-slate-800">₹{activeProp.score_breakdown.factors.baseline_sqft_rate} / sq.ft</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Furnishing Weight</span>
                <span className="font-bold text-slate-800">{activeProp.score_breakdown.factors.furnishing_multiplier}x ({activeProp.furnishing})</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Metro Transit Factor</span>
                <span className="font-bold text-slate-800">{activeProp.score_breakdown.factors.metro_proximity_multiplier}x ({activeProp.metro_distance_km} km)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Deposit Ratio</span>
                <span className="font-bold text-slate-800">{activeProp.deposit_to_rent_ratio}x ({activeProp.score_breakdown.deposit_assessment})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Property Details & Amenities */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
            <Building className="w-4 h-4 text-brand-600" />
            <span>Listing Attributes</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">Location:</span>
              <span className="font-semibold text-slate-800">{activeProp.sub_locality}, {activeProp.locality}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Property Type:</span>
              <span className="font-semibold text-slate-800">{activeProp.property_type} ({activeProp.bhk} BHK)</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Built-up Area:</span>
              <span className="font-semibold text-slate-800">{activeProp.area_sqft} sq.ft</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Age of Property:</span>
              <span className="font-semibold text-slate-800">{activeProp.property_age} years</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Nearest Metro Station:</span>
              <span className="font-semibold text-purple-700">{activeProp.nearest_metro_station} ({activeProp.metro_distance_km} km)</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Verification Status:</span>
              <span className="font-semibold text-emerald-700">{activeProp.availability_status}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-slate-400 text-[10px] block mb-1.5">Amenities:</span>
            <div className="flex flex-wrap gap-1.5">
              {activeProp.amenities.split(',').map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium"
                >
                  {amenity.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparable Peer Listings in the Same Micro-Market */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>Comparable Properties in {activeProp.locality}</span>
          </div>
          <span className="text-xs text-slate-400">
            Same locality & BHK benchmark set
          </span>
        </div>

        {loadingComps ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading comparable listings...</div>
        ) : comparables.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No close comparables found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="pb-2 font-semibold">ID</th>
                  <th className="pb-2 font-semibold">Sub-locality</th>
                  <th className="pb-2 font-semibold">Configuration</th>
                  <th className="pb-2 font-semibold">Asking Rent</th>
                  <th className="pb-2 font-semibold">Rate/sqft</th>
                  <th className="pb-2 font-semibold">Fairness Score</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {comparables.map((comp) => (
                  <tr key={comp.property_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-mono text-[11px] font-bold text-slate-900">{comp.property_id}</td>
                    <td className="py-2.5 font-medium">{comp.sub_locality}</td>
                    <td className="py-2.5">{comp.bhk} BHK • {comp.area_sqft} sqft • {comp.furnishing}</td>
                    <td className="py-2.5 font-bold text-slate-900">{formatINR(comp.rent)}</td>
                    <td className="py-2.5">₹{comp.rent_per_sqft}</td>
                    <td className="py-2.5 font-bold text-brand-700">{comp.fairness_score}/100</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        comp.price_category === 'Below Benchmark'
                          ? 'bg-emerald-100 text-emerald-800'
                          : comp.price_category === 'Above Benchmark'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {comp.price_category}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => {
                          setActiveProp(comp);
                          onSelectProperty(comp);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-brand-500 hover:text-white text-slate-700 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
