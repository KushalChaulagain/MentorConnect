'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { InfoIcon } from 'lucide-react';
import { signOut, useSession } from "next-auth/react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

export default function MentorOnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Add useEffect to set role as MENTOR when landing on this page
  useEffect(() => {
    const setMentorRole = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/update-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: 'MENTOR' }),
        });

        if (!response.ok) {
          throw new Error('Failed to set mentor role');
        }

        // Sign out to refresh the session with new role
        await signOut({ 
          redirect: false
        });

        // Redirect to login with callback to mentor dashboard
        router.push(`/login?callbackUrl=${encodeURIComponent('/dashboard/mentor')}`);
      } catch (error) {
        console.error('Error setting mentor role:', error);
        toast({
          title: 'Error',
          description: 'Failed to set mentor role. Please try again.',
          variant: 'destructive',
        });
        router.push('/role-selection');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user && session.user.role !== 'MENTOR') {
      setMentorRole();
    }
  }, [session, router, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  const userInitials = session?.user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                MentorConnect
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {session?.user?.name}
              </span>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left side - Form */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Become a Mentor</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Let us know more about yourself by filling out this application. We'll ask
              some questions about your experience, why you want to join us, and how
              you mentor others!
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 p-4 rounded-lg mb-8">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Please use your real name, as it will be the name others see on your MentorConnect
                profile - it's just like any other professional profile!
              </p>
            </div>

            <form className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-200">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  className="w-full dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-gray-700 dark:text-gray-200">Your time zone</Label>
                <select
                  id="timezone"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  <option>(GMT+05:45) Nepal Time</option>
                  <option>(GMT+05:30) India</option>
                  <option>(GMT+06:00) Bangladesh</option>
                  <option>(GMT+00:00) UTC</option>
                </select>
              </div>

              <Button type="submit" size="lg" className="w-32">
                Next
              </Button>
            </form>
          </div>

          {/* Right side - Info */}
          <div className="lg:w-2/5">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">NPR 30,000</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">/ MONTH</span>
                <InfoIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Mentors are able to earn an average income of
              </p>
            </div>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Why become a mentor?</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Share your knowledge and experience with others</li>
                <li>• Earn additional income in your free time</li>
                <li>• Build your professional network</li>
                <li>• Help shape the next generation of developers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

