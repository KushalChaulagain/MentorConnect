import ConditionalNavbar from '@/components/ConditionalNavbar';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MentorConnect - Nepal\'s Premier Developer Mentorship Platform',
  description: 'Connect with experienced Nepali developers for personalized mentorship, code reviews, and career guidance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <ConditionalNavbar />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
