import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Stethoscope, 
  Hospital, 
  Cpu, 
  Gauge, 
  UserCheck, 
  CheckSquare, 
  UploadCloud, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Activity,
  PlusCircle,
  ExternalLink,
  Flame
} from 'lucide-react';
import { useLeads, ActiveRoute } from '../../context/LeadContext';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { currentRoute, setCurrentRoute, leads, setIsAddModalOpen } = useLeads();
  const { user, isSupabaseLive } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Compute live badges
  const totalLeads = leads.length;
  const hospitalsCount = leads.filter(l => l.business.business_type === 'Hospital').length;
  const clinicsCount = leads.filter(l => l.business.business_type === 'Clinic').length;
  const centresCount = leads.filter(l => l.business.business_type === 'Medical Centre').length;
  const equipmentCount = leads.filter(l => l.business.business_type === 'Medical Equipment' || l.business.business_type === 'Medical Device').length;
  const noWebsiteCount = leads.filter(l => l.digital_presence.website_status === 'No Website').length;
  const tasksPending = leads.reduce((acc, l) => acc + l.tasks.filter(t => t.status !== 'Completed').length, 0);
  const highPriorityCount = leads.filter(l => l.lead.lead_score >= 9).length;

  const navItems: { id: ActiveRoute; label: string; icon: React.ElementType; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'All Leads', icon: Users, badge: totalLeads },
    { id: 'hospitals', label: 'Hospitals', icon: Hospital, badge: hospitalsCount },
    { id: 'clinics', label: 'Clinics', icon: Stethoscope, badge: clinicsCount },
    { id: 'medical-centres', label: 'Medical Centres', icon: Building2, badge: centresCount },
    { id: 'medical-equipment', label: 'Medical Equipment', icon: Cpu, badge: equipmentCount },
    { id: 'website-audit', label: 'Website Audit', icon: Gauge, badge: `${noWebsiteCount} no site`, badgeColor: 'bg-rose-500/20 text-rose-300' },
    { id: 'decision-makers', label: 'Decision Makers', icon: UserCheck },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: tasksPending > 0 ? tasksPending : undefined, badgeColor: 'bg-amber-500/20 text-amber-300' },
    { id: 'import-leads', label: 'Import Leads', icon: UploadCloud },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside 
      className={`h-screen bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-all duration-300 select-none z-30 shrink-0 sticky top-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
          <div 
            onClick={() => setCurrentRoute('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-white tracking-tight text-base leading-tight">MedLead AU</h1>
                  <span className="text-[10px] font-semibold tracking-wider bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">CRM</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">Medical Lead Intelligence</p>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="p-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-3 rounded-xl transition-all shadow-sm shadow-blue-600/30 hover:shadow-blue-600/50 active:scale-[0.98] ${
              isCollapsed ? 'px-0' : ''
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="text-xs font-semibold">Add New Lead</span>}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id || (item.id === 'leads' && currentRoute === 'lead-detail');

            return (
              <button
                key={item.id}
                onClick={() => setCurrentRoute(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badgeColor || (isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400')
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Status & User Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        {/* Supabase status badge */}
        {!isCollapsed && (
          <div className="mb-3 px-2 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">
                {isSupabaseLive ? 'Supabase Connected' : 'Local / Demo Mode'}
              </span>
            </div>
            <button
              onClick={() => setCurrentRoute('settings')}
              className="text-blue-400 hover:text-blue-300 font-semibold hover:underline text-[10px]"
            >
              Config
            </button>
          </div>
        )}

        {/* User Card */}
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-600 shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-white bg-blue-600">
                {user?.name?.charAt(0) || 'A'}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{user?.name || 'Medical Agent'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'director@agency.com.au'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
