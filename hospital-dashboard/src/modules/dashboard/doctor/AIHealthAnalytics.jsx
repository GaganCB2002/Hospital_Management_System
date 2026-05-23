import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { useHospital } from '../../../context/HospitalContext';
import { useTheme } from '../../../context/ThemeContext';

const mockPatients = [
  {
    id: 'PT-1001', name: 'Alice Vance', age: 28, gender: 'Female', bloodType: 'A+',
    condition: 'Stable - Cardiac Observation',
    vitalsTimeline: [
      { date: '08:00', heartRate: 70, bloodPressure: 118, temperature: 98.2, oxygen: 98 },
      { date: '10:00', heartRate: 75, bloodPressure: 122, temperature: 98.4, oxygen: 99 },
      { date: '12:00', heartRate: 72, bloodPressure: 120, temperature: 98.5, oxygen: 98 },
      { date: '14:00', heartRate: 74, bloodPressure: 119, temperature: 98.7, oxygen: 99 },
      { date: '16:00', heartRate: 71, bloodPressure: 121, temperature: 98.4, oxygen: 98 },
      { date: '18:00', heartRate: 72, bloodPressure: 120, temperature: 98.6, oxygen: 99 },
    ],
    risks: { cardiac: 3, diabetic: 5, respiratory: 2 },
  },
  {
    id: 'PT-1002', name: 'Robert Johnson', age: 58, gender: 'Male', bloodType: 'B+',
    condition: 'Critical - Post-angioplasty',
    vitalsTimeline: [
      { date: '08:00', heartRate: 88, bloodPressure: 142, temperature: 99.1, oxygen: 95 },
      { date: '10:00', heartRate: 92, bloodPressure: 145, temperature: 99.3, oxygen: 94 },
      { date: '12:00', heartRate: 85, bloodPressure: 138, temperature: 98.9, oxygen: 96 },
      { date: '14:00', heartRate: 90, bloodPressure: 140, temperature: 99.0, oxygen: 95 },
      { date: '16:00', heartRate: 94, bloodPressure: 148, temperature: 99.4, oxygen: 93 },
      { date: '18:00', heartRate: 96, bloodPressure: 152, temperature: 99.5, oxygen: 92 },
    ],
    risks: { cardiac: 64, diabetic: 28, respiratory: 35 },
  },
  {
    id: 'PT-1003', name: 'Grace Hopper', age: 62, gender: 'Female', bloodType: 'O-',
    condition: 'Severe - Diabetic Ketoacidosis',
    vitalsTimeline: [
      { date: '08:00', heartRate: 80, bloodPressure: 110, temperature: 98.2, oxygen: 97 },
      { date: '10:00', heartRate: 85, bloodPressure: 112, temperature: 98.5, oxygen: 96 },
      { date: '12:00', heartRate: 90, bloodPressure: 108, temperature: 98.9, oxygen: 97 },
      { date: '14:00', heartRate: 95, bloodPressure: 105, temperature: 99.1, oxygen: 95 },
      { date: '16:00', heartRate: 88, bloodPressure: 115, temperature: 98.6, oxygen: 96 },
      { date: '18:00', heartRate: 86, bloodPressure: 118, temperature: 98.4, oxygen: 97 },
    ],
    risks: { cardiac: 18, diabetic: 72, respiratory: 15 },
  },
];

