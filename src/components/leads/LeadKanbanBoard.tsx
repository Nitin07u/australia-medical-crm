import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Globe, 
  UserCheck, 
  ChevronRight, 
  ChevronLeft,
  Edit3
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { LeadStatus, LeadFull } from '../../types';
import { getLeadScoreBadge, getWebsiteStatusBadge } from '../../services/auditCalculator';
import { EditHospitalModal } from '../modals/EditHospitalModal';

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
  const [editingHospital, setEditingHospital] = useState<LeadFull | null>(null);

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
    <div className="overflow-x-auto pb-4">
      <div className="flex items-start gap-3 min-w-[1700px]">
        {PIPELINE_COLUMNS.map((col, colIdx) => {
          const leadsInColumn = filteredLeads.filter(l => l.lead.lead_status === col.id);

          return (
            <div
              key={col.id}
              className="w-72 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] p-3 flex flex-col shrink-0"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-bold text-xs text-[#0F172A]">{col.label}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#64748B] border border-[#E2E8F0]">
                  {leadsInColumn.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-0.5">
                {leadsInColumn.length > 0 ? (
                  leadsInColumn.map((lead) => {
                    const b = lead.business;
                    const dp = lead.digital_presence;
                    const dm = lead.decision_makers.find(d => d.priority === 'Primary') || lead.decision_makers[0];
                    const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);
                    const webBadge = getWebsiteStatusBadge(dp.website_status);

                    return (
                      <div
                        key={b.id}
                        className="bg-white rounded-lg p-3 border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all space-y-2 group"
                      >
                        {/* Top: Score & Edit Button */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-black text-xs ${scoreBadge.textColor}`}>
                              {lead.lead.lead_score}/10
                            </span>
                            <div className="w-8 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                              <div
                                style={{ width: `${lead.lead.lead_score * 10}%` }}
                                className={`h-full ${scoreBadge.barColor} rounded-full`}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingHospital(lead)}
                              className="p-1 rounded text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                              title="Edit facility profile"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
                              {b.state}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h4
                          onClick={() => openLeadDetail(b.id)}
                          className="font-bold text-xs text-[#0F172A] group-hover:text-[#2563EB] cursor-pointer line-clamp-1"
                        >
                          {b.business_name}
                        </h4>

                        {/* Location */}
                        <p className="text-[11px] text-[#64748B] flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" />
                          <span>{b.city}</span>
                          <span className="text-[#94A3B8]">• {b.business_type}</span>
                        </p>

                        {/* Website Status Badge */}
                        <div className="pt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${webBadge.badgeClass}`}>
                            <span className={`w-1 h-1 rounded-full ${webBadge.dotColor}`} />
                            <span>{dp.website_status}</span>
                          </span>
                        </div>

                        {/* Decision Maker if any */}
                        {dm && (
                          <div className="text-[10px] text-[#475569] bg-[#F8FAFC] p-1.5 rounded border border-[#E2E8F0] flex items-center gap-1.5 truncate">
                            <UserCheck className="w-3 h-3 text-[#2563EB] shrink-0" />
                            <span className="font-semibold truncate">{dm.full_name}</span>
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

      {/* Edit Hospital Modal */}
      <EditHospitalModal
        isOpen={Boolean(editingHospital)}
        onClose={() => setEditingHospital(null)}
        lead={editingHospital}
      />
    </div>
  );
}
