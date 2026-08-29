import React, { useState } from 'react';
import { 
  CheckSquare, 
  X, 
  Trash2, 
  Download, 
  Tag as TagIcon, 
  Star, 
  Building2, 
  Globe, 
  Activity, 
  ChevronDown 
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { LeadStatus, BusinessType, WebsiteStatus } from '../../types';
import { exportLeadsToCsv } from '../../services/csvService';
import { useToast } from '../../context/ToastContext';

export function BulkActionBar() {
  const { 
    selectedLeadIds, 
    clearSelection, 
    leads, 
    bulkUpdateStatus, 
    bulkUpdateBusinessType, 
    bulkUpdateWebsiteStatus, 
    bulkAssignScore,
    bulkAddTag,
    bulkDeleteLeads,
    tags 
  } = useLeads();

  const { showToast } = useToast();

  const [activeDropdown, setActiveDropdown] = useState<'status' | 'type' | 'website' | 'score' | 'tag' | null>(null);

  if (selectedLeadIds.length === 0) return null;

  const selectedLeadsList = leads.filter(l => selectedLeadIds.includes(l.business.id));

  const handleExportSelected = () => {
    const csv = exportLeadsToCsv(selectedLeadsList);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `selected_medical_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'Selected Leads Exported',
      message: `Exported ${selectedLeadIds.length} leads to CSV`
    });
  };

  const leadStatuses: LeadStatus[] = [
    'New', 'Researching', 'Qualified', 'Ready for Outreach', 'Contacted', 'Interested', 'Meeting', 'Proposal', 'Won', 'Lost', 'Disqualified'
  ];

  const businessTypes: BusinessType[] = [
    'Hospital', 'Clinic', 'Medical Centre', 'Medical Equipment', 'Medical Device', 'Rehabilitation', 'Other'
  ];

  const websiteStatuses: WebsiteStatus[] = [
    'No Website', 'Severely Outdated', 'Needs Improvement', 'Good Website', 'Unknown'
  ];

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 animate-in slide-in-from-bottom-5 duration-200 pointer-events-none">
      <div className="pointer-events-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 px-4 py-3 flex items-center gap-3 flex-wrap max-w-5xl backdrop-blur-xl">
        
        {/* Selection Count */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <span className="w-6 h-6 rounded-full bg-blue-600 font-bold text-xs flex items-center justify-center text-white">
            {selectedLeadIds.length}
          </span>
          <span className="text-xs font-semibold text-slate-200">Selected</span>
          <button
            onClick={clearSelection}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            title="Deselect all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          
          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Change Status</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'status' && (
              <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1.5 space-y-0.5 z-50">
                {leadStatuses.map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      bulkUpdateStatus(st);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Business Type Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Business Type</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'type' && (
              <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1.5 space-y-0.5 z-50">
                {businessTypes.map(bt => (
                  <button
                    key={bt}
                    onClick={() => {
                      bulkUpdateBusinessType(bt);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    {bt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Website Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'website' ? null : 'website')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-rose-400" />
              <span>Website Status</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'website' && (
              <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1.5 space-y-0.5 z-50">
                {websiteStatuses.map(ws => (
                  <button
                    key={ws}
                    onClick={() => {
                      bulkUpdateWebsiteStatus(ws);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    {ws}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lead Score Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'score' ? null : 'score')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-colors"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Assign Score</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'score' && (
              <div className="absolute bottom-full mb-2 left-0 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1.5 grid grid-cols-5 gap-1 z-50">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(sc => (
                  <button
                    key={sc}
                    onClick={() => {
                      bulkAssignScore(sc);
                      setActiveDropdown(null);
                    }}
                    className="py-1.5 rounded bg-slate-800 hover:bg-blue-600 text-white font-bold text-xs text-center"
                  >
                    {sc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Tag Dropdown */}
          {tags.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'tag' ? null : 'tag')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-colors"
              >
                <TagIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Tag</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {activeDropdown === 'tag' && (
                <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1.5 space-y-0.5 z-50">
                  {tags.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        bulkAddTag(t);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-xs"
                    >
                      #{t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Export Selected */}
          <button
            onClick={handleExportSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          {/* Bulk Delete */}
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${selectedLeadIds.length} selected leads?`)) {
                bulkDeleteLeads();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 border border-rose-700/60 text-rose-200 font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Delete</span>
          </button>

        </div>

      </div>
    </div>
  );
}
