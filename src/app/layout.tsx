import ConditionalNavbar from '@/components/ConditionalNavbar';
import { Inter } from 'next/font/google';
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
  console.log('RootLayout rendering');

  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalNavbar />
        {children}
      </body>
    </html>
  );
}
