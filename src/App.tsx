import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LeadProvider, useLeads } from './context/LeadContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { LeadModal } from './components/leads/form/LeadModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { LeadsView } from './components/leads/LeadsView';
import { CategoryView } from './components/categories/CategoryView';
import { WebsiteAuditHubView } from './components/audit/WebsiteAuditHubView';
import { DecisionMakersView } from './components/decision-makers/DecisionMakersView';
import { TasksView } from './components/tasks/TasksView';
import { ImportLeadsView } from './components/import/ImportLeadsView';
import { SettingsView } from './components/settings/SettingsView';
import { LeadDetailView } from './components/leads/detail/LeadDetailView';

function MainContent() {
  const { currentRoute } = useLeads();

  const renderActiveRoute = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardView />;
      case 'leads':
        return <LeadsView />;
      case 'hospitals':
        return (
          <CategoryView
            category="Hospital"
            title="Hospitals & Surgical Facilities"
            subtitle="Australian private acute hospitals, public healthcare networks, and day surgery units"
          />
        );
      case 'clinics':
        return (
          <CategoryView
            category="Clinic"
            title="Specialist Medical Clinics"
            subtitle="Specialist cosmetic dentistry, orthopaedics, physio, dermatology, and diagnostic rooms"
          />
        );
      case 'medical-centres':
        return (
          <CategoryView
            category="Medical Centre"
            title="General Practice Medical Centres"
            subtitle="High-volume GP surgeries, travel health clinics, and community health practices"
          />
        );
      case 'medical-equipment':
        return (
          <CategoryView
            category="Medical Equipment"
            title="Medical Equipment & Device Suppliers"
            subtitle="B2B medical device manufacturers, endoscopy supplies, and orthotic laboratories"
          />
        );
      case 'website-audit':
        return <WebsiteAuditHubView />;
      case 'decision-makers':
        return <DecisionMakersView />;
      case 'tasks':
        return <TasksView />;
      case 'import-leads':
        return <ImportLeadsView />;
      case 'settings':
        return <SettingsView />;
      case 'lead-detail':
        return <LeadDetailView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-600/15 selection:text-blue-600">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopNav />
        <main className="flex-1 pb-16">
          {renderActiveRoute()}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal />
      <LeadModal />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LeadProvider>
          <MainContent />
        </LeadProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
