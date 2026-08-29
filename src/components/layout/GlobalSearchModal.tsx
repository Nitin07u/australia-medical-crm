import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, MapPin, Globe, UserCheck, ArrowRight } from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { getOpportunityLevel, getLeadScoreBadge, getWebsiteStatusBadge } from '../../services/auditCalculator';

export function GlobalSearchModal() {
  const { isSearchModalOpen, setIsSearchModalOpen, leads, openLeadDetail } = useLeads();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      } else if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const q = query.toLowerCase().trim();
  const results = q ? leads.filter(l => {
    const b = l.business;
    const dp = l.digital_presence;
    const dms = l.decision_makers;
    const tags = l.tags;

    return (
      b.business_name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.state.toLowerCase().includes(q) ||
      (b.provider_number && b.provider_number.toLowerCase().includes(q)) ||
      (b.abn && b.abn.includes(q)) ||
      (dp.website_url && dp.website_url.toLowerCase().includes(q)) ||
      (b.general_email && b.general_email.toLowerCase().includes(q)) ||
      dms.some(dm => dm.full_name.toLowerCase().includes(q) || (dm.email && dm.email.toLowerCase().includes(q))) ||
      tags.some(t => t.name.toLowerCase().includes(q))
    );
  }).slice(0, 8) : leads.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#0B1220]/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-modal border border-[#E2E8F0] overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E2E8F0]">
          <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search medical businesses, cities, states, websites, decision makers, provider number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-xs text-[#0F172A] placeholder-[#94A3B8] font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#94A3B8] bg-[#F8FAFC] border border-[#E2E8F0] rounded">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-[#F1F5F9]">
          {results.length > 0 ? (
            results.map((lead) => {
              const b = lead.business;
              const dp = lead.digital_presence;
              const wa = lead.website_audit;
              const dm = lead.decision_makers[0];
              const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);
              const webBadge = getWebsiteStatusBadge(dp.website_status);

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    openLeadDetail(b.id);
                    setIsSearchModalOpen(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0">
                      {b.business_type.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#0F172A] group-hover:text-[#2563EB] truncate">
                          {b.business_name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                          {b.state}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                        {b.business_type} • {b.city} • {dm ? dm.full_name : 'No executive contact'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${webBadge.badgeClass}`}>
                      <span className={`w-1 h-1 rounded-full ${webBadge.dotColor}`} />
                      <span>{dp.website_status}</span>
                    </span>

                    <span className={`font-black text-xs px-2 py-0.5 rounded ${scoreBadge.textColor}`}>
                      {lead.lead.lead_score}/10
                    </span>

                    <ArrowRight className="w-3.5 h-3.5 text-[#CBD5E1] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-[#94A3B8] text-xs">
              No matching medical leads found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
          <span>Navigate with <kbd className="px-1 py-0.2 bg-white rounded border border-[#E2E8F0]">↑</kbd> <kbd className="px-1 py-0.2 bg-white rounded border border-[#E2E8F0]">↓</kbd></span>
          <span>Open with <kbd className="px-1 py-0.2 bg-white rounded border border-[#E2E8F0]">Enter</kbd></span>
        </div>

      </div>
    </div>
  );
}
