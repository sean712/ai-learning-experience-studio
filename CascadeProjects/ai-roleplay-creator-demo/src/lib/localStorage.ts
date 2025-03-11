import { Assistant } from '@prisma/client';

// Define a type that matches the Prisma Assistant model
export type LocalAssistant = {
  id: string;
  name: string;
  instructions: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
  accessCode: string;
  shareableUrl: string;
  isPublic?: boolean;
};

// Key for storing assistants in localStorage
const ASSISTANTS_KEY = 'ai-learning-experience-assistants';

// Create a simple in-memory storage for server-side
let serverAssistants: LocalAssistant[] = [];

// Mock storage for server-side rendering
const serverStorage = {
  getItem: () => {
    return JSON.stringify(serverAssistants);
  },
  setItem: (_key: string, value: string) => {
    serverAssistants = JSON.parse(value);
  }
};

// Helper to safely access localStorage (only on client)
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  // Return the mock storage for server-side rendering
  return serverStorage;
};

// Get all assistants
export const getAllAssistants = async (): Promise<LocalAssistant[]> => {
  const storage = getLocalStorage();
  if (!storage) return [];
  
  try {
    const assistantsJson = storage.getItem(ASSISTANTS_KEY);
    if (!assistantsJson) return [];
    
    const assistants = JSON.parse(assistantsJson);
    // Convert string dates back to Date objects
    return assistants.map((assistant: any) => ({
      ...assistant,
      createdAt: new Date(assistant.createdAt),
      updatedAt: new Date(assistant.updatedAt)
    }));
  } catch (error) {
    console.error('Error getting assistants from localStorage:', error);
    return [];
  }
};

// Get a single assistant by ID
export const getAssistantById = async (id: string): Promise<LocalAssistant | null> => {
  const assistants = await getAllAssistants();
  const assistant = assistants.find(a => a.id === id);
  return assistant || null;
};

// Get a single assistant by access code
export const getAssistantByAccessCode = async (accessCode: string): Promise<LocalAssistant | null> => {
  const assistants = await getAllAssistants();
  const assistant = assistants.find(a => a.accessCode === accessCode);
  return assistant || null;
};

// Create a new assistant
export const createAssistant = async (data: Omit<LocalAssistant, 'createdAt' | 'updatedAt'>): Promise<LocalAssistant> => {
  const storage = getLocalStorage();
  if (!storage) throw new Error('localStorage not available');
  
  const assistants = await getAllAssistants();
  
  const newAssistant: LocalAssistant = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const updatedAssistants = [...assistants, newAssistant];
  storage.setItem(ASSISTANTS_KEY, JSON.stringify(updatedAssistants));
  
  return newAssistant;
};

// Update an assistant
export const updateAssistant = async (id: string, data: Partial<Omit<LocalAssistant, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LocalAssistant> => {
  const storage = getLocalStorage();
  if (!storage) throw new Error('localStorage not available');
  
  const assistants = await getAllAssistants();
  const assistantIndex = assistants.findIndex(a => a.id === id);
  
  if (assistantIndex === -1) {
    throw new Error(`Assistant with ID ${id} not found`);
  }
  
  const updatedAssistant: LocalAssistant = {
    ...assistants[assistantIndex],
    ...data,
    updatedAt: new Date()
  };
  
  assistants[assistantIndex] = updatedAssistant;
  storage.setItem(ASSISTANTS_KEY, JSON.stringify(assistants));
  
  return updatedAssistant;
};

// Delete an assistant
export const deleteAssistant = async (id: string): Promise<void> => {
  const storage = getLocalStorage();
  if (!storage) throw new Error('localStorage not available');
  
  const assistants = await getAllAssistants();
  const updatedAssistants = assistants.filter(a => a.id !== id);
  
  storage.setItem(ASSISTANTS_KEY, JSON.stringify(updatedAssistants));
};

// Find assistant by name (for demo creation)
export const findAssistantByName = async (name: string): Promise<LocalAssistant | null> => {
  const assistants = await getAllAssistants();
  const assistant = assistants.find(a => a.name === name);
  return assistant || null;
};

// Server-side helper for API routes
export const getServerStorage = () => {
  return serverStorage;
};
