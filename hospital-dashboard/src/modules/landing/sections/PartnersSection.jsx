import { motion } from 'framer-motion';

const partners = [
  'Apollo', 'Fortis', 'Max Healthcare', 'Medanta', 'AIIMS', 'Narayana Health',
  'Manipal', 'KIMS', 'Care Hospitals', 'Artemis', 'Kasturba', 'Sir Ganga Ram',
];

export default function PartnersSection() {
  return (
    <section className="relative py-16 border-b border-slate-200/50 dark:border-slate-800/50 bg-[#F8FAFC] dark:bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#475569] dark:text-slate-400 mb-8"
        >
          Trusted by leading healthcare institutions worldwide
        </motion.p>

        <div className="relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex gap-12 sm:gap-16 items-center"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
          >
            <motion.div
              animate={{ x: [0, -2000] }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="flex gap-12 sm:gap-16 items-center shrink-0"
            >
              {[...partners, ...partners].map((name, i) => (
                <span key={i} className="text-sm sm:text-base font-bold text-[#334155] dark:text-slate-400 hover:text-[#475569] dark:hover:text-slate-300 transition-colors whitespace-nowrap">
                  {name}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
