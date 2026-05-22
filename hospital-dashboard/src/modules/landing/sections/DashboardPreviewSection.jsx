import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../../../components/common/ScrollReveal';

const views = [
  {
    id: 'analytics',
    label: 'Live Analytics',
    icon: 'monitoring',
    gradient: 'from-[#3B82F6] to-[#2563EB]',
    widgets: [
      { label: 'Total Patients', value: '24,850', change: '+12%', color: '#3B82F6' },
      { label: 'Revenue MTD', value: '₹2.4Cr', change: '+18%', color: '#10B981' },
      { label: 'Bed Occupancy', value: '78%', change: '+5%', color: '#F59E0B' },
      { label: 'Satisfaction', value: '4.8/5', change: '+0.3', color: '#8B5CF6' },
    ],
  },
  {
    id: 'patients',
    label: 'Patient OPD',
    icon: 'groups',
    gradient: 'from-[#06B6D4] to-[#0891B2]',
    widgets: [
      { label: 'Checked In', value: '186', change: '+23', color: '#06B6D4' },
      { label: 'In Queue', value: '42', change: '-8', color: '#F59E0B' },
      { label: 'Avg Wait', value: '12m', change: '-3m', color: '#10B981' },
      { label: 'Completed', value: '1,024', change: '+156', color: '#8B5CF6' },
    ],
  },
  {
    id: 'revenue',
    label: 'Revenue Analytics',
    icon: 'account_balance',
    gradient: 'from-[#8B5CF6] to-[#7C3AED]',
    widgets: [
      { label: 'Monthly Rev', value: '₹2.4Cr', change: '+18%', color: '#8B5CF6' },
      { label: 'Avg per Patient', value: '₹4,200', change: '+7%', color: '#3B82F6' },
      { label: 'Insurance Claims', value: '₹1.1Cr', change: '+22%', color: '#10B981' },
      { label: 'Pending', value: '₹18.2L', change: '-12%', color: '#F59E0B' },
    ],
  },
];

const notifications = [
  { id: 1, text: 'Emergency alert: Code Blue - Room 204', time: '2m ago', type: 'emergency' },
  { id: 2, text: 'Dr. Sarah Chen completed rounds - Cardiology', time: '5m ago', type: 'info' },
  { id: 3, text: 'New lab results available for Patient #4821', time: '8m ago', type: 'lab' },
  { id: 4, text: 'ICU Bed #12 vitals flagged - notify attending', time: '12m ago', type: 'warning' },
];

export default function DashboardPreviewSection() {
  const [activeView, setActiveView] = useState(views[0]);
  const [currentNotif, setCurrentNotif] = useState(0);

  useEffect(() => {
    const viewInterval = setInterval(() => {
      setActiveView((prev) => {
        const idx = views.findIndex((v) => v.id === prev.id);
        return views[(idx + 1) % views.length];
      });
    }, 4000);
    const notifInterval = setInterval(() => {
      setCurrentNotif((prev) => (prev + 1) % notifications.length);
    }, 3000);

    return () => {
      clearInterval(viewInterval);
      clearInterval(notifInterval);
    };
  }, []);

  return (
    <section id="analytics" className="relative py-24 lg:py-32 bg-[#020817] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6] mb-4">Live Dashboard</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F8FAFC] leading-tight">
              Real-time intelligence at your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]">fingertips</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Dashboard Preview */}
        <ScrollReveal delay={0.2}>
          <div className="mt-16 relative">
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#0F172A] shadow-2xl overflow-hidden">
              {/* Top Bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-[#0F172A]/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  </div>
                  <span className="text-xs text-[#475569] font-mono">curepulse.com/dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[10px] text-[#64748B]">Live</span>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-5 sm:p-6 lg:p-8">
                {/* View Tabs */}
                <div className="flex gap-2 mb-6">
                  {views.map((view) => (
                    <button
                      key={view.id}
                      onClick={() => setActiveView(view)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-none ${
                        activeView.id === view.id
                          ? 'text-[#F8FAFC] bg-white/[0.1]'
                          : 'text-[#64748B] hover:text-[#94A3B8] bg-transparent'
                      }`}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>

                {/* Animated Widgets */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <AnimatePresence mode="wait">
                    {activeView.widgets.map((widget, i) => (
                      <motion.div
                        key={`${activeView.id}-${widget.label}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]"
                      >
                        <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">{widget.label}</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#F8FAFC] mt-1">{widget.value}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="material-symbols-outlined text-sm" style={{ color: widget.color }}>
                            {widget.change.startsWith('+') ? 'trending_up' : 'trending_down'}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: widget.color }}>{widget.change}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Bottom Row: Chart Area + Notifications */}
                <div className="grid lg:grid-cols-3 gap-4 mt-6">
                  {/* Mini Chart */}
                  <div className="lg:col-span-2 rounded-xl border border-white/[0.06] p-4 bg-white/[0.02] min-h-[120px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#94A3B8]">Revenue Trend (30 days)</span>
                      <div className="flex gap-3">
                        {['1W', '1M', '3M', '1Y'].map((p) => (
                          <button key={p} className="text-[10px] text-[#475569] hover:text-[#94A3B8] transition-colors cursor-pointer border-none bg-transparent">{p}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-end gap-1.5 h-16">
                      {[40, 55, 48, 72, 60, 85, 68, 90, 78, 95, 82, 70, 88, 76, 92, 80, 86, 74, 96, 84].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.8, delay: i * 0.03 }}
                          className="flex-1 rounded-sm bg-gradient-to-t from-[#3B82F6] to-[#06B6D4] opacity-80 hover:opacity-100 transition-opacity"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Live Notifications */}
                  <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02] min-h-[120px] relative overflow-hidden">
                    <span className="text-xs font-semibold text-[#94A3B8] mb-3 block">Live Feed</span>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentNotif}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className={`flex items-start gap-2.5 ${
                          notifications[currentNotif].type === 'emergency' ? 'text-[#EF4444]' :
                          notifications[currentNotif].type === 'warning' ? 'text-[#F59E0B]' : 'text-[#06B6D4]'
                        }`}>
                          <span className="material-symbols-outlined text-base mt-0.5">
                            {notifications[currentNotif].type === 'emergency' ? 'emergency' :
                             notifications[currentNotif].type === 'warning' ? 'warning' : 'notifications'}
                          </span>
                          <div>
                            <p className="text-xs text-[#F8FAFC] leading-relaxed">{notifications[currentNotif].text}</p>
                            <p className="text-[10px] text-[#475569] mt-1">{notifications[currentNotif].time}</p>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    <div className="absolute bottom-3 left-4 right-4 flex gap-1.5">
                      {notifications.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentNotif(i)}
                          className={`flex-1 h-1 rounded-full transition-all cursor-pointer border-none ${
                            i === currentNotif ? 'bg-[#3B82F6]' : 'bg-white/[0.08]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow behind dashboard */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#3B82F6]/10 blur-[100px] rounded-full pointer-events-none" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
