# AI Learning Experience Studio

This project allows faculty at Imperial College Business School to create custom AI learning experiences with various interaction types using the OpenAI Assistants API and the Next.js AI SDK. Developed by the IDEA Lab, it supports roleplay characters, discussion facilitators, feedback coaches, and subject tutors.

## Features

- Create custom AI learning experiences with various interaction types
- Upload files to provide curriculum-aligned knowledge
- Structured input fields for educational purpose, context, persona, and instructions
- Imperial College Business School branding throughout
- Pre-built examples to demonstrate capabilities
- Manage and share experiences with students

## Prerequisites

- Node.js 18+ installed
- An OpenAI API key with access to the Assistants API

## Setup

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up your environment variables:

The project includes a `.env.local` file with the following variable:

```
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Deployment on Netlify

This project is configured for deployment on Netlify. Follow these steps to deploy:

1. Push your code to a GitHub repository
2. Log in to Netlify and click "New site from Git"
3. Select your GitHub repository
4. Configure the build settings:
   - Base directory: `CascadeProjects/ai-roleplay-creator-demo`
   - Build command: `npm install && npm run build`
   - Publish directory: `.next`
5. Add environment variables:
   - Go to Site settings > Environment variables
   - Add `OPENAI_API_KEY` with your API key value
6. Click "Deploy site"

The application will be built and deployed to a Netlify URL. You can configure a custom domain in the Netlify settings if needed.

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/src/app/page.tsx` - Home page
- `/src/app/create/page.tsx` - Create assistant page
- `/src/app/chat/page.tsx` - Chat with assistants page
- `/src/app/api/assistant/route.ts` - API route for assistant chat functionality
- `/src/app/api/create-assistant/route.ts` - API route for creating assistants and uploading files
- `/src/components/` - Reusable components (AssistantChat, FileUpload, RoleplayForm)
- `/src/lib/openai.ts` - OpenAI client utilities

## How It Works

1. **Create an Assistant**: Design a custom AI assistant with specific instructions about its personality, knowledge, and behavior.

2. **Upload Knowledge**: Optionally upload PDF, TXT, DOCX, or CSV files to give your assistant specialized knowledge.

3. **Chat with Your Assistant**: Interact with your assistant and see it respond based on its personality and knowledge base.

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Next.js AI SDK](https://sdk.vercel.ai/docs) - Tools for building AI-powered applications
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview) - For creating and managing AI assistants
- [Tailwind CSS](https://tailwindcss.com/) - For styling

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs/introduction)
