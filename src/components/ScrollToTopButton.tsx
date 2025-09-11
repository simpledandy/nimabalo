"use client";

import { useState, useEffect } from 'react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 bg-accent hover:bg-secondary text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 animate-fade-in-up"
      style={{
        animationDelay: '0ms',
      }}
    >
      <span className="text-2xl animate-bounce-slow">⬆️</span>
    </button>
  );
}
