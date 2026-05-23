import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../../../components/common/ScrollReveal';

const faqs = [
  {
    q: 'How long does it take to deploy CurePulse?',
    a: 'Most hospitals go live within 2-4 weeks. Our onboarding team handles data migration, staff training, and system configuration. Enterprise deployments with custom integrations typically take 6-8 weeks.',
  },
  {
    q: 'Is my hospital data secure?',
    a: 'Absolutely. CurePulse is HIPAA-compliant and uses 256-bit AES encryption at rest and TLS 1.3 in transit. We undergo annual SOC 2 Type II audits and maintain ISO 27001 certification. On-premise deployment is available for Enterprise plans.',
  },
  {
    q: 'Can CurePulse integrate with my existing systems?',
    a: 'Yes. We offer REST APIs, HL7 FHIR compatibility, and pre-built connectors for major HIS, LIMS, PACS, and billing platforms. Our integration team will work with your IT department for a seamless transition.',
  },
  {
    q: 'What kind of support do you provide?',
    a: 'Starter plans include email support with 24-hour response. Professional plans get priority support with 4-hour response. Enterprise plans include a dedicated account manager, 24/7 phone support, and guaranteed SLAs.',
  },
  {
    q: 'Do you offer a free trial?',
    a: 'Yes! All plans include a 14-day free trial with full access to all features. No credit card required. We also offer a personalized demo with our solutions team to walk through your specific use case.',
  },
  {
    q: 'Can I customize the platform for my hospital\'s workflow?',
    a: 'Absolutely. CurePulse is built on a modular architecture. You can configure workflows, custom fields, reporting templates, and role-based access. Enterprise customers get full customization and white-labeling options.',
  },
];

function FAQItem({ faq, index, isOpen, toggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="rounded-xl border border-slate-200/60 overflow-hidden bg-white shadow-sm hover:border-slate-300 transition-colors"
    >
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer border-none bg-transparent"
      >
        <span className="text-sm font-semibold text-slate-900 pr-4">{faq.q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="material-symbols-outlined text-[#64748B] shrink-0"
        >
          expand_more
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-[#64748B] leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="relative py-24 lg:py-32 bg-[#F8FAFC] border-t border-slate-200/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6] mb-4">FAQ</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Frequently asked
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]">questions</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              toggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
