import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vzpegbodzdjatalhmram.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6cGVnYm9kemRqYXRhbGhtcmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjM1OTYsImV4cCI6MjA5MDc5OTU5Nn0.pfNJXTVHmPMiTA_9RBXWfUtUwg01Nn_mU78RJn-68As';

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : ({} as ReturnType<typeof createClient>);


