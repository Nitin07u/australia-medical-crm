import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, ExternalLink, ShieldCheck, Check, Building2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-modal overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {decisionMaker ? 'Edit Decision Maker Profile' : 'Add Key Decision Maker'}
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-sm">
                {businessName}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Full Name & Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Alistair Vance"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Hospital / Practice Position *
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Director of Clinical Services / CEO"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Email Address & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-500" /> Direct Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. a.vance@hospital.com.au"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-500" /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0412 345 678 or (02) 9000 1000"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role Type & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Role Category
              </label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value as RoleType)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
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
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Outreach Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Primary">Primary (First point of contact)</option>
                <option value="Secondary">Secondary (Secondary contact)</option>
              </select>
            </div>
          </div>

          {/* LinkedIn Profile & Email Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Email Verification Status
              </label>
              <select
                value={emailVerificationStatus}
                onChange={(e) => setEmailVerificationStatus(e.target.value as EmailVerificationStatus)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
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
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Internal Contact Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Best contacted on Tuesday mornings, manages IT and web budget."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
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
              <Check className="w-4 h-4" /> Save Profile & Email
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
