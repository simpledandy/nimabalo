"use client";

export default function QuestionSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 flex items-center justify-center">
      <div className="w-full max-w-4xl px-4">
        <div className="space-y-6 animate-fade-in-up">
          {/* Back button skeleton */}
          <div className="w-48 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          
          {/* Question card skeleton */}
          <div className="card p-6 space-y-4">
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24"></div>
            </div>
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex justify-center gap-4">
            <div className="h-10 bg-gray-200 rounded-full animate-pulse w-32"></div>
            <div className="h-10 bg-gray-200 rounded-full animate-pulse w-24"></div>
          </div>
          
          {/* Answers section skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-12"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Answer form skeleton */}
          <div className="card p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
