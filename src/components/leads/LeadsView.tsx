import React, { useState } from 'react';
import { 
  Table, 
  Kanban, 
  Filter, 
  Plus, 
  X, 
  Download, 
  UploadCloud, 
  Sparkles,
  Search
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { LeadTable } from './LeadTable';
import { LeadKanbanBoard } from './LeadKanbanBoard';
import { LeadFiltersDrawer } from './LeadFiltersDrawer';
import { BulkActionBar } from './BulkActionBar';

export function LeadsView() {
  const { 
    filteredLeads, 
    leads, 
    filters, 
    setFilters, 
    resetFilters, 
    activeFilterCount,
    setIsAddModalOpen,
    setIsFilterDrawerOpen,
    setCurrentRoute
  } = useLeads();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      
      {/* Header bar with View Mode Switcher and Quick Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Medical Leads CRM Directory
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
              {filteredLeads.length} of {leads.length} Leads
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, qualify, manage website audits, and discover decision makers across Australia.
          </p>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center gap-2.5">
          {/* Table / Kanban Toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline Board</span>
            </button>
          </div>

          {/* Filter Drawer Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeFilterCount > 0
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Add Lead Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-slate-400 font-medium text-[11px]">Active Filters:</span>
          
          {filters.states.map(st => (
            <span key={st} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold">
              State: {st}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-blue-900" 
                onClick={() => setFilters(prev => ({ ...prev, states: prev.states.filter(s => s !== st) }))} 
              />
            </span>
          ))}

          {filters.businessTypes.map(bt => (
            <span key={bt} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold">
              Type: {bt}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-indigo-900" 
                onClick={() => setFilters(prev => ({ ...prev, businessTypes: prev.businessTypes.filter(t => t !== bt) }))} 
              />
            </span>
          ))}

          {filters.websiteStatuses.map(ws => (
            <span key={ws} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold">
              Website: {ws}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-rose-900" 
                onClick={() => setFilters(prev => ({ ...prev, websiteStatuses: prev.websiteStatuses.filter(s => s !== ws) }))} 
              />
            </span>
          ))}

          {filters.leadStatuses.map(ls => (
            <span key={ls} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
              Status: {ls}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-emerald-900" 
                onClick={() => setFilters(prev => ({ ...prev, leadStatuses: prev.leadStatuses.filter(s => s !== ls) }))} 
              />
            </span>
          ))}

          {filters.scoreRange && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold">
              Score: {filters.scoreRange[0]}-{filters.scoreRange[1]}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-purple-900" 
                onClick={() => setFilters(prev => ({ ...prev, scoreRange: undefined }))} 
              />
            </span>
          )}

          {filters.decisionMakerFound !== null && filters.decisionMakerFound !== undefined && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-[11px] font-semibold">
              DM: {filters.decisionMakerFound ? 'Found' : 'Not Found'}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-cyan-900" 
                onClick={() => setFilters(prev => ({ ...prev, decisionMakerFound: null }))} 
              />
            </span>
          )}

          <button
            onClick={resetFilters}
            className="text-[11px] text-blue-600 hover:underline font-bold ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Render Table or Kanban View */}
      {viewMode === 'table' ? <LeadTable /> : <LeadKanbanBoard />}

      {/* Filter Drawer Modal */}
      <LeadFiltersDrawer />

      {/* Floating Bulk Actions Bar */}
      <BulkActionBar />

    </div>
  );
}
