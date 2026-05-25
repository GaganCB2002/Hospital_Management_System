import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroBg from '../../../assets/images/hero-bg.jpg';
import heroMedical from '../../../assets/images/hero-medical.jpg';

const floatingStats = [
  { label: 'Active Patients', value: '24,850+', icon: 'groups', color: '#3B82F6' },
  { label: 'Doctors Online', value: '187', icon: 'stethoscope', color: '#06B6D4' },
  { label: 'Today\'s OPD', value: '1,242', icon: 'clinical_notes', color: '#8B5CF6' },
  { label: 'ICU Available', value: '42', icon: 'monitor_heart', color: '#10B981' },
];

const kpiCards = [
  { label: 'Avg. Wait Time', value: '12m', change: '-18%', trend: 'down' },
  { label: 'Bed Occupancy', value: '78%', change: '+5%', trend: 'up' },
  { label: 'Satisfaction', value: '94%', change: '+2%', trend: 'up' },
  { label: 'Emergency Response', value: '4.2m', change: '-32%', trend: 'down' },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex items-center w-full overflow-hidden"
    >
      {/* Background Image - Professional hospital exterior */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0B1120]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/90 to-[#0B1120]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/90 via-transparent to-[#0B1120]/60" />
      </div>

      {/* Decorative medical team image - right side */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[42%] h-[75%] hidden xl:block pointer-events-none">
        <div className="relative w-full h-full">
          <img
            src={heroMedical}
            alt=""
            className="w-full h-full object-cover rounded-l-[32px] shadow-2xl"
          />
          <div className="absolute inset-0 rounded-l-[32px] bg-gradient-to-r from-[#0B1120]/90 via-[#0B1120]/40 to-transparent" />
          <div className="absolute inset-0 rounded-l-[32px] ring-1 ring-white/10" />
        </div>
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating Analytics Cards - Desktop */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        {floatingStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 0.9, 1],
              y: [0, -10, 0, -5],
            }}
            transition={{
              opacity: { delay: 1 + i * 0.2, duration: 0.6 },
              y: { duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border border-white/10 shadow-lg"
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              left: i < 2 ? '6%' : 'auto',
              right: i >= 2 ? '6%' : 'auto',
              top: `${20 + i * 18}%`,
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${stat.color}20` }}
            >
              <span className="material-symbols-outlined text-base" style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 break-words whitespace-normal">{stat.label}</p>
              <p className="text-sm font-bold text-white break-words whitespace-normal">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live KPI Widgets */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, x: i < 2 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.5 + i * 0.15, duration: 0.5 }}
            className="absolute px-3.5 py-2.5 rounded-lg backdrop-blur-xl border border-white/10 shadow-md"
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              top: `${56 + i * 13}%`,
              left: i < 2 ? 'auto' : '4%',
              right: i >= 2 ? 'auto' : '4%',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] text-slate-400 font-medium">{kpi.label}</span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${kpi.trend === 'up' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                <span className="material-symbols-outlined text-[10px]">{kpi.trend === 'up' ? 'trending_up' : 'trending_down'}</span>
                {kpi.change}
              </span>
            </div>
            <p className="text-lg font-bold text-white mt-0.5">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Center Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="max-w-4xl mx-auto text-center">
          {/* Content backdrop for readability */}
          <div className="relative">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
              <span className="text-sm font-medium text-slate-200 break-words whitespace-normal">
                <span className="text-[#60A5FA] font-semibold">AI-Powered</span> Healthcare Platform
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight w-full break-words whitespace-normal"
            >
              <span className="text-white break-words whitespace-normal drop-shadow-lg">AI-Powered Smart</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#93C5FD] via-[#22D3EE] to-[#93C5FD] drop-shadow-lg break-words whitespace-normal">
                Hospital Management
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed break-words whitespace-normal drop-shadow-md"
            >
              Manage patients, doctors, appointments, analytics, emergency monitoring, AI health predictions, and hospital operations from one intelligent healthcare ecosystem.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 mt-10"
            >
              <button
                onClick={() => navigate('/signup')}
                className="relative group px-8 py-3.5 text-base font-bold text-white rounded-xl overflow-hidden cursor-pointer border-none shadow-xl"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] group-hover:from-[#2563EB] group-hover:to-[#0891B2] transition-all duration-300" />
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </span>
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 text-base font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl border border-white/25 hover:border-white/40 transition-all cursor-pointer border-solid shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                  Live Demo
                </span>
              </button>
              <button
                onClick={() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 text-base font-semibold text-white hover:text-white transition-colors cursor-pointer border-none bg-transparent drop-shadow-md"
              >
                Explore Dashboard
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-14"
            >
              {[
                { icon: 'verified', text: 'HIPAA Compliant' },
                { icon: 'shield', text: '256-bit Encrypted' },
                { icon: 'update', text: '99.99% Uptime' },
                { icon: 'groups', text: '200+ Hospitals' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-slate-300 drop-shadow-md">
                  <span className="material-symbols-outlined text-base text-[#22D3EE]">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B1120] to-transparent z-10 pointer-events-none" />
    </section>
  );
}
