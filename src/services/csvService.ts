import { LeadFull, AustralianState, BusinessType, WebsiteStatus } from '../types';

/**
 * Robust CSV parser that handles commas inside quotes and multiline fields
 */
export function parseCsvText(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentLine += char;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const parseRow = (line: string): string[] => {
    const values: string[] = [];
    let currentVal = '';
    let inside = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const next = line[i + 1];

      if (c === '"') {
        if (inside && next === '"') {
          currentVal += '"';
          i++;
        } else {
          inside = !inside;
        }
      } else if (c === ',' && !inside) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += c;
      }
    }
    values.push(currentVal.trim());
    return values;
  };

  const headers = parseRow(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      rowObj[header] = (values[idx] || '').replace(/^["']|["']$/g, '').trim();
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * Generate CSV string from LeadFull records
 */
export function exportLeadsToCsv(leads: LeadFull[]): string {
  const headers = [
    'Business Name',
    'Business Type',
    'Subcategory',
    'Ownership Type',
    'ABN',
    'State',
    'City',
    'Address',
    'Postcode',
    'Phone',
    'General Email',
    'Website URL',
    'Website Status',
    'Google Maps Verified',
    'Google Rating',
    'Google Review Count',
    'Opportunity Score',
    'Lead Score',
    'Lead Status',
    'Primary Decision Maker',
    'Position',
    'Decision Maker Email',
    'Decision Maker Phone',
    'LinkedIn URL',
    'Tags',
    'Created Date'
  ];

  const escapeCell = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = leads.map(lead => {
    const b = lead.business;
    const dp = lead.digital_presence;
    const l = lead.lead;
    const wa = lead.website_audit;
    const primaryDM = lead.decision_makers.find(dm => dm.priority === 'Primary') || lead.decision_makers[0];
    const tagsStr = lead.tags.map(t => t.name).join(', ');

    return [
      escapeCell(b.business_name),
      escapeCell(b.business_type),
      escapeCell(b.subcategory || ''),
      escapeCell(b.ownership_type),
      escapeCell(b.abn || ''),
      escapeCell(b.state),
      escapeCell(b.city),
      escapeCell(b.address),
      escapeCell(b.postcode),
      escapeCell(b.phone || ''),
      escapeCell(b.general_email || ''),
      escapeCell(dp.website_url || ''),
      escapeCell(dp.website_status),
      escapeCell(dp.google_maps_verified),
      escapeCell(dp.google_rating || ''),
      escapeCell(dp.google_review_count || 0),
      escapeCell(wa?.opportunity_score ?? ''),
      escapeCell(l.lead_score),
      escapeCell(l.lead_status),
      escapeCell(primaryDM?.full_name || ''),
      escapeCell(primaryDM?.position || ''),
      escapeCell(primaryDM?.email || ''),
      escapeCell(primaryDM?.phone || ''),
      escapeCell(primaryDM?.linkedin_url || ''),
      escapeCell(tagsStr),
      escapeCell(b.created_at.split('T')[0])
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Sample Australian Medical CSV Data for Instant Testing
 */
export function getSampleCsvData(): string {
  return `Business Name,Business Type,State,City,Address,Postcode,Phone,General Email,ABN,Website URL,Website Status,Google Rating,Review Count,Decision Maker,Position,Decision Maker Email,LinkedIn URL,Lead Score,Tags
"Starlight Paediatric Medical Practice","Clinic","NSW","Surry Hills","240 Crown St","2010","(02) 9360 8822","info@starlightpaediatrics.com.au","39 881 209 443","","No Website","4.9","88","Dr. Jeremy Clarkson","Principal Paediatrician","j.clarkson@starlightpaediatrics.com.au","https://linkedin.com/in/dr-jeremy-clarkson-paeds","10","High Opportunity, Sydney"
"Monash Specialist Imaging Centre","Medical Centre","VIC","Clayton","15 Clayton Rd","3168","(03) 9544 3300","reception@monashimaging.com.au","48 119 402 771","http://monashimaging.com.au","Severely Outdated","4.7","134","Dr. Angela Watson","Director of Imaging","awatson@monashimaging.com.au","https://linkedin.com/in/dr-angela-watson-rad","9","Melbourne, Outdated Website"
"Queensland Robotic Joint Institute","Clinic","QLD","Auchenflower","Level 4, 12 Chasely St","4066","(07) 3870 9900","rooms@qldroboticjoints.com.au","72 884 102 995","https://qldroboticjoints.com.au","Needs Improvement","4.8","92","Dr. Harrison Wells","Managing Partner & Surgeon","hwells@qldroboticjoints.com.au","https://linkedin.com/in/dr-harrison-wells-ortho","8","Brisbane"
"West Coast Endoscopy & Day Hospital","Hospital","WA","Subiaco","374 Bagot Rd","6008","(08) 9382 7700","admin@westcoastdayhospital.com.au","55 901 338 224","https://westcoastdayhospital.com.au","Needs Improvement","4.5","160","Samantha Vance","Chief Executive Officer","svance@westcoastdayhospital.com.au","https://linkedin.com/in/samantha-vance-ceo","8","Private Hospital"
"Precision Cardiac Diagnostics","Medical Equipment","NSW","Macquarie Park","Unit 3, 14 Giffnock Ave","2113","(02) 8878 9911","sales@precisioncardiac.com.au","61 443 889 102","http://precisioncardiac.com.au","Severely Outdated","4.8","45","Craig Mitchell","Managing Director","cmitchell@precisioncardiac.com.au","https://linkedin.com/in/craig-mitchell-med","9","Medical Equipment, Sydney"`;
}
