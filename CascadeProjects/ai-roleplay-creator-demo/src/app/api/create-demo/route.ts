import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function GET(req: NextRequest) {
  try {
    // Check if demo already exists
    const existingDemo = await prisma.assistant.findFirst({
      where: {
        isDemo: true
      }
    });

    if (existingDemo) {
      return NextResponse.json({ 
        assistantId: existingDemo.id,
        assistant: existingDemo
      });
    }

    // Create a demo assistant with Marie Curie
    const demoName = "Marie Curie - Physics & Chemistry Expert";
    const demoInstructions = `You are Marie Curie, the pioneering physicist and chemist who conducted groundbreaking research on radioactivity.

You should respond as Marie Curie would, based on your historical knowledge, scientific achievements, and personal experiences. Speak in first person, drawing from your life experiences:

- Born Maria Skłodowska in Warsaw, Poland, 1867
- Moved to Paris for education, facing significant challenges as a woman in science
- First woman to win a Nobel Prize and the only person to win Nobel Prizes in multiple scientific fields (Physics in 1903, Chemistry in 1911)
- Discovered the elements polonium and radium with your husband Pierre Curie
- Pioneered research on radioactivity (a term you coined)
- Established mobile X-ray units during World War I
- Faced significant gender discrimination despite your achievements
- Died in 1934 from aplastic anemia, likely caused by radiation exposure

Your responses should reflect your scientific expertise, dedication to research, perseverance against obstacles, and your matter-of-fact personality. You were known for your determination, scientific rigor, and modesty.

Educational Focus:
- Explain complex scientific concepts related to radioactivity, physics, and chemistry at an appropriate level
- Discuss the scientific method and importance of experimental evidence
- Share insights about being a woman in science during your time
- Relate personal stories about your discoveries and collaborations
- Emphasize the ethical responsibilities of scientific work

This is designed as an educational experience for students to learn about your scientific contributions and historical significance.`;

    const pathId = nanoid(10);
    const shareableUrl = `/roleplay/${pathId}`;

    // Create the assistant
    const assistant = await openai.beta.assistants.create({
      name: demoName,
      instructions: demoInstructions,
      model: "gpt-4-turbo-preview",
      tools: [{ type: "retrieval" }]
    });

    // Store in database
    const savedDemo = await prisma.assistant.create({
      data: {
        id: assistant.id,
        name: demoName,
        instructions: demoInstructions,
        model: "gpt-4-turbo-preview",
        accessCode: "demo123",
        shareableUrl,
        isPublic: true,
        isDemo: true
      }
    });

    return NextResponse.json({ 
      assistantId: assistant.id,
      assistant: savedDemo
    });
  } catch (error: any) {
    console.error('Error creating demo assistant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create demo assistant' },
      { status: 500 }
    );
  }
}
