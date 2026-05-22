import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ScrollReveal from '../../../components/common/ScrollReveal';

const insights = [
  {
    icon: 'analytics', title: 'Predictive Analytics',
    desc: 'ML models forecast patient admission rates, helping you allocate staff and beds 48 hours in advance with 94% accuracy.',
    color: '#3B82F6', metrics: ['94% accuracy', '48h forecast'],
  },
  {
    icon: 'warning', title: 'Early Warning System',
    desc: 'Continuous monitoring of vitals triggers automated alerts for sepsis, cardiac events, and deterioration risks before they become critical.',
    color: '#EF4444', metrics: ['12m avg lead time', '23% mortality reduction'],
  },
  {
    icon: 'prescriptions', title: 'Smart Prescribing',
    desc: 'AI-assisted prescription with allergy checks, drug interaction warnings, and dosage optimization based on patient history.',
    color: '#10B981', metrics: ['99.8% interaction catch', '15% cost reduction'],
  },
  {
    icon: 'radiology', title: 'Medical Imaging AI',
    desc: 'Deep learning models analyze X-rays, CT scans, and MRIs, flagging abnormalities for radiologist review within seconds.',
    color: '#8B5CF6', metrics: ['97% sensitivity', '< 30s analysis'],
  },
  {
    icon: 'summarize', title: 'Clinical Summarization',
    desc: 'NLP-powered auto-summarization of patient encounters, generating structured clinical notes from doctor-patient conversations.',
    color: '#06B6D4', metrics: ['85% time saved', '10K+ daily notes'],
  },
  {
    icon: 'trending_up', title: 'Operational Intelligence',
    desc: 'AI-driven resource optimization for OPD scheduling, bed management, staff rostering, and pharmacy inventory across departments.',
    color: '#F59E0B', metrics: ['32% efficiency gain', '₹50L+ annual savings'],
  },
];

export default function AIInsightsSection() {
  return (
    <section id="ai-insights" className="relative py-24 lg:py-32 bg-[#020817] border-t border-white/[0.04]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#06B6D4]/3 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4] mb-4">AI & Machine Learning</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F8FAFC] leading-tight">
              Intelligence that transforms
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#3B82F6]">every clinical decision</span>
            </h2>
            <p className="mt-4 text-[#64748B] text-lg max-w-2xl mx-auto">
              Purpose-built AI models trained on millions of clinical encounters to augment medical expertise.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
          {insights.map((item, i) => (
            <InsightCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightCard({ item, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="relative group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
        style={{ background: `${item.color}15` }}
      >
        <span className="material-symbols-outlined text-xl" style={{ color: item.color }}>{item.icon}</span>
      </div>
      <h3 className="text-base font-bold text-[#F8FAFC] mb-2">{item.title}</h3>
      <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/[0.06]">
        {item.metrics.map((m) => (
          <span
            key={m}
            className="px-2 py-0.5 text-[10px] font-semibold rounded-md"
            style={{ background: `${item.color}15`, color: item.color }}
          >
            {m}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
