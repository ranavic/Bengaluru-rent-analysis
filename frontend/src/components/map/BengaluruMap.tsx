import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import type { PropertyItem, MetroStation } from '../../types/property';
import { formatINR } from '../../utils/formatters';
import { Train, Navigation, Eye, EyeOff } from 'lucide-react';

interface BengaluruMapProps {
  properties: PropertyItem[];
  metroStations: MetroStation[];
  selectedProperty: PropertyItem | null;
  onSelectProperty: (property: PropertyItem) => void;
  showMetroLayer: boolean;
  onToggleMetroLayer: () => void;
  height?: string;
  className?: string;
  activeLocality?: string;
  focusStation?: MetroStation | null;
}

// Controller component to smoothly fly/pan map when property, station, or locality changes
const MapController: React.FC<{ 
  properties: PropertyItem[];
  activeLocality?: string;
  focusStation?: MetroStation | null;
  selectedProp: PropertyItem | null;
}> = ({ properties, activeLocality, focusStation, selectedProp }) => {
  const map = useMap();
  const prevFocusStationRef = useRef<string | null>(null);
  const prevLocalityRef = useRef<string | undefined>(undefined);
  const prevSelectedPropIdRef = useRef<string | null>(null);
  const prevPropsLenRef = useRef<number>(properties.length);

  useEffect(() => {
    // 1. Focused Metro Station changed
    const currentStationName = focusStation ? focusStation.station_name : null;
    if (focusStation && currentStationName !== prevFocusStationRef.current) {
      prevFocusStationRef.current = currentStationName;
      prevLocalityRef.current = activeLocality;
      if (selectedProp) prevSelectedPropIdRef.current = selectedProp.property_id;
      map.flyTo([focusStation.latitude, focusStation.longitude], 14.2, {
        duration: 1.2,
      });
      return;
    }
    prevFocusStationRef.current = currentStationName;

    // 2. Locality changed
    if (activeLocality !== prevLocalityRef.current) {
      prevLocalityRef.current = activeLocality;
      if (selectedProp) prevSelectedPropIdRef.current = selectedProp.property_id;

      if (activeLocality && activeLocality !== 'All' && properties.length > 0) {
        const avgLat = properties.reduce((acc, p) => acc + p.latitude, 0) / properties.length;
        const avgLon = properties.reduce((acc, p) => acc + p.longitude, 0) / properties.length;
        map.flyTo([avgLat, avgLon], 13.8, { duration: 1.2 });
        return;
      } else if (activeLocality === 'All' && !focusStation) {
        map.flyTo([12.9716, 77.5946], 12, { duration: 1.0 });
        return;
      }
    }

    // 3. Properties list changed while no specific station was focused (e.g. search filter applied)
    if (!focusStation && properties.length > 0 && properties.length !== prevPropsLenRef.current) {
      prevPropsLenRef.current = properties.length;
      if (activeLocality && activeLocality !== 'All') {
        const avgLat = properties.reduce((acc, p) => acc + p.latitude, 0) / properties.length;
        const avgLon = properties.reduce((acc, p) => acc + p.longitude, 0) / properties.length;
        map.flyTo([avgLat, avgLon], 13.8, { duration: 1.2 });
        return;
      } else if (properties.length < 50) {
        // Search filter resulted in a subset of properties
        const avgLat = properties.reduce((acc, p) => acc + p.latitude, 0) / properties.length;
        const avgLon = properties.reduce((acc, p) => acc + p.longitude, 0) / properties.length;
        map.flyTo([avgLat, avgLon], 14, { duration: 1.2 });
        return;
      }
    }
    prevPropsLenRef.current = properties.length;

    // 4. User clicked a different property marker
    const currentPropId = selectedProp ? selectedProp.property_id : null;
    if (selectedProp && currentPropId !== prevSelectedPropIdRef.current) {
      prevSelectedPropIdRef.current = currentPropId;
      map.flyTo([selectedProp.latitude, selectedProp.longitude], 15.2, {
        duration: 1.0,
      });
      return;
    }
  }, [focusStation, activeLocality, selectedProp, properties, map]);

  return null;
};

