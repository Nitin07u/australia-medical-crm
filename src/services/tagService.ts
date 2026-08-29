import { Tag } from '../types';
import { loadStoredTags, saveStoredTags, saveStoredLeads } from './storage';
import { getAllLeads } from './leadService';

export function getAllTags(): Tag[] {
  return loadStoredTags();
}

export function createTag(name: string, color: string = 'blue'): Tag {
  const tags = getAllTags();
  const existing = tags.find(t => t.name.toLowerCase() === name.toLowerCase().trim());
  if (existing) return existing;

  const newTag: Tag = {
    id: `tag-${Date.now()}`,
    name: name.trim(),
    color,
    created_at: new Date().toISOString()
  };

  const updated = [...tags, newTag];
  saveStoredTags(updated);
  return newTag;
}

export function deleteTag(tagId: string): void {
  const tags = getAllTags();
  const filteredTags = tags.filter(t => t.id !== tagId);
  saveStoredTags(filteredTags);

  // Remove from leads
  const leads = getAllLeads();
  leads.forEach(l => {
    l.tags = l.tags.filter(t => t.id !== tagId);
  });
  saveStoredLeads(leads);
}
