import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Train, 
  Maximize2, 
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import type { PropertyItem } from '../../types/property';
import { formatINR, formatLakh } from '../../utils/formatters';

interface PropertySpotlightCardProps {
  property: PropertyItem | null;
  onInspect: () => void;
}

export const PropertySpotlightCard: React.FC<PropertySpotlightCardProps> = ({ 
  property, 
  onInspect 
}) => {
  if (!property) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col items-center justify-center text-center py-10">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
          <MapPin className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Select a Listing to Inspect</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Click any marker on the Bengaluru map to inspect its asking rent vs benchmark and fairness score.
        </p>
      </div>
    );
  }

  const isBargain = property.price_category === 'Below Benchmark';
  const isOverpriced = property.price_category === 'Above Benchmark';

  const badgeStyle = isBargain
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isOverpriced
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : 'bg-sky-50 text-sky-700 border-sky-200';

  const badgeIcon = isBargain ? (
    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
  ) : isOverpriced ? (
    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
  ) : (
    <Info className="w-3.5 h-3.5 mr-1 text-sky-600" />
  );

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
      {/* Top Header: ID & Category Badge */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
              {property.property_id}
            </span>
            <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
              {property.sub_locality}, {property.locality}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">
            {property.bhk} BHK • {property.furnishing} • {property.property_type}
          </div>
        </div>

        <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${badgeStyle}`}>
          {badgeIcon}
          <span>{property.price_category}</span>
        </div>
      </div>

      {/* Pricing Comparison: Asking vs Expected */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Asking Rent
          </span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatINR(property.rent)}
            </span>
            <span className="text-[11px] text-slate-400">/mo</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            ₹{property.rent_per_sqft}/sq.ft
          </span>
        </div>

        <div className="border-l border-slate-200 pl-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Expected Peer Rent
          </span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-xl font-extrabold text-slate-700 tracking-tight">
              {formatINR(property.expected_rent)}
            </span>
            <span className="text-[11px] text-slate-400">/mo</span>
          </div>
          <span className={`text-[11px] font-bold ${
            isBargain ? 'text-emerald-600' : isOverpriced ? 'text-rose-600' : 'text-sky-600'
          }`}>
            {property.premium_pct > 0 ? `+${property.premium_pct}% markup` : `${property.premium_pct}% savings`}
          </span>
        </div>
      </div>

      {/* Fairness Score Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Fairness Evaluation Score</span>
          </span>
          <span className="font-extrabold text-brand-700">
            {property.fairness_score} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              property.fairness_score >= 80
                ? 'bg-brand-500'
                : property.fairness_score >= 60
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
            style={{ width: `${property.fairness_score}%` }}
          />
        </div>
      </div>

      {/* 3 Quick Attributes: Area, Metro, Deposit */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-center text-slate-400 mb-0.5">
            <Maximize2 className="w-3 h-3 mr-1" />
            <span className="text-[10px] font-medium">Area</span>
          </div>
          <div className="font-bold text-slate-800 text-[11px]">{property.area_sqft} sq.ft</div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-center text-slate-400 mb-0.5">
            <Train className="w-3 h-3 mr-1" />
            <span className="text-[10px] font-medium">Metro</span>
          </div>
          <div className="font-bold text-slate-800 text-[11px] truncate">{property.metro_distance_km} km</div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-center text-slate-400 mb-0.5">
            <CreditCard className="w-3 h-3 mr-1" />
            <span className="text-[10px] font-medium">Deposit</span>
          </div>
          <div className="font-bold text-slate-800 text-[11px]">{formatLakh(property.deposit)}</div>
        </div>
      </div>

      {/* CTA Button to Fairness Analyzer */}
      <button
        onClick={onInspect}
        className="w-full flex items-center justify-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm shadow-brand-500/20 transition-all cursor-pointer"
      >
        <span>Audit Fairness & Peer Comparables</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
