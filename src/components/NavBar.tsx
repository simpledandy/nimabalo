'use client';

import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { usePathname } from 'next/navigation';
import SurpriseCTA from './SurpriseCTA';

export default function NavBar() {
  const { user } = useSession();
  const pathname = usePathname();
  const showSurprise = !user && pathname === '/';

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <header className="fixed top-0 left-0 w-full z-20 bg-transparent backdrop-blur" style={{height:'72px'}}>
      <nav
        className="w-full h-full flex items-center justify-between px-2 sm:px-6"
        style={{height:'100%'}}
        aria-label="Main navigation"
      >
        {/* Logo: far left, bigger, vertically centered */}
        <div className="flex items-center h-full animate-fade-in">
          <Link href="/" className="icon-btn p-0 flex items-center" title="Nimabalo bosh sahifa" aria-label="Nimabalo Home">
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
              title="Bildirishnomalar"
              aria-label="Notifications"
              tabIndex={0}
              onClick={() => alert('Bildirishnomalar tez orada!')}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-5-6.32V4a1 1 0 1 0-2 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 0 0 6 19h12a1 1 0 0 0 .71-1.71L18 16z" fill="#0C4A6E"/>
              </svg>
              {/* Example: red dot for unread notifications */}
              {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
            </button>
            <Link href="/profile" className="icon-btn flex items-center" title="Shaxsiy ko‘rinish" aria-label="Profile">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="#0C4A6E"/><rect x="6" y="14" width="12" height="6" rx="3" fill="#0C4A6E"/></svg>
            </Link>
            <button
              onClick={handleSignOut}
              className="icon-btn flex items-center"
              title="Nimabalo'dan chiqish"
              aria-label="Sign out"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSignOut(); }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="12" height="2" fill="#0C4A6E"/><polygon points="16,7 22,12 16,17" fill="#0C4A6E"/></svg>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
