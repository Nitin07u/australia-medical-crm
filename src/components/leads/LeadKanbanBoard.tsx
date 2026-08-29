import React from 'react';
import { 
  Building2, 
  MapPin, 
  Globe, 
  UserCheck, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  MoreHorizontal, 
  ArrowUpRight 
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { LeadStatus, LeadFull } from '../../types';
import { getLeadScoreBadge, getOpportunityLevel } from '../../services/auditCalculator';

const PIPELINE_COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'New', label: 'New', color: 'border-t-slate-400' },
  { id: 'Researching', label: 'Researching', color: 'border-t-blue-400' },
  { id: 'Qualified', label: 'Qualified', color: 'border-t-cyan-400' },
  { id: 'Ready for Outreach', label: 'Ready for Outreach', color: 'border-t-purple-500' },
  { id: 'Contacted', label: 'Contacted', color: 'border-t-indigo-400' },
  { id: 'Interested', label: 'Interested', color: 'border-t-amber-400' },
  { id: 'Meeting', label: 'Meeting', color: 'border-t-orange-500' },
  { id: 'Proposal', label: 'Proposal', color: 'border-t-emerald-400' },
  { id: 'Won', label: 'Won', color: 'border-t-emerald-600' },
  { id: 'Lost', label: 'Lost', color: 'border-t-rose-500' }
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
      <div className="flex gap-4 min-w-[2400px] items-start">
        {PIPELINE_COLUMNS.map((col, colIdx) => {
          const colLeads = filteredLeads.filter(l => l.lead.lead_status === col.id);

          return (
            <div
              key={col.id}
              className="w-72 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[calc(100vh-210px)] overflow-hidden shadow-subtle shrink-0"
            >
              {/* Column Header */}
              <div className={`p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 border-t-4 ${col.color} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white tracking-tight truncate">
                    {col.label}
                  </h4>
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-center">
                    {colLeads.length}
                  </span>
                </div>
              </div>

              {/* Column Cards Container */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {colLeads.length > 0 ? (
                  colLeads.map((lead) => {
                    const b = lead.business;
                    const dp = lead.digital_presence;
                    const wa = lead.website_audit;
                    const dm = lead.decision_makers.find(d => d.priority === 'Primary') || lead.decision_makers[0];
                    const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);
                    const opp = getOpportunityLevel(wa?.opportunity_score ?? 50);

                    return (
                      <div
                        key={b.id}
                        className="bg-white dark:bg-slate-800/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-subtle hover:shadow-card hover:border-blue-300 dark:hover:border-blue-700 transition-all text-xs group"
                      >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${scoreBadge.badgeClass}`}>
                            ★ {lead.lead.lead_score}/10
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {b.business_type}
                          </span>
                        </div>

                        {/* Business Name */}
                        <h5
                          onClick={() => openLeadDetail(b.id)}
                          className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer transition-colors leading-snug line-clamp-2"
                        >
                          {b.business_name}
                        </h5>

                        {/* Location & Website */}
                        <div className="space-y-1 my-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {b.city}, <span className="font-bold text-slate-700 dark:text-slate-300">{b.state}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className={opp.label === 'High Opportunity' ? 'text-rose-500 font-semibold' : ''}>
                              {dp.website_status}
                            </span>
                          </p>
                          {dm && (
                            <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                              <UserCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{dm.full_name} ({dm.position})</span>
                            </p>
                          )}
                        </div>

                        {/* Move Stage Controls */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between mt-2">
                          <button
                            disabled={colIdx === 0}
                            onClick={() => handleMoveStatus(lead, PIPELINE_COLUMNS[colIdx - 1].id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors"
                            title="Move back"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openLeadDetail(b.id)}
                            className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                          >
                            View Profile <ArrowUpRight className="w-2.5 h-2.5" />
                          </button>

                          <button
                            disabled={colIdx === PIPELINE_COLUMNS.length - 1}
                            onClick={() => handleMoveStatus(lead, PIPELINE_COLUMNS[colIdx + 1].id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors"
                            title="Advance to next stage"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs">
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
