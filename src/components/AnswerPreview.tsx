"use client";

import { useState } from 'react';

interface AnswerPreviewProps {
  text: string;
  maxLength?: number;
}

export default function AnswerPreview({ text, maxLength = 300 }: AnswerPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded ? text : text.slice(0, maxLength);
  const hasMore = shouldTruncate && !isExpanded;

  if (!shouldTruncate) {
    return <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>;
  }

  return (
    <div>
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {displayText}
        {hasMore && '...'}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-sky-600 hover:text-sky-700 font-medium text-sm flex items-center gap-1 transition-colors"
      >
        <span className="animate-bounce-slow">
          {isExpanded ? '🔽' : '🔼'}
        </span>
        <span>{isExpanded ? 'Kamroq ko\'rsatish' : 'Batafsil ko\'rish'}</span>
      </button>
    </div>
  );
}
