import { NextRequest, NextResponse } from 'next/server';
import { getAllAssistants } from '@/lib/localStorage';

export async function GET(req: NextRequest) {
  try {
    // Fetch all assistants from localStorage
    const assistants = await getAllAssistants();
    
    // Sort by createdAt in descending order
    const sortedAssistants = assistants.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    
    return NextResponse.json({ assistants: sortedAssistants });
  } catch (error: any) {
    console.error('Error fetching assistants:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assistants' },
      { status: 500 }
    );
  }
}
