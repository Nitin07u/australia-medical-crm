import { DecisionMaker } from '../types';
import { getAllLeads, updateLead } from './leadService';

export function getDecisionMakers(businessId: string): DecisionMaker[] {
  const leads = getAllLeads();
  const found = leads.find(l => l.business.id === businessId);
  return found?.decision_makers || [];
}

export function getAllDecisionMakers(): { decisionMaker: DecisionMaker; businessName: string; businessId: string; state: string }[] {
  const leads = getAllLeads();
  const result: { decisionMaker: DecisionMaker; businessName: string; businessId: string; state: string }[] = [];

  leads.forEach(l => {
    l.decision_makers.forEach(dm => {
      result.push({
        decisionMaker: dm,
        businessName: l.business.business_name,
        businessId: l.business.id,
        state: l.business.state
      });
    });
  });

  return result;
}

export function addDecisionMaker(businessId: string, data: Omit<DecisionMaker, 'id' | 'business_id' | 'created_at' | 'updated_at'>): DecisionMaker | null {
  const leads = getAllLeads();
  const found = leads.find(l => l.business.id === businessId);
  if (!found) return null;

  const timestamp = new Date().toISOString();
  const newDM: DecisionMaker = {
    id: `dm-${Date.now()}`,
    business_id: businessId,
    ...data,
    created_at: timestamp,
    updated_at: timestamp
  };

  // If new DM is Primary, demote other primaries to secondary
  let dms = [...found.decision_makers];
  if (newDM.priority === 'Primary') {
    dms = dms.map(d => ({ ...d, priority: 'Secondary' as const }));
  }
  dms.push(newDM);

  const updatedActivities = [
    {
      id: `act-${Date.now()}`,
      business_id: businessId,
      activity_type: 'decision_maker_added' as const,
      description: `Added decision maker: ${newDM.full_name} (${newDM.position})`,
      user_name: 'You',
      created_at: timestamp
    },
    ...found.activities
  ];

  updateLead(businessId, {
    decision_makers: dms,
    activities: updatedActivities
  });

  return newDM;
}

export function updateDecisionMaker(businessId: string, dmId: string, updates: Partial<DecisionMaker>): DecisionMaker | null {
  const leads = getAllLeads();
  const found = leads.find(l => l.business.id === businessId);
  if (!found) return null;

  const timestamp = new Date().toISOString();
  let updatedDm: DecisionMaker | null = null;

  const dms = found.decision_makers.map(dm => {
    if (dm.id === dmId) {
      updatedDm = { ...dm, ...updates, updated_at: timestamp };
      return updatedDm;
    }
    if (updates.priority === 'Primary') {
      return { ...dm, priority: 'Secondary' as const };
    }
    return dm;
  });

  if (!updatedDm) return null;

  updateLead(businessId, { decision_makers: dms });
  return updatedDm;
}

export function deleteDecisionMaker(businessId: string, dmId: string): boolean {
  const leads = getAllLeads();
  const found = leads.find(l => l.business.id === businessId);
  if (!found) return false;

  const filtered = found.decision_makers.filter(dm => dm.id !== dmId);
  updateLead(businessId, { decision_makers: filtered });
  return true;
}
