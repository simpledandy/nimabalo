'use client';

import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';

export default function NavBar() {
  const { user } = useSession();

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <header className="fixed top-0 left-0 w-full z-20 bg-white/80 backdrop-blur shadow-sm" style={{height:'72px'}}>
      <nav
        className="w-full h-full flex items-center justify-between px-2 sm:px-6"
        style={{height:'100%'}}
        aria-label="Main navigation"
      >
        {/* Logo: far left, bigger, vertically centered */}
        <div className="flex items-center h-full">
          <Link href="/" className="icon-btn p-0 flex items-center" title="Nimabalo bosh sahifa" aria-label="Nimabalo Home">
            <img src="/logo.svg" alt="Nimabalo" className="h-12 w-auto sm:h-16" style={{display:'block', maxHeight:'64px'}} />
          </Link>
        </div>
        {/* Profile: far right, vertically centered (only if logged in) */}
        {user && (
          <div className="flex items-center h-full gap-2">
            <Link href="/profile" className="icon-btn flex items-center" title="Nimabalo profil" aria-label="Profile">
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
      <style jsx>{`
        .icon-btn {
          pointer-events: auto;
          background: none;
          border: none;
          padding: 4px;
          border-radius: 50%;
          font-size: 1.7rem;
          color: #0C4A6E;
          transition: background 0.15s;
        }
        .icon-btn:focus {
          outline: 2px solid #0C4A6E;
          outline-offset: 2px;
        }
        .icon-btn:hover {
          background: #e0e7ef;
        }
        @media (max-width: 640px) {
          nav {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        }
      `}</style>
    </header>
  );
}
