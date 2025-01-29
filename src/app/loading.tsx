import { FaCode, FaLightbulb, FaUsers } from 'react-icons/fa';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="flex items-center justify-center mb-8">
          {/* Rotating icons animation */}
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 flex items-center justify-center animate-ping">
              <FaCode className="h-12 w-12 text-indigo-500/20" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center animate-spin [animation-duration:3s]">
              <FaLightbulb className="h-16 w-16 text-indigo-600/40" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <FaUsers className="h-20 w-20 text-indigo-700/60" />
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Loading amazing mentors...
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
          We're connecting you with the best tech mentors in the community
        </p>
        
        {/* Progress bar */}
        <div className="mt-8 max-w-xs mx-auto w-full">
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full animate-progress origin-left"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 