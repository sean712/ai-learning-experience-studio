# AI Roleplay Creator Demo

This project allows you to create custom AI assistants with unique personalities and knowledge bases using the OpenAI Assistants API and the Vercel AI SDK.

## Features

- Create custom AI assistants with specific personalities and roles
- Upload files to give your assistants specialized knowledge
- Chat with your assistants in real-time
- Pre-built example assistants to try out

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
- [Vercel AI SDK](https://sdk.vercel.ai/docs) - Tools for building AI-powered applications
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview) - For creating and managing AI assistants
- [Tailwind CSS](https://tailwindcss.com/) - For styling

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs/introduction)

## Deployment

This application can be deployed on Vercel or any other platform that supports Next.js applications.
