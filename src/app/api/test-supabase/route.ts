/**
 * Test API Route - Verify Supabase Connection
 * 
 * Visit: http://localhost:3000/api/test-supabase
 * 
 * This route tests:
 * 1. Environment variables are loaded
 * 2. Supabase client can connect
 * 3. Database tables exist
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test 1: Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasUrl || !hasAnonKey || !hasServiceKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing environment variables',
          details: {
            hasUrl,
            hasAnonKey,
            hasServiceKey,
          },
        },
        { status: 500 }
      );
    }

    // Test 2: Query database (check if tables exist)
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (tablesError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database query failed',
          details: tablesError.message,
        },
        { status: 500 }
      );
    }

    // Test 3: Check all tables exist
    const tableChecks = await Promise.all([
      supabaseAdmin.from('users').select('count').limit(1),
      supabaseAdmin.from('jobs').select('count').limit(1),
      supabaseAdmin.from('reports').select('count').limit(1),
      supabaseAdmin.from('patterns').select('count').limit(1),
    ]);

    const allTablesExist = tableChecks.every((check) => !check.error);

    if (!allTablesExist) {
      const errors = tableChecks
        .filter((check) => check.error)
        .map((check) => check.error?.message);

      return NextResponse.json(
        {
          success: false,
          error: 'Some tables are missing',
          details: errors,
        },
        { status: 500 }
      );
    }

    // Test 4: Check storage bucket exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();

    const screenshotsBucketExists = buckets?.some((b) => b.name === 'screenshots');

    // Success!
    return NextResponse.json({
      success: true,
      message: '✅ Supabase connection successful!',
      checks: {
        environmentVariables: '✅ All environment variables present',
        databaseConnection: '✅ Connected to database',
        tables: {
          users: '✅ Exists',
          jobs: '✅ Exists',
          reports: '✅ Exists',
          patterns: '✅ Exists',
        },
        storage: {
          screenshots: screenshotsBucketExists ? '✅ Bucket exists' : '⚠️ Bucket not found',
        },
      },
      info: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        tablesCount: 4,
        bucketsCount: buckets?.length || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

