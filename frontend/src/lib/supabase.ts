import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = (Constants as any).expoConfig?.extra || (Constants as any).manifest?.extra || {};

export const supabase = createClient(
  extra.SUPABASE_URL,
  extra.SUPABASE_ANON_KEY
);

