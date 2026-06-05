import { FC } from 'react';
import { DataTable } from "./BaseWidgets";
import type { DataGridProps } from "./types";

export const DataGridSection: FC<DataGridProps> = ({
  sheetsSummary, companies, employees, onCascadeDeleteCompany
}) => (
  <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
    <div className="bg-slate-700/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
      <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">📊 Current Spreadsheet Tab Inventory</h3>
      <span className="bg-slate-900 text-[10px] px-2 py-0.5 rounded text-emerald-400 font-mono font-bold">
        {sheetsSummary.length} Active Tabs
      </span>
    </div>
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      
      {/* COMPANIES DATA SUBGRID */}
      <DataTable 
        title="🏢 Companies" 
        colorClass="text-emerald-400" 
        data={companies} 
        emptyMessage="Table unseeded. Initialize schema to generate database layout."
        renderRow={(c) => (
          <div key={c.ID} className="flex justify-between items-center bg-slate-800/80 p-1.5 rounded text-[11px] border border-slate-700/40 hover:border-slate-600 transition">
            <span className="truncate max-w-[120px] font-medium text-slate-200">{c["Company Name"]}</span>
            <button onClick={() => onCascadeDeleteCompany(c.ID)} className="text-red-400 hover:text-red-500 font-bold px-1 text-xs transition">🗑️</button>
          </div>
        )}
      />

      {/* EMPLOYEES DATA SUBGRID */}
      <DataTable 
        title="👥 Employees" 
        colorClass="text-blue-400" 
        data={employees} 
        emptyMessage="Table unseeded. Execute forms or seed batch payloads."
        renderRow={(e) => (
          <div key={e.ID} className="bg-slate-800/80 p-1.5 rounded text-[11px] flex flex-col gap-0.5 border border-slate-700/40">
            <div className="flex justify-between font-medium">
              <span className="text-slate-200">{e["Staff Name"]}</span>
              <span className="text-[9px] text-slate-500 font-mono">ID: {String(e.ID).slice(0,6)}...</span>
            </div>
            <span className="text-[10px] text-slate-400 truncate">{e["Contact Email"]}</span>
          </div>
        )}
      />

    </div>
  </div>
);
