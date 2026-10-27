import React, { useState, useEffect } from 'react';
import { BengaluruMap } from '../map/BengaluruMap';
import { CleanKeyMetrics } from './CleanKeyMetrics';
import { PropertySpotlightCard } from './PropertySpotlightCard';
import { LocalityBhkChart } from './LocalityBhkChart';
import type { 
  PropertyItem, 
  MetroStation, 
  OverviewMetrics, 
  FilterState 
} from '../../types/property';
import { Layers, RotateCcw, MapPin } from 'lucide-react';

interface MainDashboardProps {
  properties: PropertyItem[];
  metroStations: MetroStation[];
  metrics: OverviewMetrics;
  selectedProperty: PropertyItem | null;
  onSelectProperty: (property: PropertyItem) => void;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onNavigateToAnalyzer: (property: PropertyItem) => void;
  focusStation?: MetroStation | null;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  properties,
  metroStations,
  metrics,
  selectedProperty,
  onSelectProperty,
  filters,
  onFilterChange,
  onResetFilters,
  onNavigateToAnalyzer,
  focusStation,
}) => {
  const [showMetroLayer, setShowMetroLayer] = useState(true);

  // Auto-enable metro layer when user focuses a station from search
  useEffect(() => {
    if (focusStation) {
      setShowMetroLayer(true);
    }
  }, [focusStation]);

  const locationTitle = filters.locality && filters.locality !== 'All' ? filters.locality : 'All Bengaluru Micro-markets';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 h-full overflow-y-auto">
      {/* Left Column: Geographic Focus & Interactive Map (7 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-3">
        {/* Geographic Zone & Filter Strip */}
        <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200/90 shadow-sm flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Active Micro-market
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {locationTitle}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* BHK Filter */}
            <select
              value={filters.bhk || 0}
              onChange={(e) => onFilterChange({ bhk: Number(e.target.value) })}
              className="bg-slate-50 text-xs font-semibold text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value={0}>All Configurations</option>
              <option value={1}>1 BHK</option>
              <option value={2}>2 BHK</option>
              <option value={3}>3 BHK</option>
              <option value={4}>4 BHK</option>
            </select>

            {/* Furnishing Filter */}
            <select
              value={filters.furnishing || 'All'}
              onChange={(e) => onFilterChange({ furnishing: e.target.value })}
              className="bg-slate-50 text-xs font-semibold text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="All">All Furnishing</option>
              <option value="Fully-Furnished">Fully-Furnished</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>

            {/* Reset Button */}
            {(filters.locality !== 'All' || filters.bhk !== 0 || filters.furnishing !== 'All') && (
              <button
                onClick={onResetFilters}
                className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 min-h-[480px] lg:min-h-[560px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm relative">
          <BengaluruMap
            properties={properties}
            metroStations={metroStations}
            selectedProperty={selectedProperty}
            onSelectProperty={onSelectProperty}
            showMetroLayer={showMetroLayer}
            onToggleMetroLayer={() => setShowMetroLayer(!showMetroLayer)}
            activeLocality={filters.locality}
            height="100%"
            focusStation={focusStation}
          />
        </div>

        {/* Clean Map Legend Bar */}
        <div className="bg-white rounded-xl px-4 py-2.5 border border-slate-200/80 shadow-sm flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center space-x-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Legend:</span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-medium text-slate-700">Bargain Deal (&gt;5% below)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span className="text-[11px] font-medium text-slate-700">Fair Market (±5%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-[11px] font-medium text-slate-700">Premium Overpriced</span>
            </span>
          </div>

          <button
            onClick={() => setShowMetroLayer(!showMetroLayer)}
            className={`flex items-center space-x-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
              showMetroLayer
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showMetroLayer ? 'Metro Lines Visible' : 'Metro Lines Hidden'}</span>
          </button>
        </div>
      </div>

      {/* Right Column: Clean Intelligence & Spotlight (5 cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        {/* 4 Clean Key Metrics */}
        <CleanKeyMetrics metrics={metrics} />

        {/* Unified Selected Property Spotlight Card */}
        <PropertySpotlightCard
          property={selectedProperty}
          onInspect={() => selectedProperty && onNavigateToAnalyzer(selectedProperty)}
        />

        {/* Real BHK Rent Benchmark Chart */}
        <LocalityBhkChart
          locality={filters.locality}
          properties={properties}
        />
      </div>
    </div>
  );
};
