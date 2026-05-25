import { useNavigate } from 'react-router-dom';
import ScrollReveal from '../../../components/common/ScrollReveal';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section id="contact" className="relative py-24 lg:py-32 bg-[#F8FAFC] dark:bg-[#0B1120] border-t border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#3B82F6]/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6] mb-4 break-words whitespace-normal">Get Started</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight break-words whitespace-normal">
            Ready to transform your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] break-words whitespace-normal">hospital operations?</span>
          </h2>
          <p className="mt-4 text-lg text-[#64748B] dark:text-slate-400 max-w-2xl mx-auto break-words whitespace-normal">
            Join 200+ healthcare institutions already using CurePulse to deliver better patient outcomes.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <button
              onClick={() => navigate('/signup')}
              className="relative group px-8 py-3.5 text-base font-bold text-white rounded-xl overflow-hidden cursor-pointer border-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] group-hover:from-[#2563EB] group-hover:to-[#0891B2] transition-all duration-300" />
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-2">
                Start Free Trial
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </span>
            </button>
            <button
              onClick={() => window.open('mailto:sales@curepulse.com')}
              className="px-8 py-3.5 text-base font-semibold text-slate-800 dark:text-white bg-slate-100/80 dark:bg-white/10 hover:bg-slate-200/60 dark:hover:bg-white/20 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-white/20 hover:border-slate-300 dark:hover:border-white/30 transition-all cursor-pointer border-solid"
            >
              Talk to Sales
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-12 text-sm text-[#475569] dark:text-slate-400">
            <span className="flex items-center gap-2 break-words whitespace-normal">
              <span className="material-symbols-outlined text-sm text-[#10B981] shrink-0">check_circle</span>
              No credit card required
            </span>
            <span className="flex items-center gap-2 break-words whitespace-normal">
              <span className="material-symbols-outlined text-sm text-[#10B981] shrink-0">check_circle</span>
              14-day free trial
            </span>
            <span className="flex items-center gap-2 break-words whitespace-normal">
              <span className="material-symbols-outlined text-sm text-[#10B981] shrink-0">check_circle</span>
              Free onboarding support
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
