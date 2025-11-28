/**
 * Referral Landing Page
 * 
 * /r/[code] - Landing page for users clicking referral links
 * Shows referrer info and special offer, then redirects to signup
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import ReferralLandingClient from './ReferralLandingClient';

interface PageProps {
  params: Promise<{ code: string }>;
}

// Types for referral data (not in generated Supabase types yet)
interface ReferrerData {
  id: string;
  referral_code: string | null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'You\'ve Been Invited! | Pirouette',
    description: 'Get 20% off your first 3 months of Pirouette - Design Confidence for Your Landing Page',
  };
}

export default async function ReferralLandingPage({ params }: PageProps) {
  const { code } = await params;
  
  // Validate the referral code
  const supabase = supabaseAdmin;
  
  const { data: referrerData, error } = await supabase
    .from('users')
    .select('id, referral_code')
    .eq('referral_code', code.toUpperCase())
    .single();
  
  const referrer = referrerData as ReferrerData | null;
  
  // If invalid code, redirect to home
  if (error || !referrer) {
    redirect('/');
  }
  
  // Track the click (fire and forget)
  // TODO: Enable once Supabase types are regenerated with referral_clicks table
  // For now, just log the click
  console.log(`Referral click tracked: code=${code.toUpperCase()}, referrer=${referrer.id}`);
  
  return <ReferralLandingClient referralCode={code.toUpperCase()} />;
}

