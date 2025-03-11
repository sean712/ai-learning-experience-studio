import OpenAI from 'openai';

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// In-memory cache for development environments
let inMemoryVectorStore: VectorStoreData | null = null;

// Interface for our vector store data
interface VectorStoreData {
  id: string;
  name: string;
  createdAt: string;
}

// Helper to determine if we're in a serverless environment like Netlify
const isServerlessEnvironment = () => {
  return process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
};

/**
 * Gets the current vector store ID from environment variable or in-memory cache
 */
export async function getVectorStoreId(): Promise<string | null> {
  // First check if we have a vector store ID in the environment
  if (process.env.OPENAI_VECTOR_STORE_ID) {
    return process.env.OPENAI_VECTOR_STORE_ID;
  }
  
  // Then check if we have one in memory (for development)
  if (inMemoryVectorStore) {
    return inMemoryVectorStore.id;
  }
  
  return null;
}

/**
 * Creates a new vector store and saves its ID
 */
export async function createVectorStore(name: string = 'AI Roleplay Knowledge Base'): Promise<string> {
  try {
    // Create a new vector store
    const vectorStore = await openai.beta.vectorStores.create({
      name: name,
      // Set expiration to 30 days after last activity to avoid unnecessary costs
      expires_after: { anchor: 'last_active_at', days: 30 }
    });
    
    // Create data object
    const data: VectorStoreData = {
      id: vectorStore.id,
      name: vectorStore.name,
      createdAt: new Date().toISOString()
    };
    
    // Store in memory for development environments
    inMemoryVectorStore = data;
    
    // Log the vector store ID for debugging
    console.log(`Created vector store: ${vectorStore.id} (${name})`);
    
    return vectorStore.id;
  } catch (error) {
    console.error('Error creating vector store:', error);
    throw error;
  }
}

/**
 * Adds a file to the vector store using a more direct approach
 */
export async function addFileToVectorStore(fileId: string, vectorStoreId: string): Promise<any> {
  try {
    console.log(`Starting file upload to vector store: ${fileId} -> ${vectorStoreId}`);
    
    // First, try a direct upload with the files batch API
    const fileBatch = await openai.beta.vectorStores.fileBatches.create(
      vectorStoreId,
      { file_ids: [fileId] }
    );
    
    console.log(`File batch created, waiting for processing:`, fileBatch);
    
    // Then poll separately to check status, without blocking the response
    // This is a compromise between responsiveness and reliability
    let attempts = 0;
    const maxAttempts = 10;
    const checkStatus = async () => {
      try {
        if (attempts >= maxAttempts) {
          console.log(`Reached max polling attempts for file ${fileId}. The file may still be processing.`);
          return;
        }
        
        attempts++;
        console.log(`Checking status for file batch ${fileBatch.id}, attempt ${attempts}/${maxAttempts}...`);
        
        const status = await openai.beta.vectorStores.fileBatches.retrieve(
          vectorStoreId,
          fileBatch.id
        );
        
        console.log(`File batch status: ${status.status}`);
        
        if (status.status === 'completed') {
          console.log(`File batch processing completed successfully!`);
          return;
        } else if (status.status === 'failed') {
          console.error(`File batch processing failed:`, status);
          return;
        } else {
          // Still processing, try again after delay
          setTimeout(checkStatus, 3000);
        }
      } catch (error) {
        console.error(`Error checking file batch status:`, error);
      }
    };
    
    // Start the polling process in the background
    setTimeout(checkStatus, 3000);
    
    return fileBatch;
  } catch (error) {
    console.error(`Error adding file ${fileId} to vector store ${vectorStoreId}:`, error);
    throw error;
  }
}
