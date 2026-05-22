import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import ScrollReveal from '../../../components/common/ScrollReveal';

const features = [
  {
    icon: 'neurology', title: 'Clinical Health Analytics',
    desc: 'Predictive models for patient deterioration, readmission risk, and treatment optimization using advanced analytics.',
    color: '#3B82F6', stat: '94% accuracy',
  },
  {
    icon: 'emergency', title: 'Emergency Monitoring',
    desc: 'Real-time ICU telemetry, automated code-blue alerts, and smart ambulance dispatch coordination.',
    color: '#EF4444', stat: '4.2m avg response',
  },
  {
    icon: 'calendar_month', title: 'Smart Appointment Booking',
    desc: 'Intelligently scheduled appointments with slot optimization, automated reminders, and wait-time predictions.',
    color: '#10B981', stat: '68% faster booking',
  },
  {
    icon: 'stethoscope', title: 'Doctor Management',
    desc: 'Complete physician scheduling, performance analytics, patient load balancing, and skill-based routing.',
    color: '#8B5CF6', stat: '200+ doctors',
  },
  {
    icon: 'account_balance', title: 'Billing & Revenue',
    desc: 'Automated insurance claims, real-time revenue tracking, payment gateway integration, and financial reporting.',
    color: '#F59E0B', stat: '₹2.4Cr/month',
  },
  {
    icon: 'pharmacy', title: 'Pharmacy Management',
    desc: 'Smart inventory tracking, expiry alerts, automated reordering, and prescription-to-dispense workflow.',
    color: '#06B6D4', stat: '99.2% stock rate',
  },
  {
    icon: 'monitor_heart', title: 'ICU Monitoring',
    desc: 'Centralized vitals dashboard, sepsis early warning, ventilator management, and remote intensivist access.',
    color: '#EC4899', stat: '24/7 monitoring',
  },
  {
    icon: 'notifications_active', title: 'Real-time Notifications',
    desc: 'Multi-channel alerts for critical events, lab results, schedule changes, and patient status updates.',
    color: '#6366F1', stat: '< 2s delivery',
  },
  {
    icon: 'folder_open', title: 'Patient Records',
    desc: 'Unified EHR with document management, imaging integration, lab result tracking, and longitudinal health history.',
    color: '#14B8A6', stat: '500K+ records',
  },
  {
    icon: 'settings_recommend', title: 'Clinical Decision Support',
    desc: 'Clinical decision recommendations with drug interaction checks, diagnosis suggestions, and evidence-based treatment protocols.',
    color: '#A855F7', stat: '98% relevance',
  },
];

function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      className="relative group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
    >
      {/* Spotlight */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${spotlight.x}px ${spotlight.y}px, ${feature.color}08, transparent 60%)`,
        }}
      />
      {/* Glow Border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${feature.color}20`,
        }}
      />

      <div className="relative z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
          style={{ background: `${feature.color}15` }}
        >
          <span className="material-symbols-outlined text-xl" style={{ color: feature.color }}>{feature.icon}</span>
        </div>
        <h3 className="text-base font-bold text-[#F8FAFC] mb-2">{feature.title}</h3>
        <p className="text-sm text-[#64748B] leading-relaxed">{feature.desc}</p>
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: feature.color }} />
          <span className="text-xs font-medium" style={{ color: feature.color }}>{feature.stat}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32 bg-[#020817]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#3B82F6]/3 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6] mb-4">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F8FAFC] leading-tight">
              Everything you need to run a
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]">world-class hospital</span>
            </h2>
            <p className="mt-4 text-[#64748B] text-lg max-w-2xl mx-auto">
              From advanced clinical diagnostics to real-time emergency response — one integrated platform for every department.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
