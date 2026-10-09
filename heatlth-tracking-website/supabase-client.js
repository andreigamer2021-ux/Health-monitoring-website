import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from './supabase-config.js';

let supabaseClient;

export function getSupabaseClient() {
    if (
        SUPABASE_URL.includes('YOUR_PROJECT_ID') ||
        SUPABASE_PUBLIC_KEY.includes('YOUR_SUPABASE')
    ) {
        throw new Error('Add your Supabase project URL and public key in supabase-config.js.');
    }

    if (!supabaseClient) {
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
    }

    return supabaseClient;
}
