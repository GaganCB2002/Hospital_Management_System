import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

const navItems = [
  { label: 'Features', href: 'features' },
  { label: 'Analytics', href: 'analytics' },
  { label: 'AI Insights', href: 'ai-insights' },
  { label: 'Testimonials', href: 'testimonials' },
  { label: 'FAQ', href: 'faq' },
  { label: 'Contact', href: 'contact' },
];

export default function NavbarSection() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50);
    const sections = ['hero', ...navItems.map((i) => i.href)];
    for (const id of sections.reverse()) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) {
        setActiveSection(id);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  function scrollTo(id) {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#F8FAFC]/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2.5 cursor-pointer border-none bg-transparent group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#3B82F6]/20 group-hover:shadow-[#3B82F6]/40 transition-shadow duration-300">
              <svg viewBox="0 0 36 36" className="w-5.5 h-5.5 fill-white">
                <path d="M18 4C12 4 8 8 8 14v2a2 2 0 002 2h2v-4c0-3.3 2.7-6 6-6s6 2.7 6 6v4h2a2 2 0 002-2v-2c0-6-4-10-10-10z" opacity="0.85"/>
                <path d="M14 18h-4a2 2 0 00-2 2v2c0 6 4 10 10 10s10-4 10-10v-2a2 2 0 00-2-2h-4v2a4 4 0 01-8 0v-2z"/>
                <rect x="16.5" y="14" width="3" height="10" rx="1"/>
                <rect x="12" y="17.5" width="12" height="3" rx="1"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Cure<span className="text-[#06B6D4]">Pulse</span>
              <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-[#3B82F6]/15 text-[#3B82F6] rounded border border-[#3B82F6]/20 uppercase tracking-wider">Enterprise</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer border-none ${
                  activeSection === item.href
                    ? 'text-[#3B82F6] font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {activeSection === item.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="relative px-5 py-2 text-sm font-bold text-white rounded-lg overflow-hidden group cursor-pointer border-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] group-hover:from-[#2563EB] group-hover:to-[#0891B2] transition-all duration-300" />
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-1.5">
                Get Started
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </span>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-slate-800 dark:text-white">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl bg-[#F8FAFC]/95 dark:bg-[#0B1120]/95"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollTo(item.href)}
                  className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer border-none ${
                    activeSection === item.href
                      ? 'text-[#3B82F6] bg-slate-100 dark:bg-slate-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 mt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer border-none bg-transparent"
                >
                  Sign In
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
