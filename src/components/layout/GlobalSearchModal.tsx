import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, MapPin, Globe, UserCheck, ArrowRight, Sparkles, Tag as TagIcon } from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { getOpportunityLevel, getLeadScoreBadge } from '../../services/auditCalculator';

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
      (b.abn && b.abn.includes(q)) ||
      (dp.website_url && dp.website_url.toLowerCase().includes(q)) ||
      (b.general_email && b.general_email.toLowerCase().includes(q)) ||
      dms.some(dm => dm.full_name.toLowerCase().includes(q) || (dm.email && dm.email.toLowerCase().includes(q))) ||
      tags.some(t => t.name.toLowerCase().includes(q))
    );
  }).slice(0, 8) : leads.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search medical businesses, cities, states, websites, decision makers, ABN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {results.length > 0 ? (
            results.map((lead) => {
              const b = lead.business;
              const dp = lead.digital_presence;
              const wa = lead.website_audit;
              const dm = lead.decision_makers[0];
              const scoreBadge = getLeadScoreBadge(lead.lead.lead_score);
              const oppLevel = getOpportunityLevel(wa?.opportunity_score ?? 50);

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    openLeadDetail(b.id);
                    setIsSearchModalOpen(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/60 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {b.business_name}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {b.business_type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {b.city}, {b.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          {dp.website_status}
                        </span>
                        {dm && (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <UserCheck className="w-3 h-3 text-emerald-500" />
                            {dm.full_name} ({dm.position})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${scoreBadge.badgeClass}`}>
                        ★ {lead.lead.lead_score}/10
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{oppLevel.label}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-medium">No medical leads found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for a different city, clinic name, or ABN</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Fast debounced indexing across Australian medical directories</span>
          </div>
          <span className="text-[11px]">Press ↵ to select</span>
        </div>
      </div>
    </div>
  );
}
