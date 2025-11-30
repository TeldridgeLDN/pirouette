/**
 * Traffic Update API
 * 
 * POST /api/reports/[id]/traffic
 * Updates the weekly_traffic value for a report.
 * Pro users only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Type for the report record
interface ReportRecord {
  id: string;
  user_id: string | null;
  weekly_traffic: number | null;
}

// Type for the user record
interface UserRecord {
  id: string;
  plan: string | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { weeklyTraffic } = body;
    
    // Validate traffic value
    if (weeklyTraffic === undefined || weeklyTraffic === null) {
      return NextResponse.json(
        { error: 'weeklyTraffic is required' },
        { status: 400 }
      );
    }
    
    const trafficValue = parseInt(weeklyTraffic, 10);
    if (isNaN(trafficValue) || trafficValue < 0) {
      return NextResponse.json(
        { error: 'weeklyTraffic must be a positive number' },
        { status: 400 }
      );
    }
    
    // Check if user is Pro
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, plan')
      .eq('clerk_id', userId)
      .single() as { data: UserRecord | null; error: Error | null };
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const isPro = user.plan === 'pro_29' || user.plan === 'pro_49' || user.plan === 'agency';
    if (!isPro) {
      return NextResponse.json(
        { error: 'Pro subscription required to update traffic data' },
        { status: 403 }
      );
    }
    
    // Verify the report exists and belongs to the user
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('id, user_id, weekly_traffic')
      .eq('id', reportId)
      .single() as { data: ReportRecord | null; error: Error | null };
    
    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // Check ownership (allow if user owns it or it's anonymous/unclaimed)
    if (report.user_id && report.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this report' },
        { status: 403 }
      );
    }
    
    // Update the report with the new traffic value
    // Note: weekly_traffic column may not be in generated Supabase types
    const { error: updateError } = await supabaseAdmin
      .from('reports')
      // @ts-expect-error - weekly_traffic column exists but may not be in generated types
      .update({ weekly_traffic: trafficValue })
      .eq('id', reportId);
    
    if (updateError) {
      console.error('Error updating report traffic:', updateError);
      return NextResponse.json(
        { error: 'Failed to update traffic data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      weeklyTraffic: trafficValue,
      message: 'Traffic data updated successfully'
    });
    
  } catch (error) {
    console.error('Traffic update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    
    // Get the current traffic value for a report
    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select('weekly_traffic')
      .eq('id', reportId)
      .single() as { data: { weekly_traffic: number | null } | null; error: Error | null };
    
    if (error || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      weeklyTraffic: report.weekly_traffic
    });
    
  } catch (error) {
    console.error('Traffic fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

