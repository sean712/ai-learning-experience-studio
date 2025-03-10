'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const createOrFetchDemo = async () => {
      try {
        // Call our API to create or fetch a demo assistant
        const response = await fetch('/api/create-demo');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create demo experience');
        }
        
        // Redirect to the chat with the demo assistant
        router.push(`/chat?assistantId=${data.assistantId}`);
      } catch (err: any) {
        console.error('Error creating/fetching demo:', err);
        setError('Failed to load the demonstration experience. Please try again.');
        setLoading(false);
      }
    };
    
    createOrFetchDemo();
  }, [router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl font-bold mb-6">Loading Educational Roleplay Demo</h1>
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600">
            Preparing a demonstration of the educational roleplay platform with a sample
            historical figure interaction...
          </p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl font-bold mb-6">Error Loading Demo</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }
  
  // This should not be visible as we're redirecting
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Redirecting to Demo...</h1>
      </div>
    </div>
  );
}
