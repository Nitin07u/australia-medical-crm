import { 
  LeadFull, 
  LeadFilterState, 
  LeadSortState, 
  DuplicateCandidate, 
  LeadStatus, 
  BusinessType, 
  WebsiteStatus,
  Activity,
  Tag
} from '../types';
import { loadStoredLeads, saveStoredLeads } from './storage';
import { calculateOpportunityScore, calculateLeadScore } from './auditCalculator';

export function getAllLeads(): LeadFull[] {
  return loadStoredLeads();
}

export function getLeadById(id: string): LeadFull | undefined {
  const leads = getAllLeads();
  return leads.find(l => l.business.id === id || l.lead.id === id);
}

/**
 * Filter, sort, and search leads
 */
export function filterAndSortLeads(
  leads: LeadFull[],
  filter: LeadFilterState,
  sort: LeadSortState
): LeadFull[] {
  let result = [...leads];

  // 1. Global Search query
  if (filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase().trim();
    result = result.filter(lead => {
      const b = lead.business;
      const dp = lead.digital_presence;
      const dms = lead.decision_makers;
      const tags = lead.tags;

      const matchName = b.business_name.toLowerCase().includes(q);
      const matchCity = b.city.toLowerCase().includes(q);
      const matchState = b.state.toLowerCase().includes(q);
      const matchAddress = b.address.toLowerCase().includes(q);
      const matchAbn = b.abn ? b.abn.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) : false;
      const matchWebsite = dp.website_url ? dp.website_url.toLowerCase().includes(q) : false;
      const matchEmail = b.general_email ? b.general_email.toLowerCase().includes(q) : false;
      const matchDM = dms.some(dm => 
        dm.full_name.toLowerCase().includes(q) || 
        (dm.email && dm.email.toLowerCase().includes(q)) ||
        dm.position.toLowerCase().includes(q)
      );
      const matchTag = tags.some(t => t.name.toLowerCase().includes(q));

      return matchName || matchCity || matchState || matchAddress || matchAbn || matchWebsite || matchEmail || matchDM || matchTag;
    });
  }

  // 2. Business Type filter
  if (filter.businessTypes.length > 0) {
    result = result.filter(l => filter.businessTypes.includes(l.business.business_type));
  }

  // 3. Ownership Type filter
  if (filter.ownershipTypes.length > 0) {
    result = result.filter(l => filter.ownershipTypes.includes(l.business.ownership_type));
  }

  // 4. Australian State filter
  if (filter.states.length > 0) {
    result = result.filter(l => filter.states.includes(l.business.state));
  }

  // 5. Website Status filter
  if (filter.websiteStatuses.length > 0) {
    result = result.filter(l => filter.websiteStatuses.includes(l.digital_presence.website_status));
  }

  // 6. Google Maps Status filter
  if (filter.googleMapsStatuses.length > 0) {
    result = result.filter(l => filter.googleMapsStatuses.includes(l.digital_presence.google_maps_verified));
  }

  // 7. Decision Maker Found filter
  if (filter.decisionMakerFound !== undefined && filter.decisionMakerFound !== null) {
    result = result.filter(l => {
      const hasDM = l.decision_makers.length > 0;
      return filter.decisionMakerFound ? hasDM : !hasDM;
    });
  }

  // 8. Lead Score Range filter
  if (filter.scoreRange) {
    const [min, max] = filter.scoreRange;
    result = result.filter(l => l.lead.lead_score >= min && l.lead.lead_score <= max);
  }

  // 9. Lead Status filter
  if (filter.leadStatuses.length > 0) {
    result = result.filter(l => filter.leadStatuses.includes(l.lead.lead_status));
  }

  // 10. Tags filter
  if (filter.tagIds.length > 0) {
    result = result.filter(l => l.tags.some(t => filter.tagIds.includes(t.id)));
  }

  // Sorting
  result.sort((a, b) => {
    let comparison = 0;

    switch (sort.field) {
      case 'lead_score':
        comparison = a.lead.lead_score - b.lead.lead_score;
        break;
      case 'opportunity_score':
        const oppA = a.website_audit?.opportunity_score ?? 0;
        const oppB = b.website_audit?.opportunity_score ?? 0;
        comparison = oppA - oppB;
        break;
      case 'business_name':
        comparison = a.business.business_name.localeCompare(b.business.business_name);
        break;
      case 'business_type':
        comparison = a.business.business_type.localeCompare(b.business.business_type);
        break;
      case 'state':
        comparison = a.business.state.localeCompare(b.business.state);
        break;
      case 'city':
        comparison = a.business.city.localeCompare(b.business.city);
        break;
      case 'website_status':
        comparison = a.digital_presence.website_status.localeCompare(b.digital_presence.website_status);
        break;
      case 'created_at':
      default:
        comparison = new Date(a.business.created_at).getTime() - new Date(b.business.created_at).getTime();
        break;
    }

    return sort.order === 'asc' ? comparison : -comparison;
  });

  return result;
}

