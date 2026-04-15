import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  level: number;
  progress: number;
  family_group_id?: string;
  location?: { latitude: number; longitude: number };
  last_seen?: string;
  is_online: boolean;
  created_at: string;
  updated_at: string;
};

export type FamilyGroup = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

export type LocationHistory = {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
};
