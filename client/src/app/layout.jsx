import ThemeRegistry from '@/provider/theme/ThemeRegistry';
import { Inter } from 'next/font/google';
import './globals.css';
import ReactQueryProvider from '@/provider/queryProvider';
import AuthProvider from '@/provider/authProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Calendar App',
  description: 'A calendar application built with Next.js and MUI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <AuthProvider>
            <ThemeRegistry>{children}</ThemeRegistry>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
} 