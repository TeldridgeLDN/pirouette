/**
 * Account Settings Page
 * 
 * Data & Privacy settings including:
 * - Download your data (GDPR export)
 * - Delete account
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SettingsClient from './SettingsClient';

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
    </svg>
  );
}

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
            <ChevronLeftIcon className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="mt-1 text-slate-600">Manage your account and data</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <SettingsClient 
          email={user.emailAddresses[0]?.emailAddress || ''}
        />
      </div>
    </div>
  );
}

