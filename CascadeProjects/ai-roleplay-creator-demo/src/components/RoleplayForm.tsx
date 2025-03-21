'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from './FileUpload';

export default function RoleplayForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [context, setContext] = useState('');
  const [interactionType, setInteractionType] = useState('roleplay');
  const [persona, setPersona] = useState('');
  const [interactionInstructions, setInteractionInstructions] = useState('');
  const [knowledgeBaseInstructions, setKnowledgeBaseInstructions] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [accessCode, setAccessCode] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAssistantId, setCreatedAssistantId] = useState<string | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; vectorStoreId?: string }>>([]);

  const handleFileUploaded = (fileId: string, fileName: string, vectorStoreId?: string) => {
    setUploadedFiles([...uploadedFiles, { id: fileId, name: fileName, vectorStoreId }]);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !accessCode.trim() || 
        !purpose.trim() || !context.trim() || 
        !interactionInstructions.trim() || !knowledgeBaseInstructions.trim() ||
        (interactionType === 'roleplay' && !persona.trim())) {
      setError('All fields and access code are required');
      return;
    }
    
    // Combine all instruction fields into a single instructions string
    const combinedInstructions = `
# Purpose
${purpose}

# Context
${context}

# Interaction Type
${interactionType}

${interactionType === 'roleplay' ? `# Persona
${persona}

