import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import type { PropertyItem } from '../../types/property';
import { formatINR } from '../../utils/formatters';
import { BarChart3 } from 'lucide-react';

interface LocalityBhkChartProps {
  locality: string;
  properties: PropertyItem[];
}

export const LocalityBhkChart: React.FC<LocalityBhkChartProps> = ({ locality, properties }) => {
  const chartData = useMemo(() => {
    const bhkTypes = [1, 2, 3, 4];
    return bhkTypes.map((bhk) => {
      const matchProps = properties.filter((p) => p.bhk === bhk);
      let medianRent = 0;
      let medianSqft = 0;

      if (matchProps.length > 0) {
        const rents = matchProps.map((p) => p.rent).sort((a, b) => a - b);
        medianRent = rents[Math.floor(rents.length / 2)];
        const sqfts = matchProps.map((p) => p.rent_per_sqft).sort((a, b) => a - b);
        medianSqft = sqfts[Math.floor(sqfts.length / 2)];
      } else {
        // Fallbacks for representative estimates
        const defaults: Record<number, { rent: number; sqft: number }> = {
          1: { rent: 22000, sqft: 38 },
          2: { rent: 42000, sqft: 41 },
          3: { rent: 68000, sqft: 45 },
          4: { rent: 110000, sqft: 50 },
        };
        medianRent = defaults[bhk].rent;
        medianSqft = defaults[bhk].sqft;
      }

      return {
        name: `${bhk} BHK`,
        rent: medianRent,
        sqftRate: medianSqft,
        count: matchProps.length,
      };
    });
  }, [properties]);

  const displayLocality = locality && locality !== 'All' ? locality : 'Bengaluru Metro Core';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              Median Rent by Configuration
            </h3>
            <p className="text-[10px] text-slate-400">
              1, 2, 3 & 4 BHK baseline in {displayLocality}
            </p>
          </div>
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                      <div className="font-bold text-lime-400">{data.name} Units</div>
                      <div className="text-slate-200">
                        Median Rent: <span className="font-bold text-white">{formatINR(data.rent)}/mo</span>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        Avg Rate: ₹{data.sqftRate}/sq.ft ({data.count} listings)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="rent" 
              fill="#84cc16" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
