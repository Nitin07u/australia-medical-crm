import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Trash2, 
  Download,
  AlertCircle
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { parseCsvText, getSampleCsvData } from '../../services/csvService';
import { AustralianState, BusinessType, WebsiteStatus, LeadFull, RawCsvRow } from '../../types';
import { useToast } from '../../context/ToastContext';

export function ImportLeadsView() {
  const { createLead, checkDuplicates, setCurrentRoute } = useLeads();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<RawCsvRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column Mapping state
  const [mappings, setMappings] = useState<Record<string, string>>({
    business_name: '',
    business_type: '',
    state: '',
    city: '',
    address: '',
    postcode: '',
    phone: '',
    general_email: '',
    abn: '',
    website_url: '',
    website_status: '',
    google_rating: '',
    google_review_count: '',
    decision_maker_name: '',
    decision_maker_position: '',
    decision_maker_email: '',
    decision_maker_linkedin: '',
    lead_score: '',
    notes: ''
  });

  // Validation results
  const [validationResults, setValidationResults] = useState<{
    validRows: LeadFull[];
    duplicateCount: number;
    errorCount: number;
    errors: { row: number; reason: string }[];
  }>({
    validRows: [],
    duplicateCount: 0,
    errorCount: 0,
    errors: []
  });

  // Import Progress
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);

  // Load sample CSV
  const handleLoadSample = () => {
    const sample = getSampleCsvData();
    processCsvData(sample, 'australia_medical_leads_sample.csv');
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processCsvData(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const processCsvData = (csvText: string, name: string) => {
    setCsvContent(csvText);
    setFileName(name);
    const { headers, rows } = parseCsvText(csvText);
    setParsedHeaders(headers);
    setParsedRows(rows);

    // Auto-map headers
    const autoMap: Record<string, string> = { ...mappings };
    headers.forEach(h => {
      const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (lower.includes('businessname') || lower.includes('hospitalname') || lower.includes('company') || lower === 'name') {
        autoMap.business_name = h;
      } else if (lower.includes('type') || lower.includes('category') || lower.includes('facility')) {
        autoMap.business_type = h;
      } else if (lower.includes('state') || lower === 'st') {
        autoMap.state = h;
      } else if (lower.includes('city') || lower.includes('suburb') || lower.includes('town')) {
        autoMap.city = h;
      } else if (lower.includes('address') || lower.includes('street')) {
        autoMap.address = h;
      } else if (lower.includes('postcode') || lower.includes('postal') || lower === 'zip') {
        autoMap.postcode = h;
      } else if (lower.includes('phone') || lower.includes('telephone') || lower.includes('mobile')) {
        autoMap.phone = h;
      } else if (lower.includes('email') || lower.includes('mail')) {
        if (!autoMap.general_email) autoMap.general_email = h;
      } else if (lower.includes('abn') || lower.includes('acn')) {
        autoMap.abn = h;
      } else if (lower.includes('website') || lower.includes('url') || lower.includes('domain')) {
        autoMap.website_url = h;
      } else if (lower.includes('contact') || lower.includes('doctor') || lower.includes('director') || lower.includes('manager')) {
        autoMap.decision_maker_name = h;
      }
    });

    setMappings(autoMap);
    setCurrentStep(2);
  };

  // Run validation
  const handleValidate = () => {
    const valid: LeadFull[] = [];
    let dupes = 0;
    const errs: { row: number; reason: string }[] = [];

    parsedRows.forEach((row, index) => {
      const rowNum = index + 2;
      const bName = (row[mappings.business_name] || '').trim();
      const bType = (row[mappings.business_type] || 'Clinic').trim() as BusinessType;
      const bState = (row[mappings.state] || 'NSW').trim() as AustralianState;
      const bCity = (row[mappings.city] || 'Sydney').trim();
      const bAddress = (row[mappings.address] || 'Main Medical St').trim();
      const bPostcode = (row[mappings.postcode] || '2000').trim();
      const bPhone = (row[mappings.phone] || '').trim();
      const bEmail = (row[mappings.general_email] || '').trim();
      const bAbn = (row[mappings.abn] || '').trim();
      const bWebUrl = (row[mappings.website_url] || '').trim();
      const bWebStatus = (row[mappings.website_status] || (bWebUrl ? 'Needs Improvement' : 'No Website')).trim() as WebsiteStatus;

      if (!bName) {
        errs.push({ row: rowNum, reason: 'Missing required Business Name' });
        return;
      }

      const candidateDuplicates = checkDuplicates({
        business_name: bName,
        address: bAddress,
        city: bCity,
        state: bState,
        abn: bAbn,
        website_url: bWebUrl,
        phone: bPhone
      });

      if (candidateDuplicates.length > 0) {
        dupes++;
      }

      const bizId = `biz-import-${Date.now()}-${index}`;
      const timestamp = new Date().toISOString();

      const dmName = (row[mappings.decision_maker_name] || '').trim();
      const dmPos = (row[mappings.decision_maker_position] || 'Director').trim();
      const dmEmail = (row[mappings.decision_maker_email] || '').trim();
      const dmLinkedin = (row[mappings.decision_maker_linkedin] || '').trim();

      const constructed: LeadFull = {
        business: {
          id: bizId,
          business_name: bName,
          business_type: ['Hospital', 'Clinic', 'Medical Centre', 'Medical Equipment', 'Medical Device', 'Rehabilitation', 'Other'].includes(bType) ? bType : 'Clinic',
          ownership_type: 'Independent',
          abn: bAbn || undefined,
          state: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].includes(bState) ? bState : 'NSW',
          city: bCity,
          address: bAddress,
          postcode: bPostcode,
          phone: bPhone || undefined,
          general_email: bEmail || undefined,
          created_at: timestamp,
          updated_at: timestamp
        },
        digital_presence: {
          id: `dp-${bizId}`,
          business_id: bizId,
          website_url: bWebUrl || undefined,
          website_exists: bWebStatus !== 'No Website',
          website_status: ['No Website', 'Good Website', 'Needs Improvement', 'Severely Outdated', 'Unknown'].includes(bWebStatus) ? bWebStatus : 'Needs Improvement',
          google_maps_verified: 'Verified',
          google_rating: Number(row[mappings.google_rating]) || 4.8,
          google_review_count: Number(row[mappings.google_review_count]) || 30,
          created_at: timestamp,
          updated_at: timestamp
        },
        lead: {
          id: `lead-${bizId}`,
          business_id: bizId,
          lead_score: bWebStatus === 'No Website' ? 10 : 8,
          lead_status: 'New',
          priority: 'High',
          created_at: timestamp,
          updated_at: timestamp
        },
        website_audit: {
          id: `wa-${bizId}`,
          business_id: bizId,
          visual_design_score: bWebStatus === 'No Website' ? 0 : 4,
          branding_score: 4,
          typography_score: 4,
          image_quality_score: 3,
          navigation_score: 4,
          mobile_ux_score: bWebStatus === 'No Website' ? 0 : 3,
          user_journey_score: 3,
          cta_score: 3,
          loading_speed_score: 4,
          mobile_performance_score: 3,
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
          what_i_noticed: bWebStatus === 'No Website' ? 'No active website found.' : 'Outdated responsive structure detected.',
          recommended_improvements: '1. Modern responsive medical web rebuild\n2. Online appointment engine integration',
          opportunity_score: bWebStatus === 'No Website' ? 97 : 80,
          created_at: timestamp,
          updated_at: timestamp
        },
        decision_makers: dmName ? [
          {
            id: `dm-${bizId}`,
            business_id: bizId,
            full_name: dmName,
            position: dmPos,
            role_type: 'Director',
            priority: 'Primary',
            email: dmEmail || undefined,
            linkedin_url: dmLinkedin || undefined,
            email_verification_status: 'Verified',
            created_at: timestamp,
            updated_at: timestamp
          }
        ] : [],
        tasks: [],
        activities: [
          {
            id: `act-${Date.now()}-${index}`,
            business_id: bizId,
            activity_type: 'lead_created',
            description: `Imported via CSV (${fileName})`,
            user_name: 'CSV Import Wizard',
            created_at: timestamp
          }
        ],
        tags: []
      };

      valid.push(constructed);
    });

    setValidationResults({
      validRows: valid,
      duplicateCount: dupes,
      errorCount: errs.length,
      errors: errs
    });

    setCurrentStep(4);
  };

  // Run Import (Step 5)
  const handleExecuteImport = () => {
    setCurrentStep(5);
    setImportProgress(10);

    let count = 0;
    const total = validationResults.validRows.length;

    const interval = setInterval(() => {
      count += Math.ceil(total / 5);
      if (count >= total) {
        count = total;
        clearInterval(interval);
        validationResults.validRows.forEach(lead => createLead(lead));
        setImportedCount(total);
        setImportProgress(100);
        showToast({
          type: 'success',
          title: 'Import Successful',
          message: `Added ${total} medical leads into CRM`
        });
      } else {
        setImportProgress(Math.round((count / total) * 90));
      }
    }, 200);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">
            Australian Medical Leads CSV Import Wizard
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Bulk ingest Australian hospitals, clinics, medical practices, and equipment suppliers with column mapping and duplicate check.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="h-9 px-3.5 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold hover:bg-[#DBEAFE] transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" /> Load Sample Australian CSV
        </button>
      </div>

      {/* Section 19: Clear Stepper */}
      <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
        {[
          { step: 1, label: '1. Upload CSV' },
          { step: 2, label: '2. Map Columns' },
          { step: 4, label: '3. Validate' },
          { step: 5, label: '4. Import' }
        ].map(s => {
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step || (s.step === 2 && currentStep === 2) || (s.step === 2 && currentStep === 3);

          return (
            <div
              key={s.step}
              className={`p-3 rounded-lg border text-center transition-all ${
                isCurrent 
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs' 
                  : isDone 
                  ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]' 
                  : 'bg-white text-[#94A3B8] border-[#E2E8F0]'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {isDone && <Check className="w-3.5 h-3.5 text-[#047857] stroke-[3]" />}
                <span>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* STEP 1: UPLOAD */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl p-12 border-2 border-dashed border-[#CBD5E1] text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-bold text-base text-[#0F172A]">Drop your Excel or CSV file here</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
              Drag and drop your spreadsheet or browse files. Standard UTF-8 CSV supported.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,text/csv"
            className="hidden"
          />

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs transition-all"
            >
              Browse files
            </button>
            <button
              onClick={handleLoadSample}
              className="h-9 px-4 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] font-semibold text-xs transition-colors"
            >
              Use sample data
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PREVIEW */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#0F172A]">CSV Preview: {fileName}</h3>
              <p className="text-xs text-[#64748B]">Found {parsedRows.length} rows and {parsedHeaders.length} columns</p>
            </div>
            <button
              onClick={() => setCurrentStep(3)}
              className="h-9 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs"
            >
              Continue to Column Mapping →
            </button>
          </div>

          <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold">
                  <th className="py-2.5 px-3">#</th>
                  {parsedHeaders.map(h => (
                    <th key={h} className="py-2.5 px-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#0F172A]">
                {parsedRows.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3 text-[#94A3B8] font-mono">{idx + 1}</td>
                    {parsedHeaders.map(h => (
                      <td key={h} className="py-2.5 px-3 whitespace-nowrap">{row[h] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STEP 3: COLUMN MAPPING */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#0F172A]">Map CSV Columns to CRM Fields</h3>
              <p className="text-xs text-[#64748B]">Match headers from your file to healthIntel database properties</p>
            </div>
            <button
              onClick={handleValidate}
              className="h-9 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs"
            >
              Validate & Check Duplicates →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {[
              { key: 'business_name', label: 'Business Name *', req: true },
              { key: 'business_type', label: 'Business Type', req: false },
              { key: 'state', label: 'Australian State (NSW, VIC...)', req: false },
              { key: 'city', label: 'City / Suburb', req: false },
              { key: 'address', label: 'Street Address', req: false },
              { key: 'postcode', label: 'Postcode', req: false },
              { key: 'phone', label: 'Phone Number', req: false },
              { key: 'general_email', label: 'General Email', req: false },
              { key: 'abn', label: 'ABN', req: false },
              { key: 'website_url', label: 'Website URL', req: false },
              { key: 'website_status', label: 'Website Status', req: false },
              { key: 'decision_maker_name', label: 'Decision Maker Name', req: false },
              { key: 'decision_maker_position', label: 'Decision Maker Position', req: false },
              { key: 'decision_maker_email', label: 'Decision Maker Email', req: false },
              { key: 'decision_maker_linkedin', label: 'Decision Maker LinkedIn', req: false }
            ].map(f => (
              <div key={f.key} className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <label className="font-bold text-[#0F172A] block mb-1">
                  {f.label}
                </label>
                <select
                  value={mappings[f.key] || ''}
                  onChange={(e) => setMappings({ ...mappings, [f.key]: e.target.value })}
                  className="w-full bg-white border border-[#CBD5E1] rounded-md p-1.5 font-medium text-[#0F172A] text-xs focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="">-- Don't Map --</option>
                  {parsedHeaders.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: VALIDATION & DUPLICATE CHECK */}
      {currentStep === 4 && (
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-sm text-[#0F172A]">Data Validation & Duplicate Analysis</h3>
            <p className="text-xs text-[#64748B]">Review scan results before committing into CRM</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857]">
              <span className="font-bold block text-sm">{validationResults.validRows.length} Records Ready</span>
              <p className="text-[11px] text-[#047857] mt-1">Properly mapped and structured</p>
            </div>

            <div className="p-4 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]">
              <span className="font-bold block text-sm">{validationResults.duplicateCount} Potential Duplicates</span>
              <p className="text-[11px] text-[#B45309] mt-1">Matches existing ABN, Name or Domain</p>
            </div>

            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569]">
              <span className="font-bold block text-sm">{validationResults.errorCount} Errors</span>
              <p className="text-[11px] text-[#64748B] mt-1">Missing required business names</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <button
              onClick={() => setCurrentStep(3)}
              className="h-9 px-4 rounded-lg text-[#64748B] hover:text-[#0F172A] font-semibold text-xs"
            >
              Back to Mapping
            </button>
            <button
              onClick={handleExecuteImport}
              className="h-9 px-5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs"
            >
              Execute Import of {validationResults.validRows.length} Leads
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: IMPORT EXECUTION */}
      {currentStep === 5 && (
        <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] shadow-xs text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto">
            {importProgress === 100 ? <CheckCircle2 className="w-7 h-7 text-[#047857]" /> : <UploadCloud className="w-7 h-7 animate-pulse" />}
          </div>

          <div>
            <h3 className="font-bold text-base text-[#0F172A]">
              {importProgress === 100 ? 'Import Completed Successfully!' : 'Importing Leads into healthIntel CRM...'}
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              {importProgress === 100 ? `Added ${importedCount} medical leads with opportunity scores.` : 'Ingesting records and computing website opportunity matrix...'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
              <div
                style={{ width: `${importProgress}%` }}
                className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
              />
            </div>
            <span className="text-xs font-bold text-[#64748B] mt-2 block">
              {importProgress}%
            </span>
          </div>

          {importProgress === 100 && (
            <div className="pt-2">
              <button
                onClick={() => setCurrentRoute('leads')}
                className="h-9 px-5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs"
              >
                Go to CRM Leads Table →
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
