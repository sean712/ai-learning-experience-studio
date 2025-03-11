'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, useAssistant } from '@ai-sdk/react';

interface AssistantChatProps {
  assistantId?: string;
  initialThreadId?: string;
  fileIds?: string[];
}

export default function AssistantChat({ 
  assistantId, 
  initialThreadId,
  fileIds = []
}: AssistantChatProps) {
  const [threadId, setThreadId] = useState<string | null>(initialThreadId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for handling demo mode
  const [demoMode, setDemoMode] = useState(false);
  
  // Check if we're in demo mode (no API key)
  useEffect(() => {
    // For example assistants, always use demo mode
    if (assistantId?.startsWith('example-')) {
      setDemoMode(true);
    }
  }, [assistantId]);

  // Initialize the assistant chat with basic options to avoid TypeScript errors
  const { 
    status, 
    messages, 
    input, 
    submitMessage, 
    handleInputChange,
    error
  } = useAssistant({
    api: '/api/assistant',
    body: {
      assistantId,
      threadId,
      fileIds
    }
  });
  
  // Handle threadId updates from response data
  useEffect(() => {
    // Look for data messages that contain threadId
    const dataMessage = messages.find(m => 
      m.role === 'data' && 
      (m.data as any)?.threadId && 
      (m.data as any).threadId !== threadId
    );
    
    if (dataMessage) {
      const newThreadId = (dataMessage.data as any).threadId;
      setThreadId(newThreadId);
    }
  }, [messages, threadId]);
  
  // Handle API key errors
  useEffect(() => {
    if (error?.message?.includes('API key')) {
      setDemoMode(true);
      console.error('Error in assistant chat:', error);
    }
  }, [error]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Maximum message size in characters
  const MAX_MESSAGE_LENGTH = 4000;

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check message length before submitting
    if (input.length > MAX_MESSAGE_LENGTH) {
      console.error(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }
    
    submitMessage();
  };
  
  // Check if input is too long
  const isInputTooLong = input.length > MAX_MESSAGE_LENGTH;

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Start a conversation with your assistant</p>
          </div>
        ) : (
          messages.map((message: Message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : message.role === 'assistant'
                      ? 'bg-gray-200 dark:bg-gray-700 rounded-bl-none' 
                      : 'bg-gray-100 dark:bg-gray-800 text-sm'
                }`}
              >
                {message.role === 'data' ? (
                  <div>
                    <p className="font-semibold">System Message</p>
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(message.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>{message.content}</div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form 
        onSubmit={handleSubmit} 
        className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 rounded-b-lg"
      >
        {error && (
          <div className="mb-3 p-3 text-sm bg-red-100 text-red-800 rounded-lg">
            Error: {error.message || 'Something went wrong'}
          </div>
        )}
        
        {isInputTooLong && (
          <div className="mb-3 p-3 text-sm bg-yellow-100 text-yellow-800 rounded-lg">
            Message is too long. Please keep it under {MAX_MESSAGE_LENGTH} characters.
            Current length: {input.length} characters.
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={status !== 'awaiting_message'}
            className={`flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${isInputTooLong ? 'border-yellow-500 focus:ring-yellow-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}`}
          />
          <button
            type="submit"
            disabled={status !== 'awaiting_message' || !input.trim() || isInputTooLong}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'in_progress' ? 'Thinking...' : 'Send'}
          </button>
        </div>
        
        {status === 'in_progress' && (
          <div className="mt-2 text-sm text-gray-500 animate-pulse">
            Assistant is thinking...
          </div>
        )}
      </form>
    </div>
  );
}
