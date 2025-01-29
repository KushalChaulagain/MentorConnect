'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, Users } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UpdateRoleResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: 'MENTOR' | 'MENTEE';
    onboardingCompleted: boolean;
  };
}

export default function RoleSelection() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleRoleSelection = async (role: 'MENTOR' | 'MENTEE') => {
    setIsLoading(true);
    try {
      if (role === 'MENTOR') {
        // For mentors, redirect to onboarding first
        router.push('/become-mentor/get-started');
        return;
      }

      // For mentees, continue with existing flow
      const response = await fetch('/api/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json() as UpdateRoleResponse;

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update role');
      }

      toast({
        title: 'Role Updated',
        description: `You are now registered as a mentee.`,
      });

      // Sign out to refresh the session
      await signOut({ 
        redirect: false
      });

      // Redirect to login with mentee dashboard as callback
      router.push(`/login?callbackUrl=${encodeURIComponent('/dashboard/mentee')}`);

    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Choose Your Path</h1>
          <p className="mt-2 text-muted-foreground">Select how you want to participate in our community</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden border-2 hover:border-primary transition-colors">
            <div className="p-6 space-y-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Join as a Mentee</h2>
              <p className="text-muted-foreground">
                Connect with experienced mentors who can guide you on your journey
                and help you achieve your goals.
              </p>
              <Button 
                onClick={() => !isLoading && handleRoleSelection('MENTEE')}
                className="w-full"
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? 'Processing...' : 'Continue as Mentee'}
              </Button>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-primary transition-colors">
            <div className="p-6 space-y-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Become a Mentor</h2>
              <p className="text-muted-foreground">
                Share your expertise, guide others, and make a meaningful impact
                while building your professional network.
              </p>
              <Button 
                onClick={() => !isLoading && handleRoleSelection('MENTOR')}
                className="w-full"
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? 'Processing...' : 'Continue as Mentor'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 