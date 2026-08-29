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
import { AustralianState, BusinessType, WebsiteStatus } from '../../types';
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
    <div className="px-6 md:px-7 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Page Header Section */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Medical Leads CRM Directory
          </h1>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            {filteredLeads.length} of {leads.length} Leads
          </span>
        </div>
        <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
          Search, qualify, manage website audits, and discover decision makers across Australia.
        </p>

        {/* View Mode Switcher and Page Action Controls */}
        <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
          {/* Table / Kanban Toggle */}
          <div className="bg-[#F1F5F9] p-0.5 rounded-lg flex items-center border border-[#E2E8F0]">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Filter Drawer Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
                activeFilterCount > 0
                  ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                  : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Add Lead Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
          <span className="font-semibold text-[#64748B]">Active Filters:</span>

          {filters.states.map((st: AustralianState) => (
            <span key={st} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] font-medium text-[11px]">
              State: {st}
              <X className="w-3 h-3 cursor-pointer hover:text-[#0F172A]" onClick={() => setFilters(prev => ({ ...prev, states: prev.states.filter(s => s !== st) }))} />
            </span>
          ))}

          {filters.businessTypes.map((bt: BusinessType) => (
            <span key={bt} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] font-medium text-[11px]">
              Type: {bt}
              <X className="w-3 h-3 cursor-pointer hover:text-[#0F172A]" onClick={() => setFilters(prev => ({ ...prev, businessTypes: prev.businessTypes.filter(t => t !== bt) }))} />
            </span>
          ))}

          {filters.websiteStatuses.map((ws: WebsiteStatus) => (
            <span key={ws} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] font-medium text-[11px]">
              Website: {ws}
              <X className="w-3 h-3 cursor-pointer hover:text-[#0F172A]" onClick={() => setFilters(prev => ({ ...prev, websiteStatuses: prev.websiteStatuses.filter(w => w !== ws) }))} />
            </span>
          ))}

          {filters.scoreRange && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-medium text-[11px]">
              Score: {filters.scoreRange[0]}–{filters.scoreRange[1]}
              <X className="w-3 h-3 cursor-pointer hover:text-[#0F172A]" onClick={() => setFilters(prev => ({ ...prev, scoreRange: undefined }))} />
            </span>
          )}

          {filters.decisionMakerFound !== undefined && filters.decisionMakerFound !== null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] font-medium text-[11px]">
              DM: {filters.decisionMakerFound ? 'Found' : 'Not Found'}
              <X className="w-3 h-3 cursor-pointer hover:text-[#0F172A]" onClick={() => setFilters(prev => ({ ...prev, decisionMakerFound: undefined }))} />
            </span>
          )}

          <button
            onClick={resetFilters}
            className="text-[11px] font-semibold text-[#B91C1C] hover:underline ml-auto"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Main View Area (Table or Kanban) */}
      {viewMode === 'table' ? <LeadTable /> : <LeadKanbanBoard />}

      {/* Slide-out Filters Drawer */}
      <LeadFiltersDrawer />

      {/* Bulk Action Bar */}
      <BulkActionBar />

    </div>
  );
}
