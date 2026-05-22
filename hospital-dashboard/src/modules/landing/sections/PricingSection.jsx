import { motion } from 'framer-motion';
import ScrollReveal from '../../../components/common/ScrollReveal';

const plans = [
  {
    name: 'Starter',
    desc: 'For small clinics and single-specialty practices.',
    price: '₹29,999',
    period: '/month',
    features: [
      'Up to 500 patient records',
      'Appointment scheduling',
      'Basic analytics dashboard',
      'EHR management',
      'Email support',
      '5 user accounts',
      'Mobile app access',
    ],
    cta: 'Start Free Trial',
    popular: false,
    gradient: 'from-[#3B82F6] to-[#2563EB]',
  },
  {
    name: 'Professional',
    desc: 'For mid-size hospitals and multi-specialty clinics.',
    price: '₹79,999',
    period: '/month',
    features: [
      'Up to 5,000 patient records',
      'AI health analytics',
      'Emergency monitoring',
      'Billing & insurance integration',
      'Pharmacy management',
      '25 user accounts',
      'Priority support',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: true,
    gradient: 'from-[#06B6D4] to-[#0891B2]',
  },
  {
    name: 'Enterprise',
    desc: 'For large hospital chains and healthcare groups.',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited patient records',
      'Full AI suite',
      'Multi-facility management',
      'Dedicated account manager',
      'Custom integrations',
      'Unlimited users',
      '24/7 phone support',
      'On-premise deployment',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
    gradient: 'from-[#8B5CF6] to-[#7C3AED]',
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32 bg-[#020817] border-t border-white/[0.04]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full bg-[#3B82F6]/3 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6] mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F8FAFC] leading-tight">
              Transparent pricing for
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#06B6D4">every healthcare scale</span>
            </h2>
            <p className="mt-4 text-[#64748B] text-lg">14-day free trial. No credit card required.</p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative rounded-2xl border p-6 sm:p-8 transition-all duration-300 ${
        plan.popular
          ? 'border-[#06B6D4]/30 bg-gradient-to-b from-[#06B6D4]/[0.04] to-transparent shadow-xl shadow-[#06B6D4]/5'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
          Most Popular
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg font-bold text-[#F8FAFC]">{plan.name}</h3>
        <p className="text-sm text-[#64748B] mt-2">{plan.desc}</p>
        <div className="mt-6 flex items-baseline justify-center gap-1">
          <span className="text-3xl sm:text-4xl font-bold text-[#F8FAFC]">{plan.price}</span>
          {plan.period && <span className="text-sm text-[#64748B]">{plan.period}</span>}
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-[#94A3B8]">
            <span className="material-symbols-outlined text-sm text-[#10B981] mt-0.5">check</span>
            {f}
          </li>
        ))}
      </ul>

      <button className="mt-8 w-full py-3 text-sm font-bold text-white rounded-xl transition-all duration-300 cursor-pointer border-none relative overflow-hidden group">
        <span className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} group-hover:opacity-90 transition-opacity`} />
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <span className="relative z-10">{plan.cta}</span>
      </button>
    </motion.div>
  );
}
