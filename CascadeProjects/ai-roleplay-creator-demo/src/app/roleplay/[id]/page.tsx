'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

export default function RoleplayAccess({ params }: PageProps) {
  const router = useRouter();
  const { id } = params;
  
  const [accessCode, setAccessCode] = useState('');
  const [assistantDetails, setAssistantDetails] = useState<{
    id: string;
    name: string;
    isPublic?: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch the assistant details first
  useEffect(() => {
    const fetchAssistantDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/assistants/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Educational roleplay experience not found');
          }
          throw new Error('Failed to load educational roleplay details');
        }
        
        const data = await response.json();
        setAssistantDetails(data.assistant);
        
        // If the assistant is public, redirect to chat directly
        if (data.assistant.isPublic) {
          router.push(`/chat?assistantId=${data.assistant.id}`);
        }
      } catch (err: any) {
        console.error('Error fetching assistant details:', err);
        setError(err.message || 'Failed to load educational roleplay');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssistantDetails();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      setError('Please enter an access code');
      return;
    }
    
    try {
      setIsVerifying(true);
      setError(null);
      
      const response = await fetch('/api/verify-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: id,
          accessCode: accessCode.trim()
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify access code');
      }
      
      if (data.verified) {
        // Redirect to the chat with the verified assistant
        router.push(`/chat?assistantId=${id}`);
      } else {
        setError('Invalid access code. Please try again.');
      }
    } catch (err: any) {
      console.error('Error verifying access code:', err);
      setError(err.message || 'Failed to verify access code');
    } finally {
      setIsVerifying(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
        <p className="text-gray-600">Loading educational experience...</p>
      </div>
    );
  }
  
  if (error && !assistantDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 max-w-md w-full">
          <p className="font-medium">{error}</p>
        </div>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to homepage
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          Access Educational Roleplay
        </h1>
        
        {assistantDetails && (
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold">{assistantDetails.name}</h2>
            <p className="text-gray-600 mt-2">Enter the access code to begin the learning experience</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium mb-1">
              Access Code
            </label>
            <input
              id="accessCode"
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter access code"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p>{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isVerifying || !accessCode.trim()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying...' : 'Enter Roleplay'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
