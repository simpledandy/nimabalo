"use client";

import LoadingSkeleton from './LoadingSkeleton';

export default function QuestionSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 flex items-center justify-center">
      <div className="w-full max-w-4xl px-4">
        <div className="space-y-6 animate-fade-in-up">
          {/* Back button skeleton */}
          <LoadingSkeleton variant="button" className="w-48" />
          
          {/* Question card skeleton */}
          <LoadingSkeleton variant="card" lines={6} />
          
          {/* Action buttons skeleton */}
          <div className="flex justify-center gap-4">
            <LoadingSkeleton variant="button" className="w-32" />
            <LoadingSkeleton variant="button" className="w-24" />
          </div>
          
          {/* Answers section skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <LoadingSkeleton variant="text" lines={1} className="w-20" />
              <LoadingSkeleton variant="button" className="w-12" />
            </div>
            
            {/* Answer cards skeleton */}
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} variant="card" lines={4} />
            ))}
          </div>
          
          {/* Answer form skeleton */}
          <LoadingSkeleton variant="card" lines={5} />
        </div>
      </div>
    </div>
  );
}