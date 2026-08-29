import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Key, 
  Tag as TagIcon, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { useAuth } from '../../context/AuthContext';
import { initializeSupabase, getSupabaseConfig } from '../../lib/supabase';
import { exportLeadsToCsv } from '../../services/csvService';
import { useToast } from '../../context/ToastContext';

export function SettingsView() {
  const { leads, tags, createTag, deleteTag, resetDemoData } = useLeads();
  const { isSupabaseLive } = useAuth();
  const { showToast } = useToast();

  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.key);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    const res = initializeSupabase(supabaseUrl.trim(), supabaseAnonKey.trim());
    if (res.success) {
      showToast({
        type: 'success',
        title: 'Supabase Configuration Saved',
        message: res.message
      });
      window.location.reload();
    } else {
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: res.message
      });
    }
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    createTag(newTagName.trim(), newTagColor);
    setNewTagName('');
    showToast({
      type: 'success',
      title: 'Tag Created',
      message: `Added tag #${newTagName}`
    });
  };

  const sqlSchemaSnippet = `-- healthIntel - Complete 9 Table Supabase DDL
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  ownership_type VARCHAR(50) DEFAULT 'Unknown',
  abn VARCHAR(50),
  state VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  postcode VARCHAR(10) NOT NULL,
  phone VARCHAR(50),
  general_email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS digital_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  website_url TEXT,
  website_exists BOOLEAN DEFAULT true,
  website_status VARCHAR(50) DEFAULT 'Unknown',
  google_maps_url TEXT,
  google_maps_verified VARCHAR(50) DEFAULT 'Pending',
  google_rating NUMERIC(2,1),
  google_review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS website_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  opportunity_score INTEGER NOT NULL DEFAULT 50,
  visual_design_score INTEGER DEFAULT 5,
  branding_score INTEGER DEFAULT 5,
  typography_score INTEGER DEFAULT 5,
  mobile_ux_score INTEGER DEFAULT 5,
  navigation_score INTEGER DEFAULT 5,
  cta_score INTEGER DEFAULT 5,
  appointment_cta BOOLEAN DEFAULT false,
  contact_cta BOOLEAN DEFAULT true,
  what_i_noticed TEXT,
  recommended_improvements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decision_makers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  role_type VARCHAR(100) NOT NULL,
  priority VARCHAR(50) DEFAULT 'Primary',
  email VARCHAR(255),
  phone VARCHAR(50),
  linkedin_url TEXT,
  email_verification_status VARCHAR(50) DEFAULT 'Verified',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    showToast({
      type: 'success',
      title: 'SQL Copied',
      message: 'Supabase schema DDL copied to clipboard'
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">
            Settings & Backend Integration
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Configure Supabase PostgreSQL backend, custom tags, schema definitions, and local cache controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isSupabaseLive 
              ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]' 
              : 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-[#047857]' : 'bg-[#B45309]'}`} />
            <span>{isSupabaseLive ? 'Supabase Live Connected' : 'Local Storage Engine'}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Supabase Settings */}
        <div className="space-y-6">
          
          {/* Supabase Connection Form */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0F172A]">Supabase API Credentials</h2>
                <p className="text-xs text-[#64748B]">Connect your Supabase project for real-time multi-user synchronization</p>
              </div>
            </div>

            <form onSubmit={handleSaveSupabase} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0F172A] block mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2 font-mono text-[11px] text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="font-bold text-[#0F172A] block mb-1">
                  Supabase Anon / Public Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2 font-mono text-[11px] text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Supabase Dashboard
                </a>

                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs transition-all"
                >
                  Save Connection
                </button>
              </div>
            </form>
          </div>

          {/* Tag Management */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
                <TagIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0F172A]">CRM Tags & Classifications</h2>
                <p className="text-xs text-[#64748B]">Organize and segment medical leads by campaign or specialty</p>
              </div>
            </div>

            {/* Create Tag Form */}
            <form onSubmit={handleCreateTag} className="flex items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="New tag label (e.g. Q4 Outreach)"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2 text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />

              <select
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2 text-xs font-medium text-[#0F172A]"
              >
                <option value="blue">Blue</option>
                <option value="emerald">Emerald</option>
                <option value="rose">Rose</option>
                <option value="amber">Amber</option>
                <option value="purple">Purple</option>
              </select>

              <button
                type="submit"
                className="h-9 px-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Tag List */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-semibold text-[#475569]"
                >
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  <span>{tag.name}</span>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="hover:text-[#B91C1C] ml-1 text-[#94A3B8]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Local Data Controls */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Dataset & Cache Management</h3>
                <p className="text-xs text-[#64748B]">Reset or reload default Australian medical provider dataset</p>
              </div>

              <button
                onClick={() => {
                  if (confirm('Reset CRM database and reload Commonwealth hospital register dataset?')) {
                    resetDemoData();
                  }
                }}
                className="h-9 px-3.5 rounded-lg bg-[#F8FAFC] hover:bg-[#FEF2F2] text-[#475569] hover:text-[#B91C1C] border border-[#E2E8F0] hover:border-[#FECACA] text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Database
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: SQL Schema DDL */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <h2 className="text-sm font-bold text-[#0F172A]">Supabase SQL Schema DDL</h2>
              </div>

              <button
                onClick={copySql}
                className="h-8 px-3 rounded-md bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <p className="text-xs text-[#64748B] mb-3">
              Run this SQL script in your Supabase SQL Editor to provision all tables, columns, and foreign keys.
            </p>

            <div className="bg-[#0B1220] rounded-lg p-3 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-[460px] leading-relaxed border border-[#1E293B]">
              <pre>{sqlSchemaSnippet}</pre>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#64748B] flex items-center justify-between">
            <span>Location: <code className="font-mono text-[#0F172A]">supabase/schema.sql</code></span>
            <span className="font-semibold text-[#047857]">Production Ready</span>
          </div>
        </div>

      </div>

    </div>
  );
}
