"use client";

import React from 'react';
import NextLink from 'next/link';

interface CustomLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * CustomLink component that works in both Windsurf and Netlify environments
 * Uses direct navigation which is more reliable in Windsurf
 * 
 * Based on previous successful implementation, we're using direct window.location.href
 * navigation which has proven to work reliably in Windsurf
 */
export default function CustomLink({ href, className, children }: CustomLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Always prevent default behavior
    e.preventDefault();
    
    // Use direct navigation which works reliably in Windsurf
    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
  };

  return (
    <NextLink 
      href={href} 
      className={className}
      onClick={handleClick}
      prefetch={false} // Disable prefetching to avoid issues in Windsurf
    >
      {children}
    </NextLink>
  );
}
