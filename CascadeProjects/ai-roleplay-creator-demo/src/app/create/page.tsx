import Link from 'next/link';
import RoleplayForm from '@/components/RoleplayForm';

export default function CreatePage() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/"
            className="text-blue-500 hover:text-blue-700 flex items-center"
          >
            <span className="mr-1">←</span> Back to Home
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Create Your AI Assistant</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Design a custom AI assistant with a unique personality and knowledge base. 
            Be as specific as possible in your instructions to get the best results.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <RoleplayForm />
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <h3 className="text-lg font-medium mb-2">Tips for Great Assistants</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <strong>Be specific about personality:</strong> Include details about how the character speaks, their mannerisms, and their worldview.
            </li>
            <li>
              <strong>Define knowledge boundaries:</strong> Specify what your assistant knows and doesn't know.
            </li>
            <li>
              <strong>Add context:</strong> Include background information like time period, setting, or profession.
            </li>
            <li>
              <strong>Upload relevant files:</strong> Provide documents that contain specialized knowledge your assistant should have.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
