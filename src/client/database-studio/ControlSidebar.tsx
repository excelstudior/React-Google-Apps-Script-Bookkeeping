import { FC } from 'react';
import type { SidebarProps } from "./types";

export const ControlSidebar: FC<SidebarProps> = ({
  isLoading, formName, formEmail, formCompanyId, companies,
  setFormName, setFormEmail, setFormCompanyId,
  onInitializeSchema, onSingleInsert, onSeedBatch, onTestRollback
}) => (
  <div className="space-y-6 lg:col-span-1">
    {/* SCHEMA CARD */}
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
      <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">1. Blueprint Initialization</h2>
      <button onClick={onInitializeSchema} disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold py-2.5 px-4 text-xs rounded-lg shadow-md transition-all uppercase">
        Build Typed Layout Sheets Schema
      </button>
    </div>

    {/* FORM CARD */}
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
      <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">2. Live Constraint Form Gate</h2>
      <form onSubmit={onSingleInsert} className="space-y-3">
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Staff Name</label>
          <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Tony Stark" className="w-full bg-slate-900 text-sm px-3 py-2 rounded border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"/>
        </div>
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Contact Email (Regex Check)</label>
          <input type="text" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="e.g. tony@stark.com" className="w-full bg-slate-900 text-sm px-3 py-2 rounded border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"/>
        </div>
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Employer Company Key ID</label>
          <select value={formCompanyId} onChange={e => setFormCompanyId(e.target.value)} className="w-full bg-slate-900 text-sm px-3 py-2 rounded border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500">
            <option value="">-- Choose Assigned Company ID --</option>
            <option value="FAKE_ID_999">INVALID_KEY_Simulation (Triggers Block)</option>
            {companies.map(c => (
              <option key={c.ID} value={c.ID}>{c["Company Name"]} ({c.ID})</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold py-2 text-xs rounded uppercase transition">
          Execute Safe Row Insert
        </button>
      </form>
    </div>

    {/* TESTING ACTIONS CARD */}
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl space-y-3">
      <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">3. Stress Tests & Session Boundaries</h2>
      <div className="flex gap-2">
        <button onClick={() => onSeedBatch(false)} disabled={isLoading} className="flex-1 bg-slate-700 hover:bg-slate-600 text-[11px] font-bold py-2 rounded text-center uppercase">🚀 Batch (Pass)</button>
        <button onClick={() => onSeedBatch(true)} disabled={isLoading} className="flex-1 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800 text-[11px] font-bold py-2 rounded text-center text-amber-300 uppercase">💥 Batch (Fail)</button>
      </div>
      <button onClick={onTestRollback} disabled={isLoading} className="w-full bg-indigo-900 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 font-semibold py-2 px-4 text-xs rounded uppercase tracking-wider transition-all">
        🛡️ Multi-Sheet Transaction (Rollback)
      </button>
    </div>
  </div>
);
