import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { useHospital } from '../../../context/HospitalContext';
import { useTheme } from '../../../context/ThemeContext';

const mockPatients = [
  {
    id: 'PT-1001',
    name: 'Alice Vance',
    age: 28,
    gender: 'Female',
    bloodType: 'A+',
    condition: 'Stable - Cardiac Observation',
    vitalsTimeline: [
      { date: '08:00', heartRate: 70, bloodPressure: 118, temperature: 98.2, oxygen: 98 },
      { date: '10:00', heartRate: 75, bloodPressure: 122, temperature: 98.4, oxygen: 99 },
      { date: '12:00', heartRate: 72, bloodPressure: 120, temperature: 98.5, oxygen: 98 },
      { date: '14:00', heartRate: 74, bloodPressure: 119, temperature: 98.7, oxygen: 99 },
      { date: '16:00', heartRate: 71, bloodPressure: 121, temperature: 98.4, oxygen: 98 },
      { date: '18:00', heartRate: 72, bloodPressure: 120, temperature: 98.6, oxygen: 99 }
    ],
    risks: { cardiac: 3, diabetic: 5, respiratory: 2 }
  },
  {
    id: 'PT-1002',
    name: 'Robert Johnson',
    age: 58,
    gender: 'Male',
    bloodType: 'B+',
    condition: 'Critical - Post-angioplasty',
    vitalsTimeline: [
      { date: '08:00', heartRate: 88, bloodPressure: 142, temperature: 99.1, oxygen: 95 },
      { date: '10:00', heartRate: 92, bloodPressure: 145, temperature: 99.3, oxygen: 94 },
      { date: '12:00', heartRate: 85, bloodPressure: 138, temperature: 98.9, oxygen: 96 },
      { date: '14:00', heartRate: 90, bloodPressure: 140, temperature: 99.0, oxygen: 95 },
      { date: '16:00', heartRate: 94, bloodPressure: 148, temperature: 99.4, oxygen: 93 },
      { date: '18:00', heartRate: 96, bloodPressure: 152, temperature: 99.5, oxygen: 92 }
    ],
    risks: { cardiac: 64, diabetic: 28, respiratory: 35 }
  },
  {
    id: 'PT-1003',
    name: 'Grace Hopper',
    age: 62,
    gender: 'Female',
    bloodType: 'O-',
    condition: 'Severe - Diabetic Ketoacidosis',
    vitalsTimeline: [
      { date: '08:00', heartRate: 80, bloodPressure: 110, temperature: 98.2, oxygen: 97 },
      { date: '10:00', heartRate: 85, bloodPressure: 112, temperature: 98.5, oxygen: 96 },
      { date: '12:00', heartRate: 90, bloodPressure: 108, temperature: 98.9, oxygen: 97 },
      { date: '14:00', heartRate: 95, bloodPressure: 105, temperature: 99.1, oxygen: 95 },
      { date: '16:00', heartRate: 88, bloodPressure: 115, temperature: 98.6, oxygen: 96 },
      { date: '18:00', heartRate: 86, bloodPressure: 118, temperature: 98.4, oxygen: 97 }
    ],
    risks: { cardiac: 18, diabetic: 72, respiratory: 15 }
  }
];

