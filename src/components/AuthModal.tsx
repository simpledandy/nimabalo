"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  showSignupOption?: boolean;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  title = "Tizimga kirish kerak",
  message = "Bu amalni bajarish uchun tizimga kiring yoki ro'yxatdan o'ting"
}: AuthModalProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-6 max-w-md w-full mx-4">
        {/* Header with fun emoji */}
        <div className="text-center">
          <div className="text-4xl mb-3">
            {isSignup ? '✨' : '🔐'}
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            {isSignup ? 'Ro\'yxatdan o\'ting' : title}
          </h2>
          {message && (
            <p className="text-neutral text-center text-sm mt-2">
              {message}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 w-full">
          {isSignup ? (
            <>
              <a 
                href="/auth?signup=1" 
                className="btn w-full text-center py-3 font-bold text-lg hover:scale-105 transition-transform"
              >
                <span className="mr-2">🚀</span>
                Ro'yxatdan o'tish
              </a>
              <button 
                onClick={() => setIsSignup(false)}
                className="text-accent hover:text-secondary font-medium py-2 transition-colors"
              >
                ← Tizimga kirish
              </button>
            </>
          ) : (
            <>
              <a 
                href="/auth" 
                className="btn w-full text-center py-3 font-bold text-lg hover:scale-105 transition-transform"
              >
                <span className="mr-2">🔑</span>
                Tizimga kirish
              </a>
              <a 
                href="/auth?signup=1" 
                className="btn-secondary w-full text-center py-3 font-bold text-lg hover:scale-105 transition-transform"
              >
                <span className="mr-2">✨</span>
                Ro'yxatdan o'tish
              </a>
            </>
          )}
        </div>

        {/* Close button */}
        <button 
          onClick={onClose}
          className="text-neutral hover:text-primary transition-colors text-sm mt-2"
        >
          Bekor qilish
        </button>
      </div>
    </div>,
    document.body
  );
}