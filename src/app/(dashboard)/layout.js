'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layouts/Sidebar';
import Header from '@/components/layouts/Header';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

function DashboardContent({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (!response.ok) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/invoice-maker')) {
      if (pathname.includes('/create')) return 'Create Invoice';
      if (pathname.includes('/edit')) return 'Edit Invoice';
      if (pathname.includes('/settings')) return 'Invoice Settings';
      return 'Invoice Maker';
    }
    if (pathname.startsWith('/master-item')) {
      if (pathname.includes('/create')) return 'Create Master Item';
      if (pathname.includes('/edit')) return 'Edit Master Item';
      return 'Master Items';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          user={user}
          pageTitle={getPageTitle()}
        />
        
        {/* Page Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <DashboardContent>{children}</DashboardContent>
    </ThemeProvider>
  );
}