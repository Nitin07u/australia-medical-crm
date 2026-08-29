-- ==============================================================================
-- MedLead AU - Australian Medical Business Lead Intelligence
-- Supabase PostgreSQL Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100) NOT NULL CHECK (business_type IN ('Hospital', 'Clinic', 'Medical Centre', 'Medical Equipment', 'Medical Device', 'Rehabilitation', 'Other')),
  subcategory VARCHAR(100),
  ownership_type VARCHAR(50) DEFAULT 'Unknown' CHECK (ownership_type IN ('Public', 'Private', 'Independent', 'Unknown')),
  abn VARCHAR(50),
  provider_number VARCHAR(50),
  description TEXT,
  state VARCHAR(10) NOT NULL CHECK (state IN ('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT')),
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  postcode VARCHAR(10) NOT NULL,
  phone VARCHAR(50),
  general_email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DIGITAL PRESENCE TABLE
CREATE TABLE IF NOT EXISTS digital_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  website_url TEXT,
  website_exists BOOLEAN NOT NULL DEFAULT true,
  website_status VARCHAR(50) NOT NULL DEFAULT 'Unknown' CHECK (website_status IN ('No Website', 'Good Website', 'Needs Improvement', 'Severely Outdated', 'Unknown')),
  website_technology VARCHAR(255),
  google_maps_url TEXT,
  google_maps_verified VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (google_maps_verified IN ('Verified', 'Not Found', 'Pending')),
  google_rating NUMERIC(2,1),
  google_review_count INTEGER DEFAULT 0,
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_digital_presence_business UNIQUE(business_id)
);

-- 3. WEBSITE AUDITS TABLE
CREATE TABLE IF NOT EXISTS website_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  visual_design_score SMALLINT NOT NULL DEFAULT 5 CHECK (visual_design_score BETWEEN 0 AND 10),
  branding_score SMALLINT NOT NULL DEFAULT 5 CHECK (branding_score BETWEEN 0 AND 10),
  typography_score SMALLINT NOT NULL DEFAULT 5 CHECK (typography_score BETWEEN 0 AND 10),
  image_quality_score SMALLINT NOT NULL DEFAULT 5 CHECK (image_quality_score BETWEEN 0 AND 10),
  navigation_score SMALLINT NOT NULL DEFAULT 5 CHECK (navigation_score BETWEEN 0 AND 10),
  mobile_ux_score SMALLINT NOT NULL DEFAULT 5 CHECK (mobile_ux_score BETWEEN 0 AND 10),
  user_journey_score SMALLINT NOT NULL DEFAULT 5 CHECK (user_journey_score BETWEEN 0 AND 10),
  cta_score SMALLINT NOT NULL DEFAULT 5 CHECK (cta_score BETWEEN 0 AND 10),
  loading_speed_score SMALLINT NOT NULL DEFAULT 5 CHECK (loading_speed_score BETWEEN 0 AND 10),
  mobile_performance_score SMALLINT NOT NULL DEFAULT 5 CHECK (mobile_performance_score BETWEEN 0 AND 10),
  contact_cta BOOLEAN NOT NULL DEFAULT false,
  appointment_cta BOOLEAN NOT NULL DEFAULT false,
  enquiry_form BOOLEAN NOT NULL DEFAULT false,
  whatsapp_contact BOOLEAN NOT NULL DEFAULT false,
  product_enquiry BOOLEAN NOT NULL DEFAULT false,
  service_information BOOLEAN NOT NULL DEFAULT false,
  product_information BOOLEAN NOT NULL DEFAULT false,
  about_information BOOLEAN NOT NULL DEFAULT false,
  testimonials BOOLEAN NOT NULL DEFAULT false,
  trust_signals BOOLEAN NOT NULL DEFAULT false,
  certifications BOOLEAN NOT NULL DEFAULT false,
  what_i_noticed TEXT,
  recommended_improvements TEXT,
  opportunity_score SMALLINT NOT NULL DEFAULT 50 CHECK (opportunity_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_audit_business UNIQUE(business_id)
);

-- 4. DECISION MAKERS TABLE
CREATE TABLE IF NOT EXISTS decision_makers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  role_type VARCHAR(100) NOT NULL CHECK (role_type IN ('Owner', 'Founder', 'CEO', 'Managing Director', 'Director', 'Marketing Manager', 'Head of Marketing', 'Practice Manager', 'Medical Director', 'Other')),
  priority VARCHAR(50) NOT NULL DEFAULT 'Primary' CHECK (priority IN ('Primary', 'Secondary')),
  linkedin_url TEXT,
  email VARCHAR(255),
  email_verification_status VARCHAR(50) NOT NULL DEFAULT 'Unknown' CHECK (email_verification_status IN ('Verified', 'Unverified', 'Risky', 'Unknown')),
  phone VARCHAR(50),
  source VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  lead_score SMALLINT NOT NULL DEFAULT 5 CHECK (lead_score BETWEEN 1 AND 10),
  lead_status VARCHAR(50) NOT NULL DEFAULT 'New' CHECK (lead_status IN ('New', 'Researching', 'Qualified', 'Ready for Outreach', 'Contacted', 'Interested', 'Meeting', 'Proposal', 'Won', 'Lost', 'Disqualified')),
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_lead_business UNIQUE(business_id)
);

-- 6. TAGS TABLE
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(50) NOT NULL DEFAULT 'slate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BUSINESS_TAGS JOIN TABLE
CREATE TABLE IF NOT EXISTS business_tags (
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, tag_id)
);

-- 8. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  user_name VARCHAR(100) DEFAULT 'Agent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_businesses_state ON businesses(state);
CREATE INDEX IF NOT EXISTS idx_businesses_type ON businesses(business_type);
CREATE INDEX IF NOT EXISTS idx_businesses_abn ON businesses(abn);
CREATE INDEX IF NOT EXISTS idx_digital_presence_status ON digital_presence(website_status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_business_id ON tasks(business_id);
CREATE INDEX IF NOT EXISTS idx_decision_makers_business_id ON decision_makers(business_id);
CREATE INDEX IF NOT EXISTS idx_activities_business_id ON activities(business_id);

-- ==============================================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_timestamp_businesses
BEFORE UPDATE ON businesses
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_digital_presence
BEFORE UPDATE ON digital_presence
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_website_audits
BEFORE UPDATE ON website_audits
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_decision_makers
BEFORE UPDATE ON decision_makers
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_leads
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_tasks
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_makers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full read/write access
CREATE POLICY "Authenticated users can select businesses" ON businesses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert businesses" ON businesses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update businesses" ON businesses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete businesses" ON businesses FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can all digital_presence" ON digital_presence FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can all website_audits" ON website_audits FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can all decision_makers" ON decision_makers FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can all leads" ON leads FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can all tags" ON tags FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can all business_tags" ON business_tags FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can all tasks" ON tasks FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can all activities" ON activities FOR ALL TO authenticated USING (true);
