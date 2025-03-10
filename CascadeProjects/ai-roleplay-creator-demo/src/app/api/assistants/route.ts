import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Fetch all assistants from the database with their files
    const assistants = await prisma.assistant.findMany({
      include: {
        files: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ assistants });
  } catch (error: any) {
    console.error('Error fetching assistants:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assistants' },
      { status: 500 }
    );
  }
}
