import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { FairnessAnalyzer } from './components/analyzer/FairnessAnalyzer';
import { PropertyDirectory } from './components/listings/PropertyDirectory';
import { MethodologyModal } from './components/layout/MethodologyModal';
import type { 
  PropertyItem, 
  MetroStation, 
  OverviewMetrics, 
  FilterState 
} from './types/property';
import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [metroStations, setMetroStations] = useState<MetroStation[]>([]);
  const [metrics, setMetrics] = useState<OverviewMetrics>({
    total_listings: 690,
    median_rent: 45250,
    median_rent_per_sqft: 42.9,
    pct_above_benchmark: 30.7,
    pct_below_benchmark: 32.8,
    pct_near_benchmark: 36.5,
    avg_metro_distance_km: 2.2,
    student_budget_listings_pct: 7.2,
    median_deposit: 180000,
    total_localities: 16,
  });
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [focusStation, setFocusStation] = useState<MetroStation | null>(null);

  // Available Bengaluru localities
  const localitiesList = [
    'Indiranagar',
    'Koramangala',
    'HSR Layout',
    'Whitefield',
    'Bellandur',
    'Marathahalli',
    'BTM Layout',
    'Jayanagar',
    'JP Nagar',
    'Malleshwaram',
    'Electronic City',
    'Hebbal',
    'Sarjapur Road',
    'Rajajinagar',
    'Kalyan Nagar',
    'Banashankari',
  ];

  const defaultFilters: FilterState = {
    locality: 'All',
    bhk: 0,
    furnishing: 'All',
    price_category: 'All',
    search: '',
  };

  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Load properties and metro stations
  const loadData = () => {
    Promise.all([
      api.getProperties(filters, 1000),
      api.getOverview(filters),
      api.getMetroStations(),
    ])
      .then(([propsRes, overviewRes, metroRes]) => {
        setProperties(propsRes.properties);
        setMetrics(overviewRes);
        setMetroStations(metroRes);

        // Smart selection of spotlight property matching the active view
        if (propsRes.properties.length > 0) {
          if (focusStation) {
            // Find closest property to the focused metro station
            let closest = propsRes.properties[0];
            let minDist = Number.MAX_VALUE;
            for (const p of propsRes.properties) {
              const d = Math.hypot(p.latitude - focusStation.latitude, p.longitude - focusStation.longitude);
              if (d < minDist) {
                minDist = d;
                closest = p;
              }
            }
            setSelectedProperty(closest);
          } else {
            // Check if existing selected property is in the new results
            const stillExists = selectedProperty && propsRes.properties.some((p) => p.property_id === selectedProperty.property_id);
            if (!stillExists) {
              setSelectedProperty(propsRes.properties[0]);
            }
          }
        } else {
          setSelectedProperty(null);
        }
      })
      .catch((err) => console.error('API load error:', err));
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  // When focusStation changes and properties are already loaded, select the closest property
  useEffect(() => {
    if (focusStation && properties.length > 0) {
      let closest = properties[0];
      let minDist = Number.MAX_VALUE;
      for (const p of properties) {
        const d = Math.hypot(p.latitude - focusStation.latitude, p.longitude - focusStation.longitude);
        if (d < minDist) {
          minDist = d;
          closest = p;
        }
      }
      setSelectedProperty(closest);
    }
  }, [focusStation]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    // If user changes locality or search, clear station focus
    if (newFilters.locality !== undefined || newFilters.search !== undefined) {
      setFocusStation(null);
    }
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFocusStation(null);
    setFilters(defaultFilters);
  };

  const handleClearLocation = () => {
    setFocusStation(null);
    setFilters((prev) => ({
      ...prev,
      locality: 'All',
      search: '',
    }));
  };

  const handleFocusStation = (station: MetroStation) => {
    setFocusStation(station);
    setCurrentTab('dashboard');
    // Reset locality and search so all citywide listings are fetched and nearby properties appear
    setFilters((prev) => ({
      ...prev,
      locality: 'All',
      search: '',
    }));
  };

  const handleNavigateToAnalyzer = (prop: PropertyItem) => {
    setSelectedProperty(prop);
    setCurrentTab('analyzer');
  };

  const handleNavigateToDashboard = () => {
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-200 via-emerald-100/30 to-slate-300 p-2 sm:p-4 md:p-6 flex items-center justify-center font-sans antialiased text-slate-800">
      {/* Outer Floating App Card matching reference image */}
      <div className="w-full max-w-[1600px] h-[96vh] bg-slate-50/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/5">
        <div className="flex flex-1 h-full overflow-hidden">
          {/* Left Navigation Sidebar (Simplified to 3 clean tabs) */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            onOpenMethodology={() => setIsMethodologyOpen(true)}
          />

          {/* Main Area: Top Header + View Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]/80 overflow-hidden">
            {/* Top Navigation Header */}
            <Header
              filters={filters}
              onFilterChange={handleFilterChange}
              localities={localitiesList}
              totalListingsCount={metrics.total_listings}
              onOpenMethodology={() => setIsMethodologyOpen(true)}
              metroStations={metroStations}
              onFocusStation={handleFocusStation}
              focusStation={focusStation}
              onClearLocation={handleClearLocation}
            />

            {/* Dynamic View Body (Uncluttered, simple to understand) */}
            <main className="flex-1 overflow-y-auto">
              {currentTab === 'dashboard' && (
                <MainDashboard
                  properties={properties}
                  metroStations={metroStations}
                  metrics={metrics}
                  selectedProperty={selectedProperty}
                  onSelectProperty={(prop) => setSelectedProperty(prop)}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  onNavigateToAnalyzer={handleNavigateToAnalyzer}
                  focusStation={focusStation}
                />
              )}

              {currentTab === 'analyzer' && (
                <FairnessAnalyzer
                  properties={properties}
                  selectedProperty={selectedProperty}
                  onSelectProperty={(prop) => setSelectedProperty(prop)}
                  onNavigateToMap={handleNavigateToDashboard}
                />
              )}

              {currentTab === 'listings' && (
                <PropertyDirectory
                  properties={properties}
                  onSelectProperty={(prop) => setSelectedProperty(prop)}
                  onNavigateToAnalyzer={handleNavigateToAnalyzer}
                  onNavigateToMap={handleNavigateToDashboard}
                />
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Coursework & Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}

export default App;
