import React from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

interface CustomLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * CustomLink component that works in both Windsurf and Netlify environments
 * Uses Next.js Link component with enhanced compatibility
 * 
 * This component handles navigation in a way that works in both Windsurf and Netlify:
 * 1. In Windsurf, it uses direct navigation with window.location.href
 * 2. In Netlify, it uses Next.js router for client-side navigation
 */
export default function CustomLink({ href, className, children }: CustomLinkProps) {
  const router = useRouter();

  // Detect if we're in Windsurf by checking for specific environment variables or features
  const isWindsurf = typeof window !== 'undefined' && 
    (window.navigator.userAgent.includes('Windsurf') || 
     window.location.href.includes('windsurf'));

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Always prevent default behavior
    e.preventDefault();
    
    // In Windsurf, use direct navigation
    if (isWindsurf) {
      window.location.href = href;
      return;
    }
    
    // Otherwise use Next.js router for client-side navigation
    router.push(href);
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
