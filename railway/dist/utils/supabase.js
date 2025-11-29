"use strict";
/**
 * Supabase Client for Railway Worker
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseClient = getSupabaseClient;
exports.uploadScreenshot = uploadScreenshot;
exports.updateJobProgress = updateJobProgress;
exports.saveReport = saveReport;
exports.updateJobStatus = updateJobStatus;
const supabase_js_1 = require("@supabase/supabase-js");
let supabase = null;
/**
 * Get or create Supabase client
 */
function getSupabaseClient() {
    if (!supabase) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        // Debug logging - show what we're reading
        console.log('[Supabase] URL from env:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING');
        console.log('[Supabase] Key from env:', supabaseKey ? `${supabaseKey.substring(0, 20)}...${supabaseKey.substring(supabaseKey.length - 10)}` : 'MISSING');
        console.log('[Supabase] Key length:', supabaseKey?.length || 0);
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
        }
        supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        console.log('[Supabase] Client initialized');
    }
    return supabase;
}
/**
 * Upload screenshot to Supabase Storage
 */
async function uploadScreenshot(jobId, buffer) {
    try {
        const client = getSupabaseClient();
        const fileName = `${jobId}.png`;
        const filePath = fileName; // Just the filename, bucket is already 'screenshots'
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
        const { data: { publicUrl }, } = client.storage.from('screenshots').getPublicUrl(filePath);
        console.log(`[Supabase] Screenshot uploaded: ${publicUrl}`);
        return publicUrl;
    }
    catch (error) {
        console.error('[Supabase] Upload failed:', error);
        return null;
    }
}
/**
 * Update job progress in database
 */
async function updateJobProgress(jobId, progress, step, message) {
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
    }
    catch (error) {
        console.error('[Supabase] Progress update failed:', error);
    }
}
/**
 * Save analysis report to database
 */
async function saveReport(jobId, userId, url, report) {
    try {
        const client = getSupabaseClient();
        const { error } = await client.from('reports').insert({
            job_id: jobId,
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
    }
    catch (err) {
        console.error('[Supabase] Report save failed:', err);
        throw err;
    }
}
/**
 * Update job status
 */
async function updateJobStatus(jobId, status, errorMsg) {
    try {
        const client = getSupabaseClient();
        const updates = {
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
    }
    catch (err) {
        console.error('[Supabase] Status update failed:', err);
    }
}
exports.default = {
    getSupabaseClient,
    uploadScreenshot,
    updateJobProgress,
    saveReport,
    updateJobStatus,
};
