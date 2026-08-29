import { DigitalPresence, WebsiteAudit, DecisionMaker, WebsiteStatus, LeadStatus } from '../types';

/**
 * Calculate the Website Opportunity Score (0 - 100).
 * Higher score = HIGHER opportunity for a web agency to sell redesign/new website.
 */
export function calculateOpportunityScore(
  digitalPresence: Partial<DigitalPresence>,
  audit?: Partial<WebsiteAudit>
): number {
  let score = 50;

  // 1. Website Status Base Weight
  switch (digitalPresence.website_status) {
    case 'No Website':
      score = 95; // Highest opportunity
      break;
    case 'Severely Outdated':
      score = 85; // Very high opportunity
      break;
    case 'Needs Improvement':
      score = 65; // High opportunity
      break;
    case 'Good Website':
      score = 20; // Low opportunity
      break;
    case 'Unknown':
    default:
      score = 50;
      break;
  }

  // If detailed audit metrics exist, refine score
  if (audit) {
    const designAvg = (
      (audit.visual_design_score ?? 5) +
      (audit.branding_score ?? 5) +
      (audit.typography_score ?? 5) +
      (audit.image_quality_score ?? 5)
    ) / 4;

    const uxAvg = (
      (audit.navigation_score ?? 5) +
      (audit.mobile_ux_score ?? 5) +
      (audit.user_journey_score ?? 5) +
      (audit.cta_score ?? 5)
    ) / 4;

    const perfAvg = (
      (audit.loading_speed_score ?? 5) +
      (audit.mobile_performance_score ?? 5)
    ) / 2;

    const auditQualityAvg = (designAvg * 0.4) + (uxAvg * 0.4) + (perfAvg * 0.2);

    let missingSignals = 0;
    if (!audit.contact_cta) missingSignals++;
    if (!audit.appointment_cta) missingSignals++;
    if (!audit.enquiry_form) missingSignals++;
    if (!audit.mobile_ux_score || audit.mobile_ux_score < 5) missingSignals += 2;

    const inverseQuality = (10 - auditQualityAvg) * 10;
    
    score = Math.round((score * 0.5) + (inverseQuality * 0.4) + (missingSignals * 2));
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate the Lead Score (1 - 10).
 */
export function calculateLeadScore(
  digitalPresence: Partial<DigitalPresence>,
  opportunityScore: number,
  decisionMakers: DecisionMaker[] = [],
  googleRating?: number,
  reviewCount?: number
): number {
  let score = 5;

  if (opportunityScore >= 80) score += 3.5;
  else if (opportunityScore >= 60) score += 2;
  else if (opportunityScore >= 40) score += 1;
  else score -= 1.5;

  if (digitalPresence.google_maps_verified === 'Verified') {
    score += 1;
  }
  if (reviewCount && reviewCount > 20) {
    score += 1;
  }
  if (googleRating && googleRating >= 4.0) {
    score += 0.5;
  }

  const hasPrimaryDM = decisionMakers.some(dm => dm.priority === 'Primary' && (dm.email || dm.linkedin_url));
  if (hasPrimaryDM) {
    score += 2;
  } else if (decisionMakers.length > 0) {
    score += 1;
  } else {
    score -= 0.5;
  }

  if (digitalPresence.website_status === 'No Website' && digitalPresence.google_maps_verified === 'Verified') {
    score = Math.max(score, 8.5);
  }

  return Math.round(Math.max(1, Math.min(10, score)));
}

/**
 * Opportunity categorization helper
 */
export function getOpportunityLevel(score: number): {
  label: string;
  color: string;
  badgeClass: string;
  bgClass: string;
} {
  if (score >= 80) {
    return {
      label: 'High Opportunity',
      color: '#B91C1C',
      badgeClass: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
      bgClass: 'bg-[#B91C1C]'
    };
  }
  if (score >= 55) {
    return {
      label: 'Medium Opportunity',
      color: '#B45309',
      badgeClass: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
      bgClass: 'bg-[#B45309]'
    };
  }
  return {
    label: 'Low Opportunity',
    color: '#047857',
    badgeClass: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    bgClass: 'bg-[#047857]'
  };
}

/**
 * Lead score badge styling
 */
export function getLeadScoreBadge(score: number): {
  label: string;
  badgeClass: string;
  barColor: string;
  textColor: string;
} {
  if (score >= 9) {
    return {
      label: 'Tier 1 Priority',
      badgeClass: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
      barColor: 'bg-[#B91C1C]',
      textColor: 'text-[#B91C1C]'
    };
  }
  if (score >= 7) {
    return {
      label: 'High Potential',
      badgeClass: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
      barColor: 'bg-[#2563EB]',
      textColor: 'text-[#1D4ED8]'
    };
  }
  if (score >= 5) {
    return {
      label: 'Moderate',
      badgeClass: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
      barColor: 'bg-[#D97706]',
      textColor: 'text-[#B45309]'
    };
  }
  return {
    label: 'Low Priority',
    badgeClass: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
    barColor: 'bg-[#64748B]',
    textColor: 'text-[#475569]'
  };
}

/**
 * Website status badge styling
 */
export function getWebsiteStatusBadge(status: WebsiteStatus): {
  badgeClass: string;
  dotColor: string;
} {
  switch (status) {
    case 'Good Website':
      return {
        badgeClass: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
        dotColor: 'bg-[#047857]'
      };
    case 'Needs Improvement':
      return {
        badgeClass: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
        dotColor: 'bg-[#B45309]'
      };
    case 'Severely Outdated':
      return {
        badgeClass: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
        dotColor: 'bg-[#B91C1C]'
      };
    case 'No Website':
      return {
        badgeClass: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
        dotColor: 'bg-[#B91C1C]'
      };
    case 'Unknown':
    default:
      return {
        badgeClass: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
        dotColor: 'bg-[#94A3B8]'
      };
  }
}

/**
 * Pipeline status badge styling
 */
export function getPipelineStatusBadge(status: LeadStatus): {
  badgeClass: string;
} {
  switch (status) {
    case 'Won':
    case 'Qualified':
      return { badgeClass: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]' };
    case 'Researching':
    case 'Pending' as any:
      return { badgeClass: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]' };
    case 'Ready for Outreach':
    case 'Interested':
    case 'Meeting':
    case 'Proposal':
      return { badgeClass: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]' };
    case 'Lost':
    case 'Disqualified':
      return { badgeClass: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]' };
    case 'New':
    default:
      return { badgeClass: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]' };
  }
}
