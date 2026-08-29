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
  MapPin,
  ExternalLink,
  Edit3,
  Mail,
  Phone,
  Search
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { BusinessType, LeadFull, DecisionMaker } from '../../types';
import { getLeadScoreBadge, getWebsiteStatusBadge } from '../../services/auditCalculator';
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
      case 'Hospital': return <Hospital className="w-5 h-5 text-[#2563EB]" />;
      case 'Clinic': return <Stethoscope className="w-5 h-5 text-[#2563EB]" />;
      case 'Medical Centre': return <Building2 className="w-5 h-5 text-[#2563EB]" />;
      case 'Medical Equipment': return <Cpu className="w-5 h-5 text-[#2563EB]" />;
    }
  };

  const states = ['all', 'NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Category Hero Banner */}
      <div className="rounded-xl bg-white p-5 border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold shrink-0">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">{title}</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                {categoryLeads.length} Facilities
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs">
            <span className="font-bold text-[#B91C1C]">{noWebsiteCount}</span>
            <span className="text-[#B91C1C] ml-1">No Website</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs">
            <span className="font-bold text-[#B45309]">{outdatedCount}</span>
            <span className="text-[#B45309] ml-1">Needs Redesign</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs">
            <span className="font-bold text-[#1D4ED8]">{highPriorityCount}</span>
            <span className="text-[#1D4ED8] ml-1">Tier 1 Leads</span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Facility</span>
          </button>
        </div>
      </div>

      {/* Filter and State Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs">
        
        {/* Search */}
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()} by name, suburb, email or executive...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        {/* State Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {states.map(st => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedState === st
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
              }`}
            >
              {st === 'all' ? 'All States' : st}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categoryLeads.length > 0 ? (
          categoryLeads.map((lead) => {
            const b = lead.business;
            const dp = lead.digital_presence;
            const dm = lead.decision_makers.find(d => d.priority === 'Primary') || lead.decision_makers[0];
            const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);
            const webBadge = getWebsiteStatusBadge(dp.website_status);

            return (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all p-4 flex flex-col justify-between group"
              >
                <div>
                  
                  {/* Top Bar: Lead Score & Edit Profile Trigger */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
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

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingHospital(lead)}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#64748B] hover:text-[#2563EB] bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] px-2 py-0.5 rounded-md transition-colors"
                        title="Edit Hospital Profile & Mail Address"
                      >
                        <Edit3 className="w-3 h-3 text-[#2563EB]" /> Edit Profile
                      </button>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                        {b.state}
                      </span>
                    </div>
                  </div>

                  {/* Business Name */}
                  <h3
                    onClick={() => openLeadDetail(b.id)}
                    className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] cursor-pointer transition-colors line-clamp-1 mb-1"
                  >
                    {b.business_name}
                  </h3>

                  {/* Address & Provider Number */}
                  <p className="text-[11px] text-[#64748B] flex items-center gap-1 mb-2.5 truncate">
                    <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" />
                    <span>{b.address}, {b.city} {b.postcode}</span>
                    {b.provider_number && (
                      <span className="text-[#94A3B8] font-mono text-[10px] ml-1">({b.provider_number})</span>
                    )}
                  </p>

                  {/* Website & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3 bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                    <div className="truncate flex-1">
                      {dp.website_url ? (
                        <a
                          href={dp.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#2563EB] hover:underline font-mono text-[11px] flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{dp.website_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-[#B91C1C] font-semibold text-[11px]">No Website Detected</span>
                      )}
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${webBadge.badgeClass}`}>
                      <span className={`w-1 h-1 rounded-full ${webBadge.dotColor}`} />
                      <span>{dp.website_status}</span>
                    </span>
                  </div>

                  {/* Decision Maker / Key Contact Box */}
                  <div className="border-t border-[#F1F5F9] pt-2.5">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#94A3B8] font-semibold uppercase text-[9px] tracking-wider">Key Executive</span>
                      <button
                        onClick={() => setEditingDm({
                          businessId: b.id,
                          businessName: b.business_name,
                          decisionMaker: dm || null
                        })}
                        className="text-[10px] text-[#2563EB] hover:underline font-semibold flex items-center gap-0.5"
                      >
                        <Edit3 className="w-2.5 h-2.5" /> Edit Mail & Profile
                      </button>
                    </div>

                    {dm ? (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-xs text-[#0F172A] truncate">{dm.full_name}</p>
                        <p className="text-[10px] text-[#64748B] truncate">{dm.position}</p>
                        {dm.email && (
                          <a
                            href={`mailto:${dm.email}`}
                            className="text-[10px] text-[#2563EB] hover:underline font-mono flex items-center gap-1 truncate mt-0.5"
                          >
                            <Mail className="w-3 h-3" /> {dm.email}
                          </a>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingDm({
                          businessId: b.id,
                          businessName: b.business_name,
                          decisionMaker: null
                        })}
                        className="text-[11px] text-[#94A3B8] hover:text-[#2563EB] italic py-1 block"
                      >
                        + Add Executive Contact
                      </button>
                    )}
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8] text-[11px]">
                    Status: <strong className="text-[#0F172A] font-semibold">{lead.lead.lead_status}</strong>
                  </span>

                  <button
                    onClick={() => openLeadDetail(b.id)}
                    className="font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    View Dossier →
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-[#94A3B8] bg-white rounded-xl border border-[#E2E8F0]">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-[#CBD5E1]" />
            <p className="font-semibold text-sm text-[#475569]">No facilities found</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">Try selecting another state or adjusting search keywords</p>
          </div>
        )}
      </div>

      {/* Edit Decision Maker Modal */}
      <EditDecisionMakerModal
        isOpen={Boolean(editingDm)}
        onClose={() => setEditingDm(null)}
        businessId={editingDm?.businessId || ''}
        businessName={editingDm?.businessName || ''}
        decisionMaker={editingDm?.decisionMaker || null}
      />

      {/* Edit Hospital Modal */}
      <EditHospitalModal
        isOpen={Boolean(editingHospital)}
        onClose={() => setEditingHospital(null)}
        lead={editingHospital}
      />

    </div>
  );
}
