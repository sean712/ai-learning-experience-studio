import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getVectorStoreId, createVectorStore, addFileToVectorStore } from '@/utils/vectorStoreManager';

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// For Next.js 15+, we need to use a different approach for handling large file uploads
export const dynamic = 'force-dynamic';

// Set a longer timeout for this route to handle large file uploads
export const maxDuration = 120; // 120 seconds - doubled to handle larger files

// Configure the route to handle larger payloads
export const fetchCache = 'force-no-store';

// Increase the body size limit for this specific route
export const bodyParser = {
  sizeLimit: '512mb', // Match OpenAI's file size limit of 512MB
};

// API route for uploading files to OpenAI
export async function POST(req: NextRequest) {
  console.log('File upload request received');
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided in the request');
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
    
    console.log(`Processing file upload: ${file.name}, size: ${(file.size / (1024 * 1024)).toFixed(2)}MB, type: ${file.type}`);
    
    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|csv|docx)$/i)) {
      console.error(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: PDF, TXT, CSV, DOCX' },
        { status: 415 }
      );
    }

    console.log(`Uploading file to OpenAI: ${file.name}`);
    
    try {
      console.log(`Starting OpenAI file upload for ${file.name}...`);
      
      // Set a longer timeout for the OpenAI API call
      const uploadStartTime = Date.now();
      
      // Create a temporary file to use with createReadStream
      // We need to save the file to disk temporarily since we can't directly create a stream from the FormData file
      const tempFilePath = `/tmp/${Date.now()}-${file.name}`;
      
      // Convert the file to a Buffer and write to disk
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Import fs module
      const fs = require('fs');
      
      // Write the buffer to a temporary file
      fs.writeFileSync(tempFilePath, buffer);
      
      console.log(`Created temporary file at ${tempFilePath}`);
      
      // Use our vector store manager
      
      // Create a fresh vector store for each file upload to avoid reusing problematic ones
      console.log('Creating a new Vector Store specifically for this file');
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
      const vectorStoreName = `${fileName} - ${new Date().toISOString()}`;
      const vectorStoreId = await createVectorStore(vectorStoreName);
      console.log('Created fresh Vector Store:', vectorStoreId);
      
      // Upload the file directly from the buffer instead of a stream
      console.log(`Uploading file ${file.name} to OpenAI`);
      
      // First, read the file as a Buffer
      const fileBuffer = fs.readFileSync(tempFilePath);
      
      // Create a File object that OpenAI's toFile can use
      const fileBlob = new Blob([fileBuffer], { type: file.type || 'application/octet-stream' });
      
      try {
        // Import toFile from openai
        const { toFile } = await import('openai');
        
        // Convert the blob to a File that OpenAI can process
        const openaiFile = await toFile(
          new File([fileBlob], file.name, { type: file.type || 'application/octet-stream' })
        );
        
        // Upload the file to OpenAI
        const uploadedFile = await openai.files.create({
          file: openaiFile,
          purpose: 'assistants',
        });
        
        console.log(`File uploaded successfully with ID: ${uploadedFile.id}`);
        
        // Then, add the file to the vector store
        console.log(`Adding file ${uploadedFile.id} to Vector Store ${vectorStoreId}`);
        
        try {
          // Start the file batch creation process
          const fileBatch = await addFileToVectorStore(uploadedFile.id, vectorStoreId);
          console.log('File batch creation initiated with ID:', fileBatch.id);
          
          // Include both IDs in the response
          const responseData = {
            ...uploadedFile,
            vectorStoreId: vectorStoreId,
            fileBatchId: fileBatch.id
          };
          
          // Clean up the temporary file
          fs.unlinkSync(tempFilePath);
          console.log(`Removed temporary file ${tempFilePath}`);
          
          return NextResponse.json({ file: responseData });
        } catch (vectorStoreError: any) {
          console.error('Vector store processing error:', vectorStoreError);
          // Return what we have so far even if vector store processing failed
          return NextResponse.json({ 
            file: { ...uploadedFile, vectorStoreId: vectorStoreId },
            warning: 'File uploaded but vector store processing failed. The assistant may not be able to search this file.'
          });
        }
      } catch (fileUploadError: any) {
        console.error('Error uploading file to OpenAI:', fileUploadError);
        return NextResponse.json(
          { error: `Error uploading file: ${fileUploadError.message}` },
          { status: 500 }
        );
      }
      
      const uploadDuration = (Date.now() - uploadStartTime) / 1000;
      console.log(`OpenAI upload completed in ${uploadDuration.toFixed(2)} seconds`);

      console.log(`File uploaded successfully: ${file.name}, id: ${uploadedFile.id}, vectorStoreId: ${vectorStoreId}`);
      return NextResponse.json({ file: responseData });
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError);
      return NextResponse.json(
        { error: `OpenAI API error: ${openaiError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
