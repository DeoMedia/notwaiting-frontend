import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function LanguageToggle({ className = '' }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const set = (lng: 'en' | 'fr') => {
    if (lng !== current) void i18n.changeLanguage(lng);
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 p-1 shadow-sm backdrop-blur-sm ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => set('en')}
        aria-pressed={current === 'en'}
        className={`h-7 min-w-10 rounded-full px-3 font-mono text-[11px] font-bold uppercase tracking-[0.08em] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
          current === 'en'
            ? 'bg-[#EBBD06] text-[#0C0C0A] shadow-[0_1px_4px_rgba(12,12,10,0.18)]'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => set('fr')}
        aria-pressed={current === 'fr'}
        className={`h-7 min-w-10 rounded-full px-3 font-mono text-[11px] font-bold uppercase tracking-[0.08em] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
          current === 'fr'
            ? 'bg-[#EBBD06] text-[#0C0C0A] shadow-[0_1px_4px_rgba(12,12,10,0.18)]'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`}
      >
        FR
      </button>
    </div>
  );
}

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const links = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/manifesto', label: t('nav.manifesto') },
    { path: '/stories', label: t('nav.stories') },
    { path: '/partners', label: t('nav.partners') },
    { path: '/contact', label: t('nav.contact') }
  ];

  return (
    <nav className="bg-[#DD3935] text-white fixed top-0 left-0 right-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8">
          <Link
            to="/"
            className="text-xl font-black tracking-tight hover:text-[#EBBD06] transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="font-custard font-normal normal-case text-[#fffff]">
              #NotWaiting
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`pb-0.5 px-0.5 transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-white border-b-2 border-[#EBBD06]'
                    : 'text-white/70 hover:text-white border-b-2 border-transparent'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Language Toggle */}
          <div className="hidden md:flex justify-end">
            <LanguageToggle />
          </div>

          {/* Mobile: menu toggle */}
          <div className="md:hidden flex items-center gap-3">
            <LanguageToggle />
            <button
              className="text-white hover:text-[#EBBD06] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t('nav.toggleMenu')}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-white border-l-2 border-[#EBBD06] pl-3'
                    : 'text-white/70 hover:text-white pl-3'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
