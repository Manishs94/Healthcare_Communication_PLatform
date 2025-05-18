import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please connect to Supabase using the "Connect to Supabase" button in the top right corner.'
  );
}

// Validate Supabase URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!isValidUrl(supabaseUrl)) {
  throw new Error(
    'Invalid Supabase URL format. Please connect to Supabase using the "Connect to Supabase" button in the top right corner.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'healthcare-auth',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'healthcare-platform@0.1.0'
    }
  }
});

// Test database connection
const testConnection = async () => {
  try {
    // First check if we can access the auth schema
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth connection test failed:', authError);
      throw authError;
    }

    // Then check if we can access the profiles table
    const { data, error: tableError } = await supabase
      .from('profiles')
      .select('id')
      .maybeSingle();
    
    if (tableError) {
      if (tableError.message.includes('Database error querying schema')) {
        throw new Error('Database configuration error. Please ensure you are connected to Supabase by clicking the "Connect to Supabase" button in the top right corner.');
      }
      console.error('Database connection test failed:', tableError);
      throw tableError;
    }

    console.log('Database connection successful.');
    return true;
  } catch (err) {
    console.error('Failed to test database connection:', err);
    throw err;
  }
};

// Initialize connection test
testConnection().catch(err => {
  console.error('Initial connection test failed:', err);
});

// Add error handling for failed requests
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    supabase.auth.refreshSession();
  }
});

// Add custom error handler
supabase.handleError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.message?.includes('Database error querying schema')) {
    throw new Error('Database configuration error. Please ensure you are connected to Supabase by clicking the "Connect to Supabase" button in the top right corner.');
  }
  
  if (error?.message?.includes('JWT')) {
    throw new Error('Authentication error. Please try logging in again.');
  }
  
  throw error;
};