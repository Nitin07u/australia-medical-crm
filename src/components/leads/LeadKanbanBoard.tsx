import React from 'react';
import { 
  Building2, 
  MapPin, 
  Globe, 
  UserCheck, 
  ChevronRight, 
  ChevronLeft
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { LeadStatus, LeadFull } from '../../types';
import { getLeadScoreBadge, getWebsiteStatusBadge } from '../../services/auditCalculator';

const PIPELINE_COLUMNS: { id: LeadStatus; label: string }[] = [
  { id: 'New', label: 'New' },
  { id: 'Researching', label: 'Researching' },
  { id: 'Qualified', label: 'Qualified' },
  { id: 'Ready for Outreach', label: 'Ready for Outreach' },
  { id: 'Contacted', label: 'Contacted' },
  { id: 'Interested', label: 'Interested' },
  { id: 'Meeting', label: 'Meeting' },
  { id: 'Proposal', label: 'Proposal' },
  { id: 'Won', label: 'Won' },
  { id: 'Lost', label: 'Lost' }
];

export function LeadKanbanBoard() {
  const { filteredLeads, updateLead, openLeadDetail } = useLeads();

  const handleMoveStatus = (lead: LeadFull, newStatus: LeadStatus) => {
    updateLead(lead.business.id, {
      lead: { ...lead.lead, lead_status: newStatus },
      activities: [
        {
          id: `act-${Date.now()}`,
          business_id: lead.business.id,
          activity_type: 'status_changed',
          description: `Pipeline stage moved to "${newStatus}"`,
          user_name: 'You',
          created_at: new Date().toISOString()
        },
        ...lead.activities
      ]
    });
  };

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-3 min-w-[2600px] items-start">
        {PIPELINE_COLUMNS.map((col, colIdx) => {
          const colLeads = filteredLeads.filter(l => l.lead.lead_status === col.id);

          return (
            <div
              key={col.id}
              className="w-64 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] flex flex-col max-h-[calc(100vh-210px)] overflow-hidden shrink-0"
            >
              {/* Column Header */}
              <div className="p-3 bg-white border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-[#0F172A] tracking-tight">
                    {col.label}
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-[#F1F5F9] font-bold text-[10px] text-[#475569] flex items-center justify-center">
                    {colLeads.length}
                  </span>
                </div>
              </div>

              {/* Column Cards Container */}
              <div className="p-2 space-y-2 overflow-y-auto flex-1">
                {colLeads.length > 0 ? (
                  colLeads.map((lead) => {
                    const b = lead.business;
                    const dp = lead.digital_presence;
                    const dm = lead.decision_makers.find(d => d.priority === 'Primary') || lead.decision_makers[0];
                    const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);
                    const webBadge = getWebsiteStatusBadge(dp.website_status);

                    return (
                      <div
                        key={b.id}
                        className="bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all text-xs group"
                      >
                        {/* Top Score and Type */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-black text-[11px] ${scoreBadge.textColor}`}>
                              {lead.lead.lead_score}/10
                            </span>
                            <div className="w-8 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                              <div
                                style={{ width: `${lead.lead.lead_score * 10}%` }}
                                className={`h-full ${scoreBadge.barColor} rounded-full`}
                              />
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-[#64748B]">
                            {b.state}
                          </span>
                        </div>

                        {/* Business Name */}
                        <h4
                          onClick={() => openLeadDetail(b.id)}
                          className="font-bold text-xs text-[#0F172A] group-hover:text-[#2563EB] cursor-pointer line-clamp-1 mb-1 transition-colors"
                        >
                          {b.business_name}
                        </h4>

                        {/* Category & City */}
                        <div className="flex items-center gap-1 text-[11px] text-[#64748B] mb-2 truncate">
                          <span>{b.business_type}</span>
                          <span>•</span>
                          <span className="truncate">{b.city}</span>
                        </div>

                        {/* Website Status Pill */}
                        <div className="mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${webBadge.badgeClass}`}>
                            <span className={`w-1 h-1 rounded-full ${webBadge.dotColor}`} />
                            <span className="truncate">{dp.website_status}</span>
                          </span>
                        </div>

                        {/* Primary Decision Maker */}
                        {dm && (
                          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10px] text-[#64748B]">
                            <span className="truncate font-medium text-[#0F172A]">{dm.full_name}</span>
                            <span className="truncate text-[#94A3B8]">{dm.position}</span>
                          </div>
                        )}

                        {/* Move Stage Controls */}
                        <div className="pt-2 mt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10px]">
                          <button
                            disabled={colIdx === 0}
                            onClick={() => handleMoveStatus(lead, PIPELINE_COLUMNS[colIdx - 1].id)}
                            className="p-1 rounded hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move back"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openLeadDetail(b.id)}
                            className="text-[#2563EB] font-semibold hover:underline"
                          >
                            View Dossier
                          </button>

                          <button
                            disabled={colIdx === PIPELINE_COLUMNS.length - 1}
                            onClick={() => handleMoveStatus(lead, PIPELINE_COLUMNS[colIdx + 1].id)}
                            className="p-1 rounded hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move forward"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-[11px] text-[#94A3B8]">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
