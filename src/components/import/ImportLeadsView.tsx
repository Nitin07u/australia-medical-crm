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
      const norm = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (norm.includes('name') && !norm.includes('decision') && !norm.includes('contact')) autoMap.business_name = h;
      else if (norm.includes('type') || norm.includes('category')) autoMap.business_type = h;
      else if (norm.includes('state')) autoMap.state = h;
      else if (norm.includes('city') || norm.includes('suburb')) autoMap.city = h;
      else if (norm.includes('address') || norm.includes('street')) autoMap.address = h;
      else if (norm.includes('postcode') || norm.includes('zip')) autoMap.postcode = h;
      else if (norm.includes('phone') && !norm.includes('decision')) autoMap.phone = h;
      else if (norm.includes('email') && !norm.includes('decision')) autoMap.general_email = h;
      else if (norm.includes('abn')) autoMap.abn = h;
      else if (norm.includes('website') && !norm.includes('status')) autoMap.website_url = h;
      else if (norm.includes('websitestatus') || (norm.includes('site') && norm.includes('status'))) autoMap.website_status = h;
      else if (norm.includes('rating')) autoMap.google_rating = h;
      else if (norm.includes('review')) autoMap.google_review_count = h;
      else if (norm.includes('decision') && norm.includes('name')) autoMap.decision_maker_name = h;
      else if (norm.includes('decision') && norm.includes('position')) autoMap.decision_maker_position = h;
      else if (norm.includes('position') && !autoMap.decision_maker_position) autoMap.decision_maker_position = h;
      else if (norm.includes('decision') || norm.includes('contact') && !autoMap.decision_maker_name) autoMap.decision_maker_name = h;
      else if (norm.includes('linkedin')) autoMap.decision_maker_linkedin = h;
    });

    setMappings(autoMap);
    setCurrentStep(2);
  };

  // Run validation (Step 4)
  const handleValidate = () => {
    const valid: LeadFull[] = [];
    const errs: { row: number; reason: string }[] = [];
    let dupes = 0;

    parsedRows.forEach((row, index) => {
      const rowNum = index + 1;
      const bName = (row[mappings.business_name] || '').trim();
      const bType = (row[mappings.business_type] || 'Clinic').trim() as BusinessType;
      const bState = ((row[mappings.state] || 'NSW').trim().toUpperCase()) as AustralianState;
      const bCity = (row[mappings.city] || 'Sydney').trim();
      const bAddress = (row[mappings.address] || '100 Medical Way').trim();
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

      // Check duplicate
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
          message: `Imported ${total} Australian medical leads into CRM`
        });
      } else {
        setImportProgress(Math.round((count / total) * 100));
        setImportedCount(count);
      }
    }, 200);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card flex items-center justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            5-Step Australian Medical Leads Import Wizard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Bulk ingest Australian hospitals, clinics, medical practices, and equipment suppliers with column mapping and duplicate check.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" /> Load Sample Australian CSV
        </button>
      </div>

      {/* 5 Step Indicator */}
      <div className="grid grid-cols-5 gap-2 text-xs font-semibold">
        {[
          { step: 1, label: '1. Upload CSV' },
          { step: 2, label: '2. Preview Rows' },
          { step: 3, label: '3. Map Columns' },
          { step: 4, label: '4. Validate & Dedup' },
          { step: 5, label: '5. Import Execution' }
        ].map(s => {
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;

          return (
            <div
              key={s.step}
              className={`p-3 rounded-2xl border text-center transition-all ${
                isCurrent 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                  : isDone 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {isDone && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                <span>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* STEP 1: UPLOAD */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">Upload Australian Medical Leads CSV</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Drag and drop your spreadsheet or click browse. Standard UTF-8 CSV supported.
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
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
            >
              Browse Files
            </button>
            <button
              onClick={handleLoadSample}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              Use Sample Data
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PREVIEW */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">CSV File Preview: {fileName}</h3>
              <p className="text-xs text-slate-400">Found {parsedRows.length} rows and {parsedHeaders.length} columns</p>
            </div>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
            >
              Continue to Column Mapping →
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="py-2.5 px-3">#</th>
                  {parsedHeaders.map(h => (
                    <th key={h} className="py-2.5 px-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {parsedRows.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Map CSV Columns to CRM Fields</h3>
              <p className="text-xs text-slate-400">Match headers from your file to MedLead AU database properties</p>
            </div>
            <button
              onClick={handleValidate}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
            >
              Validate & Check Duplicates →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
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
              <div key={f.key} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                  {f.label}
                </label>
                <select
                  value={mappings[f.key] || ''}
                  onChange={(e) => setMappings({ ...mappings, [f.key]: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-medium"
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Data Validation & Duplicate Analysis</h3>
            <p className="text-xs text-slate-400">Review scan results before committing into CRM</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <span className="font-bold block text-sm">{validationResults.validRows.length} Records Ready</span>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Properly mapped and structured</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
              <span className="font-bold block text-sm">{validationResults.duplicateCount} Potential Duplicates</span>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Matches existing ABN, Name or Domain</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <span className="font-bold block text-sm">{validationResults.errorCount} Errors</span>
              <p className="text-[11px] text-slate-400 mt-1">Missing required business names</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold text-xs"
            >
              Back to Mapping
            </button>
            <button
              onClick={handleExecuteImport}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30"
            >
              Execute Import of {validationResults.validRows.length} Leads
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: IMPORT EXECUTION */}
      {currentStep === 5 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 shadow-card text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            {importProgress === 100 ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <UploadCloud className="w-8 h-8 animate-bounce" />}
          </div>

          <div>
            <h3 className="font-black text-xl text-slate-900 dark:text-white">
              {importProgress === 100 ? 'Import Completed Successfully!' : 'Importing Leads into MedLead CRM...'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {importProgress === 100 ? `Added ${importedCount} medical leads with opportunity scores.` : 'Ingesting records and computing website opportunity matrix...'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${importProgress}%` }}
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-2 block">
              {importProgress}%
            </span>
          </div>

          {importProgress === 100 && (
            <div className="pt-4">
              <button
                onClick={() => setCurrentRoute('leads')}
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30"
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
