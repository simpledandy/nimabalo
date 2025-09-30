"use client";

import { ReactNode } from 'react';
import SparkleEffect from './SparkleEffect';
import BackgroundEffects from './BackgroundEffects';

interface PageLayoutProps {
  children: ReactNode;
  showSparkles?: boolean;
  showBackgroundEffects?: boolean;
  className?: string;
}

export default function PageLayout({ 
  children, 
  showSparkles = true, 
  showBackgroundEffects = true,
  className = ""
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-sky-50 relative overflow-hidden ${className}`}>
      {/* Sparkle effect for extra playfulness */}
      {showSparkles && <SparkleEffect />}
      
      {/* Floating background elements */}
      {showBackgroundEffects && <BackgroundEffects />}
      
      {children}
    </div>
  );
}
