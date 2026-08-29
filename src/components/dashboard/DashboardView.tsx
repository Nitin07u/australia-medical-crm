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
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { getLeadScoreBadge, getOpportunityLevel } from '../../services/auditCalculator';
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
    { label: 'No Website', count: leads.filter(l => l.digital_presence.website_status === 'No Website').length, color: '#EF4444', status: 'No Website' },
    { label: 'Severely Outdated', count: leads.filter(l => l.digital_presence.website_status === 'Severely Outdated').length, color: '#F97316', status: 'Severely Outdated' },
    { label: 'Needs Improvement', count: leads.filter(l => l.digital_presence.website_status === 'Needs Improvement').length, color: '#F59E0B', status: 'Needs Improvement' },
    { label: 'Good Website', count: leads.filter(l => l.digital_presence.website_status === 'Good Website').length, color: '#10B981', status: 'Good Website' },
    { label: 'Unknown', count: leads.filter(l => l.digital_presence.website_status === 'Unknown').length, color: '#94A3B8', status: 'Unknown' }
  ];

  // Business Type Distribution
  const typeDistribution: { type: BusinessType; count: number; color: string }[] = ([
    { type: 'Hospital' as BusinessType, count: leads.filter(l => l.business.business_type === 'Hospital').length, color: '#6366F1' },
    { type: 'Clinic' as BusinessType, count: leads.filter(l => l.business.business_type === 'Clinic').length, color: '#3B82F6' },
    { type: 'Medical Centre' as BusinessType, count: leads.filter(l => l.business.business_type === 'Medical Centre').length, color: '#06B6D4' },
    { type: 'Medical Equipment' as BusinessType, count: leads.filter(l => l.business.business_type === 'Medical Equipment').length, color: '#8B5CF6' },
    { type: 'Medical Device' as BusinessType, count: leads.filter(l => l.business.business_type === 'Medical Device').length, color: '#A855F7' },
    { type: 'Rehabilitation' as BusinessType, count: leads.filter(l => l.business.business_type === 'Rehabilitation').length, color: '#EC4899' },
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
    .slice(0, 6);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner / Agency Intelligence Intro */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 text-white border border-slate-700 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-blue-400" /> Australian Medical Market
            </span>
            <span className="text-xs text-slate-300">Live CRM Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            High-Opportunity Medical Web Redesign Pipeline
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Targeting Australian medical practices, private hospitals, specialist clinics, and medical suppliers with high digital opportunity and verified decision makers.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setCurrentRoute('import-leads')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors"
          >
            Import CSV Leads
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Medical Lead
          </button>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Leads */}
        <div 
          onClick={() => setCurrentRoute('leads')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer shadow-subtle group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Leads</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 group-hover:text-blue-600 transition-colors">
            {totalLeads}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">100%</span> in Australia
          </p>
        </div>

        {/* No Website */}
        <div 
          onClick={() => {
            setFilters(prev => ({ ...prev, websiteStatuses: ['No Website'] }));
            setCurrentRoute('leads');
          }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer shadow-subtle group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">No Website</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Globe className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {noWebsiteCount}
          </p>
          <p className="text-[11px] text-rose-500 font-semibold mt-1">
            ★ Highest Opportunity
          </p>
        </div>

        {/* Needs Redesign */}
        <div 
          onClick={() => {
            setFilters(prev => ({ ...prev, websiteStatuses: ['Severely Outdated', 'Needs Improvement'] }));
            setCurrentRoute('leads');
          }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer shadow-subtle group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Needs Redesign</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {needsRedesignCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Outdated / Slow UX
          </p>
        </div>

        {/* Good Website */}
        <div 
          onClick={() => {
            setFilters(prev => ({ ...prev, websiteStatuses: ['Good Website'] }));
            setCurrentRoute('leads');
          }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer shadow-subtle group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Good Website</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {goodWebsiteCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Low Outreach Priority
          </p>
        </div>

        {/* High Priority (Tier 1) */}
        <div 
          onClick={() => {
            setFilters(prev => ({ ...prev, scoreRange: [8, 10] }));
            setCurrentRoute('leads');
          }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer shadow-subtle group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tier 1 Priority</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Flame className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
            {highPriorityCount}
          </p>
          <p className="text-[11px] text-purple-500 font-semibold mt-1">
            Lead Score 8 - 10
          </p>
        </div>

        {/* Decision Maker Found */}
        <div 
          onClick={() => {
            setFilters(prev => ({ ...prev, decisionMakerFound: true }));
            setCurrentRoute('leads');
          }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all cursor-pointer shadow-subtle group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Decision Makers</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-cyan-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-2">
            {dmFoundCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalLeads > 0 ? Math.round((dmFoundCount / totalLeads) * 100) : 0}% identified
          </p>
        </div>
      </div>

      {/* Grid of Visual Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Website Opportunity Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Website Opportunity Distribution</h3>
                <p className="text-xs text-slate-400">Classification of digital presence status</p>
              </div>
              <Globe className="w-4 h-4 text-slate-400" />
            </div>

            {/* Stacked Percentage Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 mb-5">
              {oppDistribution.map((item) => {
                const pct = totalLeads > 0 ? (item.count / totalLeads) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={item.label}
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                    className="h-full transition-all relative group"
                    title={`${item.label}: ${item.count} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>

            {/* Legend List */}
            <div className="space-y-2.5">
              {oppDistribution.map((item) => {
                const pct = totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0;
                return (
                  <div 
                    key={item.label}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, websiteStatuses: [item.status as any] }));
                      setCurrentRoute('leads');
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{item.count}</span>
                      <span className="text-[11px] text-slate-400 w-8 text-right">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>High opportunity = No website or severely outdated</span>
            <button 
              onClick={() => setCurrentRoute('website-audit')}
              className="text-blue-600 hover:text-blue-500 font-semibold"
            >
              Audit Matrix →
            </button>
          </div>
        </div>

        {/* 2. Lead Distribution by Business Type */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Leads by Business Type</h3>
                <p className="text-xs text-slate-400">Medical facility sector breakdown</p>
              </div>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {typeDistribution.map((item) => {
                const pct = totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0;
                return (
                  <div 
                    key={item.type}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, businessTypes: [item.type] }));
                      setCurrentRoute('leads');
                    }}
                    className="cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                        {item.type}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.count} <span className="text-slate-400 font-normal text-[11px]">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                        className="h-full rounded-full transition-all group-hover:opacity-85"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Specialists & Centres represent primary agency targets</span>
            <button 
              onClick={() => setCurrentRoute('leads')}
              className="text-blue-600 hover:text-blue-500 font-semibold"
            >
              Filter CRM →
            </button>
          </div>
        </div>

        {/* 3. Leads by Australian State */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Leads by Australian State</h3>
                <p className="text-xs text-slate-400">Territory distribution across Australia</p>
              </div>
              <MapPin className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stateCounts.map((item) => {
                const pct = maxStateCount > 0 ? (item.count / maxStateCount) * 100 : 0;
                return (
                  <div
                    key={item.state}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, states: [item.state] }));
                      setCurrentRoute('leads');
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{item.state}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>NSW & VIC have highest concentration of private practices</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">8 Territories</span>
          </div>
        </div>
      </div>

      {/* High Priority Leads Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">High Priority Leads (Outreach Ready)</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                Tier 1 Leads
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by Lead Score, website opportunity gap, and verified decision-maker availability
            </p>
          </div>

          <button
            onClick={() => setCurrentRoute('leads')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500"
          >
            View all {totalLeads} leads <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Business Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">City / State</th>
                <th className="py-3 px-4">Website Status</th>
                <th className="py-3 px-4">Decision Maker</th>
                <th className="py-3 px-4">Pipeline Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {highPriorityLeads.map((lead) => {
                const b = lead.business;
                const dp = lead.digital_presence;
                const dm = lead.decision_makers.find(d => d.priority === 'Primary') || lead.decision_makers[0];
                const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);
                const opp = getOpportunityLevel(lead.website_audit?.opportunity_score ?? 50);

                return (
                  <tr
                    key={b.id}
                    onClick={() => openLeadDetail(b.id)}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    {/* Score */}
                    <td className="py-3.5 px-4 font-bold">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-xs ${scoreBadge.badgeClass}`}>
                        ★ {lead.lead.lead_score}/10
                      </span>
                    </td>

                    {/* Business */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {b.business_name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{b.subcategory || b.address}</div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {b.business_type}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 font-medium">
                      {b.city}, <span className="font-bold text-slate-900 dark:text-slate-100">{b.state}</span>
                    </td>

                    {/* Website */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${opp.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${opp.bgClass}`} />
                        {dp.website_status}
                      </span>
                    </td>

                    {/* Decision Maker */}
                    <td className="py-3.5 px-4">
                      {dm ? (
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            {dm.full_name}
                          </p>
                          <p className="text-[11px] text-slate-400">{dm.position}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No contact listed</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                        {lead.lead.lead_status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline inline-flex items-center gap-1">
                        View Lead <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