/**
 * Check for duplicate leads across ABN, Name + Address, Domain, Phone
 */
export function checkDuplicates(
  newLead: {
    abn?: string;
    business_name: string;
    address: string;
    city: string;
    state: string;
    website_url?: string;
    phone?: string;
  },
  existingLeads: LeadFull[],
  excludeBusinessId?: string
): DuplicateCandidate[] {
  const duplicates: DuplicateCandidate[] = [];
  const leadsToCheck = excludeBusinessId 
    ? existingLeads.filter(l => l.business.id !== excludeBusinessId)
    : existingLeads;

  // 1. Check ABN match
  if (newLead.abn && newLead.abn.trim()) {
    const cleanAbn = newLead.abn.replace(/\s+/g, '');
    const abnMatch = leadsToCheck.find(l => 
      l.business.abn && l.business.abn.replace(/\s+/g, '') === cleanAbn
    );
    if (abnMatch) {
      duplicates.push({
        field: 'abn',
        matchedValue: `ABN: ${newLead.abn}`,
        existingLead: abnMatch
      });
    }
  }

  // 2. Check Website Domain match
  if (newLead.website_url && newLead.website_url.trim()) {
    try {
      const cleanUrl = newLead.website_url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      if (cleanUrl.length > 3) {
        const domainMatch = leadsToCheck.find(l => {
          if (!l.digital_presence.website_url) return false;
          const exClean = l.digital_presence.website_url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
          return exClean === cleanUrl;
        });
        if (domainMatch && !duplicates.some(d => d.existingLead.business.id === domainMatch.business.id)) {
          duplicates.push({
            field: 'domain',
            matchedValue: `Domain: ${cleanUrl}`,
            existingLead: domainMatch
          });
        }
      }
    } catch {
      // Ignore URL parse error
    }
  }

  // 3. Check Phone match
  if (newLead.phone && newLead.phone.trim()) {
    const cleanPhone = newLead.phone.replace(/\D/g, '');
    if (cleanPhone.length >= 8) {
      const phoneMatch = leadsToCheck.find(l => {
        if (!l.business.phone) return false;
        return l.business.phone.replace(/\D/g, '') === cleanPhone;
      });
      if (phoneMatch && !duplicates.some(d => d.existingLead.business.id === phoneMatch.business.id)) {
        duplicates.push({
          field: 'phone',
          matchedValue: `Phone: ${newLead.phone}`,
          existingLead: phoneMatch
        });
      }
    }
  }

  // 4. Check Business Name + City/State match
  const nameNorm = newLead.business_name.toLowerCase().trim();
  const cityNorm = newLead.city.toLowerCase().trim();
  const nameMatch = leadsToCheck.find(l => {
    const exName = l.business.business_name.toLowerCase().trim();
    const exCity = l.business.city.toLowerCase().trim();
    return exName === nameNorm && (exCity === cityNorm || l.business.state === newLead.state);
  });
  if (nameMatch && !duplicates.some(d => d.existingLead.business.id === nameMatch.business.id)) {
    duplicates.push({
      field: 'name_address',
      matchedValue: `Name & Location: ${newLead.business_name} (${newLead.city}, ${newLead.state})`,
      existingLead: nameMatch
    });
  }

  return duplicates;
}

/**
 * Save / Create new lead
 */
export function createLead(newLead: LeadFull): LeadFull {
  const leads = getAllLeads();
  const timestamp = new Date().toISOString();

  // Auto calculate opportunity score & lead score
  const oppScore = newLead.website_audit 
    ? calculateOpportunityScore(newLead.digital_presence, newLead.website_audit)
    : calculateOpportunityScore(newLead.digital_presence);

  const calculatedLeadScore = calculateLeadScore(
    newLead.digital_presence,
    oppScore,
    newLead.decision_makers,
    newLead.digital_presence.google_rating,
    newLead.digital_presence.google_review_count
  );

  const leadToSave: LeadFull = {
    ...newLead,
    business: {
      ...newLead.business,
      created_at: newLead.business.created_at || timestamp,
      updated_at: timestamp
    },
    lead: {
      ...newLead.lead,
      lead_score: newLead.lead.lead_score || calculatedLeadScore,
      created_at: newLead.lead.created_at || timestamp,
      updated_at: timestamp
    },
    website_audit: newLead.website_audit ? {
      ...newLead.website_audit,
      opportunity_score: oppScore,
      created_at: newLead.website_audit.created_at || timestamp,
      updated_at: timestamp
    } : undefined,
    activities: [
      {
        id: `act-${Date.now()}`,
        business_id: newLead.business.id,
        activity_type: 'lead_created',
        description: `Lead created for ${newLead.business.business_name}`,
        user_name: 'You',
        created_at: timestamp
      },
      ...(newLead.activities || [])
    ]
  };

  const updatedLeads = [leadToSave, ...leads];
  saveStoredLeads(updatedLeads);
  return leadToSave;
}

/**
 * Update existing lead
 */
