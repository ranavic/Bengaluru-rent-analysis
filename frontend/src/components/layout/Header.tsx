import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  MapPin, 
  BookOpen,
  Search,
  X,
  Train
} from 'lucide-react';
import type { FilterState, MetroStation } from '../../types/property';
import { SUB_LOCALITIES } from '../../data/subLocalities';
import type { SubLocalityItem } from '../../data/subLocalities';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  localities: string[];
  totalListingsCount: number;
  onOpenMethodology: () => void;
  metroStations: MetroStation[];
  onFocusStation: (station: MetroStation) => void;
  focusStation?: MetroStation | null;
  onClearLocation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  localities,
  totalListingsCount,
  onOpenMethodology,
  metroStations,
  onFocusStation,
  focusStation,
  onClearLocation,
}) => {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const bhkOptions = [
    { label: 'All BHK', value: 0 },
    { label: '1 BHK', value: 1 },
    { label: '2 BHK', value: 2 },
    { label: '3 BHK', value: 3 },
    { label: '4 BHK', value: 4 },
  ];

  const query = searchText.toLowerCase();
  const filteredLocalities = localities.filter((loc) => loc.toLowerCase().includes(query));
  const filteredStations = metroStations.filter(
    (s) => s.station_name.toLowerCase().includes(query) || s.line.toLowerCase().includes(query)
  );
  const filteredSubLocalities = query.length >= 2 
    ? SUB_LOCALITIES.filter((item) => 
        item.sub_locality.toLowerCase().includes(query) || 
        item.locality.toLowerCase().includes(query)
      ).slice(0, 8)
    : [];
  const hasResults = filteredLocalities.length > 0 || filteredSubLocalities.length > 0 || filteredStations.length > 0;

  // Active label logic
  let activeDisplay = '';
  let activeSubtext = `${totalListingsCount} listings tracked across Bengaluru`;

  if (focusStation) {
    activeDisplay = `${focusStation.station_name} Metro`;
    activeSubtext = `${focusStation.line} Line · Properties framed nearby`;
  } else if (filters.search) {
    activeDisplay = `"${filters.search}"`;
    activeSubtext = `${totalListingsCount} matching listings in ${filters.locality && filters.locality !== 'All' ? filters.locality : 'Bengaluru'}`;
  } else if (filters.locality && filters.locality !== 'All') {
    activeDisplay = filters.locality;
    activeSubtext = `${totalListingsCount} listings in ${filters.locality}`;
  }

  const isLocationFiltered = Boolean(focusStation || (filters.locality && filters.locality !== 'All') || filters.search);

  // Recalculate dropdown position on open/resize
  const openDropdown = () => {
    if (anchorRef.current) {
      setDropdownRect(anchorRef.current.getBoundingClientRect());
    }
    setShowDropdown(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const dropdownEl = document.getElementById('search-dropdown-portal');
      const isInsideDropdown = dropdownEl?.contains(target);
      if (!isInsideContainer && !isInsideDropdown) {
        setShowDropdown(false);
        setSearchText('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocality = (loc: string) => {
    onFilterChange({ locality: loc, search: '' });
    setSearchText('');
    setShowDropdown(false);
  };

  const handleSelectSubLocality = (item: SubLocalityItem) => {
    onFilterChange({ locality: item.locality, search: item.sub_locality });
    setSearchText('');
    setShowDropdown(false);
  };

  const handleSelectStation = (station: MetroStation) => {
    onFocusStation(station);
    setSearchText('');
    setShowDropdown(false);
  };

  const handleClear = () => {
    if (onClearLocation) {
      onClearLocation();
    } else {
      onFilterChange({ locality: 'All', search: '' });
    }
    setSearchText('');
    inputRef.current?.focus();
  };

  const handleSearchSubmit = () => {
    const trimmed = searchText.trim();
    if (!trimmed) return;
    const term = trimmed.toLowerCase();

    // 1. Exact or partial locality match
    const matchedLoc = localities.find((l) => l.toLowerCase() === term);
    if (matchedLoc) {
      handleSelectLocality(matchedLoc);
      return;
    }

    // 2. Exact or partial metro station match
    const matchedStation = metroStations.find((s) => 
      s.station_name.toLowerCase() === term || s.station_name.toLowerCase().includes(term)
    );
    if (matchedStation) {
      handleSelectStation(matchedStation);
      return;
    }

    // 3. Sub-locality match
    const matchedSub = SUB_LOCALITIES.find((s) => 
      s.sub_locality.toLowerCase() === term || s.sub_locality.toLowerCase().includes(term)
    );
    if (matchedSub) {
      handleSelectSubLocality(matchedSub);
      return;
    }

    // 4. Fallback to free-text search across all fields
    onFilterChange({ search: trimmed, locality: 'All' });
    setSearchText('');
    setShowDropdown(false);
  };

  // Portal dropdown rendered at body level to escape all stacking contexts
  const dropdownPortal = showDropdown && dropdownRect
    ? ReactDOM.createPortal(
        <div
          id="search-dropdown-portal"
          style={{
            position: 'fixed',
            top: dropdownRect.bottom + 6,
            left: dropdownRect.left,
            width: 320,
            zIndex: 99999,
          }}
          className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in-50 duration-150"
        >
          {/* All Bengaluru Option */}
          <button
            onClick={() => handleSelectLocality('All')}
            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs hover:bg-brand-50 transition-colors text-left border-b border-slate-100 ${
              !isLocationFiltered ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700 font-semibold'
            }`}
          >
            <span className="w-5 h-5 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
              <MapPin className="w-3 h-3" />
            </span>
            <div className="flex-1">
              <div className="leading-tight">All Bengaluru Micro-markets</div>
              <div className="text-[10px] text-slate-400 font-normal">Show citywide listings</div>
            </div>
          </button>

          {hasResults ? (
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
              {/* Localities Section */}
              {filteredLocalities.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                    Micro-markets ({filteredLocalities.length})
                  </div>
                  {filteredLocalities.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleSelectLocality(loc)}
                      className={`w-full flex items-center space-x-2.5 px-4 py-2 text-xs hover:bg-slate-50 transition-colors text-left ${
                        filters.locality === loc ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        filters.locality === loc ? 'bg-brand-500 ring-2 ring-brand-200' : 'bg-slate-300'
                      }`}></span>
                      <span className="font-medium flex-1">{loc}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Sub-localities / Neighborhoods Section */}
              {filteredSubLocalities.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50/70 border-b border-emerald-100/60 flex items-center space-x-1.5">
                    <MapPin className="w-3 h-3" />
                    <span>Popular Areas & Sectors ({filteredSubLocalities.length})</span>
                  </div>
                  {filteredSubLocalities.map((item) => (
                    <button
                      key={`${item.locality}-${item.sub_locality}`}
                      onClick={() => handleSelectSubLocality(item)}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs hover:bg-emerald-50/70 transition-colors text-left group"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:bg-emerald-600 shrink-0"></span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-700 group-hover:text-emerald-800 truncate">
                          {item.sub_locality}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          in {item.locality}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Metro Stations Section */}
              {filteredStations.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50/70 border-b border-purple-100/60 flex items-center space-x-1.5">
                    <Train className="w-3 h-3" />
                    <span>Namma Metro Stations ({filteredStations.length})</span>
                  </div>
                  {filteredStations.map((station) => (
                    <button
                      key={station.station_name}
                      onClick={() => handleSelectStation(station)}
                      className={`w-full flex items-center space-x-2.5 px-4 py-2 text-xs hover:bg-purple-50 transition-colors text-left group ${
                        focusStation?.station_name === station.station_name ? 'bg-purple-50 font-bold' : ''
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        M
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-700 group-hover:text-purple-700 truncate">
                          {station.station_name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {station.line} Line · {station.status}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center">
              <div className="text-xs text-slate-500 mb-2">No matching area or station found</div>
              <button
                onClick={handleSearchSubmit}
                className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Search "{searchText}" across all listings
              </button>
            </div>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <header className="h-16 px-6 border-b border-slate-200/80 bg-white/60 backdrop-blur-md flex items-center justify-between shrink-0 gap-4">

      {/* Left: Area / Station Search Bar */}
      <div ref={containerRef} className="flex items-center">
        {/* Anchor element to measure position */}
        <div ref={anchorRef} className="relative">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border bg-white shadow-sm transition-all ${
            showDropdown ? 'border-brand-400 ring-2 ring-brand-100' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <div className={`p-1 rounded-lg shrink-0 ${focusStation ? 'bg-purple-50 text-purple-600' : 'bg-brand-50 text-brand-600'}`}>
              {focusStation ? <Train className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
            </div>

            <div className="flex flex-col min-w-[200px]">
              <div className="flex items-center space-x-1.5">
                <Search className="w-3 h-3 text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={showDropdown ? searchText : (activeDisplay || searchText)}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    openDropdown();
                  }}
                  onFocus={() => {
                    setSearchText('');
                    openDropdown();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit();
                    }
                  }}
                  placeholder={activeDisplay || 'Search area or metro station...'}
                  className="text-xs font-bold text-slate-900 bg-transparent border-none focus:ring-0 focus:outline-none w-full placeholder:font-normal placeholder:text-slate-400"
                />
                {isLocationFiltered && !showDropdown && (
                  <button 
                    onClick={handleClear} 
                    title="Reset to All Bengaluru"
                    className="p-0.5 hover:bg-slate-100 rounded-md transition-colors shrink-0 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  focusStation ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500 animate-pulse'
                }`}></span>
                <span className="truncate">{activeSubtext}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portal renders dropdown at body level — above Leaflet map */}
      {dropdownPortal}

      {/* Center: Quick BHK Filter Pills */}
      <div className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
        {bhkOptions.map((opt) => {
          const isActive = (filters.bhk || 0) === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ bhk: opt.value })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Right: Guide & User Badge */}
      <div className="flex items-center space-x-3 shrink-0">
        <button
          onClick={onOpenMethodology}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-brand-600" />
          <span className="hidden sm:inline">Guide</span>
        </button>

        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            BI
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-800 leading-tight">Student Group 4</div>
            <div className="text-[10px] text-slate-400 font-medium">BI Project</div>
          </div>
        </div>
      </div>
    </header>
  );
};
