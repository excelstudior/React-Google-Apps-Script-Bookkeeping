/** @jsxImportSource react */
import { FC } from 'react';
import type { TableProps, LoggerConsoleProps } from "./types";

/**
 * COMPONENT: Reusable Data Grid View for spreadsheet data tables
 */
export const DataTable: FC<TableProps> = ({ title, colorClass, data, emptyMessage, renderRow }) => (
  <div className="bg-slate-900 rounded p-2.5 space-y-1.5 border border-slate-800">
    <h4 className={`font-bold ${colorClass} mb-2`}>{title} ({data.length})</h4>
    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
      {data.length === 0 ? (
        <p className="text-slate-500 italic text-[11px] p-1">{emptyMessage}</p>
      ) : (
        data.map(renderRow)
      )}
    </div>
  </div>
);

/**
 * COMPONENT: Live Terminal Monitoring Console Log View
 */
export const LoggerConsole: FC<LoggerConsoleProps> = ({ logs, onClear }) => (
  <div className="bg-black p-4 rounded-xl border border-slate-800 shadow-2xl font-mono text-xs">
    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">
      <span>🖥️ Live Transaction Logger Output Console</span>
      <button onClick={onClear} className="hover:text-slate-300 transition">Clear</button>
    </div>
    <div className="h-32 overflow-y-auto space-y-1 select-text scrollbar-thin scrollbar-thumb-slate-800 pr-2 flex flex-col-reverse">
      {logs.map((log, idx) => {
        const isError = log.includes('❌') || log.includes('🚨');
        const isSuccess = log.includes('✅');
        return (
          <div key={idx} className={`leading-relaxed whitespace-pre-wrap ${isError ? 'text-red-400' : isSuccess ? 'text-emerald-400' : 'text-slate-300'}`}>
            {log}
          </div>
        );
      })}
    </div>
  </div>
);
