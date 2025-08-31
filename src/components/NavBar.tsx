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
    <header className="fixed top-0 left-0 w-full z-20">
      <nav className="container flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Link href="/" className="icon-btn ml-1" title="Nimabalo bosh sahifa">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#2563eb"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">N</text></svg>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/profile" className="icon-btn" title="Nimabalo profil">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#2563eb"/><rect x="6" y="14" width="12" height="6" rx="3" fill="#2563eb"/></svg>
              </Link>
              <button onClick={handleSignOut} className="icon-btn" title="Nimabalo'dan chiqish">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="11" width="12" height="2" fill="#2563eb"/><polygon points="16,7 22,12 16,17" fill="#2563eb"/></svg>
              </button>
            </>
          ) : (
            <Link href="/auth" className="icon-btn" title="Nimabalo'ga kirish">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="8" y="11" width="12" height="2" fill="#2563eb"/><polygon points="6,7 0,12 6,17" fill="#2563eb"/></svg>
            </Link>
          )}
        </div>
      </nav>
      <style jsx>{`
        .icon-btn {
          pointer-events: auto;
          background: none;
          border: none;
          padding: 4px;
          border-radius: 50%;
          font-size: 1.5rem;
          color: #2563eb;
          transition: background 0.15s;
        }
        .icon-btn:hover {
          background: #e0e7ef;
        }
      `}</style>
    </header>
  );
}
