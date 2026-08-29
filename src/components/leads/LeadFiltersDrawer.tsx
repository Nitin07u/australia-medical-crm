import React from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { AustralianState, BusinessType, OwnershipType, WebsiteStatus, GoogleMapsStatus, LeadStatus } from '../../types';

export function LeadFiltersDrawer() {
  const { isFilterDrawerOpen, setIsFilterDrawerOpen, filters, setFilters, resetFilters, tags } = useLeads();

  if (!isFilterDrawerOpen) return null;

  const businessTypes: BusinessType[] = ['Hospital', 'Clinic', 'Medical Centre', 'Medical Equipment', 'Medical Device', 'Rehabilitation', 'Other'];
  const ownershipTypes: OwnershipType[] = ['Public', 'Private', 'Independent', 'Unknown'];
  const states: AustralianState[] = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
  const websiteStatuses: WebsiteStatus[] = ['No Website', 'Good Website', 'Needs Improvement', 'Severely Outdated', 'Unknown'];
  const mapsStatuses: GoogleMapsStatus[] = ['Verified', 'Not Found', 'Pending'];
  const leadStatuses: LeadStatus[] = ['New', 'Researching', 'Qualified', 'Ready for Outreach', 'Contacted', 'Interested', 'Meeting', 'Proposal', 'Won', 'Lost', 'Disqualified'];

  const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Filter Leads</h3>
              <p className="text-xs text-slate-400">Refine CRM database by multi-facet attributes</p>
            </div>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Filter Options */}
          <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] text-xs">
            
            {/* 1. Australian State */}
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Australian State / Territory</label>
              <div className="grid grid-cols-4 gap-1.5">
                {states.map(st => {
                  const isSelected = filters.states.includes(st);
                  return (
                    <button
                      key={st}
                      onClick={() => setFilters(prev => ({ ...prev, states: toggleArrayItem(prev.states, st) }))}
                      className={`py-1.5 px-2 rounded-lg font-bold text-xs border transition-all text-center ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Business Type */}
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Business Type</label>
              <div className="flex flex-wrap gap-1.5">
                {businessTypes.map(bt => {
                  const isSelected = filters.businessTypes.includes(bt);
                  return (
                    <button
                      key={bt}
                      onClick={() => setFilters(prev => ({ ...prev, businessTypes: toggleArrayItem(prev.businessTypes, bt) }))}
                      className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {bt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Website Status */}
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Website Status (Opportunity)</label>
              <div className="space-y-1.5">
                {websiteStatuses.map(ws => {
                  const isSelected = filters.websiteStatuses.includes(ws);
                  return (
                    <button
                      key={ws}
                      onClick={() => setFilters(prev => ({ ...prev, websiteStatuses: toggleArrayItem(prev.websiteStatuses, ws) }))}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-400 dark:border-blue-700 font-semibold' 
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{ws}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Lead Score */}
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Lead Score Range</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'All Scores', range: undefined },
                  { label: 'High (8-10)', range: [8, 10] as [number, number] },
                  { label: 'Medium (6-7)', range: [6, 7] as [number, number] },
                  { label: 'Low (1-5)', range: [1, 5] as [number, number] }
                ].map((item, idx) => {
                  const isSelected = JSON.stringify(filters.scoreRange) === JSON.stringify(item.range);
                  return (
                    <button
                      key={idx}
                      onClick={() => setFilters(prev => ({ ...prev, scoreRange: item.range }))}
                      className={`p-2 rounded-lg border text-center font-medium transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Decision Maker Filter */}
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Decision Maker Identified</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Any', val: null },
                  { label: 'Found (1+)', val: true },
                  { label: 'Not Found', val: false }
                ].map((item, idx) => {
                  const isSelected = filters.decisionMakerFound === item.val;
                  return (
                    <button
                      key={idx}
                      onClick={() => setFilters(prev => ({ ...prev, decisionMakerFound: item.val }))}
                      className={`p-2 rounded-lg border text-center font-medium transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Lead Pipeline Status */}
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Pipeline Status</label>
              <div className="flex flex-wrap gap-1.5">
                {leadStatuses.map(ls => {
                  const isSelected = filters.leadStatuses.includes(ls);
                  return (
                    <button
                      key={ls}
                      onClick={() => setFilters(prev => ({ ...prev, leadStatuses: toggleArrayItem(prev.leadStatuses, ls) }))}
                      className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {ls}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Tags Filter */}
            {tags.length > 0 && (
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => {
                    const isSelected = filters.tagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => setFilters(prev => ({ ...prev, tagIds: toggleArrayItem(prev.tagIds, tag.id) }))}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        #{tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Footer Reset & Apply */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-3">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset All
            </button>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="flex-1 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all text-center"
            >
              Apply Filters
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
