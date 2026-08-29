// TypeScript definitions for MedLead AU - Australian Medical Business Lead Intelligence

export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';

export type BusinessType = 
  | 'Hospital'
  | 'Clinic'
  | 'Medical Centre'
  | 'Medical Equipment'
  | 'Medical Device'
  | 'Rehabilitation'
  | 'Other';

export type OwnershipType = 'Public' | 'Private' | 'Independent' | 'Unknown';

export type WebsiteStatus = 
  | 'No Website'
  | 'Good Website'
  | 'Needs Improvement'
  | 'Severely Outdated'
  | 'Unknown';

export type GoogleMapsStatus = 'Verified' | 'Not Found' | 'Pending';

export type LeadStatus = 
  | 'New'
  | 'Researching'
  | 'Qualified'
  | 'Ready for Outreach'
  | 'Contacted'
  | 'Interested'
  | 'Meeting'
  | 'Proposal'
  | 'Won'
  | 'Lost'
  | 'Disqualified';

export type RoleType = 
  | 'Owner'
  | 'Founder'
  | 'CEO'
  | 'Managing Director'
  | 'Director'
  | 'Marketing Manager'
  | 'Head of Marketing'
  | 'Practice Manager'
  | 'Medical Director'
  | 'Other';

export type ContactPriority = 'Primary' | 'Secondary';
export type EmailVerificationStatus = 'Verified' | 'Unverified' | 'Risky' | 'Unknown';

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export type ActivityType = 
  | 'lead_created'
  | 'website_checked'
  | 'maps_verified'
  | 'audit_completed'
  | 'decision_maker_added'
  | 'status_changed'
  | 'score_updated'
  | 'note_added'
  | 'task_created'
  | 'task_completed';

// 1. Business Table Entity
export interface Business {
  id: string;
  business_name: string;
  business_type: BusinessType;
  subcategory?: string;
  ownership_type: OwnershipType;
  abn?: string;
  provider_number?: string;
  description?: string;
  state: AustralianState;
  city: string;
  address: string;
  postcode: string;
  phone?: string;
  general_email?: string;
  created_at: string;
  updated_at: string;
}

// 2. Digital Presence Table Entity
export interface DigitalPresence {
  id: string;
  business_id: string;
  website_url?: string;
  website_exists: boolean;
  website_status: WebsiteStatus;
  website_technology?: string;
  google_maps_url?: string;
  google_maps_verified: GoogleMapsStatus;
  google_rating?: number;
  google_review_count?: number;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  created_at: string;
  updated_at: string;
}

// 3. Website Audit Table Entity
export interface WebsiteAudit {
  id: string;
  business_id: string;
  // Design Scores (0-10)
  visual_design_score: number;
  branding_score: number;
  typography_score: number;
  image_quality_score: number;
  // UX Scores (0-10)
  navigation_score: number;
  mobile_ux_score: number;
  user_journey_score: number;
  cta_score: number;
  // Performance (0-10)
  loading_speed_score: number;
  mobile_performance_score: number;
  // Conversion Signals
  contact_cta: boolean;
  appointment_cta: boolean;
  enquiry_form: boolean;
  whatsapp_contact: boolean;
  product_enquiry: boolean;
  // Content Signals
  service_information: boolean;
  product_information: boolean;
  about_information: boolean;
  testimonials: boolean;
  trust_signals: boolean;
  certifications: boolean;
  // Notes & Recommendations
  what_i_noticed: string;
  recommended_improvements: string;
  // Calculated Score (0-100)
  opportunity_score: number;
  created_at: string;
  updated_at: string;
}

// 4. Decision Maker Table Entity
export interface DecisionMaker {
  id: string;
  business_id: string;
  full_name: string;
  position: string;
  role_type: RoleType;
  priority: ContactPriority;
  linkedin_url?: string;
  email?: string;
  email_verification_status: 'Verified' | 'Unverified' | 'Risky' | 'Unknown';
  phone?: string;
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 5. Lead Table Entity
export interface LeadRecord {
  id: string;
  business_id: string;
  lead_score: number; // 1 - 10
  lead_status: LeadStatus;
  priority: 'High' | 'Medium' | 'Low';
  created_at: string;
  updated_at: string;
}

// 6. Tag Entities
export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

// 7. Task Table Entity
export interface Task {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

// 8. Activity Table Entity
export interface Activity {
  id: string;
  business_id: string;
  activity_type: ActivityType;
  description: string;
  user_name?: string;
  created_at: string;
}

// Full Hydrated Lead Object for CRM views
export interface LeadFull {
  business: Business;
  digital_presence: DigitalPresence;
  lead: LeadRecord;
  website_audit?: WebsiteAudit;
  decision_makers: DecisionMaker[];
  tasks: Task[];
  activities: Activity[];
  tags: Tag[];
}

// Filter State for CRM Table
export interface LeadFilterState {
  searchQuery: string;
  businessTypes: BusinessType[];
  ownershipTypes: OwnershipType[];
  states: AustralianState[];
  websiteStatuses: WebsiteStatus[];
  googleMapsStatuses: GoogleMapsStatus[];
  decisionMakerFound?: boolean | null;
  scoreRange?: [number, number];
  leadStatuses: LeadStatus[];
  tagIds: string[];
}

// Table Sort Options
export type SortField = 
  | 'lead_score'
  | 'business_name'
  | 'business_type'
  | 'state'
  | 'city'
  | 'website_status'
  | 'lead_status'
  | 'opportunity_score'
  | 'created_at';

export type SortOrder = 'asc' | 'desc';

export interface LeadSortState {
  field: SortField;
  order: SortOrder;
}

// Duplicate Detection Result
export interface DuplicateCandidate {
  field: 'abn' | 'name_address' | 'domain' | 'phone';
  matchedValue: string;
  existingLead: LeadFull;
}

// CSV Import Schema
export interface RawCsvRow {
  [key: string]: string;
}

export interface CsvMapping {
  business_name: string;
  business_type: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  general_email: string;
  abn: string;
  website_url: string;
  website_status: string;
  google_maps_url: string;
  google_rating: string;
  google_review_count: string;
  decision_maker_name: string;
  decision_maker_position: string;
  decision_maker_email: string;
  decision_maker_linkedin: string;
  lead_score: string;
  notes: string;
  tags: string;
}

export interface ImportValidationResult {
  rowNumber: number;
  row: RawCsvRow;
  transformed?: Partial<LeadFull>;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  duplicateReason?: string;
}

export type ActiveRoute = 
  | 'dashboard'
  | 'leads'
  | 'hospitals'
  | 'clinics'
  | 'medical-centres'
  | 'medical-equipment'
  | 'website-audit'
  | 'decision-makers'
  | 'tasks'
  | 'import-leads'
  | 'settings'
  | 'lead-detail';
