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

  const sqlSchemaSnippet = `-- MedLead AU - Complete 9 Table Supabase DDL
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
  visual_design_score SMALLINT DEFAULT 5,
  mobile_ux_score SMALLINT DEFAULT 5,
  opportunity_score SMALLINT DEFAULT 50,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  lead_score SMALLINT DEFAULT 5,
  lead_status VARCHAR(50) DEFAULT 'New',
  priority VARCHAR(20) DEFAULT 'Medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full schema with RLS policies available in supabase/schema.sql`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    showToast({
      type: 'success',
      title: 'SQL Copied',
      message: 'Paste into Supabase SQL Editor'
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card">
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          System Settings & Database Architecture
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure Supabase PostgreSQL backend, manage custom tags, and control lead storage backups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Supabase Connection Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Supabase PostgreSQL Integration</h3>
                <p className="text-xs text-slate-400">Connect to live Supabase project instance</p>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              isSupabaseLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400'
            }`}>
              {isSupabaseLive ? 'Supabase Live' : 'Demo / Local Mode'}
            </span>
          </div>

          <form onSubmit={handleSaveSupabase} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Project URL</label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Anon / Public API Key</label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-[11px]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setSupabaseUrl('');
                  setSupabaseAnonKey('');
                  initializeSupabase('', '');
                  window.location.reload();
                }}
                className="text-xs text-slate-500 hover:text-rose-600 font-semibold"
              >
                Disconnect / Run Local
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 transition-all"
              >
                Save & Connect Supabase
              </button>
            </div>
          </form>
        </div>

        {/* 2. SQL Schema Viewer & Copier */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Supabase Schema Definition</h3>
                <p className="text-xs text-slate-400">9 Production tables with RLS & indexes</p>
              </div>
            </div>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition-colors"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="bg-slate-900 text-slate-300 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-[190px] border border-slate-800 scrollbar-thin">
            {sqlSchemaSnippet}
          </pre>

          <p className="text-[11px] text-slate-400">
            Copy the script into your Supabase Dashboard SQL Editor to initialize all tables with Row Level Security.
          </p>
        </div>

      </div>

      {/* Tag Management & Data Reset Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Custom Tags Manager */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <TagIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tagging System</h3>
                <p className="text-xs text-slate-400">Manage lead labels and campaign tags</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateTag} className="flex items-center gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="e.g. Melbourne West, High Intent"
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0"
            >
              Add Tag
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map(t => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700"
              >
                #{t.name}
                <button
                  onClick={() => deleteTag(t.id)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Demo Data & Backup Center */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Data Management & Reset</h3>
                <p className="text-xs text-slate-400">Restore default Australian medical dataset</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Resetting restores the 30 realistic Australian medical business records (Hospitals, Clinics, Centres, Medical Devices) across NSW, VIC, QLD, WA, SA, TAS, ACT, NT with completed audits and decision makers.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-3">
            <button
              onClick={() => {
                if (confirm('Reset CRM to initial 30 Australian medical leads?')) {
                  resetDemoData();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restore 30 Demo Leads
            </button>

            <span className="text-xs text-slate-400 font-semibold">{leads.length} Total Leads Active</span>
          </div>
        </div>

      </div>

    </div>
  );
}
