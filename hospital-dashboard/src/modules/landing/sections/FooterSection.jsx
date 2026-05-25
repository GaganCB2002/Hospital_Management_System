export default function FooterSection() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#F1F5F9] dark:bg-[#0B1120] border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 min-w-0">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#3B82F6]/20">
                <svg viewBox="0 0 36 36" className="w-5.5 h-5.5 fill-white">
                  <path d="M18 4C12 4 8 8 8 14v2a2 2 0 002 2h2v-4c0-3.3 2.7-6 6-6s6 2.7 6 6v4h2a2 2 0 002-2v-2c0-6-4-10-10-10z" opacity="0.85"/>
                  <path d="M14 18h-4a2 2 0 00-2 2v2c0 6 4 10 10 10s10-4 10-10v-2a2 2 0 00-2-2h-4v2a4 4 0 01-8 0v-2z"/>
                  <rect x="16.5" y="14" width="3" height="10" rx="1"/>
                  <rect x="12" y="17.5" width="12" height="3" rx="1"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white break-words whitespace-normal">Cure<span className="text-[#06B6D4]">Pulse</span></span>
            </div>
            <p className="text-sm text-[#475569] dark:text-slate-400 leading-relaxed max-w-sm w-full whitespace-normal break-words">
              AI-powered enterprise hospital management platform. Trusted by 200+ healthcare institutions to deliver better patient outcomes.
            </p>
            <div className="flex gap-3 mt-6">
              {['X', 'in', 'f', 'yt'].map((social) => (
                <button
                  key={social}
                  className="w-9 h-9 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center"
                >
                  {social}
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-4 break-words whitespace-normal">Product</p>
            <div className="space-y-2.5">
              {['Features', 'Integrations', 'API Docs', 'Changelog'].map((l) => (
                <button key={l} onClick={() => l === 'Features' ? scrollTo('features') : null} className="block text-sm text-[#475569] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent p-0 text-left">
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-4 break-words whitespace-normal">Company</p>
            <div className="space-y-2.5">
              {['About', 'Blog', 'Careers', 'Press Kit', 'Partners'].map((l) => (
                <p key={l} className="text-sm text-[#475569] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">{l}</p>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-4 break-words whitespace-normal">Contact</p>
            <div className="space-y-2.5 text-sm text-[#475569] dark:text-slate-400">
              <p>12 Innovation Drive</p>
              <p>Bengaluru, Karnataka 560001</p>
              <p className="mt-4">+91 80456 78100</p>
              <p>hello@curepulse.com</p>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Stay updated</p>
              <p className="text-xs text-[#475569] dark:text-slate-400 mt-1">Get product updates, healthcare insights, and security advisories.</p>
            </div>
            <div className="flex w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 sm:w-64 px-4 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700/80 rounded-l-lg text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
              <button className="px-5 py-2.5 text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-r-lg transition-colors cursor-pointer border-none">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#475569] dark:text-slate-400">
          <p>&copy; 2026 CurePulse Smart Health Systems. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
