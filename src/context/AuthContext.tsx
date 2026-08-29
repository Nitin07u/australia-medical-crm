import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseLive: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'usr-demo-01',
  email: 'hello@stoiclabs.dev',
  name: 'Nitin Upadhyaya',
  role: 'Founder & Digital Lead',
  avatar: '/nitin-avatar.jpg'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('medlead_active_user_v2');
    return saved ? JSON.parse(saved) : DEMO_USER;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabaseLive, setIsSupabaseLive] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      setIsSupabaseLive(true);
      // Check active Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@medlead.com.au',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Agency User',
            role: 'Agency Member'
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@medlead.com.au',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Agency User',
            role: 'Agency Member'
          });
        } else if (!session) {
          // If no supabase session, keep demo or null
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setIsSupabaseLive(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: 'Agency Member'
          };
          setUser(profile);
          localStorage.setItem('medlead_active_user_v2', JSON.stringify(profile));
          return { success: true };
        }
      }

      // Demo login
      const demoProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        email: email || DEMO_USER.email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()) || DEMO_USER.name,
        role: 'Founder & Digital Lead',
        avatar: '/nitin-avatar.jpg'
      };
      setUser(demoProfile);
      localStorage.setItem('medlead_active_user_v2', JSON.stringify(demoProfile));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to authenticate' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Supabase signout error:', e);
      }
    }
    setUser(null);
    localStorage.removeItem('medlead_active_user_v2');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isSupabaseLive,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
