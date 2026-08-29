import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or localStorage config
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || localStorage.getItem('medlead_supabase_url') || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('medlead_supabase_anon_key') || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') && 
  supabaseAnonKey.length > 20
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabase = null;
  }
}

export function initializeSupabase(url: string, key: string): { success: boolean; message: string } {
  try {
    if (!url || !key) {
      localStorage.removeItem('medlead_supabase_url');
      localStorage.removeItem('medlead_supabase_anon_key');
      supabase = null;
      return { success: true, message: 'Disconnected Supabase. Running in Demo & Local Storage mode.' };
    }

    if (!url.startsWith('https://')) {
      return { success: false, message: 'Supabase URL must start with https://' };
    }

    localStorage.setItem('medlead_supabase_url', url);
    localStorage.setItem('medlead_supabase_anon_key', key);
    
    supabase = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });

    return { success: true, message: 'Supabase client configured successfully!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to Supabase' };
  }
}

export function getSupabaseConfig() {
  const metaEnv = (import.meta as any).env || {};
  return {
    url: localStorage.getItem('medlead_supabase_url') || metaEnv.VITE_SUPABASE_URL || '',
    key: localStorage.getItem('medlead_supabase_anon_key') || metaEnv.VITE_SUPABASE_ANON_KEY || '',
    isConnected: isSupabaseConfigured && supabase !== null
  };
}
