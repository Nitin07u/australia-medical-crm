import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  ExternalLink, 
  Star, 
  UserCheck, 
  Plus, 
  Edit, 
  Trash2, 
  CheckSquare, 
  Activity as ActivityIcon, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  ArrowRight,
  Clock,
  Send
} from 'lucide-react';
import { useLeads } from '../../../context/LeadContext';
import { getLeadScoreBadge, getOpportunityLevel } from '../../../services/auditCalculator';
import { LeadStatus, RoleType, ContactPriority, TaskPriority } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { EditDecisionMakerModal } from '../../modals/EditDecisionMakerModal';
import { EditHospitalModal } from '../../modals/EditHospitalModal';

export function LeadDetailView() {
  const { 
    selectedLead, 
    setCurrentRoute, 
    updateLead, 
    deleteLead, 
    saveWebsiteAudit,
    addDecisionMaker,
    deleteDecisionMaker,
    addTask,
    updateTaskStatus,
    deleteTask,
    tags
  } = useLeads();

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'decision-makers' | 'tasks' | 'activity'>('overview');

  // Modals inside detail
  const [isAddDMOpen, setIsAddDMOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAuditEditOpen, setIsAuditEditOpen] = useState(false);
  const [isEditHospitalOpen, setIsEditHospitalOpen] = useState(false);
  const [editingDm, setEditingDm] = useState<any | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Decision maker form state
  const [dmForm, setDmForm] = useState({
    full_name: '',
    position: '',
    role_type: 'Director' as RoleType,
    priority: 'Primary' as ContactPriority,
    email: '',
    phone: '',
    linkedin_url: '',
    email_verification_status: 'Verified' as const,
    notes: ''
  });

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    priority: 'High' as TaskPriority
  });

  if (!selectedLead) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-slate-500">No lead selected</p>
        <button
          onClick={() => setCurrentRoute('leads')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  const b = selectedLead.business;
  const dp = selectedLead.digital_presence;
  const wa = selectedLead.website_audit;
  const l = selectedLead.lead;
  const scoreBadge = getLeadScoreBadge(l.lead_score);
  const opp = getOpportunityLevel(wa?.opportunity_score ?? 50);

  // Next step recommendation engine
  const getNextStepRecommendation = () => {
    if (dp.google_maps_verified === 'Pending') {
      return {
        title: 'Verify Google Maps & Reviews',
        desc: 'Confirm physical address, rating, and patient volume on Google Maps.',
        actionText: 'Verify Maps',
        action: () => updateLead(b.id, { digital_presence: { ...dp, google_maps_verified: 'Verified' } })
      };
    }
    if (!wa || wa.opportunity_score === 50) {
      return {
        title: 'Complete Website Audit',
        desc: 'Score mobile UX, design, speed, and conversion points to generate precise proposal scope.',
        actionText: 'Run Website Audit',
        action: () => setActiveTab('audit')
      };
    }
    if (selectedLead.decision_makers.length === 0) {
      return {
        title: 'Identify Key Decision Maker',
        desc: 'Find Principal Doctor, Practice Manager, Director, or Owner contact details on LinkedIn or AHPRA.',
        actionText: 'Add Decision Maker',
        action: () => setIsAddDMOpen(true)
      };
    }
    if (l.lead_status === 'New' || l.lead_status === 'Researching') {
      return {
        title: 'Mark Ready for Outreach',
        desc: 'All preliminary research is complete. Advance lead to outreach pipeline.',
        actionText: 'Mark Ready for Outreach',
        action: () => updateLead(b.id, { lead: { ...l, lead_status: 'Ready for Outreach' } })
      };
    }
    return {
      title: 'Active Pipeline Progression',
      desc: `Lead is currently in "${l.lead_status}" stage. Continue follow-up and proposal actions.`,
      actionText: 'View Tasks',
      action: () => setActiveTab('tasks')
    };
  };

  const nextStep = getNextStepRecommendation();

  // Handle adding custom note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const timestamp = new Date().toISOString();
    const newActivity = {
      id: `act-${Date.now()}`,
      business_id: b.id,
      activity_type: 'note_added' as const,
      description: newNoteText.trim(),
      user_name: 'You',
      created_at: timestamp
    };

    updateLead(b.id, {
      activities: [newActivity, ...selectedLead.activities]
    });
    setNewNoteText('');
    showToast({
      type: 'success',
      title: 'Note Added to Dossier',
      message: 'Activity log updated'
    });
  };

  // Handle submit DM
  const handleCreateDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmForm.full_name) return;
    addDecisionMaker(b.id, dmForm);
    setIsAddDMOpen(false);
    setDmForm({
      full_name: '',
      position: '',
      role_type: 'Director',
      priority: 'Primary',
      email: '',
      phone: '',
      linkedin_url: '',
      email_verification_status: 'Verified',
      notes: ''
    });
  };

  // Handle submit Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    addTask(b.id, taskForm);
    setIsAddTaskOpen(false);
    setTaskForm({
      title: '',
      description: '',
      due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      priority: 'High'
    });
  };

  return (
    <div className="pt-8 px-7 pb-8 space-y-6 max-w-[1500px] mx-auto">
      
      {/* Back to Leads Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentRoute('leads')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to CRM List
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm(`Delete ${b.business_name} permanently?`)) {
                deleteLead(b.id);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Lead
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Business Meta */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                {b.business_type}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                {b.ownership_type}
              </span>
              {b.provider_number && (
                <span className="text-[11px] font-mono text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E2E8F0]">
                  Provider: {b.provider_number}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
                {b.business_name}
              </h1>
              <button
                onClick={() => setIsEditHospitalOpen(true)}
                className="px-2.5 py-1 rounded-md bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#2563EB] font-bold text-xs flex items-center gap-1.5 transition-colors border border-[#E2E8F0] hover:border-[#BFDBFE]"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile & Mail Address
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#64748B] flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                {b.address}, {b.city} <strong className="text-[#0F172A]">{b.state}</strong> {b.postcode}
              </span>
              {b.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                  {b.phone}
                </span>
              )}
              {b.general_email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                  {b.general_email}
                </span>
              )}
            </div>
          </div>

          {/* Right Lead Scores & Pipeline Status Dropdown */}
          <div className="flex items-center gap-4 flex-wrap bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
            
            {/* Lead Score Widget */}
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] block mb-0.5">Lead Score</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-black ${scoreBadge.textColor}`}>
                  {l.lead_score}/10
                </span>
                <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${l.lead_score * 10}%` }}
                    className={`h-full ${scoreBadge.barColor} rounded-full`}
                  />
                </div>
              </div>
            </div>

            {/* Opportunity Score Widget */}
            <div className="text-center px-2 border-l border-[#E2E8F0]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] block mb-0.5">Website Opportunity</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${opp.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${opp.bgClass}`} />
                {opp.label} ({wa?.opportunity_score ?? 50}%)
              </span>
            </div>

            {/* Pipeline Status Select */}
            <div className="text-left px-2 border-l border-[#E2E8F0]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] block mb-0.5">Pipeline Stage</span>
              <select
                value={l.lead_status}
                onChange={(e) => {
                  const newStatus = e.target.value as LeadStatus;
                  updateLead(b.id, {
                    lead: { ...l, lead_status: newStatus },
                    activities: [
                      {
                        id: `act-${Date.now()}`,
                        business_id: b.id,
                        activity_type: 'status_changed',
                        description: `Status changed to ${newStatus}`,
                        user_name: 'You',
                        created_at: new Date().toISOString()
                      },
                      ...selectedLead.activities
                    ]
                  });
                }}
                className="bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-xs"
              >
                {[
                  'New', 'Researching', 'Qualified', 'Ready for Outreach', 'Contacted', 'Interested', 'Meeting', 'Proposal', 'Won', 'Lost', 'Disqualified'
                ].map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

          </div>

        </div>

        {/* Next Step Recommendation Banner */}
        <div className="mt-4 p-3.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#2563EB] text-white flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8]">
                  Recommended Next Action
                </span>
                <span className="font-bold text-xs text-[#0F172A]">• {nextStep.title}</span>
              </div>
              <p className="text-xs text-[#475569] mt-0.5">{nextStep.desc}</p>
            </div>
          </div>

          <button
            onClick={nextStep.action}
            className="h-8 px-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>{nextStep.actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto pb-0.5">
        {[
          { id: 'overview', label: 'Business Profile & Presence', icon: Building2 },
          { id: 'audit', label: 'Website Audit & Opportunity', icon: Globe, badge: `${wa?.opportunity_score ?? 50}%` },
          { id: 'decision-makers', label: 'Decision Makers', icon: UserCheck, badge: selectedLead.decision_makers.length },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: selectedLead.tasks.filter(t => t.status !== 'Completed').length || undefined },
          { id: 'activity', label: 'Activity Timeline', icon: ActivityIcon, badge: selectedLead.activities.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all shrink-0 ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Business Information & Digital Presence Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Digital Presence Grid (Website + Google Maps) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Website Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500">Official Website</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${opp.badgeClass}`}>
                      {dp.website_status}
                    </span>
                  </div>

                  {dp.website_url ? (
                    <div className="space-y-1">
                      <a
                        href={dp.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-blue-600 hover:underline break-all block"
                      >
                        {dp.website_url}
                      </a>
                      <p className="text-xs text-slate-400">Tech: {dp.website_technology || 'Custom PHP / Standard'}</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      <p className="text-sm font-bold text-rose-600 dark:text-rose-400">No Website Detected</p>
                      <p className="text-xs text-slate-400 mt-0.5">Primary high-value lead for new website build.</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                  {dp.website_url ? (
                    <a
                      href={dp.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Website
                    </a>
                  ) : (
                    <button
                      onClick={() => setActiveTab('audit')}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Create Proposal Mockup
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-xs text-slate-500 hover:text-blue-600 font-semibold"
                  >
                    View Audit Breakdown →
                  </button>
                </div>
              </div>

              {/* Google Maps Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500">Google Maps Presence</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                      dp.google_maps_verified === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {dp.google_maps_verified}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-base">
                      {dp.google_rating ? `★ ${dp.google_rating}` : 'N/A'}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        {dp.google_review_count || 0} Patient Reviews
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {dp.google_rating && dp.google_rating >= 4.5 ? 'Established high reputation' : 'Verified Google Business Listing'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                  {dp.google_maps_url ? (
                    <a
                      href={dp.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-red-500" /> Open Google Maps
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Maps listing pending</span>
                  )}
                </div>
              </div>

            </div>

            {/* Business Profile Details */}
            <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#0F172A]">Business Information</h3>
                <button
                  onClick={() => setIsEditHospitalOpen(true)}
                  className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-bold flex items-center gap-1 hover:underline"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Profile & Address
                </button>
              </div>
              
              {b.description && (
                <p className="text-xs text-[#475569] leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  {b.description}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#94A3B8] block mb-0.5">Category</span>
                  <p className="font-semibold text-[#0F172A]">{b.business_type}</p>
                </div>
                <div>
                  <span className="text-[#94A3B8] block mb-0.5">Subcategory</span>
                  <p className="font-semibold text-[#0F172A]">{b.subcategory || 'General'}</p>
                </div>
                <div>
                  <span className="text-[#94A3B8] block mb-0.5">Ownership</span>
                  <p className="font-semibold text-[#0F172A]">{b.ownership_type}</p>
                </div>
                <div>
                  <span className="text-[#94A3B8] block mb-0.5">Provider Number</span>
                  <p className="font-semibold text-[#0F172A]">{b.provider_number || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[#94A3B8] block mb-0.5">Phone Number</span>
                  <p className="font-semibold text-[#0F172A]">{b.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[#94A3B8] block mb-0.5">General Email</span>
                  <p className="font-semibold text-[#0F172A]">{b.general_email || 'N/A'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Col: Decision Makers Preview + Quick Notes */}
          <div className="space-y-6">
            
            {/* Decision Makers Widget */}
            <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#047857]" /> Decision Makers
                </h3>
                <button
                  onClick={() => setIsAddDMOpen(true)}
                  className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {selectedLead.decision_makers.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedLead.decision_makers.map(dm => (
                    <div key={dm.id} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#0F172A]">{dm.full_name}</p>
                            <button
                              onClick={() => setEditingDm(dm)}
                              className="text-[#94A3B8] hover:text-[#2563EB] transition-colors"
                              title="Edit decision maker"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[#64748B] text-[11px]">{dm.position}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          dm.priority === 'Primary' ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
                        }`}>
                          {dm.priority}
                        </span>
                      </div>
                      {dm.email && (
                        <p className="text-[#475569] text-[11px] mt-2 flex items-center gap-1 truncate font-mono">
                          <Mail className="w-3 h-3 text-[#94A3B8]" /> {dm.email}
                        </p>
                      )}
                      {dm.linkedin_url && (
                        <a
                          href={dm.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-[11px] mt-1 inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3 text-blue-600" /> LinkedIn Profile
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <p>No decision makers added yet.</p>
                  <button
                    onClick={() => setIsAddDMOpen(true)}
                    className="mt-2 text-blue-600 hover:underline font-semibold"
                  >
                    + Add Doctor / Practice Director
                  </button>
                </div>
              )}
            </div>

            {/* Quick Add Note Widget */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Add Dossier Note</h3>
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record research notes, call summaries, or website observations..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Save Note
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT 2: WEBSITE AUDIT (Sections 9, 10, 11) */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          
          {/* Audit Score Header Bar */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 rounded-3xl text-white border border-slate-800 shadow-card flex items-center justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                  Website Evaluation Engine
                </span>
                <span className="text-xs text-slate-300">• {dp.website_status}</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Opportunity Score: {wa?.opportunity_score ?? 50}/100
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {wa?.opportunity_score && wa.opportunity_score >= 80 
                  ? 'Prime target for high-converting medical website rebuild & online booking integrations.'
                  : 'Site quality analysis across Design, UX, Performance, and Conversion signals.'}
              </p>
            </div>

            <button
              onClick={() => setIsAuditEditOpen(!isAuditEditOpen)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Edit className="w-3.5 h-3.5" /> {isAuditEditOpen ? 'Close Audit Editor' : 'Edit Audit Scores'}
            </button>
          </div>

          {/* Audit Editor or Visual Display */}
          {isAuditEditOpen ? (
            /* Audit Editor Form */
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-6">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Edit Audit Evaluation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                
                {/* Design Scores */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white">Design Scores (0-10)</h4>
                  
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1">Visual Design: {wa?.visual_design_score ?? 5}/10</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={wa?.visual_design_score ?? 5}
                      onChange={(e) => saveWebsiteAudit(b.id, { visual_design_score: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1">Branding: {wa?.branding_score ?? 5}/10</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={wa?.branding_score ?? 5}
                      onChange={(e) => saveWebsiteAudit(b.id, { branding_score: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1">Typography: {wa?.typography_score ?? 5}/10</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={wa?.typography_score ?? 5}
                      onChange={(e) => saveWebsiteAudit(b.id, { typography_score: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1">Image Quality: {wa?.image_quality_score ?? 5}/10</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={wa?.image_quality_score ?? 5}
                      onChange={(e) => saveWebsiteAudit(b.id, { image_quality_score: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* UX Scores */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white">UX & Performance (0-10)</h4>
                  
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1">Mobile UX: {wa?.mobile_ux_score ?? 5}/10</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={wa?.mobile_ux_score ?? 5}
                      onChange={(e) => saveWebsiteAudit(b.id, { mobile_ux_score: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1">Navigation: {wa?.navigation_score ?? 5}/10</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={wa?.navigation_score ?? 5}
                      onChange={(e) => saveWebsiteAudit(b.id, { navigation_score: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1">User Journey: {wa?.user_journey_score ?? 5}/10</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={wa?.user_journey_score ?? 5}
                      onChange={(e) => saveWebsiteAudit(b.id, { user_journey_score: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1">Loading Speed: {wa?.loading_speed_score ?? 5}/10</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={wa?.loading_speed_score ?? 5}
                      onChange={(e) => saveWebsiteAudit(b.id, { loading_speed_score: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Conversion Features Checklist */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white">Conversion & Trust Signals</h4>
                  
                  <div className="space-y-2">
                    {[
                      { key: 'appointment_cta', label: 'Online Appointment Booking' },
                      { key: 'contact_cta', label: 'Prominent Contact CTA' },
                      { key: 'enquiry_form', label: 'Patient Enquiry Form' },
                      { key: 'testimonials', label: 'Patient Testimonials / Reviews' },
                      { key: 'trust_signals', label: 'AHPRA / RACGP Trust Signals' },
                      { key: 'service_information', label: 'Detailed Service Pages' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={Boolean((wa as any)?.[item.key])}
                          onChange={(e) => saveWebsiteAudit(b.id, { [item.key]: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* Notes Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">What I Noticed</label>
                  <textarea
                    rows={4}
                    value={wa?.what_i_noticed || ''}
                    onChange={(e) => saveWebsiteAudit(b.id, { what_i_noticed: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-medium text-slate-800 dark:text-slate-200"
                    placeholder="Specific design and technical flaws noted during manual review..."
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Recommended Improvements</label>
                  <textarea
                    rows={4}
                    value={wa?.recommended_improvements || ''}
                    onChange={(e) => saveWebsiteAudit(b.id, { recommended_improvements: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-medium text-slate-800 dark:text-slate-200"
                    placeholder="1. Redesign mobile layout\n2. Integrate Healthengine booking API..."
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Visual Audit Display */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Visual & UX Scores Bars */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Design & UX Performance</h3>
                
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Mobile UX', score: wa?.mobile_ux_score ?? 0 },
                    { label: 'Visual Design', score: wa?.visual_design_score ?? 0 },
                    { label: 'Navigation & Structure', score: wa?.navigation_score ?? 0 },
                    { label: 'Loading Speed & CWV', score: wa?.loading_speed_score ?? 0 },
                    { label: 'Branding & Aesthetics', score: wa?.branding_score ?? 0 }
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{item.label}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{item.score}/10</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${item.score * 10}%` }}
                          className={`h-full rounded-full ${
                            item.score <= 3 ? 'bg-rose-500' : item.score <= 6 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What I Noticed Box */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" /> What We Noticed
                  </h3>
                  <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[140px]">
                    {wa?.what_i_noticed || 'No audit notes entered yet. Click "Edit Audit Scores" above to add findings.'}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3">Observed by manual inspection and diagnostic scanners</p>
              </div>

              {/* Recommended Improvements */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Recommended Improvements
                  </h3>
                  <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[140px]">
                    {wa?.recommended_improvements || '1. Redesign mobile responsiveness\n2. Integrate online booking system\n3. High-definition practitioner profiles'}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3">Pitch talking points ready for client consultation</p>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT 3: DECISION MAKERS (Section 12) */}
      {activeTab === 'decision-makers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Decision Makers & Key Contacts</h3>
              <p className="text-xs text-slate-400">Owners, Medical Directors, Practice Managers, and Founders</p>
            </div>

            <button
              onClick={() => setIsAddDMOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" /> Add Decision Maker
            </button>
          </div>

          {/* DM Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedLead.decision_makers.length > 0 ? (
              selectedLead.decision_makers.map(dm => (
                <div
                  key={dm.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dm.priority === 'Primary' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {dm.priority} Decision Maker
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{dm.full_name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{dm.position}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingDm(dm)}
                          className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          title="Edit Profile & Email"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteDecisionMaker(b.id, dm.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3">
                      {dm.email && (
                        <p className="flex items-center gap-2 font-mono text-[11px] truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{dm.email}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {dm.email_verification_status}
                          </span>
                        </p>
                      )}
                      {dm.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                      {dm.notes && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg mt-2">
                          "{dm.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-slate-400">
                    Source: {dm.source || 'Direct Discovery'}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No decision makers found yet</p>
                <p className="text-slate-400 mt-0.5">Add practice directors or founders to prepare for outreach</p>
                <button
                  onClick={() => setIsAddDMOpen(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold"
                >
                  + Add Primary Contact
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: TASKS (Section 19) */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Tasks & Next Actions</h3>
              <p className="text-xs text-slate-400">Checklists, verification milestones, and scheduled outreach</p>
            </div>

            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle divide-y divide-slate-100 dark:divide-slate-800">
            {selectedLead.tasks.length > 0 ? (
              selectedLead.tasks.map(task => {
                const isCompleted = task.status === 'Completed';

                return (
                  <div key={task.id} className="p-4 flex items-center justify-between gap-4 text-xs group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) => updateTaskStatus(b.id, task.id, e.target.checked ? 'Completed' : 'Pending')}
                        className="mt-1 rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                      />
                      <div>
                        <p className={`font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-slate-500 text-[11px] mt-0.5">{task.description}</p>
                        )}
                        {task.due_date && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                            <Clock className="w-3 h-3" /> Due {task.due_date}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.priority === 'High' 
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' 
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                      }`}>
                        {task.priority} Priority
                      </span>
                      <button
                        onClick={() => deleteTask(b.id, task.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No active tasks</p>
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold"
                >
                  + Add First Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: ACTIVITY TIMELINE */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Activity Log & Audit Trail</h3>
          
          <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 dark:border-slate-800">
            {selectedLead.activities.map(act => (
              <div key={act.id} className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white" />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{act.description}</span>
                    <span className="text-[10px] text-slate-400">• by {act.user_name || 'You'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Decision Maker */}
      {isAddDMOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Decision Maker</h3>
            <form onSubmit={handleCreateDM} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={dmForm.full_name}
                  onChange={(e) => setDmForm({ ...dmForm, full_name: e.target.value })}
                  placeholder="e.g. Dr. John Howard"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Position / Title</label>
                  <input
                    type="text"
                    value={dmForm.position}
                    onChange={(e) => setDmForm({ ...dmForm, position: e.target.value })}
                    placeholder="e.g. Managing Partner"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Role Type</label>
                  <select
                    value={dmForm.role_type}
                    onChange={(e) => setDmForm({ ...dmForm, role_type: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                  >
                    {['Owner', 'Founder', 'CEO', 'Managing Director', 'Director', 'Marketing Manager', 'Head of Marketing', 'Practice Manager', 'Medical Director', 'Other'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Direct Email</label>
                <input
                  type="email"
                  value={dmForm.email}
                  onChange={(e) => setDmForm({ ...dmForm, email: e.target.value })}
                  placeholder="doctor@practice.com.au"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Direct Phone</label>
                  <input
                    type="text"
                    value={dmForm.phone}
                    onChange={(e) => setDmForm({ ...dmForm, phone: e.target.value })}
                    placeholder="0412 000 000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={dmForm.priority}
                    onChange={(e) => setDmForm({ ...dmForm, priority: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                  >
                    <option value="Primary">Primary Decision Maker</option>
                    <option value="Secondary">Secondary Contact</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">LinkedIn URL</label>
                <input
                  type="url"
                  value={dmForm.linkedin_url}
                  onChange={(e) => setDmForm({ ...dmForm, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddDMOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save Decision Maker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Create Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Call Practice Manager / Audit mobile menu"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Specific action items..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Decision Maker Modal */}
      <EditDecisionMakerModal
        isOpen={Boolean(editingDm)}
        onClose={() => setEditingDm(null)}
        businessId={b.id}
        businessName={b.business_name}
        decisionMaker={editingDm}
      />

      {/* Edit Hospital / Facility Modal */}
      <EditHospitalModal
        isOpen={isEditHospitalOpen}
        onClose={() => setIsEditHospitalOpen(false)}
        lead={selectedLead}
      />

    </div>
  );
}
