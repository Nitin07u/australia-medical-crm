import React, { useState } from 'react';
import { 
  Building2, 
  Hospital, 
  Stethoscope, 
  Cpu, 
  Plus, 
  Globe, 
  AlertTriangle, 
  UserCheck, 
  Star, 
  MapPin,
  ExternalLink,
  Edit3,
  Mail,
  Phone,
  Search
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { BusinessType, LeadFull, DecisionMaker } from '../../types';
import { getLeadScoreBadge, getOpportunityLevel } from '../../services/auditCalculator';
import { EditDecisionMakerModal } from '../modals/EditDecisionMakerModal';
import { EditHospitalModal } from '../modals/EditHospitalModal';

interface CategoryViewProps {
  category: 'Hospital' | 'Clinic' | 'Medical Centre' | 'Medical Equipment';
  title: string;
  subtitle: string;
}

export function CategoryView({ category, title, subtitle }: CategoryViewProps) {
  const { leads, openLeadDetail, setIsAddModalOpen } = useLeads();
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('all');

  // Edit Modals state
  const [editingDm, setEditingDm] = useState<{
    businessId: string;
    businessName: string;
    decisionMaker: DecisionMaker | null;
  } | null>(null);

  const [editingHospital, setEditingHospital] = useState<LeadFull | null>(null);

  const categoryLeads = leads.filter(l => {
    let matchesCategory = false;
    if (category === 'Medical Equipment') {
      matchesCategory = l.business.business_type === 'Medical Equipment' || l.business.business_type === 'Medical Device';
    } else {
      matchesCategory = l.business.business_type === category;
    }

    if (!matchesCategory) return false;
    if (selectedState !== 'all' && l.business.state !== selectedState) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const b = l.business;
      const dm = l.decision_makers.find(d => d.priority === 'Primary') || l.decision_makers[0];
      const matchesSearch = b.business_name.toLowerCase().includes(q) ||
                            b.city.toLowerCase().includes(q) ||
                            (b.provider_number && b.provider_number.toLowerCase().includes(q)) ||
                            (b.general_email && b.general_email.toLowerCase().includes(q)) ||
                            (dm && dm.full_name.toLowerCase().includes(q)) ||
                            (dm && dm.email && dm.email.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    return true;
  });

  const noWebsiteCount = categoryLeads.filter(l => l.digital_presence.website_status === 'No Website').length;
  const outdatedCount = categoryLeads.filter(l => 
    l.digital_presence.website_status === 'Severely Outdated' || 
    l.digital_presence.website_status === 'Needs Improvement'
  ).length;
  const highPriorityCount = categoryLeads.filter(l => l.lead.lead_score >= 8).length;

  const getIcon = () => {
    switch (category) {
      case 'Hospital': return <Hospital className="w-5 h-5 text-indigo-500" />;
      case 'Clinic': return <Stethoscope className="w-5 h-5 text-blue-500" />;
      case 'Medical Centre': return <Building2 className="w-5 h-5 text-cyan-500" />;
      case 'Medical Equipment': return <Cpu className="w-5 h-5 text-purple-500" />;
    }
  };

  const states = ['all', 'NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Category Hero Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-card flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold shrink-0">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                {categoryLeads.length} Facilities
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/30 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add {category}
        </button>
      </div>

      {/* Category Mini KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-medium text-slate-400">Total in View</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{categoryLeads.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-medium text-rose-500">No Website</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{noWebsiteCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-medium text-amber-500">Needs Redesign</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{outdatedCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-medium text-purple-500">Tier 1 Leads (Score 8+)</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{highPriorityCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {states.map(st => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                selectedState === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {st === 'all' ? 'All States' : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hospital, mail, doctor, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-subtle focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Leads Grid Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active {title} Directory</h3>
          <span className="text-xs text-slate-400">{categoryLeads.length} Facilities Listed</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryLeads.slice(0, 60).map(lead => {
            const b = lead.business;
            const dp = lead.digital_presence;
            const wa = lead.website_audit;
            const dm = lead.decision_makers.find(d => d.priority === 'Primary') || lead.decision_makers[0];
            const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);
            const opp = getOpportunityLevel(wa?.opportunity_score ?? 50);

            return (
              <div
                key={b.id}
                className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-card text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${scoreBadge.badgeClass}`}>
                      ★ {lead.lead.lead_score}/10
                    </span>
                    <div className="flex items-center gap-1.5">
                      {b.provider_number && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {b.provider_number}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${opp.badgeClass}`}>
                        {dp.website_status}
                      </span>
                    </div>
                  </div>

                  {/* Business Name with Edit Facility Button */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 
                      onClick={() => openLeadDetail(b.id)}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {b.business_name}
                    </h4>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingHospital(lead);
                      }}
                      title="Edit Hospital Profile & Mail Address"
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-500 hover:text-blue-600 transition-colors shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 my-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <p className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                      <span>{b.address}, {b.city}, <strong>{b.state}</strong> {b.postcode}</span>
                    </p>

                    {b.general_email && (
                      <p className="flex items-center gap-1 font-mono text-[10px] text-slate-600 dark:text-slate-400 truncate">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{b.general_email}</span>
                      </p>
                    )}

                    {b.subcategory && (
                      <p className="truncate text-slate-600 dark:text-slate-300 text-[10px] font-medium bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">
                        • {b.subcategory}
                      </p>
                    )}

                    {/* Decision Maker Section with Edit Contact Button */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Key Decision Maker</span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDm({
                              businessId: b.id,
                              businessName: b.business_name,
                              decisionMaker: dm || null
                            });
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> {dm ? 'Edit Profile & Mail' : '+ Add Contact'}
                        </button>
                      </div>

                      {dm ? (
                        <div className="mt-1 space-y-0.5">
                          <p className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold">
                            <UserCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                            {dm.full_name} <span className="text-[10px] font-normal text-slate-400">({dm.position})</span>
                          </p>
                          {dm.email && (
                            <p className="flex items-center gap-1 text-[10px] font-mono text-blue-600 dark:text-blue-400 pl-4 truncate">
                              <Mail className="w-2.5 h-2.5 shrink-0" /> {dm.email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">No contact identified yet</p>
                      )}
                    </div>

                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Stage: <strong className="text-slate-700 dark:text-slate-300">{lead.lead.lead_status}</strong></span>
                  <button 
                    onClick={() => openLeadDetail(b.id)}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    View Dossier →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Decision Maker Modal */}
      <EditDecisionMakerModal
        isOpen={Boolean(editingDm)}
        onClose={() => setEditingDm(null)}
        businessId={editingDm?.businessId || ''}
        businessName={editingDm?.businessName || ''}
        decisionMaker={editingDm?.decisionMaker || null}
      />

      {/* Edit Hospital / Facility Modal */}
      <EditHospitalModal
        isOpen={Boolean(editingHospital)}
        onClose={() => setEditingHospital(null)}
        lead={editingHospital}
      />

    </div>
  );
}
