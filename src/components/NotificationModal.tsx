"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBadges } from '@/lib/useBadges';
import { strings, formatString } from '@/lib/strings';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { badges, userPosition, hasUnreadNotifications } = useBadges();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-3">🔔</div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            {strings.notifications.title}
          </h2>
          <p className="text-neutral text-center text-sm">
            {strings.notifications.subtitle}
          </p>
        </div>

        {/* Notifications Content */}
        <div className="w-full space-y-4">
          {badges.length > 0 ? (
            <div className="space-y-3">
              {badges.map((badge) => (
                <div key={badge.id} className="card p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🏆</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-primary text-sm">
                        {userPosition !== null
                          ? formatString(strings.badge.title, { position: userPosition })
                          : strings.badge.title
                        }
                      </h3>
                      <p className="text-neutral text-xs mt-1">
                        {strings.badge.description}
                      </p>
                    </div>
                    <div className="text-emerald-600 text-lg">✨</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-neutral text-sm">
                {strings.notifications.noNotifications}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={onClose}
            className="btn w-full text-center py-3 font-bold text-lg hover:scale-105 transition-transform"
          >
            <span className="mr-2">✅</span>
            {strings.notifications.gotIt}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}