import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { DecisionMaker, RoleType, EmailVerificationStatus } from '../../types';
import { useLeads } from '../../context/LeadContext';

interface EditDecisionMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  decisionMaker: DecisionMaker | null;
}

export function EditDecisionMakerModal({
  isOpen,
  onClose,
  businessId,
  businessName,
  decisionMaker
}: EditDecisionMakerModalProps) {
  const { updateDecisionMaker, addDecisionMaker } = useLeads();

  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [roleType, setRoleType] = useState<RoleType>('Director');
  const [priority, setPriority] = useState<'Primary' | 'Secondary'>('Primary');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<EmailVerificationStatus>('Verified');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (decisionMaker) {
      setFullName(decisionMaker.full_name || '');
      setPosition(decisionMaker.position || '');
      setRoleType(decisionMaker.role_type || 'Director');
      setPriority(decisionMaker.priority || 'Primary');
      setEmail(decisionMaker.email || '');
      setPhone(decisionMaker.phone || '');
      setLinkedinUrl(decisionMaker.linkedin_url || '');
      setEmailVerificationStatus(decisionMaker.email_verification_status || 'Verified');
      setNotes(decisionMaker.notes || '');
    } else {
      setFullName('');
      setPosition('');
      setRoleType('Medical Director');
      setPriority('Primary');
      setEmail('');
      setPhone('');
      setLinkedinUrl('');
      setEmailVerificationStatus('Verified');
      setNotes('');
    }
  }, [decisionMaker, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !position.trim()) return;

    const payload = {
      full_name: fullName.trim(),
      position: position.trim(),
      role_type: roleType,
      priority,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
      email_verification_status: emailVerificationStatus,
      notes: notes.trim() || undefined
    };

    if (decisionMaker) {
      updateDecisionMaker(businessId, decisionMaker.id, payload);
    } else {
      addDecisionMaker(businessId, payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1220]/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full max-w-xl rounded-xl border border-[#E2E8F0] shadow-modal overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">
                {decisionMaker ? 'Edit Decision Maker Profile' : 'Add Key Decision Maker'}
              </h2>
              <p className="text-xs text-[#64748B] truncate max-w-sm">
                {businessName}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Full Name & Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#0F172A] block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Alistair Vance"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="font-bold text-[#0F172A] block mb-1">
                Hospital / Practice Position *
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Director of Clinical Services / CEO"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Email Address & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#0F172A] block mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#2563EB]" /> Direct Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. a.vance@hospital.com.au"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[11px] text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="font-bold text-[#0F172A] block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#047857]" /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0412 345 678"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Role Type & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#0F172A] block mb-1">
                Role Category
              </label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value as RoleType)}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              >
                <option value="Medical Director">Medical Director / Superintendent</option>
                <option value="CEO">Chief Executive Officer (CEO)</option>
                <option value="Managing Director">Managing Director</option>
                <option value="Director">Director / Head of Department</option>
                <option value="Owner">Owner / Partner</option>
                <option value="Practice Manager">Practice Manager / General Manager</option>
                <option value="Marketing Manager">Marketing / Communications Manager</option>
                <option value="Head of Marketing">Head of Marketing</option>
                <option value="Founder">Founder</option>
                <option value="Other">Other Executive</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#0F172A] block mb-1">
                Outreach Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              >
                <option value="Primary">Primary (First point of contact)</option>
                <option value="Secondary">Secondary (Secondary contact)</option>
              </select>
            </div>
          </div>

          {/* LinkedIn Profile & Email Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#0F172A] block mb-1 flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" /> LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[11px] text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="font-bold text-[#0F172A] block mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#047857]" /> Email Verification Status
              </label>
              <select
                value={emailVerificationStatus}
                onChange={(e) => setEmailVerificationStatus(e.target.value as EmailVerificationStatus)}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              >
                <option value="Verified">Verified (Active Inbox)</option>
                <option value="Unverified">Unverified (Not checked)</option>
                <option value="Risky">Risky / Catch-All</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="font-bold text-[#0F172A] block mb-1">
              Internal Contact Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Best contacted on Tuesday mornings, manages IT and web budget."
              className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            />
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
              <Check className="w-4 h-4 stroke-[2.5]" /> Save Profile & Email
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
