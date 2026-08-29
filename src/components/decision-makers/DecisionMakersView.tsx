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
  Plus,
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
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card flex items-center justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Australian Medical Decision Makers Directory
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {allDMs.length} Key Contacts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified Hospital Directors, Medical Superintendents, CEOs, and Practice Managers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contact, email, position, clinic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-subtle focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Role Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setRoleFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
            roleFilter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
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
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                roleFilter === r
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {r} ({count})
            </button>
          );
        })}
      </div>

      {/* Decision Makers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(item => {
          const dm = item.decisionMaker;

          return (
            <div
              key={dm.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle hover:shadow-card hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between text-xs group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      dm.priority === 'Primary' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {dm.priority} Decision Maker
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white mt-2 group-hover:text-blue-600 transition-colors">
                      {dm.full_name}
                    </h3>
                    <p className="text-slate-500 font-medium text-xs">{dm.position}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                      {dm.email_verification_status}
                    </span>

                    <button
                      onClick={() => setEditingDm({
                        businessId: item.businessId,
                        businessName: item.businessName,
                        decisionMaker: dm
                      })}
                      title="Edit Profile & Email"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Linked Medical Facility */}
                <div 
                  onClick={() => openLeadDetail(item.businessId)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-3 space-y-1 cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400">Medical Facility</span>
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    {item.businessName}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    State: <strong>{item.state}</strong>
                  </p>
                </div>

                {/* Contact details */}
                <div className="space-y-1.5 text-slate-600 dark:text-slate-300 pt-1">
                  {dm.email && (
                    <p className="flex items-center gap-2 font-mono text-[11px] truncate">
                      <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{dm.email}</span>
                    </p>
                  )}
                  {dm.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{dm.phone}</span>
                    </p>
                  )}
                  {dm.linkedin_url && (
                    <p className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <a href={dm.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                        LinkedIn Profile
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-slate-500">
                <button
                  onClick={() => setEditingDm({
                    businessId: item.businessId,
                    businessName: item.businessName,
                    decisionMaker: dm
                  })}
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit Mail & Profile
                </button>

                <button
                  onClick={() => openLeadDetail(item.businessId)}
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
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
