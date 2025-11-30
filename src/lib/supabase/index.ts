/**
 * Supabase Library - Main Entry Point
 * 
 * This file exports all Supabase-related utilities and types.
 * Import from here in your application code.
 */

// Clients
export { supabase, createAuthenticatedClient } from './client';
export { supabaseAdmin } from './server';

// Types
export type {
  Database,
  User,
  Job,
  Report,
  Pattern,
  InsertUser,
  InsertJob,
  InsertReport,
  InsertPattern,
  UpdateUser,
  UpdateJob,
  UpdateReport,
  UpdatePattern,
  UserPlan,
  JobStatus,
  Dimension,
  JobWithReport,
  UserWithStats,
  ReportSummary,
} from './types';

// Re-export Supabase client type for convenience
export type { SupabaseClient } from '@supabase/supabase-js';




