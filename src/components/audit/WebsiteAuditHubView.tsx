import React, { useState } from 'react';
import { 
  Gauge, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Smartphone, 
  Zap, 
  Search, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { getOpportunityLevel, getLeadScoreBadge } from '../../services/auditCalculator';

export function WebsiteAuditHubView() {
  const { leads, openLeadDetail } = useLeads();
  const [filterType, setFilterType] = useState<'all' | 'high_opp' | 'no_site' | 'outdated'>('all');
  const [search, setSearch] = useState('');

  // Sorted by highest opportunity score first
  const sortedLeads = [...leads].sort((a, b) => {
    const oppA = a.website_audit?.opportunity_score ?? 50;
    const oppB = b.website_audit?.opportunity_score ?? 50;
    return oppB - oppA;
  });

  const filtered = sortedLeads.filter(l => {
    const oppScore = l.website_audit?.opportunity_score ?? 50;
    const status = l.digital_presence.website_status;
    const matchesSearch = l.business.business_name.toLowerCase().includes(search.toLowerCase()) ||
                          l.business.city.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'high_opp') return oppScore >= 80;
    if (filterType === 'no_site') return status === 'No Website';
    if (filterType === 'outdated') return status === 'Severely Outdated' || status === 'Needs Improvement';
    return true;
  });

  const highOppCount = leads.filter(l => (l.website_audit?.opportunity_score ?? 50) >= 80).length;
  const noSiteCount = leads.filter(l => l.digital_presence.website_status === 'No Website').length;
  const completedAuditsCount = leads.filter(l => Boolean(l.website_audit)).length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 rounded-3xl text-white border border-slate-800 shadow-card flex items-center justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
              Agency Digital Audit Matrix
            </span>
            <span className="text-xs text-slate-300">• {completedAuditsCount} Evaluated</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Website Opportunity Intelligence Hub
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
            Prioritize outreach based on quantified digital vulnerabilities: missing websites, mobile UX failures, legacy un-responsive platforms, and lack of patient conversion funnels.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-400 font-bold block">Prime Targets</span>
            <span className="text-xl font-black text-rose-400">{highOppCount}</span>
          </div>
          <div className="text-center px-2 border-l border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">No Website</span>
            <span className="text-xl font-black text-red-400">{noSiteCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle text-xs font-semibold">
          {[
            { id: 'all', label: `All Leads (${leads.length})` },
            { id: 'high_opp', label: `Highest Opportunity 80%+ (${highOppCount})` },
            { id: 'no_site', label: `No Website (${noSiteCount})` },
            { id: 'outdated', label: `Outdated / Needs Work` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search facility name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-subtle focus:outline-none focus:border-blue-500"
          />
        </div>

      </div>

      {/* Ranked Audit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(lead => {
          const b = lead.business;
          const dp = lead.digital_presence;
          const wa = lead.website_audit;
          const opp = getOpportunityLevel(wa?.opportunity_score ?? 50);
          const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);

          return (
            <div
              key={b.id}
              onClick={() => openLeadDetail(b.id)}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle hover:shadow-card hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer transition-all flex flex-col justify-between text-xs group"
            >
              <div>
                {/* Header opportunity meter */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${opp.bgClass}`} />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {wa?.opportunity_score ?? 50}% Opportunity
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${opp.badgeClass}`}>
                    {dp.website_status}
                  </span>
                </div>

                {/* Business Name */}
                <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {b.business_name}
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {b.business_type} • {b.city}, {b.state}
                </p>

                {/* Subscores mini grid */}
                <div className="grid grid-cols-2 gap-2 my-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mobile UX</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {wa?.mobile_ux_score ?? 0}/10
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Visual Design</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {wa?.visual_design_score ?? 0}/10
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Speed / CWV</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {wa?.loading_speed_score ?? 0}/10
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lead Score</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      ★ {lead.lead.lead_score}/10
                    </span>
                  </div>
                </div>

                {/* What we noticed teaser */}
                {wa?.what_i_noticed && (
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 italic">
                    "{wa.what_i_noticed}"
                  </p>
                )}
              </div>

              {/* Footer action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-slate-500">
                <span className="text-[11px]">{lead.decision_makers.length} Decision Maker(s)</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:underline inline-flex items-center gap-1">
                  Open Audit <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
