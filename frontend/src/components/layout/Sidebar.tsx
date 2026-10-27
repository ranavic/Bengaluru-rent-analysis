import React from 'react';
import { 
  LayoutGrid, 
  ShieldCheck, 
  Building2, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMethodology: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onSelectTab,
  onOpenMethodology 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Map', icon: LayoutGrid },
    { id: 'analyzer', label: 'Fairness Audit', icon: ShieldCheck },
    { id: 'listings', label: 'All Listings', icon: Building2 },
  ];

  return (
    <aside className="w-56 bg-white/70 backdrop-blur-md border-r border-slate-200/80 flex flex-col justify-between py-6 px-3 shrink-0 transition-all">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 px-3 mb-8">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
              Bengaluru Rental
            </div>
            <div className="text-[10px] font-semibold text-brand-600 tracking-wider uppercase mt-1">
              Geospatial BI
            </div>
          </div>
        </div>

        {/* Navigation Menu (Only 3 clean, purposeful tabs!) */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Methodology Guide Modal Trigger */}
      <div className="pt-4 border-t border-slate-200/60">
        <button
          onClick={onOpenMethodology}
          className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 rounded-xl transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-brand-600" />
          <span>Methodology & Guide</span>
        </button>
        <div className="px-3 mt-2 text-[10px] text-slate-400 font-medium">
          690 Verified Listings • 16 Zones
        </div>
      </div>
    </aside>
  );
};
