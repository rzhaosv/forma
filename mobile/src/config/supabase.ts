import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your actual Supabase credentials
// Get these from: https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// For now, use demo mode if credentials not set
const isDemoMode = SUPABASE_URL.includes('your-project');

export const supabase = isDemoMode 
  ? null // Demo mode - will skip upload
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

export const isSupabaseConfigured = !isDemoMode;

