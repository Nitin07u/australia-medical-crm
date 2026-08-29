import React from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  UploadCloud, 
  ChevronRight,
  Database
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

  const getRouteBreadcrumb = () => {
    switch (currentRoute) {
      case 'dashboard':
        return { section: 'Overview', page: 'Executive Dashboard' };
      case 'leads':
        return { section: 'Leads', page: 'All Medical Leads' };
      case 'hospitals':
        return { section: 'Facilities', page: 'Hospitals & Surgical Centres' };
      case 'clinics':
        return { section: 'Facilities', page: 'Specialist Medical Clinics' };
      case 'medical-centres':
        return { section: 'Facilities', page: 'General Practice Centres' };
      case 'medical-equipment':
        return { section: 'Facilities', page: 'Medical Equipment & Devices' };
      case 'website-audit':
        return { section: 'Research', page: 'Website Opportunity Hub' };
      case 'decision-makers':
        return { section: 'Research', page: 'Decision Makers Directory' };
      case 'tasks':
        return { section: 'Research', page: 'Outreach Tasks' };
      case 'import-leads':
        return { section: 'System', page: 'CSV Import Wizard' };
      case 'settings':
        return { section: 'System', page: 'Settings & Database' };
      case 'lead-detail':
        return { section: 'Leads', page: 'Facility Profile Dossier' };
      default:
        return { section: 'CRM', page: 'MedLead AU' };
    }
  };

  const { section, page } = getRouteBreadcrumb();

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
    <header className="bg-white border-b border-[#E2E8F0] px-6 h-16 sticky top-0 z-20 flex items-center justify-between gap-4">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#94A3B8] font-medium">{section}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
        <h1 className="text-[#0F172A] font-bold text-sm tracking-tight">{page}</h1>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2.5">
        {/* Quick Search */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] text-xs font-medium border border-[#E2E8F0] transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="hidden md:inline">Quick search...</span>
          <kbd className="hidden lg:inline-flex items-center text-[10px] text-[#94A3B8] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">
            ⌘K
          </kbd>
        </button>

        {/* Filter Drawer Toggle */}
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors ${
            activeFilterCount > 0
              ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
              : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Export CSV */}
        <button
          onClick={handleExportCsv}
          className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] text-xs font-medium transition-colors"
          title="Export current view to CSV"
        >
          <Download className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="hidden md:inline">Export CSV</span>
        </button>

        {/* Import CSV */}
        <button
          onClick={() => setCurrentRoute('import-leads')}
          className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] text-xs font-medium border border-[#E2E8F0] transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Import</span>
        </button>

        {/* Primary Add Lead Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Lead</span>
        </button>
      </div>
    </header>
  );
}
