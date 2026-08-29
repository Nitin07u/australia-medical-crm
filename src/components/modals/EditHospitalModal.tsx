import React, { useState, useEffect } from 'react';
import { X, Hospital, Building2, MapPin, Globe, Phone, Mail, FileText, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-modal overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Edit Hospital & Facility Profile
              </h2>
              <p className="text-xs text-slate-400">
                Update mail address, contact details, provider number, and website status.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Facility Name & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Hospital / Facility Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Subcategory / Specialty
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Day Surgery & Endoscopy, Acute Care"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-500" /> Hospital General / Admin Email
              </label>
              <input
                type="email"
                value={generalEmail}
                onChange={(e) => setGeneralEmail(e.target.value)}
                placeholder="enquiries@hospital.com.au"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-500" /> Facility Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(02) 9000 0000"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Street Address, Suburb, State, Postcode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Street Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Level 2, 100 Hospital Way"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Suburb / City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value as AustralianState)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  {australianStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Postcode *
                </label>
                <input
                  type="text"
                  required
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Provider Number, Ownership, ABN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Hospital Provider No.
              </label>
              <input
                type="text"
                value={providerNumber}
                onChange={(e) => setProviderNumber(e.target.value)}
                placeholder="e.g. 0097090A"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-[11px] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Ownership Model
              </label>
              <select
                value={ownershipType}
                onChange={(e) => setOwnershipType(e.target.value as OwnershipType)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white"
              >
                <option value="Private">Private Facility</option>
                <option value="Public">Public Facility / Network</option>
                <option value="Independent">Independent / Not-For-Profit</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                ABN
              </label>
              <input
                type="text"
                value={abn}
                onChange={(e) => setAbn(e.target.value)}
                placeholder="51 824 753 556"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-[11px] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Website URL & Website Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-500" /> Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://www.hospitalname.com.au"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-[11px] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Digital Presence / Website Status
              </label>
              <select
                value={websiteStatus}
                onChange={(e) => setWebsiteStatus(e.target.value as WebsiteStatus)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white"
              >
                <option value="No Website">No Website (95%+ Opportunity)</option>
                <option value="Severely Outdated">Severely Outdated (High Opportunity)</option>
                <option value="Needs Improvement">Needs Improvement (Medium Opportunity)</option>
                <option value="Good Website">Good Website (Low Opportunity)</option>
                <option value="Unknown">Unknown / Under Verification</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Facility Description & Clinical Profile
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Facility Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