export function updateLead(id: string, updates: Partial<LeadFull>): LeadFull | null {
  const leads = getAllLeads();
  const index = leads.findIndex(l => l.business.id === id || l.lead.id === id);
  if (index === -1) return null;

  const current = leads[index];
  const timestamp = new Date().toISOString();

  const mergedBusiness = updates.business ? { ...current.business, ...updates.business, updated_at: timestamp } : current.business;
  const mergedDigital = updates.digital_presence ? { ...current.digital_presence, ...updates.digital_presence, updated_at: timestamp } : current.digital_presence;
  const mergedAudit = updates.website_audit ? { ...current.website_audit, ...updates.website_audit, updated_at: timestamp } : current.website_audit;
  const mergedDMs = updates.decision_makers ?? current.decision_makers;
  const mergedTasks = updates.tasks ?? current.tasks;
  const mergedTags = updates.tags ?? current.tags;
  const mergedActivities = updates.activities ?? current.activities;

  // Recalculate scores if audit or digital presence changed
  const oppScore = mergedAudit 
    ? calculateOpportunityScore(mergedDigital, mergedAudit)
    : calculateOpportunityScore(mergedDigital);

  const autoLeadScore = calculateLeadScore(
    mergedDigital,
    oppScore,
    mergedDMs,
    mergedDigital.google_rating,
    mergedDigital.google_review_count
  );

  const updatedLeadRecord = updates.lead 
    ? { ...current.lead, ...updates.lead, updated_at: timestamp }
    : { ...current.lead, lead_score: current.lead.lead_score || autoLeadScore, updated_at: timestamp };

  const updatedItem: LeadFull = {
    business: mergedBusiness,
    digital_presence: mergedDigital,
    lead: updatedLeadRecord,
    website_audit: mergedAudit ? { ...mergedAudit, opportunity_score: oppScore } : undefined,
    decision_makers: mergedDMs,
    tasks: mergedTasks,
    activities: mergedActivities,
    tags: mergedTags
  };

  leads[index] = updatedItem;
  saveStoredLeads(leads);
  return updatedItem;
}

/**
 * Delete a lead
 */
export function deleteLead(businessId: string): boolean {
  const leads = getAllLeads();
  const filtered = leads.filter(l => l.business.id !== businessId);
  saveStoredLeads(filtered);
  return true;
}

/**
 * Bulk actions
 */
export function bulkUpdateStatus(businessIds: string[], status: LeadStatus): void {
  const leads = getAllLeads();
  const timestamp = new Date().toISOString();
  leads.forEach(l => {
    if (businessIds.includes(l.business.id)) {
      l.lead.lead_status = status;
      l.lead.updated_at = timestamp;
      l.activities.unshift({
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        business_id: l.business.id,
        activity_type: 'status_changed',
        description: `Lead status changed to ${status}`,
        user_name: 'You',
        created_at: timestamp
      });
    }
  });
  saveStoredLeads(leads);
}

export function bulkUpdateBusinessType(businessIds: string[], type: BusinessType): void {
  const leads = getAllLeads();
  const timestamp = new Date().toISOString();
  leads.forEach(l => {
    if (businessIds.includes(l.business.id)) {
      l.business.business_type = type;
      l.business.updated_at = timestamp;
    }
  });
  saveStoredLeads(leads);
}

export function bulkUpdateWebsiteStatus(businessIds: string[], status: WebsiteStatus): void {
  const leads = getAllLeads();
  const timestamp = new Date().toISOString();
  leads.forEach(l => {
    if (businessIds.includes(l.business.id)) {
      l.digital_presence.website_status = status;
      l.digital_presence.updated_at = timestamp;
      if (l.website_audit) {
        l.website_audit.opportunity_score = calculateOpportunityScore(l.digital_presence, l.website_audit);
      }
    }
  });
  saveStoredLeads(leads);
}

export function bulkAssignScore(businessIds: string[], score: number): void {
  const leads = getAllLeads();
  const timestamp = new Date().toISOString();
  leads.forEach(l => {
    if (businessIds.includes(l.business.id)) {
      l.lead.lead_score = Math.max(1, Math.min(10, score));
      l.lead.updated_at = timestamp;
      l.activities.unshift({
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        business_id: l.business.id,
        activity_type: 'score_updated',
        description: `Lead score manually assigned to ${score}/10`,
        user_name: 'You',
        created_at: timestamp
      });
    }
  });
  saveStoredLeads(leads);
}

export function bulkAddTag(businessIds: string[], tag: Tag): void {
  const leads = getAllLeads();
  leads.forEach(l => {
    if (businessIds.includes(l.business.id)) {
      if (!l.tags.some(t => t.id === tag.id)) {
        l.tags.push(tag);
      }
    }
  });
  saveStoredLeads(leads);
}

export function bulkDeleteLeads(businessIds: string[]): void {
  const leads = getAllLeads();
  const remaining = leads.filter(l => !businessIds.includes(l.business.id));
  saveStoredLeads(remaining);
}
