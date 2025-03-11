import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>AI Learning Experience Studio | Imperial College Business School</title>
        <meta name="description" content="Create custom AI learning experiences for education" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px', 
      lineHeight: '1.6' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ marginRight: '20px' }}>
          <img 
            src="/idea-lab-logo.svg" 
            alt="IDEA Lab Logo" 
            width={80} 
            height={80} 
            style={{ display: 'block' }}
          />
        </div>
        <h1 style={{ color: '#0070f3', margin: 0 }}>AI Learning Experience Studio</h1>
      </div>
      
      <div style={{ 
        border: '1px solid #eaeaea', 
        borderRadius: '10px', 
        padding: '20px', 
        marginBottom: '20px', 
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
      }}>
        <h2>Welcome to the Imperial College Business School AI Learning Experience Studio</h2>
        <p>This application allows faculty to create custom AI learning experiences with various interaction types:</p>
        <ul>
          <li>Roleplay Characters (historical figures, experts)</li>
          <li>Discussion Facilitators</li>
          <li>Feedback Coaches</li>
          <li>Subject Tutors</li>
          <li>Custom Interactions</li>
        </ul>
        <p>The application is currently being configured for Vercel deployment.</p>
        <Link href="/demo/" style={{ 
          display: 'inline-block', 
          background: '#0070f3', 
          color: 'white', 
          padding: '10px 20px', 
          borderRadius: '5px', 
          textDecoration: 'none', 
          marginTop: '10px' 
        }}>
          Try Demo
        </Link>
      </div>
      
      <div style={{ 
        border: '1px solid #eaeaea', 
        borderRadius: '10px', 
        padding: '20px', 
        marginBottom: '20px', 
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
      }}>
        <h2>Features</h2>
        <ul>
          <li>Create custom AI learning experiences with various interaction types</li>
          <li>Upload files to provide curriculum-aligned knowledge</li>
          <li>Structured input fields for educational purpose, context, persona, and instructions</li>
          <li>Imperial College Business School branding throughout</li>
          <li>Pre-built examples to demonstrate capabilities</li>
          <li>Manage and share experiences with students</li>
        </ul>
      </div>
    </div>
    </>
  );
}
