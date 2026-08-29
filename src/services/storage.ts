import { LeadFull, Tag } from '../types';
import { MOCK_LEADS, INITIAL_TAGS } from './mockData';

const LEADS_STORAGE_KEY = 'medlead_crm_leads_v2';
const TAGS_STORAGE_KEY = 'medlead_crm_tags_v2';

export function loadStoredLeads(): LeadFull[] {
  try {
    const saved = localStorage.getItem(LEADS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading stored leads from localStorage:', error);
  }
  // Fallback to default realistic 30 leads
  saveStoredLeads(MOCK_LEADS);
  return MOCK_LEADS;
}

export function saveStoredLeads(leads: LeadFull[]): void {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch (error) {
    console.error('Error saving leads to localStorage:', error);
  }
}

export function loadStoredTags(): Tag[] {
  try {
    const saved = localStorage.getItem(TAGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading stored tags:', error);
  }
  saveStoredTags(INITIAL_TAGS);
  return INITIAL_TAGS;
}

export function saveStoredTags(tags: Tag[]): void {
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  } catch (error) {
    console.error('Error saving tags to localStorage:', error);
  }
}

export function resetToDemoData(): { leads: LeadFull[]; tags: Tag[] } {
  localStorage.removeItem(LEADS_STORAGE_KEY);
  localStorage.removeItem(TAGS_STORAGE_KEY);
  saveStoredLeads(MOCK_LEADS);
  saveStoredTags(INITIAL_TAGS);
  return {
    leads: MOCK_LEADS,
    tags: INITIAL_TAGS
  };
}

export function clearAllData(): void {
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify([]));
}
