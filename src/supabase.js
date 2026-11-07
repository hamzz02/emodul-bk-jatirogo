import { createClient } from '@supabase/supabase-js';

// Ambil kredensial dari file environment (.env) dan bersihkan URL
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Sanitasi: hilangkan /rest/v1 atau trailing slash jika terbawa
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

// Validasi apakah sudah diisi oleh pengguna
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl.startsWith('https://')
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase belum dikonfigurasi dengan benar.\n' +
    'Silakan buka file .env lalu masukkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dari dashboard Supabase Anda.'
  );
}

// Inisialisasi client Supabase
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://dummy.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'dummy-key'
);

