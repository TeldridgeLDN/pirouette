/**
 * Sign In Page
 * 
 * Clerk-powered sign-in page with email/password and OAuth options
 */

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back to Pirouette
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your design analysis dashboard
          </p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-xl',
            },
          }}
        />
      </div>
    </div>
  );
}

