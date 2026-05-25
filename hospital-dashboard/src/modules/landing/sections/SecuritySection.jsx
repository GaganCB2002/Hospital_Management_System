import ScrollReveal from '../../../components/common/ScrollReveal';

const certs = [
  { icon: 'verified', title: 'HIPAA Compliant', desc: 'Full compliance with US healthcare privacy and security standards.' },
  { icon: 'shield', title: 'SOC 2 Type II', desc: 'Annual audits for security, availability, and confidentiality controls.' },
  { icon: 'encrypted', title: 'End-to-End Encryption', desc: '256-bit AES at rest, TLS 1.3 in transit. Zero-knowledge architecture.' },
  { icon: 'gpp_bad', title: 'Threat Protection', desc: 'Real-time WAF, DDoS mitigation, intrusion detection, and 24/7 SOC monitoring.' },
  { icon: 'backup', title: 'Automated Backups', desc: 'Point-in-time recovery with 30-day retention. Multi-region failover.' },
  { icon: 'passkey', title: 'Access Control', desc: 'RBAC with MFA, SSO, audit trails, and granular permission management.' },
];

export default function SecuritySection() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#F8FAFC] dark:bg-[#0B1120] border-t border-slate-200/50 dark:border-slate-800/50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-[#10B981]/3 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#10B981] mb-4 break-words whitespace-normal">Enterprise Security</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight break-words whitespace-normal">
              Bank-grade security for
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3B82F6] break-words whitespace-normal">sensitive health data</span>
            </h2>
            <p className="mt-4 text-[#64748B] dark:text-slate-400 text-lg max-w-2xl mx-auto break-words whitespace-normal">
              Your patients trust you with their lives. We make sure their data is protected with the highest security standards.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
          {certs.map((cert, i) => (
            <ScrollReveal key={cert.title} delay={i * 0.06}>
              <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-[#1E293B] hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/80 shadow-sm hover:shadow-md dark:hover:shadow-slate-900/50 transition-all duration-300 h-full">
                <span className="material-symbols-outlined text-2xl text-[#10B981] mb-3 block">{cert.icon}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 break-words whitespace-normal">{cert.title}</h3>
                <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed break-words whitespace-normal">{cert.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
