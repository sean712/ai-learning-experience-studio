'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function SidebarMenu() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname() || '';
  const router = useRouter();

  const isActive = (path: string) => {
    // Handle both with and without trailing slashes for better compatibility
    const currentPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
    const checkPath = path.endsWith('/') ? path : `${path}/`;
    return currentPath === checkPath || currentPath.startsWith(checkPath);
  };
  
  // Handle navigation with proper error handling
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    setIsCollapsed(true);
    router.push(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-10"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-20 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } shadow-lg`}
      >
        <div className="flex flex-col border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center p-4">
            {!isCollapsed ? (
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-[#003E74]">
                  Imperial College
                </h1>
                <h2 className="text-sm font-medium text-[#003E74]">
                  Business School
                </h2>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#003E74] flex items-center justify-center text-white font-bold text-xs">
                IC
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7"></polyline>
                  <polyline points="6 17 11 12 6 7"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="11 17 6 12 11 7"></polyline>
                  <polyline points="18 17 13 12 18 7"></polyline>
                </svg>
              )}
            </button>
          </div>
          
          {!isCollapsed && (
            <div className="px-4 py-2 bg-[#f8f8f8] dark:bg-[#2a2a2a] text-[#003E74] text-xs font-medium">
              IDEA Lab AI Studio
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
              </svg>
            )}
          </button>
        </div>

        <nav className="p-3 flex-grow">
          <ul className="space-y-2">
            <li>
              <Link
                href="/demo/"
                onClick={(e) => handleNavigation(e, '/demo/')}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/demo')
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                  <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {!isCollapsed && <span>Demo</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/create/"
                onClick={(e) => handleNavigation(e, '/create/')}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/create')
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                {!isCollapsed && <span>Create</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/manage/"
                onClick={(e) => handleNavigation(e, '/manage/')}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/manage')
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                {!isCollapsed && <span>Edit</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/faq/"
                onClick={(e) => handleNavigation(e, '/faq/')}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/faq')
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                {!isCollapsed && <span>FAQs</span>}
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* IDEA Lab branding footer */}
        <div className={`p-3 mt-auto border-t border-gray-200 dark:border-gray-800 ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed ? (
            <div>
              <div className="text-xs text-gray-500 mb-1">Created & Supported by</div>
              <div className="font-semibold text-sm text-[#1D8348]">IDEA Lab</div>
            </div>
          ) : (
            <div className="w-6 h-6 mx-auto rounded-full bg-[#1D8348] flex items-center justify-center text-white font-bold text-xs">
              IL
            </div>
          )}
        </div>
      </div>
    </>
  );
}
