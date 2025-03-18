import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isCheckingUser: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isCheckingUser: false,
  error: null,

  signInWithGoogle: async () => {
    try {
      console.log('Starting Google sign in')
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
      console.log('Starting sign out')
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  checkUser: async () => {
    if (get().isCheckingUser) {
      console.log('Already checking user, skipping')
      return;
    }

    try {
      console.log('Starting user check')
      set({ isCheckingUser: true, error: null });
      const { data } = await supabase.auth.getUser();

      const currentUser = get().user;
      const newUser = data.user;

      console.log('User check result:', { currentUser, newUser });

      if (
        (currentUser === null && newUser !== null) ||
        (currentUser !== null && newUser === null) ||
        (currentUser?.id !== newUser?.id)
      ) {
        console.log('Updating user state')
        set({ user: newUser });
      }
    } catch (error) {
      console.error('Auth error:', error);
      set({ error: (error as Error).message, user: null });
    } finally {
      console.log('Finishing user check')
      set({ isCheckingUser: false });
    }
  },
}));
