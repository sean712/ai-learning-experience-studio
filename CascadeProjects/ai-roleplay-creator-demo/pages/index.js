import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px', 
      lineHeight: '1.6' 
    }}>
      <h1 style={{ color: '#0070f3' }}>AI Learning Experience Studio</h1>
      
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
  );
}
