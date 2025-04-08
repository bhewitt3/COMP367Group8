'use client'; // Mark this as a Client Component

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
// Import icons
import { RiDashboardLine } from 'react-icons/ri';
import { BiBookAlt } from 'react-icons/bi';
import { BsCardText } from 'react-icons/bs';
import { FiSun, FiMoon, FiUser, FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation items array for easier management
  const navItems = [
    {
      href: '/dashboard',
      icon: <RiDashboardLine className="w-5 h-5" />,
      label: 'Dashboard'
    },
    {
      href: '/dashboard/summaries',
      icon: <BiBookAlt className="w-5 h-5" />,
      label: 'Summaries'
    },
    {
      href: '/dashboard/flashcards',
      icon: <BsCardText className="w-5 h-5" />,
      label: 'Flashcards'
    }
  ];

  useEffect(() => {
    //redirect to login if user is not authenticated
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Left Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-rose-50 dark:bg-gray-800 flex flex-col h-full transition-all duration-300 ease-in-out relative`}>
        {/* Logo Section */}
        <div className="p-4">
          {!isSidebarCollapsed && (
            <div className="flex items-center mb-8">
              <span className="text-2xl font-bold text-rose-500">Noted!</span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-rose-100 dark:hover:bg-gray-700 rounded-lg transition-colors
                  ${pathname === item.href ? 'bg-rose-100 dark:bg-gray-700' : ''}
                  ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={isSidebarCollapsed ? item.label : ""}
              >
                <div className={isSidebarCollapsed ? '' : 'mr-3'}>
                  {item.icon}
                </div>
                {!isSidebarCollapsed && item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Section - Simplified */}
        <div className="mt-auto p-4">
          {/* Theme Toggle */}
          <div className="mb-4 flex justify-center">
            <button 
              onClick={toggleTheme}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? 
                <FiMoon className="w-5 h-5" /> : 
                <FiSun className="w-5 h-5" />
              }
            </button>
          </div>

          {/* User Profile Section */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} p-2 hover:bg-rose-100 dark:hover:bg-gray-700 rounded-lg`}>
            <Link 
              href="/dashboard/account"
              className="flex items-center min-w-0"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <FiUser className="w-5 h-5 text-gray-600" />
              </div>
              {!isSidebarCollapsed && (
                <span className="ml-3 text-sm font-medium text-gray-700 truncate">
                  {user.email.split('@')[0]}
                </span>
              )}
            </Link>
            {!isSidebarCollapsed && (
              <button 
                onClick={handleLogout}
                className="ml-2 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Sign out"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Collapse Button - Centered vertically */}
        <div 
          className="absolute top-1/2 -right-3 transform -translate-y-1/2"
          style={{ zIndex: 50 }}
        >
          <button
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="w-6 h-12 bg-rose-100 dark:bg-gray-700 rounded-r-lg flex items-center justify-center shadow-md hover:bg-rose-200 dark:hover:bg-gray-600 transition-colors"
          >
            {isSidebarCollapsed ? 
              <FiChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-200" /> : 
              <FiChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-200" />
            }
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Main Content Area */}
          {children}
        </div>
      </div>
    </div>
  );
}
