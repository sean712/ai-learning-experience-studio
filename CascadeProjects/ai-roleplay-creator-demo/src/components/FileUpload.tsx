'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileUploaded: (fileId: string, fileName: string, vectorStoreId?: string) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileUploaded, disabled = false }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    console.log(`Attempting to upload file: ${file.name}, size: ${(file.size / (1024 * 1024)).toFixed(2)}MB, type: ${file.type}`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add a timeout to the fetch request to prevent hanging indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for larger files

      try {
        const response = await fetch('/api/upload-file', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle network errors
        if (!response) {
          throw new Error('Network response was not received');
        }

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Error parsing response JSON:', jsonError);
          throw new Error('Invalid response from server');
        }

        if (!response.ok) {
          throw new Error(data.error || `Server error: ${response.status} ${response.statusText}`);
        }

        if (!data.file || !data.file.id) {
          console.error('Invalid response data:', data);
          throw new Error('Invalid response data from server');
        }

        console.log(`File uploaded successfully: ${file.name}, id: ${data.file.id}, vectorStoreId: ${data.file.vectorStoreId}`);
        // Pass both the file ID and vector store ID to the parent component
        onFileUploaded(data.file.id, file.name, data.file.vectorStoreId);
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out after 2 minutes. Try using a smaller file or splitting your content.');
        }
        throw fetchError;
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer 
            ${disabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'bg-gray-50 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-900 dark:border-gray-700'}`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <svg className="w-8 h-8 mb-4 text-gray-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">Uploading... (this may take a minute)</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Please wait while we process your file</p>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, TXT, DOCX, CSV (MAX. 20MB)
                </p>
              </>
            )}
          </div>
          <input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            accept=".pdf,.txt,.docx,.csv"
            disabled={disabled || isUploading}
            ref={fileInputRef}
          />
        </label>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          {error.includes('timed out') && (
            <p className="text-xs text-red-500 dark:text-red-300 mt-2">
              Tip: Large files may time out during upload. Try using a smaller file (under 10MB) or splitting your content into multiple files.
            </p>
          )}
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Supported formats: PDF, TXT, CSV, DOCX. Maximum size: 20MB.
      </p>
    </div>
  );
}
