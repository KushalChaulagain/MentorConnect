'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (user?.role === UserRole.MENTOR) {
    router.push('/dashboard/mentor');
    return null;
  }

  if (user?.role === UserRole.MENTEE) {
    router.push('/dashboard/mentee');
    return null;
  }

  return <MenteeDashboard />;
}

function MentorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Mentor Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your mentorship sessions and availability
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Upcoming Sessions
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      0
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/sessions"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                View all sessions
              </Link>
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Earnings
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Rs. 0
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/earnings"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                View earnings details
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Average Rating
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      0.0
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/reviews"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                View all reviews
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenteeDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Welcome to MentorConnect
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Find the perfect mentor to help you grow as a developer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Upcoming Sessions
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      0
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/sessions"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                View all sessions
              </Link>
            </div>
          </div>
        </div>

        {/* Find Mentors */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Find Mentors
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Browse our network of experienced mentors
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/find-mentors"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                Find a mentor
              </Link>
            </div>
          </div>
        </div>

        {/* Saved Mentors */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Saved Mentors
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      0
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/saved"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                View saved mentors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 