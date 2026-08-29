import React from 'react';
import { 
  Users, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  UserCheck, 
  TrendingUp, 
  Building2, 
  MapPin, 
  ArrowUpRight, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { getLeadScoreBadge, getWebsiteStatusBadge } from '../../services/auditCalculator';
import { AustralianState, BusinessType } from '../../types';

export function DashboardView() {
  const { leads, openLeadDetail, setCurrentRoute, setIsAddModalOpen, setFilters } = useLeads();

  // Metrics
  const totalLeads = leads.length;
  const noWebsiteCount = leads.filter(l => l.digital_presence.website_status === 'No Website').length;
  const needsRedesignCount = leads.filter(l => 
    l.digital_presence.website_status === 'Severely Outdated' || 
    l.digital_presence.website_status === 'Needs Improvement'
  ).length;
  const goodWebsiteCount = leads.filter(l => l.digital_presence.website_status === 'Good Website').length;
  const highPriorityCount = leads.filter(l => l.lead.lead_score >= 8).length;
  const dmFoundCount = leads.filter(l => l.decision_makers.length > 0).length;

  // Website Opportunity Distribution
  const oppDistribution = [
    { label: 'No Website', count: noWebsiteCount, color: '#B91C1C', bg: 'bg-[#B91C1C]', status: 'No Website' },
    { label: 'Severely Outdated', count: leads.filter(l => l.digital_presence.website_status === 'Severely Outdated').length, color: '#DC2626', bg: 'bg-[#DC2626]', status: 'Severely Outdated' },
    { label: 'Needs Improvement', count: leads.filter(l => l.digital_presence.website_status === 'Needs Improvement').length, color: '#D97706', bg: 'bg-[#D97706]', status: 'Needs Improvement' },
    { label: 'Good Website', count: goodWebsiteCount, color: '#059669', bg: 'bg-[#059669]', status: 'Good Website' },
    { label: 'Unknown', count: leads.filter(l => l.digital_presence.website_status === 'Unknown').length, color: '#94A3B8', bg: 'bg-[#94A3B8]', status: 'Unknown' }
  ];

  // Business Type Distribution
  const typeDistribution: { type: BusinessType; count: number; color: string }[] = ([
    { type: 'Hospital' as BusinessType, count: leads.filter(l => l.business.business_type === 'Hospital').length, color: '#2563EB' },
    { type: 'Clinic' as BusinessType, count: leads.filter(l => l.business.business_type === 'Clinic').length, color: '#3B82F6' },
    { type: 'Medical Centre' as BusinessType, count: leads.filter(l => l.business.business_type === 'Medical Centre').length, color: '#0284C7' },
    { type: 'Medical Equipment' as BusinessType, count: leads.filter(l => l.business.business_type === 'Medical Equipment').length, color: '#7C3AED' },
    { type: 'Medical Device' as BusinessType, count: leads.filter(l => l.business.business_type === 'Medical Device').length, color: '#9333EA' },
    { type: 'Rehabilitation' as BusinessType, count: leads.filter(l => l.business.business_type === 'Rehabilitation').length, color: '#DB2777' },
    { type: 'Other' as BusinessType, count: leads.filter(l => l.business.business_type === 'Other').length, color: '#64748B' }
  ] as { type: BusinessType; count: number; color: string }[]).filter(t => t.count > 0);

  // States Distribution
  const australianStates: AustralianState[] = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
  const stateCounts = australianStates.map(st => ({
    state: st,
    count: leads.filter(l => l.business.state === st).length
  }));
  const maxStateCount = Math.max(...stateCounts.map(s => s.count), 1);

  // High Priority Leads Table (Score >= 8)
  const highPriorityLeads = [...leads]
    .sort((a, b) => b.lead.lead_score - a.lead.lead_score)
    .slice(0, 7);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* 1. 6 SaaS KPI Cards (Section 7 & 8) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Total Leads */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Leads</span>
            <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-[#0F172A] tracking-tight">{totalLeads.toLocaleString()}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#047857] mt-0.5">
              <TrendingUp className="w-3 h-3" /> +12.4% MoM
            </span>
          </div>
        </div>

        {/* No Website */}
        <div 
          onClick={() => {
            setFilters(prev => ({ ...prev, websiteStatus: ['No Website'] }));
            setCurrentRoute('leads');
          }}
          className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">No Website</span>
            <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#B91C1C] flex items-center justify-center">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-[#B91C1C] tracking-tight">{noWebsiteCount.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-[#B91C1C] px-1.5 py-0.2 rounded bg-[#FEF2F2] border border-[#FECACA] inline-block mt-0.5">
              High Opportunity
            </span>
          </div>
        </div>

        {/* Needs Redesign */}
        <div 
          onClick={() => {
            setFilters(prev => ({ ...prev, websiteStatus: ['Severely Outdated', 'Needs Improvement'] }));
            setCurrentRoute('leads');
          }}
          className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Needs Work</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFFBEB] text-[#B45309] flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-[#B45309] tracking-tight">{needsRedesignCount.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-[#B45309] px-1.5 py-0.2 rounded bg-[#FFFBEB] border border-[#FDE68A] inline-block mt-0.5">
              Redesign Target
            </span>
          </div>
        </div>

        {/* Good Website */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Good Website</span>
            <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-[#047857] tracking-tight">{goodWebsiteCount.toLocaleString()}</p>
            <span className="text-[10px] font-medium text-[#64748B] inline-block mt-0.5">Low Opportunity</span>
          </div>
        </div>

        {/* High Priority (Score 8+) */}
        <div 
          onClick={() => {
            setFilters(prev => ({ ...prev, leadScoreRange: '8-10' }));
            setCurrentRoute('leads');
          }}
          className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Tier 1 Leads</span>
            <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-[#1D4ED8] tracking-tight">{highPriorityCount.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-[#1D4ED8] px-1.5 py-0.2 rounded bg-[#EFF6FF] border border-[#BFDBFE] inline-block mt-0.5">
              Score 8–10
            </span>
          </div>
        </div>

        {/* Decision Makers Found */}
        <div 
          onClick={() => setCurrentRoute('decision-makers')}
          className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Executives</span>
            <div className="w-7 h-7 rounded-lg bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-[#0D9488] tracking-tight">{dmFoundCount.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-[#0D9488] px-1.5 py-0.2 rounded bg-[#F0FDFA] border border-[#CCFBF1] inline-block mt-0.5">
              Verified Contacts
            </span>
          </div>
        </div>

      </div>

      {/* 2. Charts Row (Website Opportunity Distribution & Facility Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Website Opportunity Distribution Segmented Bar */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] tracking-tight">Website Opportunity Distribution</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Breakdown of digital presence and redesign potential across {totalLeads} medical facilities</p>
            </div>
            <button
              onClick={() => setCurrentRoute('website-audit')}
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1"
            >
              Open Audit Hub <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full h-3 rounded-full bg-[#F1F5F9] overflow-hidden flex shadow-inner">
            {oppDistribution.map(item => {
              const pct = totalLeads > 0 ? (item.count / totalLeads) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={item.label}
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                  className="h-full transition-all duration-300"
                  title={`${item.label}: ${item.count} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Clean Legend Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
            {oppDistribution.map(item => {
              const pct = totalLeads > 0 ? ((item.count / totalLeads) * 100).toFixed(1) : '0';
              return (
                <div
                  key={item.label}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, websiteStatus: [item.status as any] }));
                    setCurrentRoute('leads');
                  }}
                  className="p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1] cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-medium text-[#475569] truncate">{item.label}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-[#0F172A]">{item.count}</span>
                    <span className="text-[10px] text-[#94A3B8]">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Facility Type Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] tracking-tight">Facility Categories</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Healthcare market segment distribution</p>

            <div className="space-y-2.5 mt-4">
              {typeDistribution.map(t => {
                const pct = totalLeads > 0 ? (t.count / totalLeads) * 100 : 0;
                return (
                  <div 
                    key={t.type}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, businessType: [t.type] }));
                      setCurrentRoute('leads');
                    }}
                    className="cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-[#475569] group-hover:text-[#2563EB] transition-colors">{t.type}</span>
                      <span className="font-bold text-[#0F172A]">{t.count} <span className="text-[#94A3B8] font-normal text-[10px]">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: t.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
            <span className="text-[#64748B]">Coverage: 8 States & Territories</span>
            <button
              onClick={() => setCurrentRoute('leads')}
              className="text-[#2563EB] font-semibold hover:underline"
            >
              View all →
            </button>
          </div>
        </div>

      </div>

      {/* 3. High Priority Leads Table & State Heat Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: High Priority Outreach Leads */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] tracking-tight">Top Outreach Opportunities (Score 8–10)</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Ranked by opportunity score and executive availability</p>
            </div>
            <button
              onClick={() => setCurrentRoute('leads')}
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1"
            >
              View All in CRM <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-2.5 px-4">Score</th>
                  <th className="py-2.5 px-4">Business Name</th>
                  <th className="py-2.5 px-4">State</th>
                  <th className="py-2.5 px-4">Website Status</th>
                  <th className="py-2.5 px-4">Primary Contact</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {highPriorityLeads.map(lead => {
                  const b = lead.business;
                  const dp = lead.digital_presence;
                  const wa = lead.website_audit;
                  const dm = lead.decision_makers.find(d => d.priority === 'Primary') || lead.decision_makers[0];
                  const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);
                  const webBadge = getWebsiteStatusBadge(dp.website_status);

                  return (
                    <tr 
                      key={b.id} 
                      onClick={() => openLeadDetail(b.id)}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black text-xs ${scoreBadge.textColor}`}>
                            {lead.lead.lead_score}/10
                          </span>
                          <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div
                              style={{ width: `${lead.lead.lead_score * 10}%` }}
                              className={`h-full ${scoreBadge.barColor} rounded-full`}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate max-w-[220px]">
                          {b.business_name}
                        </p>
                        <span className="text-[10px] text-[#94A3B8]">{b.business_type} • {b.city}</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] text-[10px] font-bold">
                          {b.state}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${webBadge.badgeClass}`}>
                          {dp.website_status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {dm ? (
                          <div>
                            <p className="font-medium text-[#0F172A] truncate max-w-[140px]">{dm.full_name}</p>
                            <p className="text-[10px] text-[#64748B] truncate">{dm.position}</p>
                          </div>
                        ) : (
                          <span className="text-[#94A3B8] text-[11px] italic">Not identified</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-[#2563EB] group-hover:underline">
                          Dossier →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Australian State Distribution */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] tracking-tight">Leads by State & Territory</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Geographical facility density</p>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            {stateCounts.map(({ state, count }) => {
              const percentage = Math.round((count / maxStateCount) * 100);
              return (
                <div
                  key={state}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, state: [state] }));
                    setCurrentRoute('leads');
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#0F172A]">{state}</span>
                    <span className="font-semibold text-[#64748B]">{count} leads</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
