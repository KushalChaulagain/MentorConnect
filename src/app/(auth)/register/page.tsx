'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMentorRegistration = searchParams.get('type') === 'mentor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
    
    if (isMentorRegistration) {
      router.push('/become-mentor/get-started');
    } else {
      router.push('/dashboard');
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, {
      callbackUrl: isMentorRegistration 
        ? `/become-mentor/get-started?role=mentor` 
        : `/dashboard/mentee`,
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#006989] text-white p-12 flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">MentorConnect</h1>
          <p className="text-xl mb-8">
            {isMentorRegistration 
              ? "Join our community of mentors and help others grow in their coding journey. Share your expertise and make a difference."
              : "Connect with experienced mentors to enhance your coding journey. Find the perfect mentor to guide you through your learning path."}
          </p>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#006989]/50 z-0"></div>
        </div>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-40 h-40 border-4 border-white/30 -top-20 -left-20 rounded-full"></div>
          <div className="absolute w-40 h-40 border-4 border-white/30 -bottom-20 -right-20 rounded-full"></div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              {isMentorRegistration ? "Register as a Mentor" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isMentorRegistration ? "Start Mentoring" : "Sign up"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleOAuthSignIn('github')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FaGithub className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => handleOAuthSignIn('google')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FcGoogle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <p className="mt-6 text-xs text-center text-gray-600 dark:text-gray-400">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 