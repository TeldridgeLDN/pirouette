import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { claudeVision, DesignReviewResponse } from '@/lib/ai/claude-vision';

/**
 * Designer's Eye Review API
 * 
 * GET: Retrieve existing review for a report
 * POST: Generate a new review (Pro users only)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reportId } = await params;
  
  try {
    const supabase = await createClient();
    
    // Check for existing review
    const { data: review, error } = await supabase
      .from('designers_eye_reviews')
      .select('*')
      .eq('report_id', reportId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }
    
    if (!review) {
      return NextResponse.json({ review: null }, { status: 200 });
    }
    
    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching Designer\'s Eye Review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reportId } = await params;
  
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const supabase = await createClient();
    
    // Check user's subscription status
    const { data: user } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status')
      .eq('clerk_id', userId)
      .single();
    
    const isPro = user?.subscription_tier === 'pro' && 
                  (user?.subscription_status === 'active' || user?.subscription_status === 'trialing');
    
    if (!isPro) {
      return NextResponse.json(
        { error: 'Pro subscription required for Designer\'s Eye Review' },
        { status: 403 }
      );
    }
    
    // Get the report data (jobs table stores the analysis data)
    const { data: report, error: reportError } = await supabase
      .from('jobs')
      .select('url, screenshot_url, overall_score, typography_score, colors_score, cta_score, complexity_score')
      .eq('id', reportId)
      .single();
    
    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    if (!report.screenshot_url) {
      return NextResponse.json(
        { error: 'No screenshot available for this report' },
        { status: 400 }
      );
    }
    
    // Generate the Designer's Eye Review
    const reviewData = await claudeVision.analyzeDesign({
      screenshotUrl: report.screenshot_url,
      pageUrl: report.url,
      existingScores: {
        overall: report.overall_score,
        typography: report.typography_score,
        colors: report.colors_score,
        cta: report.cta_score,
        complexity: report.complexity_score,
      },
    });
    
    // Store the review in Supabase
    const { data: savedReview, error: saveError } = await supabase
      .from('designers_eye_reviews')
      .upsert({
        report_id: reportId,
        user_id: userId,
        overall_impression: reviewData.overallImpression,
        visual_appeal_rating: reviewData.visualAppealRating,
        visual_appeal_explanation: reviewData.visualAppealExplanation,
        first_impression_feedback: reviewData.firstImpressionFeedback,
        insights: reviewData.insights,
        missing_elements: reviewData.missingElements,
        emotional_impact: reviewData.emotionalImpact,
        top_priorities: reviewData.topPriorities,
        generated_at: reviewData.generatedAt,
      }, {
        onConflict: 'report_id',
      })
      .select()
      .single();
    
    if (saveError) {
      console.error('Error saving Designer\'s Eye Review:', saveError);
      // Return the review even if we couldn't save it
      return NextResponse.json({ review: reviewData, saved: false });
    }
    
    return NextResponse.json({ review: savedReview, saved: true });
  } catch (error) {
    console.error('Error generating Designer\'s Eye Review:', error);
    return NextResponse.json(
      { error: 'Failed to generate review' },
      { status: 500 }
    );
  }
}

