'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { FaBrain, FaCalendar, FaClock, FaHandshake, FaLaptopCode, FaMoneyBillWave } from 'react-icons/fa';

export default function BecomeMentorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative py-20 sm:py-24 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e5,#0ea5e9)] opacity-50"></div>
          <div className="absolute inset-y-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Apply to Become a Mentor
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-200">
            Share your expertise, make an impact, and earn while helping the next generation of developers.
          </p>
          <div className="mt-10">
            <Button 
              size="lg"
              onClick={() => router.push('/register?role=mentor')}
              className="bg-white text-indigo-600 hover:bg-gray-100 hover:text-indigo-700"
            >
              Become a Mentor Now
            </Button>
          </div>
        </div>
      </div>

      {/* Live Mentorship Section */}
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Live Mentorship
            </h2>
            <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
              Set your own rate and provide live 1:1 mentorship to help fellow developers on their path.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                  <FaClock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Live 1:1 Mentorship</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Provide live 1:1 help by answering questions and doing code reviews online as screen sharing.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                  <FaMoneyBillWave className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Get Paid, Stress-Free</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Unlike providing unpaid help, being a mentor lets you earn while sharing your expertise.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                  <FaCalendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Flexible Commitment</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Work whenever it suits you. You decide your own schedule and customize your availability.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-indigo-50 dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Why Become a Mentor?
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                <FaHandshake className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Make an Impact</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Help shape the next generation of developers and make a real difference in their careers.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                <FaBrain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Grow Your Skills</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Teaching others is one of the best ways to deepen your own understanding and expertise.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                <FaLaptopCode className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Build Your Brand</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Establish yourself as an expert and build your professional network.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Ready to Start Your Mentorship Journey?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
              Join our growing community of mentors and start making an impact today.
            </p>
            <div className="mt-8">
              <Button 
                size="lg"
                onClick={() => router.push('/register?role=mentor')}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 