function CircularProgress({ value, label, isDark }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  let color = '#10B981';
  let badgeClass = 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400';
  let riskLabel = 'LOW';
  if (value > 30 && value <= 60) { color = '#F59E0B'; badgeClass = 'bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400'; riskLabel = 'MODERATE'; }
  else if (value > 60) { color = '#EF4444'; badgeClass = 'bg-red-500/10 text-red-500 dark:bg-red-400/10 dark:text-red-400'; riskLabel = 'HIGH'; }
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="40" cy="40" r={radius} className="fill-none stroke-slate-200 dark:stroke-white/[0.08]" strokeWidth="5" />
          <motion.circle cx="40" cy="40" r={radius} className="fill-none" stroke={color} strokeWidth="5"
            strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }} transition={{ duration: 0.8, ease: 'easeOut' }} strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-xs font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}%</span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeClass}`}>{riskLabel}</span>
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

function VitalCard({ title, value, unit, sparklineData, sparklineKey, sparklineColor, statusText, statusColor, pulseColor }) {
  return (
    <div className="rounded-2xl border border-outline-variant dark:border-outline p-4 flex items-center justify-between bg-surface-container-lowest dark:bg-[#0f172a] w-full min-w-0">
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{title}</p>
        <p className="text-xl font-black text-on-surface dark:text-white mt-1">
          {value} <span className="text-xs font-semibold text-on-surface-variant">{unit}</span>
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseColor}`}></span>
          </span>
          <span className={`text-[10px] font-bold ${statusColor} uppercase tracking-widest`}>{statusText}</span>
        </div>
      </div>
      <VitalSparkline data={sparklineData} dataKey={sparklineKey} stroke={sparklineColor} fill={sparklineColor} />
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
        date: v.date || `Day ${i + 1}`, heartRate: Number(v.heartRate) || 72,
        bloodPressure: Number(v.bloodPressure) || 120, temperature: Number(v.temperature) || 98.6, oxygen: Number(v.oxygen) || 98,
      }));
      const finalTimeline = mappedTimeline.length > 0 ? mappedTimeline : [
        { date: 'Mon', heartRate: 70, bloodPressure: 118, temperature: 98.2, oxygen: 98 },
        { date: 'Tue', heartRate: 72, bloodPressure: 122, temperature: 98.4, oxygen: 97 },
        { date: 'Wed', heartRate: 75, bloodPressure: 120, temperature: 98.6, oxygen: 99 },
        { date: 'Thu', heartRate: 73, bloodPressure: 119, temperature: 98.5, oxygen: 98 },
      ];
      let cardiac = 5, diabetic = 8, respiratory = 4;
      if (p.condition?.toLowerCase().includes('cardiac') || p.condition?.toLowerCase().includes('heart') || p.condition?.toLowerCase().includes('angio') || p.condition?.toLowerCase().includes('valve')) cardiac = 62;
      if (p.condition?.toLowerCase().includes('diabet') || p.condition?.toLowerCase().includes('sugar')) diabetic = 75;
      if (p.condition?.toLowerCase().includes('breathing') || p.condition?.toLowerCase().includes('copd') || p.condition?.toLowerCase().includes('respiratory') || p.condition?.toLowerCase().includes('asthma') || p.condition?.toLowerCase().includes('lung')) respiratory = 55;
      if (p.age > 50) { cardiac += 12; diabetic += 8; }
      return {
        id: p.id, name: p.name, age: p.age || 35, gender: p.gender || 'Male',
        bloodType: p.bloodType || 'O+', condition: p.condition || 'General Checkup',
        vitalsTimeline: finalTimeline, risks: { cardiac: Math.min(cardiac, 98), diabetic: Math.min(diabetic, 98), respiratory: Math.min(respiratory, 98) },
      };
    });
    return [...mockPatients, ...realMapped];
  }, [patients]);

  const [selectedPatientId, setSelectedPatientId] = useState(combinedPatients[0]?.id || 'PT-1001');
  const selectedPatient = useMemo(() => combinedPatients.find((p) => p.id === selectedPatientId) || combinedPatients[0], [combinedPatients, selectedPatientId]);
  const latestVitals = useMemo(() => selectedPatient?.vitalsTimeline?.[selectedPatient.vitalsTimeline.length - 1] || null, [selectedPatient]);

  const clinicalRecommendation = useMemo(() => {
    if (!selectedPatient) return '';
    const { risks } = selectedPatient;
    if (risks.cardiac > 50) return 'High cardiac risk ratio detected. Recommend continuous telemetry recording, ECG test clearance, and cardiology specialist review.';
    if (risks.diabetic > 50) return 'Elevated glucose risk ratio. Recommended glucose monitoring (TID), strict glycemic controls, and insulin dosage titration checks.';
    if (risks.respiratory > 50) return 'Elevated respiratory risk detected. Recommend pulmonary function test, oxygen saturation monitoring, and respiratory therapy consultation.';
    return 'All patient risk indexes reside within normal baselines. Continue standard diagnostic tracking and round-the-clock vitals sync.';
  }, [selectedPatient]);

  return (
    <div className="space-y-6 pb-xl w-full min-w-0 max-w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0 max-w-full">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-headline-lg font-bold text-on-surface dark:text-white">AI Clinical Diagnostics</h1>
              <p className="text-body-md text-on-surface-variant">Advanced AI-powered patient health analysis and biometric monitoring</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold text-on-surface-variant">Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border outline-none text-sm font-bold transition-all shadow-sm cursor-pointer ${
              isDark ? 'bg-slate-900 border-white/[0.08] text-white focus:border-blue-500/50' : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
            }`}
          >
            {combinedPatients.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0 max-w-full">
        <div className="col-span-1 lg:col-span-8 space-y-6 min-w-0 w-full">
          <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline w-full min-w-0">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>monitor_heart</span>
                <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Clinical Intelligence Station</h2>
              </div>
              <p className="text-body-md text-on-surface-variant">Real-time biometric telemetry and AI-assisted health risk assessment</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
              <VitalCard
                title="HR Telemetry" value={latestVitals?.heartRate || '72'} unit="BPM"
                sparklineData={selectedPatient?.vitalsTimeline || []} sparklineKey="heartRate" sparklineColor="#ef4444"
                statusText="Lead I Active" statusColor="text-emerald-500" pulseColor="bg-emerald-500"
              />
              <VitalCard
                title="BP Cuff Monitor" value={`${latestVitals?.bloodPressure || '120'}`} unit="mmHg"
                sparklineData={selectedPatient?.vitalsTimeline || []} sparklineKey="bloodPressure" sparklineColor="#3b82f6"
                statusText="Auto-Cycle" statusColor="text-blue-500" pulseColor="bg-blue-500"
              />
              <VitalCard
                title="SpO2 Pulse Ox" value={latestVitals?.oxygen || '99'} unit="%"
                sparklineData={selectedPatient?.vitalsTimeline || []} sparklineKey="oxygen" sparklineColor="#10b981"
                statusText="Saturated" statusColor="text-emerald-500" pulseColor="bg-emerald-500"
              />
              <VitalCard
                title="Core Temp / Stress" value={latestVitals?.temperature || '98.6'} unit="°F"
                sparklineData={selectedPatient?.vitalsTimeline || []} sparklineKey="temperature" sparklineColor="#f59e0b"
                statusText={selectedPatient?.risks.cardiac > 50 ? 'Moderate Stress' : 'Low Stress'}
                statusColor="text-amber-500" pulseColor="bg-amber-500"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline w-full min-w-0">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>show_chart</span>
                <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Biometric Telemetry Trends</h2>
              </div>
              <p className="text-body-md text-on-surface-variant">Multi-lead historical telemetry view for patient vitals trend analysis</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedPatient?.vitalsTimeline || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={isDark ? 0.08 : 0.2} stroke={isDark ? '#fff' : '#000'} />
                  <XAxis dataKey="date" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: isDark ? '#1e293b' : '#ffffff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: isDark ? '#f8fafc' : '#0f172a' }} />
                  <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2.5} name="Heart Rate (BPM)" activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="bloodPressure" stroke="#3b82f6" strokeWidth={2.5} name="Systolic BP (mmHg)" activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="oxygen" stroke="#10b981" strokeWidth={2.5} name="Oxygen Saturation (%)" activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline w-full min-w-0">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>personal_medical</span>
                <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Patient Medical Overview</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
              <div className="rounded-2xl border border-outline-variant dark:border-outline p-4 bg-surface-container-lowest dark:bg-[#0f172a] w-full min-w-0">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Patient Information</p>
                <div className="space-y-2 w-full min-w-0">
                  {[
                    { label: 'Name', value: selectedPatient?.name },
                    { label: 'Age / Gender', value: `${selectedPatient?.age || 'N/A'} / ${selectedPatient?.gender || 'N/A'}` },
                    { label: 'Blood Type', value: selectedPatient?.bloodType || 'N/A' },
                    { label: 'Condition', value: selectedPatient?.condition || 'N/A' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center w-full min-w-0">
                      <span className="text-xs text-on-surface-variant">{item.label}</span>
                      <span className="text-xs font-bold text-on-surface dark:text-white text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-outline-variant dark:border-outline p-4 bg-surface-container-lowest dark:bg-[#0f172a] w-full min-w-0">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Vitals Summary</p>
                <div className="space-y-2 w-full min-w-0">
                  {[
                    { label: 'Heart Rate', value: `${latestVitals?.heartRate || 'N/A'} BPM`, normal: '60-100' },
                    { label: 'Blood Pressure', value: `${latestVitals?.bloodPressure || 'N/A'} mmHg`, normal: '120/80' },
                    { label: 'SpO2', value: `${latestVitals?.oxygen || 'N/A'}%`, normal: '95-100%' },
                    { label: 'Temperature', value: `${latestVitals?.temperature || 'N/A'}°F`, normal: '97-99°F' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center w-full min-w-0">
                      <span className="text-xs text-on-surface-variant">{item.label}</span>
                      <div className="text-right">
                        <span className="text-xs font-bold text-on-surface dark:text-white">{item.value}</span>
                        <span className="text-[9px] text-on-surface-variant ml-1">({item.normal})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-1 lg:col-span-4 min-w-0 w-full">
          <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline w-full min-w-0 sticky top-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant dark:border-outline">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                <h3 className="text-base font-extrabold text-on-surface dark:text-white">AI Clinical Assistant</h3>
              </div>
              <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400 border border-emerald-500/20">ACTIVE</span>
            </div>

            <div className="py-5">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Patient Overview</p>
              <div className="p-4 bg-surface-container-lowest dark:bg-[#0f172a] rounded-2xl border border-outline-variant dark:border-outline w-full min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold text-white shrink-0">
                    {selectedPatient?.name?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-on-surface dark:text-white truncate">{selectedPatient?.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{selectedPatient?.id}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{selectedPatient?.gender}, {selectedPatient?.age}y</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">{selectedPatient?.bloodType}</span>
                </div>
                <div className="pt-3 border-t border-outline-variant/40 dark:border-outline/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Status</span>
                    <span className="text-[10px] font-extrabold text-primary dark:text-primary-fixed-dim uppercase text-right">{selectedPatient?.condition}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">Estimated Clinical Risk Ratios</p>
              <div className="grid grid-cols-3 gap-2">
                <CircularProgress value={selectedPatient?.risks.cardiac} label="Cardiac" isDark={isDark} />
                <CircularProgress value={selectedPatient?.risks.diabetic} label="Diabetic" isDark={isDark} />
                <CircularProgress value={selectedPatient?.risks.respiratory} label="Respiratory" isDark={isDark} />
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-primary/5 dark:bg-primary-container/10 border border-primary/15">
              <div className="flex gap-2.5 items-start">
                <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <div className="text-xs leading-relaxed text-on-surface-variant">
                  <span className="font-extrabold text-on-surface dark:text-white block mb-0.5">Clinical Recommendation</span>
                  {clinicalRecommendation}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer border-none flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-sm">download</span>
                Export Report
              </button>
              <button className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface text-xs font-bold hover:bg-surface-container-high transition-all cursor-pointer bg-transparent flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-sm">print</span>
                Print
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
