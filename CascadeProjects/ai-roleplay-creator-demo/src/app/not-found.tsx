'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();

  // Attempt to fix common path issues automatically
  useEffect(() => {
    const path = window.location.pathname;
    
    // If path doesn't end with a slash, try adding one
    if (path && !path.endsWith('/') && !path.includes('.')) {
      const fixedPath = `${path}/`;
      console.log(`Attempting to redirect to: ${fixedPath}`);
      router.push(fixedPath);
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-4xl font-bold text-[#003E74] mb-4">Page Not Found</h1>
      <p className="text-lg mb-8 max-w-md">
        We couldn't find the page you were looking for. This could be due to a navigation issue.
      </p>
      <div className="space-y-4">
        <p className="font-medium">Please try one of these links instead:</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            href="/" 
            className="px-6 py-3 bg-[#003E74] text-white rounded-md hover:bg-[#002a50] transition-colors"
          >
            Home
          </Link>
          <Link 
            href="/demo/" 
            className="px-6 py-3 bg-[#1D8348] text-white rounded-md hover:bg-[#166237] transition-colors"
          >
            Try Demo
          </Link>
          <Link 
            href="/create/" 
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Create Experience
          </Link>
        </div>
      </div>
    </div>
  );
}
