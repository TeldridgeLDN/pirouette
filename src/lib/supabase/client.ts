/**
 * Supabase Client - Browser/Client-side
 * 
 * This client is used in Next.js client components and browser contexts.
 * It uses the Supabase anon key (safe to expose) and respects RLS policies.
 * Authentication is handled via Clerk JWT.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * Create browser Supabase client
 * - Uses anon key (safe for client-side)
 * - RLS policies enforce data isolation
 * - Clerk JWT provides authentication
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Clerk handles session
    autoRefreshToken: false, // Clerk handles refresh
    detectSessionInUrl: false,
  },
});

/**
 * Create authenticated Supabase client with Clerk JWT
 * Call this from client components after user authentication
 */
export function createAuthenticatedClient(clerkToken: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export default supabase;




