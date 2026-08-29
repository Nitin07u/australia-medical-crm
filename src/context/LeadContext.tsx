import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { 
  LeadFull, 
  LeadFilterState, 
  LeadSortState, 
  Tag, 
  LeadStatus, 
  BusinessType, 
  WebsiteStatus,
  DuplicateCandidate,
  TaskPriority,
  TaskStatus,
  DecisionMaker
} from '../types';
import * as leadService from '../services/leadService';
import * as websiteAuditService from '../services/websiteAuditService';
import * as decisionMakerService from '../services/decisionMakerService';
import * as taskService from '../services/taskService';
import * as tagService from '../services/tagService';
import * as storage from '../services/storage';
import { useToast } from './ToastContext';

export type ActiveRoute = 
  | 'dashboard'
  | 'leads'
  | 'hospitals'
  | 'clinics'
  | 'medical-centres'
  | 'medical-equipment'
  | 'website-audit'
  | 'decision-makers'
  | 'tasks'
  | 'import-leads'
  | 'settings'
  | 'lead-detail';

const INITIAL_FILTER: LeadFilterState = {
  searchQuery: '',
  businessTypes: [],
  ownershipTypes: [],
  states: [],
  websiteStatuses: [],
  googleMapsStatuses: [],
  decisionMakerFound: null,
  scoreRange: undefined,
  leadStatuses: [],
  tagIds: []
};

const INITIAL_SORT: LeadSortState = {
  field: 'created_at',
  order: 'desc'
};

interface LeadContextType {
  // Navigation & View
  currentRoute: ActiveRoute;
  setCurrentRoute: (route: ActiveRoute) => void;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  openLeadDetail: (id: string) => void;
  
  // Data
  leads: LeadFull[];
  filteredLeads: LeadFull[];
  tags: Tag[];
  selectedLead: LeadFull | undefined;
  
  // Filter & Sort
  filters: LeadFilterState;
  setFilters: React.Dispatch<React.SetStateAction<LeadFilterState>>;
  sort: LeadSortState;
  setSort: React.Dispatch<React.SetStateAction<LeadSortState>>;
  resetFilters: () => void;
  activeFilterCount: number;
  
  // Selection
  selectedLeadIds: string[];
  setSelectedLeadIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelectLead: (id: string) => void;
  selectAllFiltered: () => void;
  clearSelection: () => void;
  
  // Modals & Drawers
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isFilterDrawerOpen: boolean;
  setIsFilterDrawerOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  
  // CRUD Actions
  createLead: (lead: LeadFull) => LeadFull;
  updateLead: (id: string, updates: Partial<LeadFull>) => LeadFull | null;
  deleteLead: (id: string) => void;
  bulkUpdateStatus: (status: LeadStatus) => void;
  bulkUpdateBusinessType: (type: BusinessType) => void;
  bulkUpdateWebsiteStatus: (status: WebsiteStatus) => void;
  bulkAssignScore: (score: number) => void;
  bulkAddTag: (tag: Tag) => void;
  bulkDeleteLeads: () => void;
  
  // Audit, DM, Tasks
  saveWebsiteAudit: (businessId: string, audit: any) => void;
  addDecisionMaker: (businessId: string, dm: any) => void;
  updateDecisionMaker: (businessId: string, dmId: string, updates: any) => void;
  deleteDecisionMaker: (businessId: string, dmId: string) => void;
  addTask: (businessId: string, task: { title: string; description?: string; due_date?: string; priority: TaskPriority }) => void;
  updateTaskStatus: (businessId: string, taskId: string, status: TaskStatus) => void;
  deleteTask: (businessId: string, taskId: string) => void;
  
  // Tags
  createTag: (name: string, color?: string) => Tag;
  deleteTag: (tagId: string) => void;
  
  // System / Reset
  refreshLeads: () => void;
  resetDemoData: () => void;
  checkDuplicates: (candidate: any, excludeId?: string) => DuplicateCandidate[];
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [currentRoute, setCurrentRoute] = useState<ActiveRoute>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  
  const [leads, setLeads] = useState<LeadFull[]>(() => leadService.getAllLeads());
  const [tags, setTags] = useState<Tag[]>(() => tagService.getAllTags());
  
  const [filters, setFilters] = useState<LeadFilterState>(INITIAL_FILTER);
  const [sort, setSort] = useState<LeadSortState>(INITIAL_SORT);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const refreshLeads = useCallback(() => {
    setLeads(leadService.getAllLeads());
    setTags(tagService.getAllTags());
  }, []);

  const openLeadDetail = useCallback((id: string) => {
    setSelectedLeadId(id);
    setCurrentRoute('lead-detail');
  }, []);

  // Compute filtered leads
  const filteredLeads = useMemo(() => {
    return leadService.filterAndSortLeads(leads, filters, sort);
  }, [leads, filters, sort]);

