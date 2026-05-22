import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Features', href: 'features' },
  { label: 'Analytics', href: 'analytics' },
  { label: 'AI Insights', href: 'ai-insights' },
  { label: 'Testimonials', href: 'testimonials' },
  { label: 'Pricing', href: 'pricing' },
  { label: 'FAQ', href: 'faq' },
  { label: 'Contact', href: 'contact' },
];

export default function NavbarSection() {
  const navigate = useNavigate();
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
          ? 'bg-[#020817]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2.5 cursor-pointer border-none bg-transparent group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#3B82F6]/20 group-hover:shadow-[#3B82F6]/40 transition-shadow duration-300">
              <span className="material-symbols-outlined text-white text-xl">local_hospital</span>
            </div>
            <span className="text-lg font-bold text-[#F8FAFC]">
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
                    ? 'text-[#F8FAFC]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]'
                }`}
              >
                {activeSection === item.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-white/[0.06] rounded-lg border border-white/[0.06]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer border-none bg-transparent"
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
              className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-[#F8FAFC]">{mobileOpen ? 'close' : 'menu'}</span>
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
            className="md:hidden border-t border-white/[0.06] overflow-hidden backdrop-blur-xl bg-[#020817]/95"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollTo(item.href)}
                  className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer border-none ${
                    activeSection === item.href
                      ? 'text-[#F8FAFC] bg-white/[0.06]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 mt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg cursor-pointer border-none bg-transparent"
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
