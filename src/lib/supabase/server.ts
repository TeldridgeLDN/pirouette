/**
 * Supabase Client - Server-side (Service Role)
 * 
 * This client is used in Next.js API routes and server components.
 * It uses the service_role key (NEVER expose to client) and bypasses RLS.
 * Use this for admin operations like creating reports from Railway worker.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
}

/**
 * Create server-side Supabase client with service role privileges
 * 
 * WARNING: This bypasses Row Level Security (RLS) policies
 * Only use in server contexts (API routes, server components, Railway worker)
 * NEVER expose this client or the service_role key to the browser
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export default supabaseAdmin;




