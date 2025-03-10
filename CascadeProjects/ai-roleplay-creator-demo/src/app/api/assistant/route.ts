import { AssistantResponse } from 'ai';
import OpenAI from 'openai';

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// For Next.js 15+, we need to use a different approach for handling large payloads
// The config option is no longer supported in the same way
export const dynamic = 'force-dynamic';

// Set a longer timeout for this route to handle streaming responses
export const maxDuration = 120; // 120 seconds

// Configure the route to handle larger payloads
export const fetchCache = 'force-no-store';

// Increase the body size limit for this specific route
export const bodyParser = {
  sizeLimit: '512mb', // Match OpenAI's file size limit of 512MB
};

export async function POST(req: Request) {
  try {
    // Check request size before parsing
    const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
    if (contentLength > 4 * 1024 * 1024) { // 4MB limit
      return new Response(
        JSON.stringify({ error: 'Request body too large' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse the request body
    const input: {
      threadId: string | null;
      message: string;
      assistantId?: string;
      fileIds?: string[];
    } = await req.json();

    // Use the provided assistant ID or fall back to the default one
    const assistantId = input.assistantId || process.env.ASSISTANT_ID;
    
    if (!assistantId) {
      return new Response(
        JSON.stringify({ error: 'No assistant ID provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a thread if needed
    const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;

    // Add a message to the thread
    // The OpenAI API expects the parameters in a specific format
    const messageParams = {
      role: 'user',
      content: input.message,
    };
    
    // Only add file_ids if there are files to attach
    if (input.fileIds && input.fileIds.length > 0) {
      // @ts-ignore - The type definitions might be outdated
      messageParams.file_ids = input.fileIds;
    }
    
    const createdMessage = await openai.beta.threads.messages.create(threadId, messageParams);

    return AssistantResponse(
      { threadId, messageId: createdMessage.id },
      async ({ forwardStream, sendDataMessage }) => {
        // Run the assistant on the thread
        const runStream = openai.beta.threads.runs.stream(threadId, {
          assistant_id: assistantId,
        });

        // Forward run status would stream message deltas
        let runResult = await forwardStream(runStream);

        // Handle tool calls if the assistant requires actions
        while (
          runResult?.status === 'requires_action' &&
          runResult.required_action?.type === 'submit_tool_outputs'
        ) {
          const toolCalls = runResult.required_action.submit_tool_outputs.tool_calls;
          
          const toolOutputs = await Promise.all(
            toolCalls.map(async (toolCall: any) => {
              const parameters = JSON.parse(toolCall.function.arguments);
              
              // Handle different tool functions
              switch (toolCall.function.name) {
                case 'get_current_weather':
                  // Example tool function - replace with your actual tools
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify({
                      temperature: 22,
                      unit: "celsius",
                      description: "Sunny"
                    }),
                  };
                  
                // Add more tool cases as needed
                
                default:
                  console.warn(`Unknown tool call function: ${toolCall.function.name}`);
                  return {
                    tool_call_id: toolCall.id,
                    output: JSON.stringify({ error: "Tool not implemented" }),
                  };
              }
            })
          );

          // Submit tool outputs back to the assistant
          runResult = await forwardStream(
            openai.beta.threads.runs.submitToolOutputsStream(
              threadId,
              runResult.id,
              { tool_outputs: toolOutputs },
            ),
          );
        }
        
        // Send any additional data messages if needed
        sendDataMessage({
          role: 'data',
          data: {
            threadId,
            assistantId,
            completed: true,
          }
        });
      },
    );
  } catch (error) {
    console.error('Error in assistant API:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
