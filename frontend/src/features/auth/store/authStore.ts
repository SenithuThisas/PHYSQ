import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

type State = {
  initializing: boolean;
  session: Session | null;
  error?: string | null;
};

type Actions = {
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string } | void>;
  signUp: (email: string, password: string) => Promise<{ error?: string } | void>;
  signOut: () => Promise<void>;
  setError: (e: string | null) => void;
};

export const useAuthStore = create<State & Actions>((set) => ({
  initializing: true,
  session: null,
  error: null,

  initialize: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session ?? null, initializing: false });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session: session ?? null });
    });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) set({ error: error.message });
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) set({ error: error.message });
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  setError: (e) => set({ error: e })
}));

