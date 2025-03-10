import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// For Next.js 15+, we need to use a different approach for handling large file uploads
// The config option is no longer supported in the same way
export const dynamic = 'force-dynamic';

// Set a longer timeout for this route to handle large file uploads
export const maxDuration = 120; // 120 seconds

// Configure the route to handle larger payloads
export const fetchCache = 'force-no-store';

// Increase the body size limit for this specific route
export const bodyParser = {
  sizeLimit: '512mb', // Match OpenAI's file size limit of 512MB
};

export async function POST(req: NextRequest) {
  try {
    const { name, instructions, model, accessCode, isPublic = false, fileIds = [], vectorStoreIds = [] } = await req.json();

    if (!name || !instructions || !accessCode) {
      return NextResponse.json(
        { error: 'Name, instructions, and access code are required' },
        { status: 400 }
      );
    }

    // Create a new assistant using the OpenAI Vector Stores approach
    console.log('Creating educational roleplay with parameters:', { name, instructions, model, accessCode, isPublic, fileIds });
    
    // Generate a unique path ID for the shareable URL
    const pathId = nanoid(10);
    const shareableUrl = `/roleplay/${pathId}`;
    
    // Create the assistant
    const assistantParams: any = {
      name: name,
      instructions: instructions,
      model: model || 'gpt-4-turbo-preview',
      tools: [
        {
          type: 'file_search'
        }
      ]
    };
    
    // If we have vector store IDs from the form, use those
    if (vectorStoreIds && vectorStoreIds.length > 0) {
      console.log(`Using Vector Stores from uploads:`, vectorStoreIds);
      
      // Add vector_store_ids to the file_search tool resources
      assistantParams.tool_resources = {
        file_search: {
          vector_store_ids: vectorStoreIds
        }
      };
      
      console.log('Final assistant parameters with vector stores:', JSON.stringify(assistantParams, null, 2));
    } else {
      console.log('No Vector Stores provided, creating assistant without file search capability');
    }
    
    // Create the assistant with the vector store
    const assistant = await openai.beta.assistants.create(assistantParams);
    
    console.log('Assistant created successfully:', assistant.id);
    
    // Store the assistant in the database with access code and shareable URL
    const savedAssistant = await prisma.assistant.create({
      data: {
        id: assistant.id,
        name,
        instructions,
        model: model || 'gpt-4-turbo-preview',
        accessCode,
        shareableUrl,
        isPublic,
        files: {
          create: fileIds.map((fileId: string, index: number) => ({
            id: fileId,
            name: `File ${index + 1}`,
            vectorStoreId: vectorStoreIds[index] || null
          }))
        }
      },
      include: {
        files: true
      }
    });
    
    console.log('Assistant saved to database with shareable URL:', shareableUrl);

    return NextResponse.json({
      assistant,
      shareableUrl,
      dbRecord: savedAssistant
    });
  } catch (error: any) {
    console.error('Error creating assistant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create assistant' },
      { status: 500 }
    );
  }
}

// API route for uploading files to OpenAI
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Check file size - OpenAI has a 20MB limit for files
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      console.error(`File size exceeds the maximum limit: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return NextResponse.json(
        { error: `File size exceeds the maximum limit of 20MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB` },
        { status: 413 }
      );
    }
    
    console.log(`Processing file upload: ${file.name}, size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    
    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|csv|docx)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: PDF, TXT, CSV, DOCX' },
        { status: 415 }
      );
    }

    // Create a temporary file to use with createReadStream
    const tempFilePath = `/tmp/${Date.now()}-${file.name}`;
    
    // Convert the file to a Buffer and write to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Import fs module
    const fs = require('fs');
    
    // Write the buffer to a temporary file
    fs.writeFileSync(tempFilePath, buffer);
    
    console.log(`Created temporary file at ${tempFilePath}`);
    
    // Upload the file to OpenAI using a read stream instead of a buffer
    const uploadedFile = await openai.files.create({
      file: fs.createReadStream(tempFilePath),
      purpose: 'assistants',
    });
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    console.log(`Removed temporary file ${tempFilePath}`);

    return NextResponse.json({ file: uploadedFile });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
