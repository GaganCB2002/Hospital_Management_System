import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../../../components/common/ScrollReveal';

const testimonials = [
  {
    quote: 'CurePulse transformed our hospital operations. Patient wait times dropped 40%, billing errors vanished, and our doctors have real-time access to complete clinical histories. It\'s the backbone of our digital health strategy.',
    name: 'Dr. Vikram Mehta',
    role: 'Medical Director, Apollo Hospitals',
    rating: 5,
    color: '#3B82F6',
  },
  {
    quote: 'The AI early warning system flagged a sepsis case 6 hours before any clinical signs were visible. We\'ve seen a 23% reduction in ICU mortality since deploying this platform.',
    name: 'Dr. Anita Krishnan',
    role: 'Chief of Critical Care, Fortis Healthcare',
    rating: 5,
    color: '#06B6D4',
  },
  {
    quote: 'Managing 500+ beds across 12 departments was chaotic before CurePulse. Now I can see bed occupancy, staff scheduling, and emergency alerts from a single dashboard. Game-changing.',
    name: 'Rajesh Patel',
    role: 'Hospital Administrator, Max Healthcare',
    rating: 5,
    color: '#8B5CF6',
  },
  {
    quote: 'The analytics module alone paid for itself in the first quarter. We identified revenue leakages, optimized OPD scheduling, and improved our insurance claim acceptance rate by 34%.',
    name: 'Sneha Agarwal',
    role: 'CFO, Manipal Hospitals',
    rating: 5,
    color: '#10B981',
  },
  {
    quote: 'As a busy cardiologist, the AI-assisted clinical notes feature saves me 2 hours every day. The documentation writes itself while I focus on patient care.',
    name: 'Dr. James Wilson',
    role: 'Senior Cardiologist, Medanta Medicity',
    rating: 5,
    color: '#F59E0B',
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="relative py-24 lg:py-32 bg-[#020817] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6] mb-4">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F8FAFC] leading-tight">
              Trusted by healthcare
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#06B6D4">leaders worldwide</span>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="relative mt-16 max-w-4xl mx-auto">
            <div className="relative min-h-[280px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  {/* Quote Mark */}
                  <div className="text-6xl leading-none mb-4" style={{ color: `${testimonials[current].color}30` }}>
                    &ldquo;
                  </div>
                  <p className="text-lg sm:text-xl text-[#94A3B8] leading-relaxed">
                    {testimonials[current].quote}
                  </p>
                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/[0.06]">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: `linear-gradient(135deg, ${testimonials[current].color}, ${testimonials[current].color}88)` }}
                    >
                      {testimonials[current].name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#F8FAFC]">{testimonials[current].name}</p>
                      <p className="text-sm text-[#64748B]">{testimonials[current].role}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(testimonials[current].rating)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-sm" style={{ color: testimonials[current].color, fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer border-none ${
                    i === current ? 'w-8 bg-[#3B82F6]' : 'w-2 bg-white/[0.12] hover:bg-white/[0.2]'
                  }`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