  // Selected lead object
  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return undefined;
    return leads.find(l => l.business.id === selectedLeadId || l.lead.id === selectedLeadId);
  }, [leads, selectedLeadId]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.businessTypes.length) count += filters.businessTypes.length;
    if (filters.ownershipTypes.length) count += filters.ownershipTypes.length;
    if (filters.states.length) count += filters.states.length;
    if (filters.websiteStatuses.length) count += filters.websiteStatuses.length;
    if (filters.googleMapsStatuses.length) count += filters.googleMapsStatuses.length;
    if (filters.decisionMakerFound !== null && filters.decisionMakerFound !== undefined) count++;
    if (filters.scoreRange) count++;
    if (filters.leadStatuses.length) count += filters.leadStatuses.length;
    if (filters.tagIds.length) count += filters.tagIds.length;
    return count;
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTER);
  }, []);

  // Selection handlers
  const toggleSelectLead = useCallback((id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const selectAllFiltered = useCallback(() => {
    setSelectedLeadIds(filteredLeads.map(l => l.business.id));
  }, [filteredLeads]);

  const clearSelection = useCallback(() => {
    setSelectedLeadIds([]);
  }, []);

  // Actions
  const handleCreateLead = useCallback((newLead: LeadFull): LeadFull => {
    const created = leadService.createLead(newLead);
    refreshLeads();
    showToast({
      type: 'success',
      title: 'Lead Created Successfully',
      message: `${created.business.business_name} added to CRM`
    });
    return created;
  }, [refreshLeads, showToast]);

  const handleUpdateLead = useCallback((id: string, updates: Partial<LeadFull>): LeadFull | null => {
    const updated = leadService.updateLead(id, updates);
    refreshLeads();
    return updated;
  }, [refreshLeads]);

  const handleDeleteLead = useCallback((id: string) => {
    leadService.deleteLead(id);
    refreshLeads();
    if (selectedLeadId === id) {
      setSelectedLeadId(null);
      setCurrentRoute('leads');
    }
    showToast({
      type: 'info',
      title: 'Lead Deleted',
      message: 'Business record removed from CRM'
    });
  }, [refreshLeads, selectedLeadId, showToast]);

  // Bulk Actions
  const handleBulkUpdateStatus = useCallback((status: LeadStatus) => {
    if (selectedLeadIds.length === 0) return;
    leadService.bulkUpdateStatus(selectedLeadIds, status);
    refreshLeads();
    showToast({
      type: 'success',
      title: 'Bulk Status Updated',
      message: `Updated status to "${status}" for ${selectedLeadIds.length} leads`
    });
    clearSelection();
  }, [selectedLeadIds, refreshLeads, showToast, clearSelection]);

  const handleBulkUpdateBusinessType = useCallback((type: BusinessType) => {
    if (selectedLeadIds.length === 0) return;
    leadService.bulkUpdateBusinessType(selectedLeadIds, type);
    refreshLeads();
    showToast({
      type: 'success',
      title: 'Bulk Category Updated',
      message: `Updated category to "${type}" for ${selectedLeadIds.length} leads`
    });
    clearSelection();
  }, [selectedLeadIds, refreshLeads, showToast, clearSelection]);

  const handleBulkUpdateWebsiteStatus = useCallback((status: WebsiteStatus) => {
    if (selectedLeadIds.length === 0) return;
    leadService.bulkUpdateWebsiteStatus(selectedLeadIds, status);
    refreshLeads();
    showToast({
      type: 'success',
      title: 'Bulk Website Status Updated',
      message: `Updated website status to "${status}" for ${selectedLeadIds.length} leads`
    });
    clearSelection();
  }, [selectedLeadIds, refreshLeads, showToast, clearSelection]);

  const handleBulkAssignScore = useCallback((score: number) => {
    if (selectedLeadIds.length === 0) return;
    leadService.bulkAssignScore(selectedLeadIds, score);
    refreshLeads();
    showToast({
      type: 'success',
      title: 'Bulk Score Assigned',
      message: `Assigned Lead Score ${score}/10 to ${selectedLeadIds.length} leads`
    });
    clearSelection();
  }, [selectedLeadIds, refreshLeads, showToast, clearSelection]);

  const handleBulkAddTag = useCallback((tag: Tag) => {
    if (selectedLeadIds.length === 0) return;
    leadService.bulkAddTag(selectedLeadIds, tag);
    refreshLeads();
    showToast({
      type: 'success',
      title: 'Tag Added in Bulk',
      message: `Added tag "${tag.name}" to ${selectedLeadIds.length} leads`
    });
    clearSelection();
  }, [selectedLeadIds, refreshLeads, showToast, clearSelection]);

  const handleBulkDeleteLeads = useCallback(() => {
    if (selectedLeadIds.length === 0) return;
    const count = selectedLeadIds.length;
    leadService.bulkDeleteLeads(selectedLeadIds);
    refreshLeads();
    clearSelection();
    showToast({
      type: 'info',
      title: 'Bulk Deletion Complete',
      message: `Removed ${count} leads from CRM`
    });
  }, [selectedLeadIds, refreshLeads, clearSelection, showToast]);

  // Website Audit
  const handleSaveWebsiteAudit = useCallback((businessId: string, audit: any) => {
    websiteAuditService.saveWebsiteAudit(businessId, audit);
    refreshLeads();
    showToast({
      type: 'success',
      title: 'Website Audit Saved',
      message: 'Scores and opportunities recomputed successfully'
    });
  }, [refreshLeads, showToast]);

  // Decision Makers
  const handleAddDecisionMaker = useCallback((businessId: string, dm: any) => {
    decisionMakerService.addDecisionMaker(businessId, dm);
    refreshLeads();
    showToast({
      type: 'success',
      title: 'Decision Maker Added',
      message: `${dm.full_name} added to contacts`
    });
  }, [refreshLeads, showToast]);

  const handleUpdateDecisionMaker = useCallback((businessId: string, dmId: string, updates: any) => {
    decisionMakerService.updateDecisionMaker(businessId, dmId, updates);
    refreshLeads();
    showToast({
      type: 'success',
      title: 'Decision Maker Updated',
      message: 'Contact details saved'
    });
  }, [refreshLeads, showToast]);

  const handleDeleteDecisionMaker = useCallback((businessId: string, dmId: string) => {
    decisionMakerService.deleteDecisionMaker(businessId, dmId);
    refreshLeads();
    showToast({
      type: 'info',
      title: 'Contact Removed',
      message: 'Decision maker deleted from lead'
    });
  }, [refreshLeads, showToast]);

  // Tasks
  const handleAddTask = useCallback((businessId: string, task: any) => {
    taskService.addTask(businessId, task);
    refreshLeads();
    showToast({
      type: 'success',
      title: 'Task Created',
      message: `"${task.title}" scheduled`
    });
  }, [refreshLeads, showToast]);

  const handleUpdateTaskStatus = useCallback((businessId: string, taskId: string, status: TaskStatus) => {
    taskService.updateTaskStatus(businessId, taskId, status);
    refreshLeads();
    showToast({
      type: 'info',
      title: 'Task Updated',
      message: `Status changed to ${status}`
    });
  }, [refreshLeads, showToast]);

  const handleDeleteTask = useCallback((businessId: string, taskId: string) => {
    taskService.deleteTask(businessId, taskId);
    refreshLeads();
    showToast({
      type: 'info',
      title: 'Task Deleted',
      message: 'Task removed'
    });
  }, [refreshLeads, showToast]);

  // Tags
  const handleCreateTag = useCallback((name: string, color?: string) => {
    const created = tagService.createTag(name, color);
    setTags(tagService.getAllTags());
    return created;
  }, []);

  const handleDeleteTag = useCallback((tagId: string) => {
    tagService.deleteTag(tagId);
    refreshLeads();
  }, [refreshLeads]);

  // Reset Demo Data
  const handleResetDemoData = useCallback(() => {
    const { leads: newLeads, tags: newTags } = storage.resetToDemoData();
    setLeads(newLeads);
    setTags(newTags);
    setSelectedLeadIds([]);
    setSelectedLeadId(null);
    showToast({
      type: 'success',
      title: 'Demo Data Reset',
      message: 'Restored 30 realistic Australian medical leads'
    });
  }, [showToast]);

  // Duplicate checker helper
  const handleCheckDuplicates = useCallback((candidate: any, excludeId?: string) => {
    return leadService.checkDuplicates(candidate, leads, excludeId);
  }, [leads]);

  return (
    <LeadContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        selectedLeadId,
        setSelectedLeadId,
        openLeadDetail,
        leads,
        filteredLeads,
        tags,
        selectedLead,
        filters,
        setFilters,
        sort,
        setSort,
        resetFilters,
        activeFilterCount,
        selectedLeadIds,
        setSelectedLeadIds,
        toggleSelectLead,
        selectAllFiltered,
        clearSelection,
        isAddModalOpen,
        setIsAddModalOpen,
        isFilterDrawerOpen,
        setIsFilterDrawerOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        createLead: handleCreateLead,
        updateLead: handleUpdateLead,
        deleteLead: handleDeleteLead,
        bulkUpdateStatus: handleBulkUpdateStatus,
        bulkUpdateBusinessType: handleBulkUpdateBusinessType,
        bulkUpdateWebsiteStatus: handleBulkUpdateWebsiteStatus,
        bulkAssignScore: handleBulkAssignScore,
        bulkAddTag: handleBulkAddTag,
        bulkDeleteLeads: handleBulkDeleteLeads,
        saveWebsiteAudit: handleSaveWebsiteAudit,
        addDecisionMaker: handleAddDecisionMaker,
        updateDecisionMaker: handleUpdateDecisionMaker,
        deleteDecisionMaker: handleDeleteDecisionMaker,
        addTask: handleAddTask,
        updateTaskStatus: handleUpdateTaskStatus,
        deleteTask: handleDeleteTask,
        createTag: handleCreateTag,
        deleteTag: handleDeleteTag,
        refreshLeads,
        resetDemoData: handleResetDemoData,
        checkDuplicates: handleCheckDuplicates
      }}
    >
      {children}
    </LeadContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}
