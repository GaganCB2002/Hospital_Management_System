export default function FooterSection() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#0A0F1C] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#3B82F6]/20">
                <span className="material-symbols-outlined text-white text-xl">local_hospital</span>
              </div>
              <span className="text-lg font-bold text-[#F8FAFC]">Cure<span className="text-[#06B6D4]">Pulse</span></span>
            </div>
            <p className="text-sm text-[#475569] leading-relaxed max-w-sm">
              AI-powered enterprise hospital management platform. Trusted by 200+ healthcare institutions to deliver better patient outcomes.
            </p>
            <div className="flex gap-3 mt-6">
              {['X', 'in', 'f', 'yt'].map((social) => (
                <button
                  key={social}
                  className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#64748B] hover:text-[#F8FAFC] text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center"
                >
                  {social}
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-sm font-semibold text-[#F8FAFC] mb-4">Product</p>
            <div className="space-y-2.5">
              {['Features', 'Pricing', 'Integrations', 'API Docs', 'Changelog'].map((l) => (
                <button key={l} onClick={() => l === 'Features' ? scrollTo('features') : l === 'Pricing' ? scrollTo('pricing') : null} className="block text-sm text-[#475569] hover:text-[#94A3B8] transition-colors cursor-pointer border-none bg-transparent p-0 text-left">
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-sm font-semibold text-[#F8FAFC] mb-4">Company</p>
            <div className="space-y-2.5">
              {['About', 'Blog', 'Careers', 'Press Kit', 'Partners'].map((l) => (
                <p key={l} className="text-sm text-[#475569] hover:text-[#94A3B8] transition-colors cursor-pointer">{l}</p>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold text-[#F8FAFC] mb-4">Contact</p>
            <div className="space-y-2.5 text-sm text-[#475569]">
              <p>12 Innovation Drive</p>
              <p>Bengaluru, Karnataka 560001</p>
              <p className="mt-4">+91 80456 78100</p>
              <p>hello@curepulse.com</p>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#F8FAFC]">Stay updated</p>
              <p className="text-xs text-[#475569] mt-1">Get product updates, healthcare insights, and security advisories.</p>
            </div>
            <div className="flex w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 sm:w-64 px-4 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-l-lg text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6]/50 transition-colors"
              />
              <button className="px-5 py-2.5 text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-r-lg transition-colors cursor-pointer border-none">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#475569]">
          <p>&copy; 2026 CurePulse Smart Health Systems. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#94A3B8] cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#94A3B8] cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-[#94A3B8] cursor-pointer transition-colors">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
