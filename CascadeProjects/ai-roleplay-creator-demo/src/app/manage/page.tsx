'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Assistant {
  id: string;
  name: string;
  instructions: string;
  model: string;
  accessCode: string;
  shareableUrl: string;
  isPublic: boolean;
  createdAt: string;
  files: {
    id: string;
    name: string;
    vectorStoreId: string | null;
  }[];
}

export default function ManageAssistants() {
  const router = useRouter();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await fetch('/api/assistants');
        if (!response.ok) {
          throw new Error('Failed to fetch assistants');
        }
        
        const data = await response.json();
        setAssistants(data.assistants);
      } catch (err: any) {
        console.error('Error fetching assistants:', err);
        setError(err.message || 'Failed to load your educational experiences');
      } finally {
        setLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  const handleCopyLink = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    alert('Link copied to clipboard!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this educational experience? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/assistants/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete assistant');
      }

      // Remove the deleted assistant from the list
      setAssistants(assistants.filter(asst => asst.id !== id));
    } catch (err: any) {
      console.error('Error deleting assistant:', err);
      setError(err.message || 'Failed to delete educational experience');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Manage Educational Roleplays</h1>
          <Link 
            href="/create" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : assistants.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-medium text-gray-600 mb-4">You haven't created any educational experiences yet</h2>
            <Link 
              href="/create" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Roleplay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {assistants.map((assistant) => (
              <div key={assistant.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-2">{assistant.name}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">{assistant.instructions}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {assistant.model}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Access Code</p>
                    <p className="font-medium bg-gray-50 p-2 rounded mt-1">{assistant.accessCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Visibility</p>
                    <p className="font-medium mt-1">
                      {assistant.isPublic ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Public</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Access Code Required</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-gray-600 mb-1">Shareable Link</p>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={`${window.location.origin}${assistant.shareableUrl}`}
                      readOnly
                      className="bg-gray-50 border border-gray-300 rounded-l p-2 flex-1 font-mono text-sm"
                    />
                    <button
                      onClick={() => handleCopyLink(assistant.shareableUrl)}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-r border-y border-r border-gray-300"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push(`/chat?assistantId=${assistant.id}`)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Test Experience
                  </button>
                  <button
                    onClick={() => router.push(`/manage/edit/${assistant.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleDelete(assistant.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
