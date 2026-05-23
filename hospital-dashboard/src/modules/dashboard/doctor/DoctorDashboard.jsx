import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import EmptyState from '../../../components/common/EmptyState';
import BedOccupancyPanel from '../../../components/common/BedOccupancyPanel';
import AIDiagnosticAssistant from './AIDiagnosticAssistant';
import { useAuth } from '../../../context/AuthContext';
import { useHospital } from '../../../context/HospitalContext';
import { useTheme } from '../../../context/ThemeContext';
import { formatDateTime, formatDate, formatInr, formatCompactInr } from '../../../lib/formatters';

function VitalSparkline({ data, dataKey, stroke, fill }) {
  return (
    <div className="h-10 w-full max-w-[100px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Area type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={1.5} fill={fill} fillOpacity={0.15} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CircularGauge({ value, label, max = 100, isDark }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference - progress * circumference;
  let color = '#10B981';
  let riskLabel = 'Normal';
  if (value > 30 && value <= 60) { color = '#F59E0B'; riskLabel = 'Moderate'; }
  if (value > 60) { color = '#EF4444'; riskLabel = 'High'; }
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="28" cy="28" r={radius} fill="none" stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="4" />
          <motion.circle cx="28" cy="28" r={radius} fill="none" stroke={color} strokeWidth="4" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 0.8, ease: 'easeOut' }} strokeLinecap="round" />
        </svg>
        <span className={`absolute text-[10px] font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}%</span>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>{riskLabel}</span>
    </div>
  );
}

function PatientCard({ patient, selected, onSelect, onViewDetails }) {
  const latestVital = patient.vitalsTimeline?.[patient.vitalsTimeline.length - 1];
  return (
    <motion.div
      layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(patient)}
      className={`rounded-2xl border p-4 cursor-pointer transition-all w-full min-w-0 ${
        selected?.id === patient.id
          ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
          : 'border-outline-variant bg-surface dark:border-outline hover:border-primary/50 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3 w-full min-w-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
          selected?.id === patient.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
        }`}>
          {patient.name?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-2 w-full min-w-0">
            <p className="text-sm font-bold text-on-surface dark:text-white truncate">{patient.name}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
              patient.status === 'Admitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              patient.status === 'Emergency' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              patient.status === 'Discharged' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>{patient.status}</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {patient.id} &bull; {patient.age}y &bull; {patient.gender} &bull; {patient.bloodType || 'O+'}
          </p>
          {latestVital && (
            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-on-surface-variant">
              <span>HR {latestVital.heartRate}</span>
              <span>BP {latestVital.bloodPressure}</span>
              <span>SpO2 {latestVital.oxygen}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PatientDetailPanel({ patient, isDark, onClose }) {
  if (!patient) return (
    <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
      <span className="material-symbols-outlined text-5xl mb-3 opacity-30">personal_medical</span>
      <p className="text-sm font-medium">Select a patient to view detailed information</p>
    </div>
  );

  const latestVital = patient.vitalsTimeline?.[patient.vitalsTimeline.length - 1];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 w-full min-w-0">
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container-lowest dark:bg-[#0f172a] border border-outline-variant dark:border-outline w-full min-w-0">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white shrink-0">{patient.name?.charAt(0)}</div>
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-start justify-between gap-2 w-full min-w-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-on-surface dark:text-white truncate">{patient.name}</h3>
              <p className="text-xs text-on-surface-variant">{patient.id} &bull; {patient.age} years &bull; {patient.gender} &bull; {patient.bloodType}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant cursor-pointer border-none bg-transparent shrink-0">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              patient.status === 'Admitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              patient.status === 'Emergency' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>{patient.status}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{patient.department}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant dark:bg-slate-800">{patient.condition}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Doctor', value: patient.doctor || patient.assignedDoctor?.name },
          { label: 'Ward', value: patient.ward },
          { label: 'Admitted', value: patient.admittedDate || 'N/A' },
          { label: 'Contact', value: patient.mobile || patient.phone },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-outline-variant dark:border-outline p-2.5 bg-surface dark:bg-[#0f172a] w-full min-w-0">
            <p className="text-[9px] font-bold uppercase text-on-surface-variant tracking-wider">{item.label}</p>
            <p className="text-xs font-bold text-on-surface dark:text-white mt-0.5 truncate">{item.value || 'N/A'}</p>
          </div>
        ))}
      </div>

      {latestVital && (
        <div className="rounded-2xl border border-outline-variant dark:border-outline p-4 bg-surface dark:bg-[#0f172a] w-full min-w-0">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mb-3">Current Vitals</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Heart Rate', value: `${latestVital.heartRate}`, unit: 'BPM', color: '#ef4444', icon: 'favorite' },
              { label: 'Blood Pressure', value: `${latestVital.bloodPressure}`, unit: 'mmHg', color: '#3b82f6', icon: 'monitor_heart' },
              { label: 'SpO2', value: `${latestVital.oxygen}`, unit: '%', color: '#10b981', icon: 'pulmonology' },
              { label: 'Temp', value: `${latestVital.temperature}`, unit: '°F', color: '#f59e0b', icon: 'thermostat' },
            ].map((v) => (
              <div key={v.label} className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-lowest dark:bg-slate-900/50">
                <span className="material-symbols-outlined text-lg" style={{ color: v.color }}>{v.icon}</span>
                <p className="text-sm font-black text-on-surface dark:text-white mt-0.5">{v.value}</p>
                <p className="text-[9px] font-medium text-on-surface-variant">{v.unit}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full min-w-0">
        {patient.medicalHistory && (
          <div className="rounded-xl border border-outline-variant dark:border-outline p-3 bg-surface dark:bg-[#0f172a] w-full min-w-0">
            <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mb-2">Medical History</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">{patient.medicalHistory}</p>
          </div>
        )}
        {patient.allergies?.length > 0 && (
          <div className="rounded-xl border border-outline-variant dark:border-outline p-3 bg-surface dark:bg-[#0f172a] w-full min-w-0">
            <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mb-2">Allergies</p>
            <div className="flex flex-wrap gap-1">
              {patient.allergies.map((a, i) => (
                <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {patient.diagnosisHistory?.length > 0 && (
        <div className="w-full min-w-0">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mb-2">Diagnosis History</p>
          <div className="space-y-1.5 w-full min-w-0">
            {patient.diagnosisHistory.slice(0, 4).map((d, i) => (
              <div key={d.id || i} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/50 dark:border-outline/30 w-full min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-on-surface dark:text-white truncate">{d.diagnosis}</p>
                  <p className="text-[10px] text-on-surface-variant">{d.doctor} &bull; {d.date}</p>
                </div>
                <span className="material-symbols-outlined text-sm text-on-surface-variant">chevron_right</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {patient.prescriptions?.length > 0 && (
        <div className="w-full min-w-0">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider mb-2">Current Prescriptions</p>
          <div className="space-y-1.5 w-full min-w-0">
            {patient.prescriptions.slice(0, 3).map((p, i) => (
              <div key={p.id || i} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/50 dark:border-outline/30 w-full min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-on-surface dark:text-white truncate">{p.medication}</p>
                  <p className="text-[10px] text-on-surface-variant">{p.dosage} &bull; {p.frequency}</p>
                </div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  p.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { doctors, appointments, patients, billing, revenueData, departmentStats } = useHospital();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activePanel, setActivePanel] = useState('patients');

  const doctor = useMemo(
    () => doctors.find((entry) => entry.name === user?.name || entry.email === user?.email),
    [doctors, user],
  );
  const myAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.doctor === doctor?.name || appointment.doctorId === doctor?.doctorId),
    [appointments, doctor],
  );
  const myPatients = useMemo(
    () => patients.filter((patient) => patient.doctorId === doctor?.doctorId || patient.doctor === doctor?.name),
    [doctor, patients],
  );
  const inPatients = myPatients.filter((patient) => ['Admitted', 'Emergency'].includes(patient.status));
  const appointmentStatusStats = [
    { name: 'Pending', value: myAppointments.filter((app) => app.status === 'Pending').length, color: isDark ? '#3B82F6' : '#00355f' },
    { name: 'Confirmed', value: myAppointments.filter((app) => app.status === 'Confirmed').length, color: isDark ? '#10B981' : '#006b5f' },
    { name: 'Completed', value: myAppointments.filter((app) => app.status === 'Completed').length, color: isDark ? '#3B82F6' : '#0f4c81' },
    { name: 'Cancelled', value: myAppointments.filter((app) => app.status === 'Rejected' || app.status === 'Cancelled').length, color: isDark ? '#EF4444' : '#ba1a1a' },
  ];
  const revenueEstimate = myAppointments
    .filter((app) => ['Confirmed', 'Completed', 'Checked In'].includes(app.status))
    .reduce((total, app) => total + Number(app.fees || doctor?.consultationFee || 0), 0);
  const completedCount = myAppointments.filter((app) => app.status === 'Completed').length;
  const totalDepartmentRevenue = revenueData?.reduce((s, r) => s + (r.revenue || 0), 0) || 0;
  const totalBeds = departmentStats?.reduce((s, d) => s + (d.beds || 0), 0) || 0;
  const occupiedBeds = departmentStats?.reduce((s, d) => s + (d.occupied || 0), 0) || 0;

  if (!doctor) {
    return (
      <EmptyState
        icon="stethoscope"
        title="Doctor profile not available"
        description="Please sign in with a linked doctor account to see live patient and appointment data."
      />
    );
  }

  const enhancedPatients = useMemo(() =>
    myPatients.map((p) => {
      const fullPatient = patients.find((fp) => fp.id === p.id);
      return fullPatient || p;
    }),
  [myPatients, patients]);

  const tabs = [
    { id: 'patients', label: 'Patients', icon: 'patient_list' },
    { id: 'schedule', label: 'Schedule', icon: 'event' },
    { id: 'analytics', label: 'Analytics', icon: 'monitoring' },
    { id: 'hospital', label: 'Hospital', icon: 'local_hospital' },
  ];

  return (
    <div className="space-y-6 pb-xl w-full min-w-0 max-w-full">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full min-w-0 max-w-full">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
              {doctor.name?.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-headline-lg font-bold text-on-surface dark:text-white truncate">Dr. {doctor.name}</h1>
              <p className="text-body-md text-on-surface-variant truncate">{doctor.specialization} &bull; {doctor.department} &bull; {doctor.experience}</p>
            </div>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-lowest dark:bg-[#0f172a] border border-outline-variant dark:border-outline shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{doctor.status || 'Available'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => navigate('/doctor/appointments')} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer border-none flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-sm">calendar_add_on</span>
            Manage Appointments
          </button>
          <button onClick={() => navigate('/doctor/ai-insights')} className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface text-xs font-bold hover:bg-surface-container-high transition-all cursor-pointer bg-transparent flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">biotech</span>
            AI Clinic
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 w-full min-w-0 max-w-full">
        {[
          { title: "Today's Appointments", value: myAppointments.length, detail: `${myAppointments.filter((a) => a.status === 'Pending').length} pending`, icon: 'event', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
          { title: 'Assigned Patients', value: myPatients.length, detail: `${inPatients.length} admitted/emergency`, icon: 'groups', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
          { title: 'Completed Cases', value: completedCount, detail: `Revenue ${formatCompactInr(revenueEstimate)}`, icon: 'checklist', color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30' },
          { title: 'Performance', value: `${doctor.rating} / 5`, detail: doctor.performanceStats?.successRate || 'Excellent', icon: 'trending_up', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm dark:border-outline w-full min-w-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-lg">{card.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-on-surface-variant truncate">{card.title}</p>
                <p className="text-xl font-bold text-on-surface dark:text-white">{card.value}</p>
                <p className="text-[10px] text-on-surface-variant truncate">{card.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded-xl border border-outline-variant dark:border-outline bg-surface dark:bg-[#0f172a] w-full min-w-0 max-w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActivePanel(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer border-none shrink-0 ${
              activePanel === tab.id
                ? isDark ? 'bg-blue-600/20 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-md'
                : isDark ? 'text-white/30 hover:text-white/60' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activePanel === 'patients' && (
          <motion.div key="patients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full min-w-0 max-w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0 max-w-full">
              <div className="col-span-1 lg:col-span-5 xl:col-span-4 space-y-3 w-full min-w-0">
                <div className="flex items-center justify-between w-full min-w-0">
                  <h2 className="text-headline-md font-bold text-on-surface dark:text-white">My Patients</h2>
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-lg">{enhancedPatients.length} total</span>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 w-full min-w-0">
                  {enhancedPatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      selected={selectedPatient}
                      onSelect={(p) => setSelectedPatient(p)}
                      onViewDetails={(p) => setSelectedPatient(p)}
                    />
                  ))}
                  {enhancedPatients.length === 0 && (
                    <div className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl mb-2 opacity-30">person_search</span>
                      <p className="text-sm">No patients assigned yet</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-1 lg:col-span-7 xl:col-span-8 rounded-2xl border border-outline-variant dark:border-outline bg-surface p-5 shadow-sm w-full min-w-0 max-w-full">
                <PatientDetailPanel patient={selectedPatient} isDark={isDark} onClose={() => setSelectedPatient(null)} />
              </div>
            </div>
          </motion.div>
        )}

        {activePanel === 'schedule' && (
          <motion.div key="schedule" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full min-w-0 max-w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0 max-w-full">
              <section className="col-span-1 lg:col-span-7 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline w-full min-w-0 max-w-full">
                <div className="flex items-center justify-between mb-4 w-full min-w-0">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Live Schedule</h2>
                    <p className="text-body-md text-on-surface-variant">Upcoming appointments and bookings</p>
                  </div>
                  <button onClick={() => navigate('/doctor/appointments')} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold cursor-pointer border-none shrink-0">
                    View All
                  </button>
                </div>
                <div className="space-y-2 w-full min-w-0 max-w-full">
                  {myAppointments.slice(0, 8).map((appointment) => (
                    <div key={appointment.id} className="rounded-xl border border-outline-variant dark:border-outline p-3 bg-surface-container-lowest dark:bg-[#0f172a] w-full min-w-0 max-w-full">
                      <div className="flex items-start justify-between gap-3 w-full min-w-0 max-w-full">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {appointment.patient?.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-on-surface dark:text-white truncate">{appointment.patient}</p>
                              <p className="text-xs text-on-surface-variant truncate">{appointment.type} &bull; {formatDateTime(appointment.date, appointment.time)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            appointment.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            appointment.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            appointment.status === 'Completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>{appointment.status}</span>
                          <p className="text-[10px] text-on-surface-variant mt-1">{appointment.bookingMode}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {myAppointments.length === 0 && (
                    <div className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl mb-2 opacity-30">event_busy</span>
                      <p className="text-sm">No appointments scheduled</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="col-span-1 lg:col-span-5 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline w-full min-w-0 max-w-full">
                <h2 className="text-headline-md font-bold text-on-surface dark:text-white mb-4">Appointment Status</h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appointmentStatusStats}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" stroke={isDark ? '#94A3B8' : '#475569'} fontSize={11} />
                      <YAxis allowDecimals={false} stroke={isDark ? '#94A3B8' : '#475569'} fontSize={11} />
                      <Tooltip contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px', color: isDark ? '#f8fafc' : '#0f172a' }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {appointmentStatusStats.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          </motion.div>
        )}

        {activePanel === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full min-w-0 max-w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0 max-w-full">
              <div className="col-span-1 lg:col-span-7 space-y-4 w-full min-w-0">
                <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline w-full min-w-0">
                  <h2 className="text-headline-md font-bold text-on-surface dark:text-white mb-3">AI Clinical Diagnostics</h2>
                  <p className="text-body-md text-on-surface-variant mb-4">Select a patient for AI-assisted health risk assessment</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
                    {enhancedPatients.slice(0, 4).map((p) => {
                      const risks = {
                        cardiac: p.condition?.toLowerCase().includes('cardiac') || p.condition?.toLowerCase().includes('heart') ? 60 + Math.floor(Math.random() * 20) : 10 + Math.floor(Math.random() * 20),
                        diabetic: p.condition?.toLowerCase().includes('diabet') ? 60 + Math.floor(Math.random() * 20) : 10 + Math.floor(Math.random() * 20),
                        respiratory: p.condition?.toLowerCase().includes('respiratory') || p.condition?.toLowerCase().includes('lung') ? 50 + Math.floor(Math.random() * 20) : 10 + Math.floor(Math.random() * 15),
                      };
                      return (
                        <div key={p.id} className="rounded-xl border border-outline-variant dark:border-outline p-3 bg-surface-container-lowest dark:bg-[#0f172a] w-full min-w-0">
                          <p className="text-sm font-bold text-on-surface dark:text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-on-surface-variant mb-2">{p.condition}</p>
                          <div className="flex items-center justify-around">
                            <CircularGauge value={risks.cardiac} label="Cardiac" isDark={isDark} max={100} />
                            <CircularGauge value={risks.diabetic} label="Diabetic" isDark={isDark} max={100} />
                            <CircularGauge value={risks.respiratory} label="Respiratory" isDark={isDark} max={100} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => navigate('/doctor/ai-insights')} className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer border-none flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">biotech</span>
                    Open Full AI Clinical Suite
                  </button>
                </section>
              </div>

              <div className="col-span-1 lg:col-span-5 space-y-4 w-full min-w-0">
                <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline w-full min-w-0">
                  <h2 className="text-headline-md font-bold text-on-surface dark:text-white mb-3">Clinical Performance</h2>
                  <div className="space-y-3 w-full min-w-0">
                    {[
                      { label: 'Total Consultations', value: doctor.performanceStats?.consultations || '0', icon: 'stethoscope' },
                      { label: 'Success Rate', value: doctor.performanceStats?.successRate || 'N/A', icon: 'verified' },
                      { label: 'Avg Wait Time', value: doctor.performanceStats?.averageWait || 'N/A', icon: 'timer' },
                      { label: 'Monthly Revenue', value: formatCompactInr(doctor.performanceStats?.monthlyRevenue || 0), icon: 'payments' },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest dark:bg-[#0f172a] border border-outline-variant/50 dark:border-outline/30 w-full min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-sm text-primary">{stat.icon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-on-surface-variant truncate">{stat.label}</p>
                          <p className="text-sm font-bold text-on-surface dark:text-white">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}

        {activePanel === 'hospital' && (
          <motion.div key="hospital" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full min-w-0 max-w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0 max-w-full">
              <div className="col-span-1 lg:col-span-8 space-y-4 w-full min-w-0">
                <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline w-full min-w-0">
                  <div className="flex items-center justify-between mb-4 w-full min-w-0">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Hospital Overview</h2>
                      <p className="text-body-md text-on-surface-variant">Full project and facility status</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full min-w-0">
                    {[
                      { label: 'Total Doctors', value: doctors.length, icon: 'stethoscope', color: 'text-blue-600' },
                      { label: 'Total Patients', value: patients.length, icon: 'groups', color: 'text-emerald-600' },
                      { label: 'Total Beds', value: totalBeds, icon: 'bed', color: 'text-violet-600' },
                      { label: 'Occupied', value: occupiedBeds, icon: 'hotel_class', color: 'text-amber-600' },
                      { label: 'Total Appointments', value: appointments.length, icon: 'event', color: 'text-rose-600' },
                      { label: 'Revenue', value: formatCompactInr(totalDepartmentRevenue), icon: 'payments', color: 'text-green-600' },
                      { label: 'Departments', value: departmentStats?.length || '16', icon: 'account_balance', color: 'text-cyan-600' },
                      { label: 'Rating', value: '4.8/5', icon: 'star', color: 'text-yellow-600' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-outline-variant dark:border-outline p-3 bg-surface-container-lowest dark:bg-[#0f172a] w-full min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-base ${stat.color}`}>{stat.icon}</span>
                          <p className="text-xs text-on-surface-variant truncate">{stat.label}</p>
                        </div>
                        <p className="text-lg font-bold text-on-surface dark:text-white mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {departmentStats && departmentStats.length > 0 && (
                  <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline w-full min-w-0">
                    <h2 className="text-headline-md font-bold text-on-surface dark:text-white mb-3">Department Stats</h2>
                    <div className="overflow-x-auto w-full min-w-0">
                      <table className="w-full text-xs min-w-[600px]">
                        <thead>
                          <tr className="border-b border-outline-variant dark:border-outline">
                            <th className="text-left py-2 px-2 font-bold text-on-surface-variant">Department</th>
                            <th className="text-center py-2 px-2 font-bold text-on-surface-variant">Patients</th>
                            <th className="text-center py-2 px-2 font-bold text-on-surface-variant">Doctors</th>
                            <th className="text-center py-2 px-2 font-bold text-on-surface-variant">Beds</th>
                            <th className="text-center py-2 px-2 font-bold text-on-surface-variant">Occupied</th>
                            <th className="text-right py-2 px-2 font-bold text-on-surface-variant">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {departmentStats.map((dept, i) => (
                            <tr key={i} className="border-b border-outline-variant/30 dark:border-outline/30 hover:bg-surface-container-lowest dark:hover:bg-[#0f172a] transition-colors">
                              <td className="py-2.5 px-2 font-bold text-on-surface dark:text-white">{dept.name}</td>
                              <td className="text-center py-2.5 px-2 text-on-surface-variant">{dept.patients || dept.patientCount || 0}</td>
                              <td className="text-center py-2.5 px-2 text-on-surface-variant">{dept.doctors || dept.doctorCount || 0}</td>
                              <td className="text-center py-2.5 px-2 text-on-surface-variant">{dept.beds || 0}</td>
                              <td className="text-center py-2.5 px-2 text-on-surface-variant">{dept.occupied || 0}</td>
                              <td className="text-right py-2.5 px-2 font-bold text-primary">{formatCompactInr(dept.revenue || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </div>

              <div className="col-span-1 lg:col-span-4 space-y-4 w-full min-w-0">
                <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline w-full min-w-0">
                  <h2 className="text-headline-md font-bold text-on-surface dark:text-white mb-3">Bed Occupancy</h2>
                  <BedOccupancyPanel />
                </section>

                <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline w-full min-w-0">
                  <div className="flex items-center justify-between mb-3 w-full min-w-0">
                    <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Admitted Patients</h2>
                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-lg">{inPatients.length}</span>
                  </div>
                  <div className="space-y-2 w-full min-w-0">
                    {inPatients.length ? inPatients.slice(0, 5).map((patient) => (
                      <div key={patient.id} className="rounded-xl border border-outline-variant dark:border-outline p-3 bg-surface-container-lowest dark:bg-[#0f172a] w-full min-w-0 cursor-pointer hover:border-primary/50 transition-all" onClick={() => { setSelectedPatient(patient); setActivePanel('patients'); }}>
                        <div className="flex items-center gap-3 w-full min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            patient.status === 'Emergency' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                          }`}>{patient.name?.charAt(0)}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-on-surface dark:text-white truncate">{patient.name}</p>
                            <p className="text-[10px] text-on-surface-variant truncate">{patient.ward} &bull; {patient.condition}</p>
                          </div>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shrink-0">{patient.status}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="py-8 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-2xl mb-1 opacity-30">bed</span>
                        <p className="text-xs">No admitted patients</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline w-full min-w-0 max-w-full">
        <AIDiagnosticAssistant />
      </section>
    </div>
  );
}
