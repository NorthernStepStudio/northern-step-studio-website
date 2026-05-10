import { TrendingUp, Eye, MousePointer2, ChevronDown } from "lucide-react";

interface MomentumData {
  app_key: string;
  page_views: number;
  cta_clicks: number;
  play_clicks: number;
  date_key: string;
}

interface Props {
  data: MomentumData[];
  loading: boolean;
}

export default function AppMomentumPanel({ data, loading }: Props) {
  if (loading) return <div className="cockpit-card animate-pulse h-64 flex items-center justify-center text-[10px] font-black uppercase">Analyzing App Momentum...</div>;

  return (
    <div className="cockpit-card h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">App Momentum (7 Days)</h3>
          <p className="text-xs font-black uppercase text-white">Page Views</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/60">
          Page Views <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="relative h-48 mb-6">
        {/* Mock Chart SVG */}
        <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
          {/* Grid Lines */}
          {[0, 50, 100, 150].map(y => (
            <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          ))}
          
          {/* Line 1 - NeuroMoves (Blue) */}
          <path d="M0,150 L166,130 L332,160 L500,100 L666,120 L832,80 L1000,110" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
          <circle cx="1000" cy="110" r="4" fill="#0ea5e9" />
          
          {/* Line 2 - Doomed (Purple) */}
          <path d="M0,180 L166,170 L332,150 L500,140 L666,160 L832,145 L1000,135" fill="none" stroke="#a855f7" strokeWidth="2.5" />
          <circle cx="1000" cy="135" r="4" fill="#a855f7" />
          
          {/* Line 3 - NexusBuild (Emerald) */}
          <path d="M0,120 L166,110 L332,105 L500,115 L666,95 L832,100 L1000,90" fill="none" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="1000" cy="90" r="4" fill="#10b981" />
          
          {/* Line 4 - Synox (Amber) */}
          <path d="M0,160 L166,155 L332,145 L500,150 L666,135 L832,140 L1000,125" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="1000" cy="125" r="4" fill="#f59e0b" />
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4">
          {[
            { label: 'NeuroMoves', color: 'bg-sky-500' },
            { label: 'Doomed', color: 'bg-purple-500' },
            { label: 'NexusBuild', color: 'bg-emerald-500' },
            { label: 'Synox', color: 'bg-amber-500' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
              <span className="text-[9px] font-black uppercase text-white/40">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
