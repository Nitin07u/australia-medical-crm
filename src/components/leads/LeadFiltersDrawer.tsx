import React from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { AustralianState, BusinessType, OwnershipType, WebsiteStatus, GoogleMapsStatus, LeadStatus } from '../../types';

export function LeadFiltersDrawer() {
  const { isFilterDrawerOpen, setIsFilterDrawerOpen, filters, setFilters, resetFilters, tags } = useLeads();

  if (!isFilterDrawerOpen) return null;

  const businessTypes: BusinessType[] = ['Hospital', 'Clinic', 'Medical Centre', 'Medical Equipment', 'Medical Device', 'Rehabilitation', 'Other'];
  const states: AustralianState[] = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
  const websiteStatuses: WebsiteStatus[] = ['No Website', 'Good Website', 'Needs Improvement', 'Severely Outdated', 'Unknown'];
  const leadStatuses: LeadStatus[] = ['New', 'Researching', 'Qualified', 'Ready for Outreach', 'Contacted', 'Interested', 'Meeting', 'Proposal', 'Won', 'Lost', 'Disqualified'];

  const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0B1220]/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-modal border-l border-[#E2E8F0] flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#0F172A]">Filter Leads</h3>
              <p className="text-xs text-[#64748B]">Refine CRM database by multi-facet attributes</p>
            </div>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Filter Options */}
          <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-130px)] text-xs">
            
            {/* 1. Australian State */}
            <div>
              <label className="font-bold text-[#0F172A] block mb-2">Australian State / Territory</label>
              <div className="grid grid-cols-4 gap-1.5">
                {states.map(st => {
                  const isSelected = filters.states.includes(st);
                  return (
                    <button
                      key={st}
                      onClick={() => setFilters(prev => ({ ...prev, states: toggleArrayItem(prev.states, st) }))}
                      className={`py-1.5 px-2 rounded-md font-bold text-xs border transition-all text-center ${
                        isSelected 
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs' 
                          : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
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
              <label className="font-bold text-[#0F172A] block mb-2">Business Type</label>
              <div className="flex flex-wrap gap-1.5">
                {businessTypes.map(bt => {
                  const isSelected = filters.businessTypes.includes(bt);
                  return (
                    <button
                      key={bt}
                      onClick={() => setFilters(prev => ({ ...prev, businessTypes: toggleArrayItem(prev.businessTypes, bt) }))}
                      className={`px-2.5 py-1 rounded-md border font-medium transition-all ${
                        isSelected 
                          ? 'bg-[#2563EB] text-white border-[#2563EB]' 
                          : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
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
              <label className="font-bold text-[#0F172A] block mb-2">Website Status (Opportunity)</label>
              <div className="space-y-1.5">
                {websiteStatuses.map(ws => {
                  const isSelected = filters.websiteStatuses.includes(ws);
                  return (
                    <button
                      key={ws}
                      onClick={() => setFilters(prev => ({ ...prev, websiteStatuses: toggleArrayItem(prev.websiteStatuses, ws) }))}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                        isSelected 
                          ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] font-semibold' 
                          : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <span>{ws}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Lead Score Range */}
            <div>
              <label className="font-bold text-[#0F172A] block mb-2">Lead Score Range</label>
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
                      className={`p-2 rounded-md border text-center font-medium transition-all ${
                        isSelected 
                          ? 'bg-[#2563EB] text-white border-[#2563EB] font-bold' 
                          : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
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
              <label className="font-bold text-[#0F172A] block mb-2">Decision Maker Identified</label>
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
                      className={`p-2 rounded-md border text-center font-medium transition-all ${
                        isSelected 
                          ? 'bg-[#2563EB] text-white border-[#2563EB] font-bold' 
                          : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
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
              <label className="font-bold text-[#0F172A] block mb-2">Pipeline Status</label>
              <div className="flex flex-wrap gap-1.5">
                {leadStatuses.map(ls => {
                  const isSelected = filters.leadStatuses.includes(ls);
                  return (
                    <button
                      key={ls}
                      onClick={() => setFilters(prev => ({ ...prev, leadStatuses: toggleArrayItem(prev.leadStatuses, ls) }))}
                      className={`px-2.5 py-1 rounded-md border font-medium transition-all ${
                        isSelected 
                          ? 'bg-[#2563EB] text-white border-[#2563EB]' 
                          : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      {ls}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer Reset & Apply */}
          <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-3">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold text-[#475569] hover:bg-[#E2E8F0] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset All
            </button>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="flex-1 h-9 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-all text-center"
            >
              Apply Filters
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
