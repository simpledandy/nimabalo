"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { strings } from '@/lib/strings';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'danger' | 'primary' | 'secondary';
  icon?: string;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = strings.confirmation.defaultTitle,
  message = strings.confirmation.defaultMessage,
  confirmText = strings.confirmation.defaultConfirm,
  cancelText = strings.confirmation.defaultCancel,
  confirmButtonStyle = 'danger',
  icon = '⚠️'
}: ConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getConfirmButtonClass = () => {
    switch (confirmButtonStyle) {
      case 'danger':
        return 'btn-danger w-full text-center py-3 font-bold text-lg hover:scale-105 transition-transform';
      case 'secondary':
        return 'btn-secondary w-full text-center py-3 font-bold text-lg hover:scale-105 transition-transform';
      default:
        return 'btn w-full text-center py-3 font-bold text-lg hover:scale-105 transition-transform';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-6 max-w-md w-full mx-4">
        {/* Header with icon */}
        <div className="text-center">
          <div className="text-4xl mb-3">
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            {title}
          </h2>
          {message && (
            <p className="text-neutral text-center text-sm mt-2">
              {message}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={handleConfirm}
            className={getConfirmButtonClass()}
          >
            {confirmText}
          </button>
          <button 
            onClick={onClose}
            className="text-neutral hover:text-primary transition-colors py-2 font-medium"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}