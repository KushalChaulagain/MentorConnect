import Link from 'next/link';
import { FaLightbulb } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] overflow-hidden">
      <div className="text-center w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Animated illustration */}
        <div className="mb-12 relative">
          <div className="relative animate-float inline-block">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className="relative">
                <FaLightbulb className="h-12 w-12 text-yellow-400 animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 blur-sm bg-yellow-400/30 animate-pulse" />
              </div>
            </div>
            <div className="w-64 h-64 bg-[#151B28] rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-8xl font-bold text-[#6366F1]">
                404
              </span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-6">
          Oops! Page Not Found
        </h1>
        
        <p className="text-gray-400 mb-10 max-w-md mx-auto">
          Looks like this page took a coffee break! Don't worry, even the best mentors need a break sometimes.
        </p>

        <div className="space-x-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-[#6366F1] px-6 py-3 text-base font-medium text-white hover:bg-[#5558DD] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard/find-mentors"
            className="inline-flex items-center justify-center rounded-md border border-[#6366F1] px-6 py-3 text-base font-medium text-[#6366F1] hover:bg-[#6366F1]/5 transition-colors"
          >
            Find Mentors
          </Link>
        </div>

        {/* Decorative elements - removed excessive blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 overflow-hidden">
          <div className="w-[40rem] h-[40rem] " />
        </div>
      </div>
    </div>
  );
}

