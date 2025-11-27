/**
 * Supabase Database Types
 * 
 * Generated type definitions for the Pirouette database schema.
 * These types provide full TypeScript autocomplete and type safety
 * when querying Supabase.
 * 
 * Update these types whenever the database schema changes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          name: string | null;
          plan: 'free' | 'pro_29' | 'pro_49' | 'agency';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          analyses_this_month: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          name?: string | null;
          plan?: 'free' | 'pro_29' | 'pro_49' | 'agency';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          analyses_this_month?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string;
          name?: string | null;
          plan?: 'free' | 'pro_29' | 'pro_49' | 'agency';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          analyses_this_month?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          status: 'queued' | 'processing' | 'completed' | 'failed';
          progress: number;
          current_step: string | null;
          error: string | null;
          retry_count: number;
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          status?: 'queued' | 'processing' | 'completed' | 'failed';
          progress?: number;
          current_step?: string | null;
          error?: string | null;
          retry_count?: number;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          url?: string;
          status?: 'queued' | 'processing' | 'completed' | 'failed';
          progress?: number;
          current_step?: string | null;
          error?: string | null;
          retry_count?: number;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          job_id: string;
          user_id: string;
          url: string;
          screenshot_url: string | null;
          overall_score: number | null;
          colors_score: number | null;
          whitespace_score: number | null;
          complexity_score: number | null;
          typography_score: number | null;
          layout_score: number | null;
          cta_score: number | null;
          hierarchy_score: number | null;
          dimensions: Json;
          recommendations: Json;
          analysis_time: number | null;
          version: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          user_id: string;
          url: string;
          screenshot_url?: string | null;
          overall_score?: number | null;
          colors_score?: number | null;
          whitespace_score?: number | null;
          complexity_score?: number | null;
          typography_score?: number | null;
          layout_score?: number | null;
          cta_score?: number | null;
          hierarchy_score?: number | null;
          dimensions: Json;
          recommendations?: Json;
          analysis_time?: number | null;
          version?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          user_id?: string;
          url?: string;
          screenshot_url?: string | null;
          overall_score?: number | null;
          colors_score?: number | null;
          whitespace_score?: number | null;
          complexity_score?: number | null;
          typography_score?: number | null;
          layout_score?: number | null;
          cta_score?: number | null;
          hierarchy_score?: number | null;
          dimensions?: Json;
          recommendations?: Json;
          analysis_time?: number | null;
          version?: string;
          created_at?: string;
        };
      };
      patterns: {
        Row: {
          id: string;
          dimension: 'colors' | 'whitespace' | 'complexity' | 'typography' | 'layout' | 'cta' | 'hierarchy';
          pattern_data: Json;
          source: string | null;
          designs_analyzed: number | null;
          prevalence: number | null;
          version: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dimension: 'colors' | 'whitespace' | 'complexity' | 'typography' | 'layout' | 'cta' | 'hierarchy';
          pattern_data: Json;
          source?: string | null;
          designs_analyzed?: number | null;
          prevalence?: number | null;
          version?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dimension?: 'colors' | 'whitespace' | 'complexity' | 'typography' | 'layout' | 'cta' | 'hierarchy';
          pattern_data?: Json;
          source?: string | null;
          designs_analyzed?: number | null;
          prevalence?: number | null;
          version?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// ================================================================
// Utility Types for Common Queries
// ================================================================

export type User = Database['public']['Tables']['users']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
export type Pattern = Database['public']['Tables']['patterns']['Row'];

export type InsertUser = Database['public']['Tables']['users']['Insert'];
export type InsertJob = Database['public']['Tables']['jobs']['Insert'];
export type InsertReport = Database['public']['Tables']['reports']['Insert'];
export type InsertPattern = Database['public']['Tables']['patterns']['Insert'];

export type UpdateUser = Database['public']['Tables']['users']['Update'];
export type UpdateJob = Database['public']['Tables']['jobs']['Update'];
export type UpdateReport = Database['public']['Tables']['reports']['Update'];
export type UpdatePattern = Database['public']['Tables']['patterns']['Update'];

// Plan types
export type UserPlan = 'free' | 'pro_29' | 'pro_49' | 'agency';

// Job status types
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

// Dimension types
export type Dimension = 'colors' | 'whitespace' | 'complexity' | 'typography' | 'layout' | 'cta' | 'hierarchy';

// ================================================================
// Helper Types for API Responses
// ================================================================

export interface JobWithReport extends Job {
  report?: Report | null;
}

export interface UserWithStats extends Omit<User, 'analyses_this_month'> {
  total_analyses?: number;
  analyses_this_month?: number;
}

export interface ReportSummary {
  id: string;
  url: string;
  overall_score: number;
  created_at: string;
  screenshot_url: string | null;
}



