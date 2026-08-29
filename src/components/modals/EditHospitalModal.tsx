import React, { useState, useEffect } from 'react';
import { X, Hospital, MapPin, Globe, Phone, Mail, Check } from 'lucide-react';
import { LeadFull, AustralianState, BusinessType, WebsiteStatus, OwnershipType } from '../../types';
import { useLeads } from '../../context/LeadContext';

interface EditHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadFull | null;
}

export function EditHospitalModal({
  isOpen,
  onClose,
  lead
}: EditHospitalModalProps) {
  const { updateLead } = useLeads();

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('Hospital');
  const [subcategory, setSubcategory] = useState('');
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('Private');
  const [providerNumber, setProviderNumber] = useState('');
  const [abn, setAbn] = useState('');
  const [generalEmail, setGeneralEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState<AustralianState>('NSW');
  const [postcode, setPostcode] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus>('Needs Improvement');

  useEffect(() => {
    if (lead) {
      setBusinessName(lead.business.business_name || '');
      setBusinessType(lead.business.business_type || 'Hospital');
      setSubcategory(lead.business.subcategory || '');
      setOwnershipType(lead.business.ownership_type || 'Private');
      setProviderNumber(lead.business.provider_number || '');
      setAbn(lead.business.abn || '');
      setGeneralEmail(lead.business.general_email || '');
      setPhone(lead.business.phone || '');
      setAddress(lead.business.address || '');
      setCity(lead.business.city || '');
      setState(lead.business.state || 'NSW');
      setPostcode(lead.business.postcode || '');
      setDescription(lead.business.description || '');
      setWebsiteUrl(lead.digital_presence.website_url || '');
      setWebsiteStatus(lead.digital_presence.website_status || 'Needs Improvement');
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !city.trim() || !address.trim() || !postcode.trim()) return;

    updateLead(lead.business.id, {
      business: {
        ...lead.business,
        business_name: businessName.trim(),
        business_type: businessType,
        subcategory: subcategory.trim() || undefined,
        ownership_type: ownershipType,
        provider_number: providerNumber.trim() || undefined,
        abn: abn.trim() || undefined,
        general_email: generalEmail.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim(),
        city: city.trim(),
        state,
        postcode: postcode.trim(),
        description: description.trim() || undefined,
        updated_at: new Date().toISOString()
      },
      digital_presence: {
        ...lead.digital_presence,
        website_url: websiteUrl.trim() || undefined,
        website_exists: websiteStatus !== 'No Website',
        website_status: websiteStatus,
        updated_at: new Date().toISOString()
      }
    });

    onClose();
  };

  const australianStates: AustralianState[] = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1220]/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full max-w-2xl rounded-xl border border-[#E2E8F0] shadow-modal overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
              <Hospital className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">
                Edit Hospital & Facility Profile
              </h2>
              <p className="text-xs text-[#64748B]">
                Update mail address, contact details, provider number, and website status.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Facility Name & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#0F172A] block mb-1">
                Hospital / Facility Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-bold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="font-bold text-[#0F172A] block mb-1">
                Subcategory / Specialty
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Day Surgery & Endoscopy, Acute Care"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#0F172A] block mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#2563EB]" /> Hospital General / Admin Email
              </label>
              <input
                type="email"
                value={generalEmail}
                onChange={(e) => setGeneralEmail(e.target.value)}
                placeholder="enquiries@hospital.com.au"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[11px] text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="font-bold text-[#0F172A] block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#047857]" /> Facility Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(02) 9000 0000"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Street Address, Suburb, State, Postcode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="font-bold text-[#0F172A] block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B91C1C]" /> Street Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Level 2, 100 Hospital Way"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="font-bold text-[#0F172A] block mb-1">
                Suburb / City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#0F172A] block mb-1">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value as AustralianState)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-bold text-[#2563EB] focus:outline-none focus:border-[#2563EB]"
                >
                  {australianStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#0F172A] block mb-1">
                  Postcode *
                </label>
                <input
                  type="text"
                  required
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Provider Number, Ownership, ABN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-[#0F172A] block mb-1">
                Provider Number
              </label>
              <input
                type="text"
                value={providerNumber}
                onChange={(e) => setProviderNumber(e.target.value)}
                placeholder="e.g. 0097090A"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[11px] text-[#0F172A]"
              />
            </div>

            <div>
              <label className="font-bold text-[#0F172A] block mb-1">
                Ownership Model
              </label>
              <select
                value={ownershipType}
                onChange={(e) => setOwnershipType(e.target.value as OwnershipType)}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
              >
                <option value="Private">Private Facility</option>
                <option value="Public">Public Facility / Network</option>
                <option value="Independent">Independent / Not-For-Profit</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#0F172A] block mb-1">
                ABN
              </label>
              <input
                type="text"
                value={abn}
                onChange={(e) => setAbn(e.target.value)}
                placeholder="51 824 753 556"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[11px] text-[#0F172A]"
              />
            </div>
          </div>

          {/* Website URL & Website Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#0F172A] block mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#2563EB]" /> Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://www.hospitalname.com.au"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[11px] text-[#0F172A]"
              />
            </div>

            <div>
              <label className="font-bold text-[#0F172A] block mb-1">
                Digital Presence / Status
              </label>
              <select
                value={websiteStatus}
                onChange={(e) => setWebsiteStatus(e.target.value as WebsiteStatus)}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A]"
              >
                <option value="No Website">No Website (High Opportunity)</option>
                <option value="Severely Outdated">Severely Outdated</option>
                <option value="Needs Improvement">Needs Improvement</option>
                <option value="Good Website">Good Website</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg text-[#64748B] hover:text-[#0F172A] font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-9 px-5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" /> Save Facility Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
