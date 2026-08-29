import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Hospital, 
  Stethoscope, 
  Building2, 
  Cpu, 
  Globe, 
  UserCheck, 
  CheckSquare, 
  UploadCloud, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Activity,
  Layers
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveRoute } from '../../types';

interface NavSection {
  title: string;
  items: {
    id: ActiveRoute;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[];
}

export function Sidebar() {
  const { currentRoute, setCurrentRoute, leads } = useLeads();
  const { user, isSupabaseLive } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Compute live badges
  const totalLeads = leads.length;
  const hospitalCount = leads.filter(l => l.business.business_type === 'Hospital').length;
  const clinicCount = leads.filter(l => l.business.business_type === 'Clinic').length;
  const centresCount = leads.filter(l => l.business.business_type === 'Medical Centre').length;
  const equipCount = leads.filter(l => l.business.business_type === 'Medical Equipment' || l.business.business_type === 'Medical Device').length;
  const pendingTasksCount = leads.flatMap(l => l.tasks).filter(t => t.status !== 'Completed').length;
  const noWebsiteAudits = leads.filter(l => l.digital_presence.website_status === 'No Website' || l.digital_presence.website_status === 'Severely Outdated').length;

  const sections: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'leads', label: 'All Leads', icon: Users, badge: totalLeads },
        { id: 'hospitals', label: 'Hospitals', icon: Hospital, badge: hospitalCount },
        { id: 'clinics', label: 'Clinics', icon: Stethoscope, badge: clinicCount },
        { id: 'medical-centres', label: 'Medical Centres', icon: Building2, badge: centresCount },
        { id: 'medical-equipment', label: 'Medical Equipment', icon: Cpu, badge: equipCount },
      ]
    },
    {
      title: 'RESEARCH & AUDIT',
      items: [
        { id: 'website-audit', label: 'Website Audit', icon: Globe, badge: noWebsiteAudits > 0 ? noWebsiteAudits : undefined, badgeColor: 'bg-rose-900/60 text-rose-300 border border-rose-700/50' },
        { id: 'decision-makers', label: 'Decision Makers', icon: UserCheck },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, badgeColor: 'bg-amber-900/60 text-amber-300 border border-amber-700/50' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'import-leads', label: 'Import Leads', icon: UploadCloud },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside 
      className={`bg-[#0B1220] border-r border-[#1E293B] flex flex-col justify-between transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      } min-h-screen shrink-0`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E293B]">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm shrink-0 border border-[#1E293B]">
                <img src="/healthintel-logo.png" alt="healthIntel" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[15px] text-white tracking-tight">healthIntel</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#2563EB]/20 text-blue-400 border border-blue-500/30">
                    B2B
                  </span>
                </div>
                <p className="text-[10px] text-[#94A3B8] truncate leading-none mt-0.5">Medical Lead Intelligence</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mx-auto p-1 shadow-sm border border-[#1E293B]">
              <img src="/healthintel-logo.png" alt="healthIntel" className="w-full h-full object-contain" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-none">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
                  {section.title}
                </div>
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.id || (item.id === 'leads' && currentRoute === 'lead-detail');

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentRoute(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-[#1E293B] text-white font-semibold shadow-xs relative'
                          : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111B2E]'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#2563EB] rounded-r" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#3B82F6]' : 'text-[#64748B] group-hover:text-[#94A3B8]'
                        }`} />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {!isCollapsed && item.badge !== undefined && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.badgeColor || (isActive ? 'bg-[#2563EB]/20 text-[#60A5FA]' : 'bg-[#1E293B] text-[#94A3B8]')
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer User Profile */}
      <div className="p-3 border-t border-[#1E293B] bg-[#060B13]/40">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="w-8 h-8 rounded-full bg-[#1E293B] overflow-hidden border border-[#334155] shrink-0">
            <img 
              src={user?.avatar || '/nitin-avatar.jpg'} 
              alt={user?.name || 'Nitin Upadhyaya'} 
              className="w-full h-full object-cover" 
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Nitin Upadhyaya'}</p>
              <p className="text-[10px] text-[#94A3B8] truncate">{user?.email || 'hello@stoiclabs.dev'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
