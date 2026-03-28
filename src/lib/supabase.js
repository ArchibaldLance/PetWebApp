import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const storageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET;

if (!supabaseUrl) {
  throw new Error('Hiányzik a VITE_SUPABASE_URL környezeti változó.');
}

if (!supabaseAnonKey) {
  throw new Error('Hiányzik a VITE_SUPABASE_ANON_KEY környezeti változó.');
}

if (!storageBucket) {
  throw new Error('Hiányzik a VITE_SUPABASE_STORAGE_BUCKET környezeti változó.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const animalImagesBucket = storageBucket;