import ConditionalNavbar from '@/components/ConditionalNavbar';
import Providers from '@/components/providers';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MentorConnect',
  description: "Nepal's Premier Developer Mentorship Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Add Devicon for tech icons in skill badges */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />
      </head>
      <body className={`${inter.className} bg-[#0F172A] text-gray-200`}>
        <Providers>
          <ConditionalNavbar />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