export const BengaluruMap: React.FC<BengaluruMapProps> = ({
  properties,
  metroStations,
  selectedProperty,
  onSelectProperty,
  showMetroLayer,
  onToggleMetroLayer,
  height = '100%',
  className = '',
  activeLocality,
  focusStation,
}) => {
  // Center of Bengaluru
  const defaultCenter: [number, number] = useMemo(() => [12.9716, 77.5946], []);

  // Create custom Pin icons
  const createPropertyIcon = (priceCategory: string, isSelected: boolean) => {
    let color = '#0284c7'; // Near benchmark (Sky)
    let ringColor = 'rgba(2, 132, 199, 0.3)';
    
    if (priceCategory === 'Below Benchmark') {
      color = '#16a34a'; // Green
      ringColor = 'rgba(22, 163, 74, 0.3)';
    } else if (priceCategory === 'Above Benchmark') {
      color = '#e11d48'; // Rose/Red
      ringColor = 'rgba(225, 29, 72, 0.3)';
    }

    const size = isSelected ? 34 : 24;
    const border = isSelected ? '3px solid #ffffff' : '2px solid #ffffff';

    const html = `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 9999px;
        border: ${border};
        box-shadow: 0 4px 10px rgba(0,0,0,0.25), 0 0 0 ${isSelected ? '6px' : '3px'} ${ringColor};
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <div style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 9999px;"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-property-pin',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  // Metro station icon
  const metroIcon = useMemo(() => {
    const html = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        background-color: #7c3aed;
        color: white;
        font-size: 11px;
        font-weight: 800;
        border-radius: 6px;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        M
      </div>
    `;
    return L.divIcon({
      html,
      className: 'custom-metro-pin',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -11],
    });
  }, []);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-50 ${className}`} style={{ height }}>
      {/* Interactive Controls Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center space-x-2">
        <button
          onClick={onToggleMetroLayer}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm transition-all backdrop-blur-md ${
            showMetroLayer
              ? 'bg-purple-600 text-white shadow-purple-200'
              : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200'
          }`}
          title="Toggle Namma Metro Stations layer"
        >
          <Train className="w-3.5 h-3.5" />
          <span>Metro ({metroStations.length})</span>
          {showMetroLayer ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5 opacity-60" />}
        </button>
      </div>

      {/* Pricing Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5 min-w-[170px]">
        <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Price Benchmark</span>
          <span className="text-[10px] text-slate-400 font-normal">Peer Median</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
            <span>Below benchmark</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Bargain</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm"></span>
            <span>Near benchmark</span>
          </div>
          <span className="text-[10px] text-sky-600 font-medium">±5% Fair</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
            <span>Above benchmark</span>
          </div>
          <span className="text-[10px] text-rose-600 font-medium">+5% Markup</span>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <ZoomControl position="topright" />
        
        <MapController 
          properties={properties}
          activeLocality={activeLocality}
          focusStation={focusStation}
          selectedProp={selectedProperty}
        />

        {/* Crisp Light Cartography Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Metro Station Catchment Rings when Station is Focused */}
        {focusStation && (
          <>
            {/* 1.5 km commute catchment zone */}
            <Circle
              center={[focusStation.latitude, focusStation.longitude]}
              radius={1500}
              pathOptions={{
                color: '#7c3aed',
                fillColor: '#8b5cf6',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '5, 8',
              }}
            />
            {/* 800m walking zone */}
            <Circle
              center={[focusStation.latitude, focusStation.longitude]}
              radius={800}
              pathOptions={{
                color: '#7c3aed',
                fillColor: '#8b5cf6',
                fillOpacity: 0.16,
                weight: 2,
              }}
            />
          </>
        )}

        {/* Pulsing Active Radar Ring on Selected Property or Locality Center */}
        {selectedProperty && (
          <>
            <Circle
              center={[selectedProperty.latitude, selectedProperty.longitude]}
              radius={900}
              pathOptions={{
                color: '#84cc16',
                fillColor: '#84cc16',
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '4, 8',
              }}
            />
            <Circle
              center={[selectedProperty.latitude, selectedProperty.longitude]}
              radius={400}
              pathOptions={{
                color: '#65a30d',
                fillColor: '#84cc16',
                fillOpacity: 0.22,
                weight: 2,
              }}
            />
          </>
        )}

        {/* Focused Station Marker (always rendered with highlight) */}
        {focusStation && (
          <Marker
            position={[focusStation.latitude, focusStation.longitude]}
            icon={metroIcon}
          >
            <Popup>
              <div className="p-2 text-xs min-w-[200px]">
                <div className="flex items-center space-x-1.5 text-purple-700 font-bold mb-1">
                  <Train className="w-4 h-4" />
                  <span>Focused Metro Station</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{focusStation.station_name}</div>
                <div className="mt-1 flex items-center justify-between text-slate-500">
                  <span>Line:</span>
                  <span className="font-semibold text-purple-700">{focusStation.line} Line</span>
                </div>
                <div className="mt-1 text-[11px] text-purple-600 bg-purple-50 p-1.5 rounded-lg border border-purple-100 font-medium">
                  Nearby rental properties framed in 1.5 km commute zone
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Namma Metro Stations */}
        {showMetroLayer &&
          metroStations
            .filter((s) => s.station_name !== focusStation?.station_name)
            .map((station) => (
            <Marker
              key={station.station_name}
              position={[station.latitude, station.longitude]}
              icon={metroIcon}
            >
              <Popup>
                <div className="p-2 text-xs min-w-[190px]">
                  <div className="flex items-center space-x-1.5 text-purple-700 font-bold mb-1">
                    <Train className="w-4 h-4" />
                    <span>Namma Metro Station</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{station.station_name}</div>
                  <div className="mt-1 flex items-center justify-between text-slate-500">
                    <span>Line:</span>
                    <span className="font-medium text-slate-700">{station.line} Line</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Status:</span>
                    <span className="text-emerald-600 font-medium">{station.status}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Rental Properties */}
        {properties.map((prop) => {
          const isSelected = selectedProperty?.property_id === prop.property_id;
          return (
            <Marker
              key={prop.property_id}
              position={[prop.latitude, prop.longitude]}
              icon={createPropertyIcon(prop.price_category, isSelected)}
              eventHandlers={{
                click: () => onSelectProperty(prop),
              }}
            >
              <Popup>
                <div className="p-3 text-xs w-[260px] font-sans">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-sm">{formatINR(prop.rent)}<span className="text-xs font-normal text-slate-500">/mo</span></span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        prop.price_category === 'Below Benchmark'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prop.price_category === 'Above Benchmark'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {prop.price_category}
                    </span>
                  </div>

                  <div className="text-slate-800 font-semibold text-xs mb-1">
                    {prop.bhk} BHK • {prop.area_sqft} sq.ft • {prop.furnishing}
                  </div>

                  <div className="text-slate-500 text-[11px] mb-2 flex items-center">
                    <Navigation className="w-3 h-3 mr-1 text-slate-400" />
                    {prop.sub_locality}, {prop.locality}
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 space-y-1 mb-2.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Expected Market Rent:</span>
                      <span className="font-semibold text-slate-700">{formatINR(prop.expected_rent)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Premium / Discount:</span>
                      <span className={`font-semibold ${prop.premium_pct > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {prop.premium_pct > 0 ? `+${prop.premium_pct}%` : `${prop.premium_pct}%`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Fairness Score:</span>
                      <span className="font-bold text-brand-700">{prop.fairness_score}/100</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Nearest Metro:</span>
                      <span className="font-medium text-slate-600">{prop.metro_distance_km} km ({prop.nearest_metro_station})</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectProperty(prop)}
                    className="w-full py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg text-center transition-colors shadow-sm text-xs"
                  >
                    Inspect in Fairness Analyzer
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
