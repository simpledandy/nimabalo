'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { usePathname } from 'next/navigation';
import SurpriseCTA from './SurpriseCTA';
import ConfirmationModal from './ConfirmationModal';
import ProfileIconButton from './ProfileIconButton';
import NotificationModal from './NotificationModal';
import { useConfirmation } from '@/lib/useConfirmation';
import { useBadges } from '@/lib/useBadges';
import { strings } from '@/lib/strings';

export default function NavBar() {
  const { user } = useSession();
  const pathname = usePathname();
  const showSurprise = !user && pathname === '/';
  const { isOpen, config, confirm, close, handleConfirm } = useConfirmation();
  const { hasUnreadNotifications } = useBadges();
  const [showNotifications, setShowNotifications] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const handleLogoutClick = () => {
    confirm(handleSignOut, {
      title: strings.nav.signOut,
      message: strings.nav.signOutConfirm,
      confirmText: strings.nav.signOutConfirmYes,
      cancelText: strings.nav.signOutConfirmCancel,
      confirmButtonStyle: "danger",
      icon: "🚪"
    });
  };

  return (
    <header className="fixed top-8 left-0 w-full z-20 bg-transparent backdrop-blur" style={{height:'72px'}}>
      <nav
        className="w-full h-full flex items-center justify-between px-2 sm:px-6"
        style={{height:'100%'}}
        aria-label="Main navigation"
      >
        {/* Logo: far left, bigger, vertically centered */}
        <div className="flex items-center h-full animate-fade-in">
          <Link href="/" className="icon-btn p-0 flex items-center" title={strings.nav.home} aria-label="Nimabalo Home">
            <img src="/logo.svg" alt="Nimabalo" className="h-12 w-auto sm:h-16" style={{display:'block', maxHeight:'64px'}} />
          </Link>
        </div>

        {showSurprise && (
          <div>
            <SurpriseCTA />
          </div>
        )}
          
        {/* Profile: far right, vertically centered (only if logged in) */}
        {user && (
          <div className="flex items-center h-full gap-2 animate-fade-in-right">
            {/* Notification bell icon button */}
            <button
              className="icon-btn flex items-center relative"
              title={strings.nav.notifications}
              aria-label="Notifications"
              tabIndex={0}
              onClick={() => setShowNotifications(true)}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-5-6.32V4a1 1 0 1 0-2 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 0 0 6 19h12a1 1 0 0 0 .71-1.71L18 16z" fill="#0C4A6E"/>
              </svg>
              {/* Red dot for unread notifications */}
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <ProfileIconButton 
              userId={user.id} 
              size="medium" 
              showTooltip={true}
              className="hover:scale-110 transition-transform"
            />
            <button
              onClick={handleLogoutClick}
              className="icon-btn flex items-center"
              title={strings.nav.signOut}
              aria-label="Sign out"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleLogoutClick(); }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="12" height="2" fill="#0C4A6E"/><polygon points="16,7 22,12 16,17" fill="#0C4A6E"/></svg>
            </button>
          </div>
        )}
      </nav>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isOpen}
        onClose={close}
        onConfirm={handleConfirm}
        {...config}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
}