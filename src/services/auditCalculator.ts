import { DigitalPresence, WebsiteAudit, DecisionMaker, WebsiteStatus } from '../types';

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
    // Design & UX subscores (0-10, lower performance means higher opportunity)
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

    const auditQualityAvg = (designAvg * 0.4) + (uxAvg * 0.4) + (perfAvg * 0.2); // 0 to 10

    // Missing conversions boost opportunity
    let missingSignals = 0;
    if (!audit.contact_cta) missingSignals++;
    if (!audit.appointment_cta) missingSignals++;
    if (!audit.enquiry_form) missingSignals++;
    if (!audit.mobile_ux_score || audit.mobile_ux_score < 5) missingSignals += 2;

    // Quality inverse (lower site quality = higher agency opportunity)
    const inverseQuality = (10 - auditQualityAvg) * 10; // 0 to 100
    
    score = Math.round((score * 0.5) + (inverseQuality * 0.4) + (missingSignals * 2));
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate the Lead Score (1 - 10).
 * Reflects lead qualification for agency outreach:
 * e.g., established business + high website opportunity + decision maker found = 9-10/10.
 */
export function calculateLeadScore(
  digitalPresence: Partial<DigitalPresence>,
  opportunityScore: number,
  decisionMakers: DecisionMaker[] = [],
  googleRating?: number,
  reviewCount?: number
): number {
  let score = 5;

  // Opportunity factor (0 to 4 points)
  if (opportunityScore >= 80) score += 3.5;
  else if (opportunityScore >= 60) score += 2;
  else if (opportunityScore >= 40) score += 1;
  else score -= 1.5;

  // Google presence factor (established business with clients is high value)
  if (digitalPresence.google_maps_verified === 'Verified') {
    score += 1;
  }
  if (reviewCount && reviewCount > 20) {
    score += 1;
  }
  if (googleRating && googleRating >= 4.0) {
    score += 0.5;
  }

  // Decision Maker factor
  const hasPrimaryDM = decisionMakers.some(dm => dm.priority === 'Primary' && (dm.email || dm.linkedin_url));
  if (hasPrimaryDM) {
    score += 2;
  } else if (decisionMakers.length > 0) {
    score += 1;
  } else {
    score -= 0.5;
  }

  // No website + verified Google presence is an instant top-tier lead
  if (digitalPresence.website_status === 'No Website' && digitalPresence.google_maps_verified === 'Verified') {
    score = Math.max(score, 8.5);
  }

  // Clamp strictly between 1 and 10
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
      color: '#EF4444',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40',
      bgClass: 'bg-rose-500'
    };
  }
  if (score >= 55) {
    return {
      label: 'Medium Opportunity',
      color: '#F59E0B',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40',
      bgClass: 'bg-amber-500'
    };
  }
  return {
    label: 'Low Opportunity',
    color: '#10B981',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40',
    bgClass: 'bg-emerald-500'
  };
}

/**
 * Lead score badge styling
 */
export function getLeadScoreBadge(score: number): {
  label: string;
  badgeClass: string;
  starColor: string;
} {
  if (score >= 9) {
    return {
      label: 'Tier 1 Priority',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      starColor: 'text-rose-500 fill-rose-500'
    };
  }
  if (score >= 7) {
    return {
      label: 'High Potential',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      starColor: 'text-amber-500 fill-amber-500'
    };
  }
  if (score >= 5) {
    return {
      label: 'Moderate',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
      starColor: 'text-blue-500 fill-blue-500'
    };
  }
  return {
    label: 'Low Priority',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    starColor: 'text-slate-400'
  };
}
