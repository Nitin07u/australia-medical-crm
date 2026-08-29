import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Globe, 
  UserCheck, 
  Sparkles, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { useLeads } from '../../../context/LeadContext';
import { 
  AustralianState, 
  BusinessType, 
  OwnershipType, 
  WebsiteStatus, 
  GoogleMapsStatus, 
  RoleType, 
  LeadFull, 
  DuplicateCandidate 
} from '../../../types';
import { DuplicateWarningModal } from './DuplicateWarningModal';

export function LeadModal() {
  const { isAddModalOpen, setIsAddModalOpen, createLead, checkDuplicates, openLeadDetail } = useLeads();

  // Step tabs
  const [activeStep, setActiveStep] = useState<'business' | 'digital' | 'contact'>('business');

  // Duplicate candidates state
  const [duplicateCandidates, setDuplicateCandidates] = useState<DuplicateCandidate[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Business Information Fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('Clinic');
  const [subcategory, setSubcategory] = useState('');
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('Independent');
  const [abn, setAbn] = useState('');
  const [providerNumber, setProviderNumber] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState<AustralianState>('NSW');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [generalEmail, setGeneralEmail] = useState('');

  // Digital Presence Fields
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteExists, setWebsiteExists] = useState(true);
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus>('Needs Improvement');
  const [websiteTechnology, setWebsiteTechnology] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [googleMapsVerified, setGoogleMapsVerified] = useState<GoogleMapsStatus>('Verified');
  const [googleRating, setGoogleRating] = useState<number | undefined>(4.8);
  const [googleReviewCount, setGoogleReviewCount] = useState<number | undefined>(40);
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Decision Maker Fields
  const [dmName, setDmName] = useState('');
  const [dmPosition, setDmPosition] = useState('');
  const [dmRoleType, setDmRoleType] = useState<RoleType>('Director');
  const [dmEmail, setDmEmail] = useState('');
  const [dmPhone, setDmPhone] = useState('');
  const [dmLinkedin, setDmLinkedin] = useState('');

  if (!isAddModalOpen) return null;

  const handleWebsiteStatusChange = (status: WebsiteStatus) => {
    setWebsiteStatus(status);
    if (status === 'No Website') {
      setWebsiteExists(false);
      setWebsiteUrl('');
    } else {
      setWebsiteExists(true);
    }
  };

  const constructLeadObject = (): LeadFull => {
    const bizId = `biz-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newLead: LeadFull = {
      business: {
        id: bizId,
        business_name: businessName.trim(),
        business_type: businessType,
        subcategory: subcategory.trim() || undefined,
        ownership_type: ownershipType,
        abn: abn.trim() || undefined,
        provider_number: providerNumber.trim() || undefined,
        description: description.trim() || undefined,
        state,
        city: city.trim(),
        address: address.trim(),
        postcode: postcode.trim(),
        phone: phone.trim() || undefined,
        general_email: generalEmail.trim() || undefined,
        created_at: timestamp,
        updated_at: timestamp
      },
      digital_presence: {
        id: `dp-${bizId}`,
        business_id: bizId,
        website_url: websiteUrl.trim() || undefined,
        website_exists: websiteStatus !== 'No Website',
        website_status: websiteStatus,
        website_technology: websiteTechnology.trim() || undefined,
        google_maps_url: googleMapsUrl.trim() || undefined,
        google_maps_verified: googleMapsVerified,
        google_rating: googleRating,
        google_review_count: googleReviewCount,
        facebook_url: facebookUrl.trim() || undefined,
        instagram_url: instagramUrl.trim() || undefined,
        linkedin_url: linkedinUrl.trim() || undefined,
        created_at: timestamp,
        updated_at: timestamp
      },
      lead: {
        id: `lead-${bizId}`,
        business_id: bizId,
        lead_score: websiteStatus === 'No Website' ? 10 : 8,
        lead_status: 'New',
        priority: 'High',
        created_at: timestamp,
        updated_at: timestamp
      },
      website_audit: {
        id: `wa-${bizId}`,
        business_id: bizId,
        visual_design_score: websiteStatus === 'No Website' ? 0 : 5,
        branding_score: 5,
        typography_score: 5,
        image_quality_score: 4,
        navigation_score: 5,
        mobile_ux_score: websiteStatus === 'No Website' ? 0 : 4,
        user_journey_score: 4,
        cta_score: 4,
        loading_speed_score: 5,
        mobile_performance_score: 4,
        contact_cta: true,
        appointment_cta: false,
        enquiry_form: false,
        whatsapp_contact: false,
        product_enquiry: false,
        service_information: true,
        product_information: false,
        about_information: true,
        testimonials: false,
        trust_signals: true,
        certifications: true,
        what_i_noticed: websiteStatus === 'No Website' ? 'No website found. Immediate lead.' : 'Initial entry.',
        recommended_improvements: '1. Build or redesign modern medical site',
        opportunity_score: websiteStatus === 'No Website' ? 95 : 75,
        created_at: timestamp,
        updated_at: timestamp
      },
      decision_makers: dmName.trim() ? [
        {
          id: `dm-${bizId}`,
          business_id: bizId,
          full_name: dmName.trim(),
          position: dmPosition.trim() || 'Director',
          role_type: dmRoleType,
          priority: 'Primary',
          email: dmEmail.trim() || undefined,
          phone: dmPhone.trim() || undefined,
          linkedin_url: dmLinkedin.trim() || undefined,
          email_verification_status: 'Verified',
          created_at: timestamp,
          updated_at: timestamp
        }
      ] : [],
      tasks: [],
      activities: [
        {
          id: `act-${Date.now()}`,
          business_id: bizId,
          activity_type: 'lead_created',
          description: 'Lead manually entered into CRM',
          user_name: 'You',
          created_at: timestamp
        }
      ],
      tags: []
    };

    return newLead;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !city.trim() || !address.trim() || !postcode.trim()) {
      setActiveStep('business');
      return;
    }

    const candidate = {
      business_name: businessName,
      address,
      city,
      state,
      abn,
      website_url: websiteUrl,
      phone
    };

    const foundDuplicates = checkDuplicates(candidate);

    if (foundDuplicates.length > 0) {
      setDuplicateCandidates(foundDuplicates);
      setShowDuplicateModal(true);
      return;
    }

    const lead = constructLeadObject();
    const created = createLead(lead);
    setIsAddModalOpen(false);
    openLeadDetail(created.business.id);
  };

  const handleForceCreate = () => {
    setShowDuplicateModal(false);
    const lead = constructLeadObject();
    const created = createLead(lead);
    setIsAddModalOpen(false);
    openLeadDetail(created.business.id);
  };

  const handleMerge = (existingLead: LeadFull) => {
    setShowDuplicateModal(false);
    setIsAddModalOpen(false);
    openLeadDetail(existingLead.business.id);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1220]/60 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-modal border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Add New Medical Business Lead</h2>
              <p className="text-xs text-[#64748B]">Capture business information, digital presence, and decision-maker contact</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Step Switcher */}
          <div className="flex items-center border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 text-xs font-semibold">
            {[
              { id: 'business', label: '1. Business Profile', icon: Building2 },
              { id: 'digital', label: '2. Digital Presence', icon: Globe },
              { id: 'contact', label: '3. Decision Maker (Optional)', icon: UserCheck }
            ].map(step => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id as any)}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
                    isActive 
                      ? 'border-[#2563EB] text-[#2563EB] bg-white' 
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            
            {/* STEP 1: BUSINESS PROFILE */}
            {activeStep === 'business' && (
              <div className="space-y-4">
                
                {/* Section: Business Information */}
                <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Business Information</span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#0F172A] block mb-1">Business Name *</label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Melbourne Orthopaedic Clinic"
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#0F172A] block mb-1">Business Type *</label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value as any)}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                      >
                        {['Hospital', 'Clinic', 'Medical Centre', 'Medical Equipment', 'Medical Device', 'Rehabilitation', 'Other'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-[#0F172A] block mb-1">Subcategory</label>
                      <input
                        type="text"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        placeholder="e.g. Cosmetic Surgery / Dental"
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#0F172A] block mb-1">Ownership Type</label>
                      <select
                        value={ownershipType}
                        onChange={(e) => setOwnershipType(e.target.value as any)}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                      >
                        {['Independent', 'Private', 'Public', 'Unknown'].map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-[#0F172A] block mb-1">ABN</label>
                      <input
                        type="text"
                        value={abn}
                        onChange={(e) => setAbn(e.target.value)}
                        placeholder="e.g. 51 824 753 556"
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[11px] text-[#0F172A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Location */}
                <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Location</span>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="font-bold text-[#0F172A] block mb-1">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Suite 4, 185 Macquarie St"
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#0F172A] block mb-1">City / Suburb *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Sydney"
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#0F172A] block mb-1">State *</label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value as any)}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-bold text-[#2563EB]"
                      >
                        {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-[#0F172A] block mb-1">Postcode *</label>
                      <input
                        type="text"
                        required
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="e.g. 2000"
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#0F172A] block mb-1">Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(02) 9000 0000"
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#0F172A] block mb-1">General Email</label>
                      <input
                        type="email"
                        value={generalEmail}
                        onChange={(e) => setGeneralEmail(e.target.value)}
                        placeholder="reception@clinic.com.au"
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 2: DIGITAL PRESENCE */}
            {activeStep === 'digital' && (
              <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Digital Presence</span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#0F172A] block mb-1">Website Status (Opportunity)</label>
                    <select
                      value={websiteStatus}
                      onChange={(e) => handleWebsiteStatusChange(e.target.value as any)}
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-semibold text-[#2563EB]"
                    >
                      <option value="No Website">No Website (Highest Opportunity)</option>
                      <option value="Severely Outdated">Severely Outdated</option>
                      <option value="Needs Improvement">Needs Improvement</option>
                      <option value="Good Website">Good Website</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#0F172A] block mb-1">Official Website URL</label>
                    <input
                      type="url"
                      disabled={websiteStatus === 'No Website'}
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://exampleclinic.com.au"
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium disabled:opacity-50 text-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-[#0F172A] block mb-1">Google Maps Status</label>
                    <select
                      value={googleMapsVerified}
                      onChange={(e) => setGoogleMapsVerified(e.target.value as any)}
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                    >
                      <option value="Verified">Verified</option>
                      <option value="Pending">Pending</option>
                      <option value="Not Found">Not Found</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#0F172A] block mb-1">Google Rating (0.0 - 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={googleRating ?? ''}
                      onChange={(e) => setGoogleRating(Number(e.target.value) || undefined)}
                      placeholder="4.8"
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0F172A] block mb-1">Review Count</label>
                    <input
                      type="number"
                      min="0"
                      value={googleReviewCount ?? ''}
                      onChange={(e) => setGoogleReviewCount(Number(e.target.value) || 0)}
                      placeholder="45"
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: INITIAL DECISION MAKER */}
            {activeStep === 'contact' && (
              <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Decision Maker</span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#0F172A] block mb-1">Contact Full Name</label>
                    <input
                      type="text"
                      value={dmName}
                      onChange={(e) => setDmName(e.target.value)}
                      placeholder="e.g. Dr. Alistair Vance"
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0F172A] block mb-1">Role / Position</label>
                    <input
                      type="text"
                      value={dmPosition}
                      onChange={(e) => setDmPosition(e.target.value)}
                      placeholder="e.g. Managing Partner & Principal GP"
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#0F172A] block mb-1">Direct Email</label>
                    <input
                      type="email"
                      value={dmEmail}
                      onChange={(e) => setDmEmail(e.target.value)}
                      placeholder="doctor@practice.com.au"
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0F172A] block mb-1">Phone</label>
                    <input
                      type="text"
                      value={dmPhone}
                      onChange={(e) => setDmPhone(e.target.value)}
                      placeholder="0412 000 000"
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
              {activeStep !== 'business' ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep === 'contact' ? 'digital' : 'business')}
                  className="h-9 px-4 rounded-lg text-[#64748B] hover:text-[#0F172A] font-semibold text-xs"
                >
                  Back
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                {activeStep !== 'contact' ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep(activeStep === 'business' ? 'digital' : 'contact')}
                    className="h-9 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-xs"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="h-9 px-5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs"
                  >
                    Save & Create Lead
                  </button>
                )}
              </div>
            </div>

          </form>

        </div>
      </div>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        isOpen={showDuplicateModal}
        duplicateCandidates={duplicateCandidates}
        onCreateAnyway={handleForceCreate}
        onMerge={handleMerge}
        onCancel={() => setShowDuplicateModal(false)}
      />
    </>
  );
}
