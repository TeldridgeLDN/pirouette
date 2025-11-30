/**
 * Admin API: Seed Pattern Library
 * 
 * POST /api/admin/seed-patterns
 * 
 * Seeds the Supabase patterns table with the default pattern library.
 * This should be run once after initial deployment or when updating patterns.
 * 
 * Security: Add authentication/authorization as needed for production
 */

import { NextRequest, NextResponse } from 'next/server';
import { seedPatternsToSupabase, getPatternStatsFromSupabase } from '@/lib/analysis/patterns/seed-patterns';

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here for production
    // e.g., verify admin user via Clerk or check API key
    
    const result = await seedPatternsToSupabase();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully seeded ${result.patternsSeeded} patterns`,
        patternsSeeded: result.patternsSeeded,
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Seeding completed with errors',
        patternsSeeded: result.patternsSeeded,
        errors: result.errors,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in seed-patterns API:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to seed patterns',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here for production
    
    const stats = await getPatternStatsFromSupabase();
    
    if (stats) {
      return NextResponse.json({
        success: true,
        stats,
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to retrieve pattern statistics',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in seed-patterns stats API:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve pattern statistics',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}


