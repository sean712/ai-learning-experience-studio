import OpenAI from 'openai';

// Create a singleton instance of the OpenAI client
let openaiInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    
    openaiInstance = new OpenAI({
      apiKey,
    });
  }
  
  return openaiInstance;
}

// Helper function to create a new assistant
export async function createAssistant({
  name,
  instructions,
  model = 'gpt-4-turbo-preview',
  fileIds = [],
}: {
  name: string;
  instructions: string;
  model?: string;
  fileIds?: string[];
}) {
  const openai = getOpenAIClient();
  
  return openai.beta.assistants.create({
    name,
    instructions,
    model,
    tools: [{ type: 'retrieval' }],
    file_ids: fileIds,
  });
}

// Helper function to upload a file for assistant use
export async function uploadFile(file: Buffer) {
  const openai = getOpenAIClient();
  
  return openai.files.create({
    file,
    purpose: 'assistants',
  });
}

// Helper function to retrieve an assistant by ID
export async function getAssistant(assistantId: string) {
  const openai = getOpenAIClient();
  
  return openai.beta.assistants.retrieve(assistantId);
}

// Helper function to list all assistants
export async function listAssistants() {
  const openai = getOpenAIClient();
  
  return openai.beta.assistants.list({
    limit: 100,
  });
}

// Helper function to delete an assistant
export async function deleteAssistant(assistantId: string) {
  const openai = getOpenAIClient();
  
  return openai.beta.assistants.del(assistantId);
}

// Helper function to create a new thread
export async function createThread() {
  const openai = getOpenAIClient();
  
  return openai.beta.threads.create();
}

// Helper function to add a message to a thread
export async function addMessageToThread(
  threadId: string,
  content: string,
  fileIds: string[] = []
) {
  const openai = getOpenAIClient();
  
  return openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content,
    file_ids: fileIds,
  });
}

// Helper function to run an assistant on a thread
export async function runAssistantOnThread(
  threadId: string,
  assistantId: string
) {
  const openai = getOpenAIClient();
  
  return openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });
}

// Helper function to get messages from a thread
export async function getThreadMessages(threadId: string) {
  const openai = getOpenAIClient();
  
  return openai.beta.threads.messages.list(threadId);
}
