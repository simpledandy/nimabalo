"use client";

import Link from 'next/link';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: {
    href: string;
    text: string;
  };
  icon?: string;
  children?: ReactNode;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  backButton, 
  icon,
  children 
}: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary via-secondary to-accent text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {backButton && (
              <Link 
                href={backButton.href}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full font-medium hover:bg-white/30 transition-all duration-300 hover:scale-105"
              >
                <span className="text-lg animate-bounce-slow">←</span>
                <span>{backButton.text}</span>
              </Link>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 animate-fade-in">
                {title}
              </h1>
              {subtitle && (
                <p className="text-white/80 text-lg animate-fade-in-up" style={{animationDelay: '200ms'}}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {children}
            {icon && (
              <div className="text-6xl opacity-20 animate-bounce-slow">{icon}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
