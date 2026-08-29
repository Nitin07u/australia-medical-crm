import React, { useState } from 'react';
import { 
  UserCheck, 
  Mail, 
  Phone, 
  Search, 
  Building2, 
  MapPin, 
  ExternalLink, 
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { getAllDecisionMakers } from '../../services/decisionMakerService';
import { RoleType, DecisionMaker } from '../../types';
import { EditDecisionMakerModal } from '../modals/EditDecisionMakerModal';

export function DecisionMakersView() {
  const { leads, openLeadDetail } = useLeads();
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Editing state
  const [editingDm, setEditingDm] = useState<{
    businessId: string;
    businessName: string;
    decisionMaker: DecisionMaker | null;
  } | null>(null);

  const allDMs = getAllDecisionMakers();

  const filtered = allDMs.filter(item => {
    const dm = item.decisionMaker;
    const matchesSearch = dm.full_name.toLowerCase().includes(search.toLowerCase()) ||
                          dm.position.toLowerCase().includes(search.toLowerCase()) ||
                          item.businessName.toLowerCase().includes(search.toLowerCase()) ||
                          (dm.email && dm.email.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (roleFilter !== 'all' && dm.role_type !== roleFilter) return false;
    return true;
  });

  const roles: RoleType[] = [
    'Medical Director', 'CEO', 'Director', 'Managing Director', 'Owner', 'Practice Manager', 'Marketing Manager', 'Head of Marketing', 'Founder', 'Other'
  ];

  return (
    <div className="pt-8 px-7 pb-8 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">
              Australian Medical Decision Makers Directory
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
              {allDMs.length} Key Contacts
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Verified Hospital Directors, Medical Superintendents, CEOs, and Practice Managers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contact, email, position, clinic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>
      </div>

      {/* Role Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setRoleFilter('all')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-all shrink-0 ${
            roleFilter === 'all'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
        >
          All Roles ({allDMs.length})
        </button>

        {roles.map(r => {
          const count = allDMs.filter(d => d.decisionMaker.role_type === r).length;
          if (count === 0) return null;
          return (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all shrink-0 ${
                roleFilter === r
                  ? 'bg-[#2563EB] text-white shadow-xs font-semibold'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
              }`}
            >
              {r} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid of Decision Makers */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(item => {
          const dm = item.decisionMaker;

          return (
            <div
              key={dm.id}
              className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all p-4 flex flex-col justify-between group"
            >
              <div>
                
                {/* Top Role & Verification Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                    {dm.role_type}
                  </span>

                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    dm.email_verification_status === 'Verified'
                      ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
                      : 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    <span>{dm.email_verification_status || 'Verified'}</span>
                  </span>
                </div>

                {/* Name and Position */}
                <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors line-clamp-1 mb-0.5">
                  {dm.full_name}
                </h3>
                <p className="text-xs text-[#64748B] font-medium mb-3 line-clamp-1">
                  {dm.position}
                </p>

                {/* Business Facility Card */}
                <div 
                  onClick={() => openLeadDetail(item.businessId)}
                  className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] cursor-pointer transition-all mb-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#0F172A] truncate flex-1">{item.businessName}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-[#475569] border border-[#E2E8F0] ml-2 shrink-0">
                      {item.state}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                    {item.businessType} • {item.city}
                  </p>
                </div>

                {/* Contact Coordinates */}
                <div className="space-y-1.5 text-xs">
                  {dm.email ? (
                    <a
                      href={`mailto:${dm.email}`}
                      className="flex items-center gap-2 text-[#2563EB] hover:underline font-mono text-[11px] truncate"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0 text-[#2563EB]" />
                      <span className="truncate">{dm.email}</span>
                    </a>
                  ) : (
                    <span className="text-[#94A3B8] italic text-[11px] flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#CBD5E1]" /> No direct email recorded
                    </span>
                  )}

                  {dm.phone && (
                    <a
                      href={`tel:${dm.phone}`}
                      className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] text-[11px]"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0 text-[#64748B]" />
                      <span>{dm.phone}</span>
                    </a>
                  )}

                  {dm.linkedin_url && (
                    <a
                      href={dm.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[#2563EB] hover:underline text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3 text-[#2563EB]" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                </div>

              </div>

              {/* Action Footer */}
              <div className="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                <button
                  onClick={() => setEditingDm({
                    businessId: item.businessId,
                    businessName: item.businessName,
                    decisionMaker: dm
                  })}
                  className="inline-flex items-center gap-1 text-[#2563EB] hover:underline font-semibold"
                >
                  <Edit3 className="w-3 h-3" /> Edit Mail & Profile
                </button>

                <button
                  onClick={() => openLeadDetail(item.businessId)}
                  className="text-[#64748B] hover:text-[#0F172A] font-semibold"
                >
                  Open Dossier →
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Decision Maker Modal */}
      <EditDecisionMakerModal
        isOpen={Boolean(editingDm)}
        onClose={() => setEditingDm(null)}
        businessId={editingDm?.businessId || ''}
        businessName={editingDm?.businessName || ''}
        decisionMaker={editingDm?.decisionMaker || null}
      />

    </div>
  );
}