function CircularProgress({ value, label, isDark }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  let color = '#10B981'; // Green
  let badgeClass = 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400';
  let riskLabel = 'LOW';
  if (value > 30 && value <= 60) {
    color = '#F59E0B'; // Amber
    badgeClass = 'bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400';
    riskLabel = 'MODERATE';
  } else if (value > 60) {
    color = '#EF4444'; // Red
    badgeClass = 'bg-red-500/10 text-red-500 dark:bg-red-400/10 dark:text-red-400';
    riskLabel = 'HIGH';
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="fill-none stroke-slate-200 dark:stroke-white/[0.08]"
            strokeWidth="5"
          />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            className="fill-none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-xs font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {value}%
        </span>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
        {label}
      </span>
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeClass}`}>
        {riskLabel}
      </span>
    </div>
  );
}

function VitalSparkline({ data, dataKey, stroke, fill }) {
  return (
    <div className="h-10 w-24 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Area type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={1.5} fill={fill} fillOpacity={0.15} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AIHealthAnalytics() {
  const { user } = useAuth();
  const { patients, doctors } = useHospital();
  const { isDark } = useTheme();

  const doctor = useMemo(
    () => doctors.find((entry) => entry.name === user?.name || entry.email === user?.email),
    [doctors, user]
  );

  const combinedPatients = useMemo(() => {
    const realMapped = patients.map((p) => {
      const rawTimeline = p.vitalsTimeline || [];
      const mappedTimeline = rawTimeline.map((v, i) => ({
        date: v.date || `Day ${i + 1}`,
        heartRate: Number(v.heartRate) || 72,
        bloodPressure: Number(v.bloodPressure) || 120,
        temperature: Number(v.temperature) || 98.6,
        oxygen: Number(v.oxygen) || 98,
      }));

      const finalTimeline = mappedTimeline.length > 0 ? mappedTimeline : [
        { date: 'Mon', heartRate: 70, bloodPressure: 118, temperature: 98.2, oxygen: 98 },
        { date: 'Tue', heartRate: 72, bloodPressure: 122, temperature: 98.4, oxygen: 97 },
        { date: 'Wed', heartRate: 75, bloodPressure: 120, temperature: 98.6, oxygen: 99 },
        { date: 'Thu', heartRate: 73, bloodPressure: 119, temperature: 98.5, oxygen: 98 },
      ];

      let cardiac = 5;
      let diabetic = 8;
      let respiratory = 4;
      if (
        p.condition?.toLowerCase().includes('cardiac') ||
        p.condition?.toLowerCase().includes('heart') ||
        p.condition?.toLowerCase().includes('angio') ||
        p.condition?.toLowerCase().includes('valve')
      ) {
        cardiac = 62;
      }
      if (p.condition?.toLowerCase().includes('diabet') || p.condition?.toLowerCase().includes('sugar')) {
        diabetic = 75;
      }
      if (
        p.condition?.toLowerCase().includes('breathing') ||
        p.condition?.toLowerCase().includes('copd') ||
        p.condition?.toLowerCase().includes('respiratory') ||
        p.condition?.toLowerCase().includes('asthma') ||
        p.condition?.toLowerCase().includes('lung')
      ) {
        respiratory = 55;
      }
      if (p.age > 50) {
        cardiac += 12;
        diabetic += 8;
      }

      return {
        id: p.id,
        name: p.name,
        age: p.age || 35,
        gender: p.gender || 'Male',
        bloodType: p.bloodType || 'O+',
        condition: p.condition || 'General Checkup',
        vitalsTimeline: finalTimeline,
        risks: { cardiac, diabetic, respiratory },
      };
    });

    return [...mockPatients, ...realMapped];
  }, [patients]);

  const [selectedPatientId, setSelectedPatientId] = useState(combinedPatients[0]?.id || 'PT-1001');

  const selectedPatient = useMemo(() => {
    return combinedPatients.find((p) => p.id === selectedPatientId) || combinedPatients[0];
  }, [combinedPatients, selectedPatientId]);

  const latestVitals = useMemo(() => {
    if (!selectedPatient?.vitalsTimeline?.length) return null;
    return selectedPatient.vitalsTimeline[selectedPatient.vitalsTimeline.length - 1];
  }, [selectedPatient]);

  return (
    <div className="space-y-6 pb-xl w-full min-w-0 max-w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0 max-w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-headline-lg font-bold text-on-surface dark:text-white break-words">
            AI Clinical Diagnostics
          </h1>
          <p className="text-body-md text-on-surface-variant break-words mt-1">
            Welcome back, Dr. {doctor?.name || user?.name || 'Sarah Connor'}. Portal: DOCTOR mode.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-semibold text-on-surface-variant">Selected Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border outline-none text-sm font-bold transition-all shadow-sm cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-white/[0.08] text-white focus:border-blue-500/50'
                : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
            }`}
          >
            {combinedPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0 max-w-full">
        {/* Left Side: Diagnostics Station & Trend Charts */}
        <div className="col-span-1 lg:col-span-8 space-y-6 min-w-0 w-full">
          {/* Vitals Station */}
          <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline w-full min-w-0">
            <div className="mb-5">
              <h2 className="text-headline-md font-bold text-on-surface dark:text-white">
                AI Clinical Intelligence Station
              </h2>
              <p className="text-body-md text-on-surface-variant mt-0.5">
                Real-time biometric analytics, neural EEG telemetry monitoring, and AI-assisted health risk assessments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* HR Telemetry */}
              <div className="rounded-2xl border border-outline-variant dark:border-outline p-4 flex items-center justify-between bg-surface-container-lowest dark:bg-[#0f172a]">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    HR Telemetry
                  </p>
                  <p className="text-xl font-black text-on-surface dark:text-white mt-1">
                    {latestVitals?.heartRate || '72'} <span className="text-xs font-semibold text-on-surface-variant">BPM</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                      Lead I Active
                    </span>
                  </div>
                </div>
                <VitalSparkline
                  data={selectedPatient?.vitalsTimeline || []}
                  dataKey="heartRate"
                  stroke="#ef4444"
                  fill="#ef4444"
                />
              </div>

              {/* BP Cuff Monitor */}
              <div className="rounded-2xl border border-outline-variant dark:border-outline p-4 flex items-center justify-between bg-surface-container-lowest dark:bg-[#0f172a]">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    BP Cuff Monitor
                  </p>
                  <p className="text-xl font-black text-on-surface dark:text-white mt-1">
                    {latestVitals?.bloodPressure || '120'}/80 <span className="text-xs font-semibold text-on-surface-variant">mmHg</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                      Auto-Cycle
                    </span>
                  </div>
                </div>
                <VitalSparkline
                  data={selectedPatient?.vitalsTimeline || []}
                  dataKey="bloodPressure"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                />
              </div>

              {/* SpO2 Pulse Ox */}
              <div className="rounded-2xl border border-outline-variant dark:border-outline p-4 flex items-center justify-between bg-surface-container-lowest dark:bg-[#0f172a]">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    SpO2 Pulse Ox
                  </p>
                  <p className="text-xl font-black text-on-surface dark:text-white mt-1">
                    {latestVitals?.oxygen || '99'} <span className="text-xs font-semibold text-on-surface-variant">%</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                      Saturated
                    </span>
                  </div>
                </div>
                <VitalSparkline
                  data={selectedPatient?.vitalsTimeline || []}
                  dataKey="oxygen"
                  stroke="#10b981"
                  fill="#10b981"
                />
              </div>

              {/* Temp / Stress */}
              <div className="rounded-2xl border border-outline-variant dark:border-outline p-4 flex items-center justify-between bg-surface-container-lowest dark:bg-[#0f172a]">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Core Temp / Stress
                  </p>
                  <p className="text-xl font-black text-on-surface dark:text-white mt-1">
                    {latestVitals?.temperature || '98.6'} <span className="text-xs font-semibold text-on-surface-variant">°F</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                      {selectedPatient.risks.cardiac > 50 ? 'Moderate Stress' : 'Low Stress'}
                    </span>
                  </div>
                </div>
                <VitalSparkline
                  data={selectedPatient?.vitalsTimeline || []}
                  dataKey="temperature"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                />
              </div>
            </div>
          </section>

          {/* Telemetry Trends Chart */}
          <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline w-full min-w-0">
            <div className="mb-5">
              <h2 className="text-headline-md font-bold text-on-surface dark:text-white">
                Biometric Telemetry Trends
              </h2>
              <p className="text-body-md text-on-surface-variant mt-0.5">
                Multi-lead historical telemetry view for patient vitals trend analysis.
              </p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedPatient?.vitalsTimeline || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={isDark ? 0.08 : 0.2} stroke={isDark ? '#fff' : '#000'} />
                  <XAxis dataKey="date" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: isDark ? '#1e293b' : '#ffffff',
                      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    name="Heart Rate (BPM)"
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bloodPressure"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    name="Systolic BP (mmHg)"
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="oxygen"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    name="Oxygen Saturation (%)"
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Right Side: AI Assistant Widget */}
        <div className="col-span-1 lg:col-span-4 min-w-0 w-full">
          <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline w-full min-w-0 sticky top-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant dark:border-outline">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  smart_toy
                </span>
                <h3 className="text-base font-extrabold text-on-surface dark:text-white">
                  AI Clinical Assistant
                </h3>
              </div>
              <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            {/* Patient Overview */}
            <div className="py-5">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Patient Overview
              </p>
              <div className="p-3 bg-surface-container-lowest dark:bg-[#0f172a] rounded-2xl border border-outline-variant dark:border-outline">
                <p className="text-sm font-extrabold text-on-surface dark:text-white">
                  {selectedPatient?.name}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Age: {selectedPatient?.age} &bull; Gender: {selectedPatient?.gender} &bull; Blood: {selectedPatient?.bloodType}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Status</span>
                  <span className="text-[10px] font-extrabold text-primary dark:text-primary-fixed-dim uppercase">
                    {selectedPatient?.condition}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Ratios */}
            <div className="pt-2">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                Estimated Clinical Risk Ratios
              </p>
              <div className="grid grid-cols-3 gap-2">
                <CircularProgress
                  value={selectedPatient?.risks.cardiac}
                  label="Cardiac"
                  isDark={isDark}
                />
                <CircularProgress
                  value={selectedPatient?.risks.diabetic}
                  label="Diabetic"
                  isDark={isDark}
                />
                <CircularProgress
                  value={selectedPatient?.risks.respiratory}
                  label="Respiratory"
                  isDark={isDark}
                />
              </div>
            </div>

            {/* AI Clinical Diagnostic Recommendation */}
            <div className="mt-6 p-4 rounded-2xl bg-primary/5 dark:bg-primary-container/10 border border-primary/15">
              <div className="flex gap-2.5 items-start">
                <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5">
                  info
                </span>
                <div className="text-xs leading-relaxed text-on-surface-variant">
                  <span className="font-extrabold text-on-surface dark:text-white block mb-0.5">
                    Clinical Recommendation
                  </span>
                  {selectedPatient?.risks.cardiac > 50 ? (
                    <span>
                      High cardiac risk ratio detected. Recommend continuous telemetry recording, ECG test clearance, and cardiology specialist review.
                    </span>
                  ) : selectedPatient?.risks.diabetic > 50 ? (
                    <span>
                      Elevated glucose risk ratio. Recommended glucose monitoring (TID), strict glycemic controls, and insulin dosage titration checks.
                    </span>
                  ) : (
                    <span>
                      All patient risk indexes reside within normal baselines. Continue standard diagnostic tracking and round-the-clock vitals sync.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
