import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  userRole: number | null;
  isLoading: boolean;
  isCheckingUser: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userRole: null,
  isLoading: false,
  isCheckingUser: false,
  error: null,

  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      const redirectUrl = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, userRole: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  checkUser: async () => {
    if (get().isCheckingUser) {
      return;
    }

    try {
      set({ isCheckingUser: true, error: null });
      const { data } = await supabase.auth.getUser();

      const currentUser = get().user;
      const newUser = data.user;

      const userChanged = (currentUser === null && newUser !== null) ||
        (currentUser !== null && newUser === null) ||
        (currentUser?.id !== newUser?.id);

      if (userChanged || (newUser !== null && get().userRole === null)) {
        if (userChanged) {
          set({ user: newUser });
        }

        if (newUser) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', newUser.id)
            .single();

          if (userError) {
            set({ userRole: null });
          } else if (userData) {
            const role = userData.role || userData.rol || userData.user_role || userData.role_id;
            set({ userRole: role ? Number(role) : null });
          } else {
            set({ userRole: null });
          }
        } else {
          set({ userRole: null });
        }
      }
    } catch (error) {
      set({ error: (error as Error).message, user: null, userRole: null });
    } finally {
      set({ isCheckingUser: false });
    }
  },
}));
