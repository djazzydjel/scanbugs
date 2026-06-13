'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user as Record<string, unknown> | null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser((session?.user ?? null) as Record<string, unknown> | null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const navLinks = [
    { href: '/scanner', label: 'Scanner', icon: '🔍' },
    { href: '/library', label: 'Bibliothèque', icon: '📚' },
    { href: '/my-scans', label: 'Mes scans', icon: '🪲' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🪲</span>
            <span className="font-bold text-xl text-gray-900">ScanBugs</span>
            <span className="hidden sm:inline-flex items-center text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold tracking-wide">
              IA VISION
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  pathname === link.href
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 truncate max-w-[160px]">
                  {String(user.email ?? '')}
                </span>
                <button
                  onClick={signOut}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  pathname === link.href
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-1">
              {user ? (
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Déconnexion
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-center"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
