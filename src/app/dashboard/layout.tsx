'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isMentor = user?.role === UserRole.MENTOR;

  const navigation = [
    { name: 'Overview', href: '/dashboard', current: pathname === '/dashboard' },
    ...(isMentor
      ? [
          {
            name: 'My Sessions',
            href: '/dashboard/sessions',
            current: pathname === '/dashboard/sessions',
          },
          {
            name: 'Availability',
            href: '/dashboard/availability',
            current: pathname === '/dashboard/availability',
          },
          {
            name: 'Reviews',
            href: '/dashboard/reviews',
            current: pathname === '/dashboard/reviews',
          },
        ]
      : [
          {
            name: 'Find Mentors',
            href: '/dashboard/find-mentors',
            current: pathname === '/dashboard/find-mentors',
          },
          {
            name: 'My Sessions',
            href: '/dashboard/sessions',
            current: pathname === '/dashboard/sessions',
          },
          {
            name: 'Saved Mentors',
            href: '/dashboard/saved',
            current: pathname === '/dashboard/saved',
          },
        ]),
    {
      name: 'Settings',
      href: '/dashboard/settings',
      current: pathname === '/dashboard/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link
                href="/"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                MentorConnect
              </Link>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      item.current
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="py-6 px-4 sm:px-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
} 