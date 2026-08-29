import React, { useState } from 'react';
import { 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Smartphone, 
  Search, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { getOpportunityLevel, getLeadScoreBadge, getWebsiteStatusBadge } from '../../services/auditCalculator';

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
  const outdatedCount = leads.filter(l => l.digital_presence.website_status === 'Severely Outdated' || l.digital_presence.website_status === 'Needs Improvement').length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full">
              Audit Intelligence
            </span>
            <span className="text-xs text-[#64748B]">• {leads.length} Medical Facilities Scored</span>
          </div>
          <h1 className="text-lg font-bold text-[#0F172A] mt-1 tracking-tight">
            Website Opportunity Intelligence Hub
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
            Prioritize outreach based on quantified digital vulnerabilities: missing websites, mobile UX failures, legacy un-responsive platforms, and lack of patient conversion funnels.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] shrink-0 text-xs">
          <div className="text-center px-2">
            <span className="text-[10px] text-[#64748B] font-bold block">Prime Targets (80%+)</span>
            <span className="text-lg font-black text-[#B91C1C]">{highOppCount}</span>
          </div>
          <div className="text-center px-2 border-l border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] font-bold block">No Website</span>
            <span className="text-lg font-black text-[#B91C1C]">{noSiteCount}</span>
          </div>
          <div className="text-center px-2 border-l border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] font-bold block">Needs Redesign</span>
            <span className="text-lg font-black text-[#B45309]">{outdatedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: `All Facilities (${leads.length})` },
            { id: 'high_opp', label: `High Opportunity 80%+ (${highOppCount})` },
            { id: 'no_site', label: `No Website (${noSiteCount})` },
            { id: 'outdated', label: `Outdated / Needs Work (${outdatedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === tab.id
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px] max-w-sm flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter audit list..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

      </div>

      {/* Audit Matrix Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(lead => {
          const b = lead.business;
          const dp = lead.digital_presence;
          const wa = lead.website_audit;
          const opp = getOpportunityLevel(wa?.opportunity_score ?? 50);
          const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);
          const webBadge = getWebsiteStatusBadge(dp.website_status);

          const mobileUx = wa?.mobile_ux_score ?? (dp.website_status === 'No Website' ? 0 : 4);
          const visualDesign = wa?.visual_design_score ?? (dp.website_status === 'No Website' ? 0 : 5);
          const websiteUx = wa?.navigation_score ?? (dp.website_status === 'No Website' ? 0 : 5);
          const conversion = (wa?.cta_score ?? (dp.website_status === 'No Website' ? 0 : 4));

          return (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all p-4 flex flex-col justify-between group"
            >
              <div>
                
                {/* Header: Opportunity Tier & Lead Score */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${opp.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${opp.bgClass}`} />
                    {opp.label} ({wa?.opportunity_score ?? 50}%)
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                    {b.state}
                  </span>
                </div>

                {/* Business Name */}
                <h3 
                  onClick={() => openLeadDetail(b.id)}
                  className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] cursor-pointer transition-colors line-clamp-1 mb-1"
                >
                  {b.business_name}
                </h3>

                <p className="text-[11px] text-[#64748B] mb-3">
                  {b.business_type} • {b.city}
                </p>

                {/* Section 16: Analytical Score Progress Bars */}
                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] space-y-2 mb-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#64748B]">Website UX</span>
                      <span className="font-bold text-[#0F172A]">{websiteUx}/10</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#2563EB] h-1.5 rounded-full" style={{ width: `${websiteUx * 10}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#64748B]">Mobile UX</span>
                      <span className="font-bold text-[#0F172A]">{mobileUx}/10</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#D97706] h-1.5 rounded-full" style={{ width: `${mobileUx * 10}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#64748B]">Visual Design</span>
                      <span className="font-bold text-[#0F172A]">{visualDesign}/10</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#64748B] h-1.5 rounded-full" style={{ width: `${visualDesign * 10}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#64748B]">Conversion Funnel</span>
                      <span className="font-bold text-[#0F172A]">{conversion}/10</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#B91C1C] h-1.5 rounded-full" style={{ width: `${conversion * 10}%` }} />
                    </div>
                  </div>
                </div>

                {/* Section 17: Prominent Opportunity Panel */}
                <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs space-y-1 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309]">Recommended Service</span>
                    <span className="text-[10px] font-bold text-[#B45309]">High Value</span>
                  </div>
                  <p className="font-bold text-xs text-[#0F172A]">
                    {dp.website_status === 'No Website' ? 'Full Website Build & Booking Engine' : 'Website Redesign + Mobile UI/UX Optimization'}
                  </p>
                  <p className="text-[11px] text-[#475569]">
                    {wa?.what_i_noticed 
                      ? wa.what_i_noticed.slice(0, 90) + '...'
                      : (dp.website_status === 'No Website' 
                          ? 'Zero website footprint detected. Practice relies only on directory citations.' 
                          : 'Poor mobile responsiveness, outdated branding, and missing online booking CTA.')}
                  </p>
                </div>

              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${webBadge.badgeClass}`}>
                    <span className={`w-1 h-1 rounded-full ${webBadge.dotColor}`} />
                    <span>{dp.website_status}</span>
                  </span>
                </div>

                <button
                  onClick={() => openLeadDetail(b.id)}
                  className="font-bold text-xs text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  Audit Dossier <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
