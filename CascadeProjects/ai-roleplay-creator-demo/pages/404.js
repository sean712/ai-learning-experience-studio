import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found | AI Learning Experience Studio</title>
        <meta name="description" content="Page not found" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px', 
        lineHeight: '1.6',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <img 
            src="/idea-lab-logo.svg" 
            alt="IDEA Lab Logo" 
            width={80} 
            height={80} 
            style={{ display: 'block', margin: '0 auto' }}
          />
        </div>
        
        <h1 style={{ color: '#0070f3' }}>404 - Page Not Found</h1>
        
        <div style={{ 
          border: '1px solid #eaeaea', 
          borderRadius: '10px', 
          padding: '20px', 
          marginBottom: '20px', 
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
        }}>
          <p>The page you are looking for does not exist or has been moved.</p>
          <p>Please check the URL or navigate to one of these pages:</p>
          
          <div style={{ marginTop: '20px' }}>
            <Link href="/" style={{ 
              display: 'inline-block', 
              background: '#0070f3', 
              color: 'white', 
              padding: '10px 20px', 
              borderRadius: '5px', 
              textDecoration: 'none', 
              margin: '0 10px' 
            }}>
              Home
            </Link>
            
            <Link href="/demo/" style={{ 
              display: 'inline-block', 
              background: '#0070f3', 
              color: 'white', 
              padding: '10px 20px', 
              borderRadius: '5px', 
              textDecoration: 'none', 
              margin: '0 10px' 
            }}>
              Demo
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
