import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { assistantId, accessCode } = await req.json();

    if (!assistantId || !accessCode) {
      return NextResponse.json(
        { error: 'Assistant ID and access code are required' },
        { status: 400 }
      );
    }

    // Find the assistant in the database
    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId }
    });

    if (!assistant) {
      return NextResponse.json(
        { error: 'Learning experience not found' },
        { status: 404 }
      );
    }

    // If the assistant is public, allow access without checking the code
    if (assistant.isPublic) {
      return NextResponse.json({ 
        verified: true,
        assistant: {
          id: assistant.id,
          name: assistant.name
        }
      });
    }

    // Check if the access code matches
    if (assistant.accessCode === accessCode) {
      return NextResponse.json({ 
        verified: true,
        assistant: {
          id: assistant.id,
          name: assistant.name
        }
      });
    } else {
      return NextResponse.json({ 
        verified: false,
        error: 'Invalid access code'
      }, { status: 403 });
    }
  } catch (error: any) {
    console.error('Error verifying access code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify access code' },
      { status: 500 }
    );
  }
}
