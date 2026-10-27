import React from 'react';
import { 
  Building2, 
  Train, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';
import type { OverviewMetrics } from '../../types/property';
import { formatINR } from '../../utils/formatters';

interface CleanKeyMetricsProps {
  metrics: OverviewMetrics;
}

export const CleanKeyMetrics: React.FC<CleanKeyMetricsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Median Monthly Rent',
      value: formatINR(metrics.median_rent),
      unit: '/ mo',
      subtext: 'Micro-market baseline',
      icon: Building2,
      accent: 'border-l-4 border-l-brand-500',
      iconBg: 'bg-brand-50 text-brand-600',
    },
    {
      title: 'Median Rate per Sq.Ft',
      value: `₹${metrics.median_rent_per_sqft.toFixed(1)}`,
      unit: '/ sq.ft',
      subtext: 'Built-up area density',
      icon: TrendingUp,
      accent: 'border-l-4 border-l-sky-500',
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      title: 'Bargain Listings',
      value: `${metrics.pct_below_benchmark}%`,
      unit: 'of listings',
      subtext: '>5% below peer median',
      icon: CheckCircle2,
      accent: 'border-l-4 border-l-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Avg Transit Distance',
      value: `${metrics.avg_metro_distance_km.toFixed(1)}`,
      unit: 'km',
      subtext: 'To nearest Namma Metro',
      icon: Train,
      accent: 'border-l-4 border-l-purple-500',
      iconBg: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className={`bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-sm ${c.accent} transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 truncate">{c.title}</span>
              <div className={`p-1.5 rounded-lg ${c.iconBg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">{c.value}</span>
              <span className="text-[11px] font-medium text-slate-400">{c.unit}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate font-medium">
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
