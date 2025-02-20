import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

interface Settings {
  autoReload: boolean;
  defaultViewMode: 'grid' | 'list' | 'table';
  autoSaveInterval: number;
  showVersionHistory: boolean;
  enableAnnotations: boolean;
  enableComments: boolean;
  emailNotifications: boolean;
  documentUpdates: boolean;
  commentNotifications: boolean;
  versionUpdates: boolean;
  twoFactorAuth: boolean;
  requireApproval: boolean;
  documentWatermark: boolean;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  settings: Settings;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  checkAuth: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => void;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

const defaultSettings: Settings = {
  autoReload: true,
  defaultViewMode: 'grid',
  autoSaveInterval: 5,
  showVersionHistory: true,
  enableAnnotations: true,
  enableComments: true,
  emailNotifications: true,
  documentUpdates: true,
  commentNotifications: true,
  versionUpdates: true,
  twoFactorAuth: false,
  requireApproval: true,
  documentWatermark: true,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      settings: defaultSettings,
      loading: true,
      initialized: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      checkAuth: async () => {
        try {
          // First check session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            set({ user: null, profile: null, loading: false, initialized: true });
            return;
          }

          if (!session?.user) {
            set({ user: null, profile: null, loading: false, initialized: true });
            return;
          }

          // Set user if session exists
          set({ user: session.user });

          // Then fetch profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile error:', profileError);
            // Don't clear user here, just set profile to null
            set({ profile: null, loading: false, initialized: true });
            return;
          }

          set({ profile, loading: false, initialized: true });
        } catch (error) {
          console.error('Auth check error:', error);
          set({ user: null, profile: null, loading: false, initialized: true });
        }
      },

      signIn: async (email, password) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({ user: data.user });

          // Fetch profile after successful sign in
          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            set({ profile });
          }
        } catch (error) {
          throw error;
        } finally {
          set({ loading: false, initialized: true });
        }
      },

      signUp: async (data) => {
        set({ loading: true });
        try {
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                full_name: data.name,
                phone: data.phone
              }
            }
          });

          if (error) throw error;

          // Don't set user/profile immediately after signup
          // Wait for email confirmation if required
          set({ loading: false, initialized: true });
          
          return authData;
        } catch (error) {
          throw error;
        } finally {
          set({ loading: false, initialized: true });
        }
      },

      signOut: async () => {
        set({ loading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          // Clear all state
          set({ 
            user: null, 
            profile: null,
            loading: false,
            initialized: true,
            settings: defaultSettings // Reset settings to default
          });
        } catch (error) {
          console.error('Sign out error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        settings: state.settings
      }),
    }
  )
);