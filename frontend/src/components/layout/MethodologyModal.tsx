import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Calculator, 
  Train, 
  Database, 
  CheckCircle, 
  GraduationCap 
} from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'formula' | 'metro' | 'data'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Coursework & Methodology Guide
              </h2>
              <p className="text-[11px] text-slate-500">
                Bengaluru Rental Intelligence • Business Intelligence Project
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 bg-white gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Project Objectives
          </button>
          <button
            onClick={() => setActiveTab('formula')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'formula'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Fairness Benchmark Math
          </button>
          <button
            onClick={() => setActiveTab('metro')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'metro'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Namma Metro Transit Model
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'data'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Data Sources & Coverage
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-brand-600" />
                <span>Problem Statement & Intelligence Goal</span>
              </h3>
              <p>
                Bengaluru's tech boom has driven intense rental inflation across corridors like Indiranagar, Koramangala, Bellandur, and Whitefield. Students and early-career software engineers routinely face information asymmetry, unreasonable security deposit demands (often 6-10x monthly rent), and arbitrary price premiums without knowing whether an asking rent reflects true micro-market value.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Descriptive BI</span>
                  <span className="text-[11px] text-slate-500">Aggregates rental rates, square footage density, and deposit ratios across 16 micro-markets.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Geospatial Insights</span>
                  <span className="text-[11px] text-slate-500">Integrates 52 Namma Metro stations to measure public transit premium using Haversine geodesic distance.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Transparent Fairness</span>
                  <span className="text-[11px] text-slate-500">Computes an explainable benchmark score (0-100) to flag bargains vs overpriced listings without black-box ML.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'formula' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-brand-600" />
                <span>Empirical Benchmark Formulation</span>
              </h3>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-800 space-y-1.5">
                <div className="text-slate-400 font-sans font-bold uppercase text-[10px]">Expected Benchmark Formula:</div>
                <div className="text-brand-700 font-bold">
                  Expected Rent = Area(sq.ft) × PeerMedianSqftRate(Locality, BHK) × FurnishingMultiplier × MetroMultiplier
                </div>
              </div>
              <ul className="space-y-2 pt-1 text-[11px] text-slate-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                  <span><strong>Locality & BHK Matching:</strong> Calculates the empirical median rate per sq.ft from peer properties in the exact same micro-market.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                  <span><strong>Furnishing Weights:</strong> Semi-Furnished = 1.0x (baseline), Fully-Furnished = 1.15x (+15% premium), Unfurnished = 0.90x (-10% discount).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                  <span><strong>Fairness Score (0-100):</strong> Baseline of 75 points; properties priced below benchmark gain up to 25 points, while markups reduce the score proportionally.</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'metro' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Train className="w-4 h-4 text-brand-600" />
                <span>Namma Metro Transit Accessibility</span>
              </h3>
              <p>
                Each listing's coordinate is evaluated against all 52 operational Namma Metro stations (Purple and Green lines) using the spherical Haversine formula:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-700">
                d = 2R × asin(sqrt(sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)))
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <strong>Walkable Zone (&le; 1.2 km):</strong>
                  <div className="text-[10px] text-emerald-600 mt-0.5">+6% transit accessibility benchmark allowance.</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
                  <strong>Feeder Zone (&gt; 1.2 km):</strong>
                  <div className="text-[10px] text-slate-500 mt-0.5">Standard baseline without extra transit premium.</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Database className="w-4 h-4 text-brand-600" />
                <span>Dataset Structure & Integrity</span>
              </h3>
              <p>
                The backend loads 690 verified rental listings across 16 primary Bengaluru localities and 52 metro station coordinates.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-lg font-extrabold text-slate-900">690</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Listings</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-lg font-extrabold text-slate-900">16</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Micro-markets</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-lg font-extrabold text-slate-900">52</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Metro Stations</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-lg font-extrabold text-emerald-600">100%</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Verified Coordinates</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Student Group 4 • BI Coursework</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
