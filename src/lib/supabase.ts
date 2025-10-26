import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  full_name: string;
  blood_type: string | null;
  has_diabetes: boolean;
  allergies: string;
  medical_conditions: string;
  medications: string;
  emergency_notes: string;
  created_at: string;
  updated_at: string;
};

export type EmergencyContact = {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
  created_at: string;
};
