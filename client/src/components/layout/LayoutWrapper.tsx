import { useRouter } from 'next/router';
import MainLayout from './MainLayout';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const router = useRouter();
  const { pathname } = router;

  // List of paths that should not use the main layout
  const publicPaths = ['/login'];

  // Check if current path should use main layout
  const shouldUseMainLayout = !publicPaths.includes(pathname);

  if (shouldUseMainLayout) {
    return <MainLayout>{children}</MainLayout>;
  }

  return <>{children}</>;
} 