` : ''}
# Interaction Instructions
${interactionInstructions}

# Knowledge Base Instructions
${knowledgeBaseInstructions}
`;

    
    setIsCreating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/create-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          instructions: combinedInstructions,
          model,
          accessCode,
          isPublic,
          fileIds: uploadedFiles.map(file => file.id),
          vectorStoreIds: uploadedFiles
            .filter(file => file.vectorStoreId) // Only include files with vector store IDs
            .map(file => file.vectorStoreId),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create educational roleplay');
      }
      
      // Store the created assistant details and show the success screen
      setCreatedAssistantId(data.assistant.id);
      setShareableUrl(`${window.location.origin}/chat?assistantId=${data.assistant.id}`);
      setIsCreating(false);
    } catch (err: any) {
      console.error('Error creating educational roleplay:', err);
      setError(err.message || 'Failed to create educational roleplay');
      setIsCreating(false);
    }
  };

  // If we've successfully created an assistant, show the success screen instead of the form
  if (createdAssistantId && shareableUrl) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-green-50 text-green-800 rounded-lg border border-green-200">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-lg font-semibold">AI Learning Experience Created Successfully!</h3>
          </div>
          <p className="mb-4">Your AI learning experience is now ready to share with your students.</p>
          
          <div className="mt-6">
            <h4 className="font-medium mb-2">Share with your students:</h4>
            <div className="flex items-center mb-4">
              <input 
                type="text" 
                value={shareableUrl} 
                readOnly 
                className="flex-1 p-3 bg-white border border-gray-300 rounded-l-lg focus:outline-none"
              />
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareableUrl);
                  alert('Link copied to clipboard!');
                }}
                className="px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
            
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Access Code: <span className="font-bold">{accessCode}</span></p>
                  <p className="text-sm mt-1">Share this code with your students so they can access the AI learning experience</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => router.push(`/chat?assistantId=${createdAssistantId}`)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Your Experience
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/manage')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage All Experiences
            </button>
            
            <button
              type="button"
              onClick={() => {
                // Reset form to create a new roleplay
                setName('');
                setPurpose('');
                setContext('');
                setPersona('');
                setInteractionType('roleplay');
                setInteractionInstructions('');
                setKnowledgeBaseInstructions('');
                setAccessCode('');
                setIsPublic(false);
                setUploadedFiles([]);
                setCreatedAssistantId(null);
                setShareableUrl(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors ml-auto"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto">
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      
      {/* Top section - Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Learning Experience Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., GMBA Global Strategy - Evaluating Global Supply Networks"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Format as: Programme - Module - Activity
          </p>
        </div>

        {/* Left column - Interaction Type and Model */}
        <div>
          <label htmlFor="interactionType" className="block text-sm font-medium mb-2">
            Interaction Type
          </label>
          <select
            id="interactionType"
            value={interactionType}
            onChange={(e) => setInteractionType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="roleplay">Roleplay Character</option>
            <option value="discussion">Discussion Facilitator</option>
            <option value="feedback">Feedback Coach</option>
            <option value="tutor">Subject Tutor</option>
            <option value="custom">Custom Interaction</option>
          </select>
          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg h-24 overflow-auto">
            <p className="font-medium mb-1">About this interaction type:</p>
            {interactionType === 'roleplay' && (
              <p>Creates an AI character that takes on a specific role or persona, allowing students to interact with a simulated expert, historical figure, or professional.</p>
            )}
            {interactionType === 'discussion' && (
              <p>Creates an AI facilitator that guides educational discussions, asks thought-provoking questions, and helps students explore topics in depth.</p>
            )}
            {interactionType === 'feedback' && (
              <p>Creates an AI coach that provides constructive feedback on student work, ideas, or practice, helping them improve their skills and understanding.</p>
            )}
            {interactionType === 'tutor' && (
              <p>Creates an AI tutor specialized in a specific subject area, providing explanations, answering questions, and guiding students through learning materials.</p>
            )}
            {interactionType === 'custom' && (
              <p>Creates a custom AI interaction designed for your specific teaching needs, with behavior defined by your detailed instructions.</p>
            )}
          </div>
        </div>

        {/* Right column - Model and Access Settings */}
        <div className="space-y-4">
          <div>
            <label htmlFor="model" className="block text-sm font-medium mb-2">
              AI Model
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="gpt-4o">GPT-4o (Recommended)</option>
              <option value="gpt-4o-mini">GPT-4o-mini (Faster)</option>
              <option value="o1">o1 (Most Capable)</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="text-sm font-medium">
              Make Publicly Available
            </label>
            <span className="text-xs text-gray-500">
              (No access code required)
            </span>
          </div>
        </div>
      </div>
      
      {/* Middle section - Content Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium mb-4">AI Learning Experience Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium mb-2">
                Purpose
              </label>
              <textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="What is the educational purpose of this experience? What should students learn?"
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            
            <div>
              <label htmlFor="context" className="block text-sm font-medium mb-2">
                Context
              </label>
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="What is the setting or background of this experience? What context should the AI understand?"
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            
            {interactionType === 'roleplay' && (
              <div>
                <label htmlFor="persona" className="block text-sm font-medium mb-2">
                  Persona
                </label>
                <textarea
                  id="persona"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  placeholder="Who will the AI roleplay as? Describe their character, expertise, and personality."
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                  required
                />
              </div>
            )}
          </div>
          
          {/* Right column */}
          <div className="space-y-4">
            <div>
              <label htmlFor="interactionInstructions" className="block text-sm font-medium mb-2">
                {interactionType === 'roleplay' ? 'Roleplay' : 
                interactionType === 'discussion' ? 'Discussion' : 
                interactionType === 'feedback' ? 'Feedback' : 
                interactionType === 'tutor' ? 'Tutoring' : 'Interaction'} Instructions
              </label>
              <textarea
                id="interactionInstructions"
                value={interactionInstructions}
                onChange={(e) => setInteractionInstructions(e.target.value)}
                placeholder={`How should the AI interact with students? ${interactionType === 'roleplay' ? 'What character traits should it exhibit?' : 
                              interactionType === 'discussion' ? 'What discussion techniques should it use?' : 
                              interactionType === 'feedback' ? 'What feedback approach should it take?' : 
                              interactionType === 'tutor' ? 'What tutoring methods should it employ?' : 
                              'What interaction patterns should it follow?'}`}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            
            <div>
              <label htmlFor="knowledgeBaseInstructions" className="block text-sm font-medium mb-2">
                Knowledge Base Instructions
              </label>
              <textarea
                id="knowledgeBaseInstructions"
                value={knowledgeBaseInstructions}
                onChange={(e) => setKnowledgeBaseInstructions(e.target.value)}
                placeholder="What knowledge should the AI use? What limitations or boundaries should it observe?"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom section - Materials and Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Learning Materials */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Learning Materials (Optional)
          </label>
          <div className="border border-gray-200 rounded-lg p-4">
            <FileUpload onFileUploaded={handleFileUploaded} />
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Uploaded Materials:</h4>
                <ul className="space-y-2 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((file) => (
                    <li key={file.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Access Code */}
        <div>
          <label htmlFor="accessCode" className="block text-sm font-medium mb-2">
            Access Code {!isPublic && <span className="text-red-500">*</span>}
          </label>
          <input
            id="accessCode"
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="e.g., class123"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
            required={!isPublic}
          />
          <p className="mt-1 text-sm text-gray-500">
            Students will need this code to access the learning experience
          </p>
          
          <div className="mt-8">
            <button
              type="submit"
              disabled={isCreating || (!isPublic && !accessCode.trim())}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating Learning Experience...' : 'Create AI Learning Experience'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
