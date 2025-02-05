'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FaGraduationCap } from 'react-icons/fa';

export default function BecomeMenteePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative py-20 sm:py-24 bg-gradient-to-br from-blue-900 to-cyan-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e9,#06b6d4)] opacity-50"></div>
          <div className="absolute inset-y-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Start Your Learning Journey
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-200">
            Connect with experienced mentors who can guide you through your development career.
          </p>
          <div className="mt-10">
            <Button 
              size="lg"
              onClick={() => router.push('/register?type=mentee')}
              className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700"
            >
              Become a Mentee Now
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">
              Why Become a Mentee?
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Accelerate Your Growth
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {/* Benefits Cards */}
              <div className="flex flex-col items-start">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-2">
                  <FaGraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Learn from Experts
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Get personalized guidance from experienced developers in your field.
                </p>
              </div>
              {/* Add more benefit cards as needed */}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Ready to Start Learning?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
              Join our community of learners and accelerate your career growth today.
            </p>
            <div className="mt-8">
              <Button 
                size="lg"
                onClick={() => router.push('/register')}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}