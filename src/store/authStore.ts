import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delayMs: number = RETRY_DELAY
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation, ${retries} attempts remaining...`);
      await delay(delayMs);
      return retryOperation(operation, retries - 1, delayMs);
    }
    throw error;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearError: () => set({ error: null }),
  signIn: async (email: string, password: string) => {
    try {
      set({ error: null });

      // Test database connection before attempting sign in
      try {
        await testConnection();
      } catch (err) {
        throw new Error('Database configuration error. Please ensure you are connected to Supabase by clicking the "Connect to Supabase" button in the top right corner.');
      }

      // First attempt to sign in
      const { data: authData, error: authError } = await retryOperation(async () => 
        await supabase.auth.signInWithPassword({
          email,
          password,
        })
      );

      if (authError) {
        if (authError.message.includes('Database error querying schema')) {
          throw new Error('Database configuration error. Please ensure you are connected to Supabase by clicking the "Connect to Supabase" button in the top right corner.');
        }
        throw authError;
      }

      if (!authData?.user) {
        throw new Error('No user data received');
      }

      // Then fetch the profile
      const { data: profile, error: profileError } = await retryOperation(async () =>
        await supabase
          .from('profiles')
          .select('role, name, avatar_url')
          .eq('id', authData.user.id)
          .maybeSingle()
      );

      if (profileError) {
        if (profileError.message.includes('Database error querying schema')) {
          throw new Error('Database configuration error. Please ensure you are connected to Supabase by clicking the "Connect to Supabase" button in the top right corner.');
        }
        throw profileError;
      }

      if (!profile) {
        throw new Error('User profile not found. Please contact support.');
      }

      set({
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          role: profile.role,
          name: profile.name,
          avatar_url: profile.avatar_url,
        },
        isAuthenticated: true,
        error: null,
      });
    } catch (err: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err.message?.includes('Database error querying schema') || 
          err.message?.includes('Database configuration error')) {
        errorMessage = 'Database configuration error. Please ensure you are connected to Supabase by clicking the "Connect to Supabase" button in the top right corner.';
      } else if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password.';
      } else if (err.message?.includes('User profile not found')) {
        errorMessage = err.message;
      }
      
      set({ error: errorMessage, user: null, isAuthenticated: false });
      throw new Error(errorMessage);
    }
  },
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false, error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      set({ error: errorMessage });
      throw err;
    }
  },
}));

// Initialize auth state from session
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    supabase
      .from('profiles')
      .select('role, name, avatar_url')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data: profile, error }) => {
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (profile) {
          useAuthStore.setState({
            user: {
              id: session.user.id,
              email: session.user.email!,
              role: profile.role,
              name: profile.name,
              avatar_url: profile.avatar_url,
            },
            isAuthenticated: true,
            error: null,
          });
        }
      });
  }
});