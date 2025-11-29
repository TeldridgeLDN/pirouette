/**
 * Supabase Client for Railway Worker
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

/**
 * Get or create Supabase client
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase credentials: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required'
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] Client initialized');
  }

  return supabase;
}

/**
 * Upload screenshot to Supabase Storage
 */
export async function uploadScreenshot(
  jobId: string,
  buffer: Buffer
): Promise<string | null> {
  try {
    const client = getSupabaseClient();
    const fileName = `${jobId}.png`;
    const filePath = `screenshots/${fileName}`;

    console.log(`[Supabase] Uploading screenshot: ${filePath}`);

    const { data, error } = await client.storage
      .from('screenshots')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error('[Supabase] Upload error:', error);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = client.storage.from('screenshots').getPublicUrl(filePath);

    console.log(`[Supabase] Screenshot uploaded: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('[Supabase] Upload failed:', error);
    return null;
  }
}

/**
 * Update job progress in database
 */
export async function updateJobProgress(
  jobId: string,
  progress: number,
  step: string,
  message: string
): Promise<void> {
  try {
    const client = getSupabaseClient();

    const { error, count } = await client
      .from('jobs')
      .update({
        progress,
        current_step: step,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (error) {
      console.error(`[Supabase] Progress update FAILED for ${jobId}:`, error.message);
      return;
    }

    console.log(`[Supabase] Job ${jobId} progress: ${progress}% - ${step}`);
  } catch (error) {
    console.error('[Supabase] Progress update failed:', error);
  }
}

/**
 * Save analysis report to database
 */
export async function saveReport(
  jobId: string,
  userId: string,
  url: string,
  report: any
): Promise<void> {
  try {
    const client = getSupabaseClient();

    const { error } = await client.from('reports').insert({
      id: jobId,
      user_id: userId === 'anonymous' ? null : userId,
      url,
      screenshot_url: report.screenshot,
      overall_score: report.overallScore,
      colors_score: report.dimensionScores.colors,
      whitespace_score: report.dimensionScores.whitespace,
      complexity_score: report.dimensionScores.complexity,
      typography_score: report.dimensionScores.typography,
      layout_score: report.dimensionScores.layout,
      cta_score: report.dimensionScores.ctaProminence,
      hierarchy_score: report.dimensionScores.hierarchy || null,
      dimensions: report.dimensions,
      recommendations: report.recommendations,
      analysis_time: report.analysisTime,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`[Supabase] Report save FAILED for ${jobId}:`, error.message);
      throw error;
    }

    console.log(`[Supabase] Report saved: ${jobId}`);
  } catch (err) {
    console.error('[Supabase] Report save failed:', err);
    throw err;
  }
}

/**
 * Update job status
 */
export async function updateJobStatus(
  jobId: string,
  status: 'queued' | 'processing' | 'completed' | 'failed',
  errorMsg?: string
): Promise<void> {
  try {
    const client = getSupabaseClient();

    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
      updates.progress = 100;
    }

    if (errorMsg) {
      updates.error = errorMsg;
    }

    const { error } = await client.from('jobs').update(updates).eq('id', jobId);

    if (error) {
      console.error(`[Supabase] Status update FAILED for ${jobId}:`, error.message);
      return;
    }

    console.log(`[Supabase] Job ${jobId} status: ${status}`);
  } catch (err) {
    console.error('[Supabase] Status update failed:', err);
  }
}

export default {
  getSupabaseClient,
  uploadScreenshot,
  updateJobProgress,
  saveReport,
  updateJobStatus,
};



