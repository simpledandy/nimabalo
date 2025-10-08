'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { usePathname } from 'next/navigation';
import SurpriseCTA from './SurpriseCTA';
import AppModal from './AppModal';
import ProfileIconButton from './ProfileIconButton';
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
      <AppModal
        isOpen={isOpen}
        onClose={close}
        icon={config.icon || '⚠️'}
        title={config.title}
        subtitle={config.message}
        showCloseButton={false}
      >
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={handleConfirm}
            className={`${
              config.confirmButtonStyle === 'danger' ? 'btn-danger' :
              config.confirmButtonStyle === 'secondary' ? 'btn-secondary' : 'btn'
            } w-full text-center py-3 font-bold text-lg hover:scale-105 transition-transform`}
          >
            {config.confirmText}
          </button>
          <button 
            onClick={close}
            className="text-neutral hover:text-primary transition-colors py-2 font-medium"
          >
            {config.cancelText}
          </button>
        </div>
      </AppModal>

      {/* Notification Modal */}
      <AppModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        icon="🔔"
        title={strings.notifications.title}
        subtitle={strings.notifications.subtitle}
      >
        <div className="w-full space-y-4">
          {hasUnreadNotifications ? (
            <div className="card p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🏆</div>
                <div className="flex-1">
                  <h3 className="font-bold text-primary text-sm">Yangi badge!</h3>
                  <p className="text-neutral text-xs mt-1">Siz yangi nishon oldingiz!</p>
                </div>
                <div className="text-emerald-600 text-lg">✨</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-neutral text-sm">{strings.notifications.noNotifications}</p>
            </div>
          )}
          <button 
            onClick={() => setShowNotifications(false)}
            className="btn w-full text-center py-3 font-bold text-lg hover:scale-105 transition-transform"
          >
            <span className="mr-2">✅</span>
            {strings.notifications.gotIt}
          </button>
        </div>
      </AppModal>
    </header>
  );
}