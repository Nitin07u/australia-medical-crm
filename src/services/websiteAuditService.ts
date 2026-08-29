import { WebsiteAudit, DigitalPresence } from '../types';
import { getAllLeads, updateLead } from './leadService';
import { calculateOpportunityScore } from './auditCalculator';

export function getWebsiteAudit(businessId: string): WebsiteAudit | undefined {
  const leads = getAllLeads();
  const found = leads.find(l => l.business.id === businessId);
  return found?.website_audit;
}

export function saveWebsiteAudit(businessId: string, auditData: Partial<WebsiteAudit>): WebsiteAudit | null {
  const leads = getAllLeads();
  const found = leads.find(l => l.business.id === businessId);
  if (!found) return null;

  const currentAudit = found.website_audit;
  const timestamp = new Date().toISOString();

  const completeAudit: WebsiteAudit = {
    id: currentAudit?.id || `wa-${Date.now()}`,
    business_id: businessId,
    visual_design_score: auditData.visual_design_score ?? currentAudit?.visual_design_score ?? 5,
    branding_score: auditData.branding_score ?? currentAudit?.branding_score ?? 5,
    typography_score: auditData.typography_score ?? currentAudit?.typography_score ?? 5,
    image_quality_score: auditData.image_quality_score ?? currentAudit?.image_quality_score ?? 5,
    navigation_score: auditData.navigation_score ?? currentAudit?.navigation_score ?? 5,
    mobile_ux_score: auditData.mobile_ux_score ?? currentAudit?.mobile_ux_score ?? 5,
    user_journey_score: auditData.user_journey_score ?? currentAudit?.user_journey_score ?? 5,
    cta_score: auditData.cta_score ?? currentAudit?.cta_score ?? 5,
    loading_speed_score: auditData.loading_speed_score ?? currentAudit?.loading_speed_score ?? 5,
    mobile_performance_score: auditData.mobile_performance_score ?? currentAudit?.mobile_performance_score ?? 5,
    contact_cta: auditData.contact_cta ?? currentAudit?.contact_cta ?? false,
    appointment_cta: auditData.appointment_cta ?? currentAudit?.appointment_cta ?? false,
    enquiry_form: auditData.enquiry_form ?? currentAudit?.enquiry_form ?? false,
    whatsapp_contact: auditData.whatsapp_contact ?? currentAudit?.whatsapp_contact ?? false,
    product_enquiry: auditData.product_enquiry ?? currentAudit?.product_enquiry ?? false,
    service_information: auditData.service_information ?? currentAudit?.service_information ?? false,
    product_information: auditData.product_information ?? currentAudit?.product_information ?? false,
    about_information: auditData.about_information ?? currentAudit?.about_information ?? false,
    testimonials: auditData.testimonials ?? currentAudit?.testimonials ?? false,
    trust_signals: auditData.trust_signals ?? currentAudit?.trust_signals ?? false,
    certifications: auditData.certifications ?? currentAudit?.certifications ?? false,
    what_i_noticed: auditData.what_i_noticed ?? currentAudit?.what_i_noticed ?? '',
    recommended_improvements: auditData.recommended_improvements ?? currentAudit?.recommended_improvements ?? '',
    opportunity_score: 0,
    created_at: currentAudit?.created_at || timestamp,
    updated_at: timestamp
  };

  completeAudit.opportunity_score = calculateOpportunityScore(found.digital_presence, completeAudit);

  const updatedActivities = [
    {
      id: `act-${Date.now()}`,
      business_id: businessId,
      activity_type: 'audit_completed' as const,
      description: `Website audit completed with Opportunity Score ${completeAudit.opportunity_score}/100`,
      user_name: 'You',
      created_at: timestamp
    },
    ...found.activities
  ];

  updateLead(businessId, {
    website_audit: completeAudit,
    activities: updatedActivities
  });

  return completeAudit;
}
