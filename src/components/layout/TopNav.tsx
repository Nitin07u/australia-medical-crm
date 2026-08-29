import React from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Bell, 
  UploadCloud, 
  Download, 
  Database,
  Moon,
  Sun,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { useAuth } from '../../context/AuthContext';
import { exportLeadsToCsv } from '../../services/csvService';
import { useToast } from '../../context/ToastContext';

export function TopNav() {
  const { 
    currentRoute, 
    setCurrentRoute, 
    setIsAddModalOpen, 
    setIsSearchModalOpen, 
    setIsFilterDrawerOpen, 
    activeFilterCount,
    leads,
    filteredLeads
  } = useLeads();
  const { isSupabaseLive } = useAuth();
  const { showToast } = useToast();

  const getRouteTitle = () => {
    switch (currentRoute) {
      case 'dashboard':
        return { title: 'Executive Intelligence Dashboard', subtitle: 'Real-time overview of Australian medical market opportunities' };
      case 'leads':
        return { title: 'Lead Directory & CRM Table', subtitle: 'Manage, score, filter and qualify medical businesses' };
      case 'hospitals':
        return { title: 'Hospitals & Surgical Facilities', subtitle: 'Private and public hospitals and day surgery units' };
      case 'clinics':
        return { title: 'Specialist Medical Clinics', subtitle: 'Private dental, orthopaedic, physiotherapy, and specialist rooms' };
      case 'medical-centres':
        return { title: 'General Practice Medical Centres', subtitle: 'High-volume community and allied health practices' };
      case 'medical-equipment':
        return { title: 'Medical Equipment & Device Suppliers', subtitle: 'B2B distributors, diagnostics, and surgical suppliers' };
      case 'website-audit':
        return { title: 'Website Audit & Opportunity Hub', subtitle: 'Deep UX, mobile performance, and conversion evaluation' };
      case 'decision-makers':
        return { title: 'Decision Makers Directory', subtitle: 'Founders, Directors, Practice Managers, and CEOs' };
      case 'tasks':
        return { title: 'Outreach & Research Tasks', subtitle: 'Action items, audits, and follow-ups for team members' };
      case 'import-leads':
        return { title: '5-Step CSV Import Wizard', subtitle: 'Bulk import and map Australian medical registries' };
      case 'settings':
        return { title: 'Settings & Supabase Integration', subtitle: 'Database connections, RLS policies, tags, and backups' };
      case 'lead-detail':
        return { title: 'Lead Detail Profile', subtitle: 'Comprehensive digital footprint and decision-maker dossier' };
      default:
        return { title: 'MedLead AU CRM', subtitle: 'Australian Medical Business Lead Intelligence' };
    }
  };

  const { title, subtitle } = getRouteTitle();

  const handleExportCsv = () => {
    const csv = exportLeadsToCsv(filteredLeads.length > 0 ? filteredLeads : leads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `medlead_australia_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'CSV Exported',
      message: `Exported ${filteredLeads.length} leads to CSV`
    });
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 sticky top-0 z-20 flex items-center justify-between gap-4 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
      {/* Route Title & Breadcrumb */}
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
          {title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Global Search Button */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-all group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <span className="hidden md:inline">Quick search...</span>
          <kbd className="hidden lg:inline-flex items-center text-[10px] text-slate-400 font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Filter Drawer Toggle */}
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors relative ${
            activeFilterCount > 0
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCsv}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          title="Export current view to CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Export</span>
        </button>

        {/* Import Leads Button */}
        <button
          onClick={() => setCurrentRoute('import-leads')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
          <span>Import CSV</span>
        </button>

        {/* Add Lead Primary CTA */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/30 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Lead</span>
        </button>
      </div>
    </header>
  );
}
