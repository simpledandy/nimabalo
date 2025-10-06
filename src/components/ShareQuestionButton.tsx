"use client";

import { useState } from 'react';
import { strings } from '@/lib/strings';

interface ShareQuestionButtonProps {
  questionTitle: string;
  questionUrl: string;
}

export default function ShareQuestionButton({ questionTitle, questionUrl }: ShareQuestionButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    setIsLoading(true);
    
    try {
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: questionTitle,
          text: `Bu savolni ko'ring: ${questionTitle}`,
          url: questionUrl,
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(questionUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard copy
      try {
        await navigator.clipboard.writeText(questionUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
        isCopied 
          ? 'bg-success text-white shadow-lg' 
          : 'bg-warm/20 text-warm hover:bg-warm/30'
      } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <span className={`text-lg ${isCopied ? 'animate-bounce-slow' : ''}`}>
        {isCopied ? '✅' : isLoading ? '⏳' : '📤'}
      </span>
      <span>
        {isCopied ? strings.ui.copied : isLoading ? strings.ui.loading : strings.ui.share}
      </span>
    </button>
  );
}