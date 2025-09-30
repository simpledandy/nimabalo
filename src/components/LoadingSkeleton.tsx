"use client";

interface LoadingSkeletonProps {
  variant?: 'profile' | 'card' | 'text' | 'button' | 'avatar';
  className?: string;
  lines?: number;
}

export default function LoadingSkeleton({ 
  variant = 'card', 
  className = "",
  lines = 3
}: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";
  
  switch (variant) {
    case 'profile':
      return (
        <div className={`space-y-4 ${className}`}>
          <div className={`h-8 ${baseClasses} w-48`}></div>
          <div className={`card space-y-3`}>
            <div className={`h-4 ${baseClasses} w-32`}></div>
            <div className={`h-4 ${baseClasses} w-48`}></div>
            <div className={`h-4 ${baseClasses} w-40`}></div>
          </div>
        </div>
      );
      
    case 'card':
      return (
        <div className={`card space-y-3 ${className}`}>
          {Array.from({ length: lines }).map((_, index) => (
            <div 
              key={index}
              className={`h-4 ${baseClasses}`}
              style={{ width: `${Math.random() * 40 + 60}%` }}
            ></div>
          ))}
        </div>
      );
      
    case 'text':
      return (
        <div className={`space-y-2 ${className}`}>
          {Array.from({ length: lines }).map((_, index) => (
            <div 
              key={index}
              className={`h-4 ${baseClasses}`}
              style={{ width: `${Math.random() * 30 + 70}%` }}
            ></div>
          ))}
        </div>
      );
      
    case 'button':
      return (
        <div className={`h-10 ${baseClasses} w-24 ${className}`}></div>
      );
      
    case 'avatar':
      return (
        <div className={`w-12 h-12 ${baseClasses} rounded-full ${className}`}></div>
      );
      
    default:
      return (
        <div className={`h-4 ${baseClasses} w-full ${className}`}></div>
      );
  }
}

// Specific loading components for common use cases
export function ProfileLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <LoadingSkeleton variant="profile" />
    </div>
  );
}

export function CardLoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return <LoadingSkeleton variant="card" lines={lines} />;
}

export function TextLoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return <LoadingSkeleton variant="text" lines={lines} />;
}
