import { FC } from 'react';
import type { HeaderProps } from "./types";

export const DashboardHeader: FC<HeaderProps> = ({ onRefresh }) => (
  <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
    <div>
      <h1 className="text-2xl font-black text-emerald-400 tracking-wide">SHEETS ORM PLATFORM</h1>
      <p className="text-xs text-slate-400 mt-1">Headless Spreadsheet CMS Core Integration Environment</p>
    </div>
    <button 
      onClick={onRefresh} 
      className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-600 transition"
    >
      🔄 Refresh State
    </button>
  </div>
);
