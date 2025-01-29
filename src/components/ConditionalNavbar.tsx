'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Show navbar on home and about pages
  const showNavbarPaths = ['/', '/about', '/become-mentor'];
  
  if (showNavbarPaths.includes(pathname)) {
    return <Navbar />;
  }
  
  return null;
} 