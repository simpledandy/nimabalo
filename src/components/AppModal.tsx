"use client";

import { useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  icon?: string;
  title?: string;
  subtitle?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  onBackdropClick?: () => void;
  className?: string;
}

export default function AppModal({ 
  isOpen, 
  onClose, 
  children,
  icon,
  title,
  subtitle,
  maxWidth = 'md',
  showCloseButton = true,
  onBackdropClick,
  className = ""
}: AppModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  if (!isOpen || !mounted) return null;

  const handleBackdropClick = () => {
    if (onBackdropClick) {
      onBackdropClick();
    } else {
      onClose();
    }
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className="absolute inset-0" 
        onClick={handleBackdropClick}
      />
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full ${maxWidthClasses[maxWidth]} animate-scale-in ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral hover:text-primary transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        {/* Header */}
        {(icon || title) && (
          <div className="text-center mb-6">
            {icon && (
              <div className="text-4xl sm:text-5xl mb-3 animate-bounce-slow">
                {icon}
              </div>
            )}
            {title && (
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-neutral">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

