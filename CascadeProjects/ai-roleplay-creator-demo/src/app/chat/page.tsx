'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CustomLink from '@/components/CustomLink';
import AssistantChat from '@/components/AssistantChat';

// Loading fallback for Suspense
function ChatPageLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-6"></div>
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-4"></div>
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Client Component that uses useSearchParams
function ChatPageContent() {
  const searchParams = useSearchParams();
  const assistantId = searchParams.get('assistantId');
  const threadId = searchParams.get('threadId');
  
  const [assistantName, setAssistantName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch assistant details if assistantId is provided
  useEffect(() => {
    if (!assistantId) return;
    
    const fetchAssistantDetails = async () => {
      setIsLoading(true);
      try {
        // For demo purposes, handle example assistants specially
        if (assistantId.startsWith('example-')) {
          // Extract a readable name from the example ID
          const readableName = assistantId
            .replace('example-', '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          setAssistantName(readableName);
        } else {
          // In a real app, you would fetch the assistant details from localStorage or API
          // For now, we'll just use the assistant ID as the name
          setAssistantName(`Assistant ${assistantId.slice(0, 8)}`);
        }
      } catch (err: any) {
        console.error('Error fetching assistant details:', err);
        setError(err.message || 'Failed to load assistant details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssistantDetails();
  }, [assistantId]);

  return (
    <div className="min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <CustomLink 
            href="/"
            className="text-blue-500 hover:text-blue-700 flex items-center"
          >
            <span className="mr-1">←</span> Back to Home
          </CustomLink>
          
          {assistantId && (
            <CustomLink 
              href="/create"
              className="text-blue-500 hover:text-blue-700"
            >
              Create New Assistant
            </CustomLink>
          )}
        </div>
        
        {!assistantId ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold mb-6">Choose an Assistant</h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              You haven't selected an assistant yet. Create a new one or try one of our examples:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* These would be real assistant IDs in a production app */}
              <CustomLink 
                href="/chat?assistantId=example-medieval-knight"
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h3 className="font-medium mb-1">Medieval Knight</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  A chivalrous knight from the Middle Ages
                </p>
              </CustomLink>
              
              <CustomLink 
                href="/chat?assistantId=example-sci-fi-explorer"
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h3 className="font-medium mb-1">Sci-Fi Explorer</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  A space explorer from the distant future
                </p>
              </CustomLink>
              
              <CustomLink 
                href="/chat?assistantId=example-detective"
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h3 className="font-medium mb-1">Detective</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  A sharp-witted detective solving mysteries
                </p>
              </CustomLink>
              
              <CustomLink 
                href="/chat?assistantId=example-fantasy-wizard"
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h3 className="font-medium mb-1">Fantasy Wizard</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  A wise and powerful magic user
                </p>
              </CustomLink>
            </div>
            
            <div className="mt-8">
              <CustomLink 
                href="/create"
                className="inline-block py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                Create Your Own Assistant
              </CustomLink>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h1 className="text-xl font-semibold">
                {isLoading ? (
                  <span className="inline-block w-32 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></span>
                ) : (
                  assistantName || 'Chat with Assistant'
                )}
              </h1>
              
              {threadId && (
                <CustomLink 
                  href={`/chat?assistantId=${assistantId}`}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  New Chat
                </CustomLink>
              )}
            </div>
            
            <div className="h-[70vh]">
              {error ? (
                <div className="p-8 text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <CustomLink 
                    href="/"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Go back home
                  </CustomLink>
                </div>
              ) : (
                <AssistantChat 
                  assistantId={assistantId} 
                  initialThreadId={threadId || undefined}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function ChatPage() {
  return (
    <Suspense fallback={<ChatPageLoading />}>
      <ChatPageContent />
    </Suspense>
  );
}
