import React from 'react';
import { AlertTriangle, Building2, MapPin, Globe, Phone, ArrowRight, X } from 'lucide-react';
import { DuplicateCandidate, LeadFull } from '../../../types';

interface DuplicateWarningModalProps {
  isOpen: boolean;
  duplicateCandidates: DuplicateCandidate[];
  onMerge: (existingLead: LeadFull) => void;
  onCreateAnyway: () => void;
  onCancel: () => void;
}

export function DuplicateWarningModal({
  isOpen,
  duplicateCandidates,
  onMerge,
  onCreateAnyway,
  onCancel
}: DuplicateWarningModalProps) {
  if (!isOpen || duplicateCandidates.length === 0) return null;

  const firstCandidate = duplicateCandidates[0];
  const existing = firstCandidate.existingLead;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-300 dark:border-amber-700/60 p-6 space-y-5">
        
        {/* Header Alert */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Possible Duplicate Detected
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              An existing record in your CRM matched via <strong className="text-amber-600 dark:text-amber-400">{firstCandidate.matchedValue}</strong>.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Lead Match Preview Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Existing CRM Lead</span>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            {existing.business.business_name}
          </h4>

          <div className="space-y-1 text-slate-600 dark:text-slate-300">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {existing.business.address}, {existing.business.city}, {existing.business.state} {existing.business.postcode}
            </p>
            {existing.business.abn && (
              <p className="flex items-center gap-1.5 font-mono text-[11px]">
                <span>ABN:</span> {existing.business.abn}
              </p>
            )}
            {existing.digital_presence.website_url && (
              <p className="flex items-center gap-1.5 text-blue-600">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                {existing.digital_presence.website_url}
              </p>
            )}
            {existing.business.phone && (
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {existing.business.phone}
              </p>
            )}
          </div>
        </div>

        {/* Actions Choice */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={onCreateAnyway}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 transition-colors"
          >
            Create Anyway
          </button>

          <button
            type="button"
            onClick={() => onMerge(existing)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all"
          >
            Open & Merge With Existing
          </button>
        </div>

      </div>
    </div>
  );
}
