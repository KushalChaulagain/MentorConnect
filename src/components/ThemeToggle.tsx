'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5 text-gray-300" />
      ) : (
        <MoonIcon className="h-5 w-5 text-gray-500" />
      )}
    </button>
  );
} 