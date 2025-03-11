import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAssistantById, updateAssistant, deleteAssistant } from '@/lib/localStorage';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface Params {
  params: {
    id: string;
  };
}

// GET a specific assistant
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Fetch the assistant from localStorage
    const assistant = await getAssistantById(id);
    
    if (!assistant) {
      return NextResponse.json(
        { error: 'Educational roleplay not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ assistant });
  } catch (error: any) {
    console.error('Error fetching assistant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assistant details' },
      { status: 500 }
    );
  }
}

// DELETE an assistant
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // First check if the assistant exists in localStorage
    const existingAssistant = await getAssistantById(id);
    
    if (!existingAssistant) {
      return NextResponse.json(
        { error: 'Educational roleplay not found' },
        { status: 404 }
      );
    }
    
    // Delete the assistant from OpenAI
    try {
      await openai.beta.assistants.del(id);
      console.log(`Successfully deleted assistant ${id} from OpenAI`);
    } catch (openaiError: any) {
      console.error(`Error deleting assistant ${id} from OpenAI:`, openaiError);
      // Continue with database deletion even if OpenAI deletion fails
    }
    
    // Delete the assistant from localStorage
    await deleteAssistant(id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Educational roleplay deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting assistant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete assistant' },
      { status: 500 }
    );
  }
}

// UPDATE an assistant
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const updates = await req.json();
    
    // Validate the updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }
    
    // First check if the assistant exists in localStorage
    const existingAssistant = await getAssistantById(id);
    
    if (!existingAssistant) {
      return NextResponse.json(
        { error: 'Educational roleplay not found' },
        { status: 404 }
      );
    }
    
    // Prepare the update data for OpenAI
    const openaiUpdateData: any = {};
    if (updates.name) openaiUpdateData.name = updates.name;
    if (updates.instructions) openaiUpdateData.instructions = updates.instructions;
    if (updates.model) openaiUpdateData.model = updates.model;
    
    // Update the assistant on OpenAI if we have applicable fields
    if (Object.keys(openaiUpdateData).length > 0) {
      await openai.beta.assistants.update(id, openaiUpdateData);
    }
    
    // Update the assistant in localStorage
    const updatedAssistant = await updateAssistant(id, {
      name: updates.name !== undefined ? updates.name : undefined,
      instructions: updates.instructions !== undefined ? updates.instructions : undefined,
      model: updates.model !== undefined ? updates.model : undefined,
      accessCode: updates.accessCode !== undefined ? updates.accessCode : undefined,
      shareableUrl: updates.shareableUrl !== undefined ? updates.shareableUrl : undefined,
    });
    
    return NextResponse.json({ 
      success: true,
      assistant: updatedAssistant
    });
  } catch (error: any) {
    console.error('Error updating assistant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update assistant' },
      { status: 500 }
    );
  }
}
