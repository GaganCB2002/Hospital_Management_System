import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useHospital } from '../../../context/HospitalContext';
import { formatDateTime, formatInr } from '../../../lib/formatters';
import RevenueChart from '../../../components/charts/RevenueChart';
import DepartmentChart from '../../../components/charts/DepartmentChart';
import BedOccupancyChart from '../../../components/charts/BedOccupancyChart';
import PatientGrowthChart from '../../../components/charts/PatientGrowthChart';
import AppointmentTrendsChart from '../../../components/charts/AppointmentTrendsChart';
import { diseaseStats as seedDiseaseStats, operationTheatre } from '../../../mock/data';
import { QRCodeCanvas } from 'qrcode.react';

const ADMIN_TASKS_KEY = 'curepulse_admin_tasks';
const ADMIN_NOTES_KEY = 'curepulse_admin_notes';

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function StatCard({ title, value, subtitle, icon, color, action, trend }) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={action}
      className="relative rounded-2xl border border-outline-variant bg-surface p-5 text-left shadow-sm transition-all hover:shadow-md w-full min-w-0 overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 -translate-y-8 translate-x-8 transition-transform group-hover:scale-150 ${color}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-md uppercase text-on-surface-variant tracking-wider">{title}</span>
          {icon && <span className={`material-symbols-outlined text-xl ${color ? color.replace('bg-', 'text-').replace('/10', '') : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>}
        </div>
        <h2 className="text-display-lg text-on-surface font-extrabold tracking-tight">{value}</h2>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-body-md text-on-surface-variant">{subtitle}</p>
          {trend && (
            <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-success' : 'text-error'}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default function AdminDashboard() {
  const { doctors, patients, appointments, billing, activityFeed, revenueData, departmentStats, bedOccupancy, inventory, updatePatient, deletePatient } = useHospital();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(() => loadFromStorage(ADMIN_TASKS_KEY, []));
  const [notes, setNotes] = useState(() => loadFromStorage(ADMIN_NOTES_KEY, []));
  const [newTaskText, setNewTaskText] = useState('');
  const [shiftNoteText, setShiftNoteText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWard, setFilterWard] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const taskInputRef = useRef(null);
  const noteInputRef = useRef(null);

  useEffect(() => { localStorage.setItem(ADMIN_TASKS_KEY, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(ADMIN_NOTES_KEY, JSON.stringify(notes)); }, [notes]);

  useEffect(() => { if (showTaskInput && taskInputRef.current) taskInputRef.current.focus(); }, [showTaskInput]);
  useEffect(() => { if (showNoteInput && noteInputRef.current) noteInputRef.current.focus(); }, [showNoteInput]);

  const addTask = () => {
    if (!newTaskText.trim()) return toast.error('Enter a task');
    setTasks(prev => [...prev, { id: Date.now().toString(), text: newTaskText.trim(), done: false, createdAt: new Date().toISOString() }]);
    setNewTaskText('');
    setShowTaskInput(false);
    toast.success('Task added');
  };

  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const addShiftNote = () => {
    if (!shiftNoteText.trim()) return toast.error('Enter a note');
    setNotes(prev => [...prev, { id: Date.now().toString(), text: shiftNoteText.trim(), createdAt: new Date().toISOString(), author: 'Admin' }]);
    setShiftNoteText('');
    setShowNoteInput(false);
    toast.success('Note added');
  };

  const clearTasks = () => {
    if (tasks.length === 0) return;
    const allDone = tasks.every(t => t.done);
    if (allDone) {
      setTasks([]);
      toast.success('All tasks cleared');
    } else {
      toast.error('Complete all tasks first, or delete them individually');
    }
  };

  const paidRevenue = billing.filter((invoice) => invoice.status === 'Paid').reduce((sum, invoice) => sum + invoice.amount, 0);

  const icuPatients = useMemo(() =>
    patients.filter(p => p.ward === 'ICU' || p.ward?.toLowerCase().includes('icu') || p.department === 'Intensive Care'),
  [patients]);

  const emergencyPatients = useMemo(() =>
    patients.filter(p => p.status === 'Emergency' || p.condition === 'Critical'),
  [patients]);

  const dashboardCards = [
    {
      title: 'Total Patients', value: patients.length, subtitle: 'Active hospital records',
      icon: 'patient_list', color: 'bg-primary', trend: `+${Math.floor(patients.length * 0.12)}%`,
      action: () => navigate('/admin/patients'),
    },
    {
      title: 'Available Doctors', value: doctors.filter((doctor) => doctor.status === 'Available').length,
      subtitle: `${doctors.length} on roster`, icon: 'stethoscope', color: 'bg-secondary',
      trend: `${doctors.filter(d => d.status !== 'Available').length} occupied`,
      action: () => navigate('/admin/doctors'),
    },
    {
      title: 'Pending Approvals', value: appointments.filter((a) => a.status === 'Pending').length,
      subtitle: 'Awaiting action', icon: 'pending_actions', color: 'bg-warning',
      action: () => navigate('/admin/doctors'),
    },
    {
      title: 'Revenue Collected', value: formatInr(paidRevenue), subtitle: 'Paid invoices',
      icon: 'payments', color: 'bg-success',
      trend: `${billing.filter(b => b.status === 'Paid').length}/${billing.length} invoices`,
      action: () => navigate('/admin/financials'),
    },
  ];

  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => ['Pending', 'Confirmed'].includes(a.status)).slice(0, 5),
    [appointments],
  );

  const inventorySummary = useMemo(() => {
    const items = inventory || [];
    return { total: items.length, critical: items.filter(i => i.status === 'Critical'), low: items.filter(i => i.status === 'Low'), normal: items.filter(i => i.status === 'Normal') };
  }, [inventory]);

  const patientGrowth = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => {
      const monthPatients = patients.filter(p => {
        if (!p.admittedDate) return false;
        const d = new Date(p.admittedDate);
        return d.getMonth() === i;
      });
      return { month, admissions: monthPatients.length || (i * 3 + 8), discharges: Math.max(0, (monthPatients.length || i * 4 + 5) - Math.floor(i * 1.5)) };
    });
  }, [patients]);

  const appointmentTrends = useMemo(() => {
    const deptMap = {};
    appointments.forEach(a => {
      const dept = a.department || 'General';
      if (!deptMap[dept]) deptMap[dept] = { department: dept, confirmed: 0, pending: 0, completed: 0 };
      if (a.status === 'Confirmed') deptMap[dept].confirmed += 1;
      else if (a.status === 'Pending') deptMap[dept].pending += 1;
      else if (a.status === 'Completed') deptMap[dept].completed += 1;
    });
    return Object.values(deptMap).slice(0, 8);
  }, [appointments]);

  const todaySurgery = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return (operationTheatre || []).filter(o => o.date === today).slice(0, 5);
  }, []);

  const totalEmployees = doctors.length;
  const presentEmployees = doctors.filter(doctor => doctor.status !== 'On Leave' && doctor.status !== 'Leave').length;
  const leaveEmployees = doctors.filter(doctor => doctor.status === 'On Leave' || doctor.status === 'Leave').length;
  const inSurgeryEmployees = doctors.filter(doctor => doctor.status === 'In-Surgery').length;
  const onCallEmployees = doctors.filter(doctor => doctor.status === 'On-Call').length;
  const availableEmployees = doctors.filter(doctor => doctor.status === 'Available').length;
  const presenceRate = totalEmployees ? Math.round((presentEmployees / totalEmployees) * 100) : 0;

  const criticalItems = useMemo(() => (inventory || []).filter(i => i.status === 'Critical' || i.status === 'Low').slice(0, 5), [inventory]);

  const handleDownload = (reportName) => {
    downloadReport(reportName, patients, billing);
  };

  const handleViewPatient = (patient) => {
    if (selectedPatient?.id === patient.id) {
      setSelectedPatient(null);
    } else {
      setSelectedPatient(patient);
    }
  };

  const handleDischarge = () => {
    if (!selectedPatient) return;
    updatePatient(selectedPatient.id, { status: 'Discharged', condition: 'Recovering' });
    toast.success(`${selectedPatient.name} discharged`);
    setSelectedPatient(null);
  };

  const handleDelete = () => {
    if (!selectedPatient) return;
    deletePatient(selectedPatient.id);
    toast.success(`${selectedPatient.name} record deleted`);
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full pb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 w-full min-w-0 max-w-full">
        {dashboardCards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Emergency Alert Section */}
      {emergencyPatients.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#fecdd3]/40 bg-gradient-to-r from-[#fff1f2] to-[#fef2f2] dark:from-rose-950/20 dark:to-rose-900/10 p-5 shadow-sm w-full min-w-0 max-w-full">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 bg-rose-400 rounded-full animate-ping" />
            <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
              Emergency Alert
            </h2>
            <span className="text-[10px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold">{emergencyPatients.length} active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {emergencyPatients.map(p => (
              <div key={p.id} onClick={() => handleViewPatient(p)}
                className="bg-white/60 dark:bg-rose-950/20 rounded-xl p-4 border border-rose-200/50 dark:border-rose-800/30 hover:border-rose-300 dark:hover:border-rose-700/50 cursor-pointer transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse shrink-0" />
                      <p className="text-sm font-bold text-rose-800 dark:text-rose-300 truncate">{p.name}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 shrink-0">{p.condition}</span>
                    </div>
                    <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-0.5">{p.ward} · {p.department} · {p.doctor}</p>
                    <p className="text-[10px] text-rose-600/70 dark:text-rose-400/70 mt-0.5">Blood: {p.bloodType} {p.allergies?.filter(a => a !== 'None').length > 0 ? `· Allergies: ${p.allergies.filter(a => a !== 'None').join(', ')}` : ''}</p>
                  </div>
                  <span className="text-[10px] text-rose-500 shrink-0 mt-1 whitespace-nowrap">View →</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Row 1 - Revenue + Department */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr,0.7fr] w-full min-w-0 max-w-full">
        <div className="w-full min-w-0 max-w-full"><RevenueChart data={revenueData} /></div>
        <div className="w-full min-w-0 max-w-full"><DepartmentChart data={departmentStats} /></div>
      </div>

      {/* Charts Row 2 - Patient Growth + Appointment Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,1fr] w-full min-w-0 max-w-full">
        <div className="w-full min-w-0 max-w-full"><PatientGrowthChart data={patientGrowth} /></div>
        <div className="w-full min-w-0 max-w-full"><AppointmentTrendsChart data={appointmentTrends} /></div>
      </div>

      {/* ICU & Critical Patients + Tasks + Shift Notes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr,0.8fr] w-full min-w-0 max-w-full">
        {/* ICU / Critical Patients */}
        <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm w-full min-w-0 max-w-full">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
              <h2 className="text-headline-md text-on-surface">ICU & Critical Care</h2>
              <span className="bg-error/10 text-error text-xs font-bold px-2 py-0.5 rounded-full">{icuPatients.length} patients</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-on-surface-variant">search</span>
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search patients..." className="w-36 pl-7 pr-2.5 py-1.5 text-[11px] rounded-lg bg-surface-container-low text-on-surface border border-outline-variant outline-none focus:border-primary placeholder:text-on-surface-variant/50" />
              </div>
              <select value={filterWard} onChange={e => setFilterWard(e.target.value)}
                className="px-2.5 py-1.5 text-[11px] rounded-lg bg-surface-container-low text-on-surface border border-outline-variant outline-none focus:border-primary">
                <option value="all">All Wards</option>
                {[...new Set(patients.map(p => p.ward).filter(Boolean))].map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {[...icuPatients, ...emergencyPatients.filter(p => !icuPatients.find(ip => ip.id === p.id))]
              .filter(p => filterWard === 'all' || p.ward === filterWard)
              .filter(p => !searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.id?.toLowerCase().includes(searchTerm.toLowerCase()) || p.doctor?.toLowerCase().includes(searchTerm.toLowerCase()))
              .slice(0, 10).map(p => (
              <div key={p.id} onClick={() => handleViewPatient(p)}
                className="flex items-start justify-between p-3 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-error/30 hover:shadow-sm cursor-pointer transition-all">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse shrink-0" />
                    <p className="text-body-md font-bold text-on-surface truncate">{p.name}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      p.condition === 'Critical' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
                    }`}>{p.condition}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-on-surface-variant">
                    <span>Ward: {p.ward}</span>
                    <span>·</span>
                    <span>Dr. {p.doctor}</span>
                    <span>·</span>
                    <span>{p.department}</span>
                  </div>
                  {p.notes && <p className="text-xs text-on-surface-variant mt-1 truncate">{p.notes}</p>}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{p.bloodType}</span>
                    {p.allergies?.filter(a => a !== 'None').length > 0 && (
                      <span className="text-[9px] bg-error/10 text-error px-1.5 py-0.5 rounded">⚠ {p.allergies.filter(a => a !== 'None').join(', ')}</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-primary shrink-0 mt-1">View →</span>
              </div>
            ))}
            {icuPatients.length === 0 && emergencyPatients.length === 0 && (
              <p className="text-body-md text-on-surface-variant text-center py-6">No ICU or critical patients currently</p>
            )}
          </div>
        </section>

        <div className="space-y-6 w-full min-w-0 max-w-full">
          {/* Task List */}
          <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm w-full min-w-0 max-w-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>checklist</span>
              <h2 className="text-headline-md text-on-surface">Task List</h2>
              {tasks.length > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                  {tasks.filter(t => !t.done).length}/{tasks.length} pending
                </span>
              )}
              <button onClick={() => { setShowTaskInput(true); setTimeout(() => taskInputRef.current?.focus(), 50); }}
                className="ml-1 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all cursor-pointer border-none shrink-0"
                title="Add Task">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              </button>
              {tasks.length > 0 && (
                <button onClick={clearTasks} className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-all cursor-pointer border-none shrink-0" title="Clear completed">
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                </button>
              )}
            </div>
            <AnimatePresence>
              {showTaskInput && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 mb-3 overflow-hidden">
                  <input ref={taskInputRef} type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Enter task description..." className="flex-1 px-3 py-2 text-xs rounded-xl bg-surface-container-low text-on-surface border border-outline-variant outline-none focus:border-primary"
                    onKeyDown={(e) => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') { setShowTaskInput(false); setNewTaskText(''); } }} />
                  <button onClick={addTask} className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 cursor-pointer border-none whitespace-nowrap">Add</button>
                  <button onClick={() => { setShowTaskInput(false); setNewTaskText(''); }} className="px-2 py-2 rounded-xl bg-surface-container-high text-on-surface-variant text-xs hover:bg-surface-container-high/80 cursor-pointer border-none">Cancel</button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {tasks.length > 0 ? tasks.slice().reverse().map(task => (
                <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-container-low transition-colors group">
                  <button onClick={() => toggleTask(task.id)}
                    className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer bg-transparent ${task.done ? 'bg-primary border-primary' : 'border-outline-variant hover:border-primary'}`}>
                    {task.done && <span className="material-symbols-outlined text-[8px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                  </button>
                  <span className={`flex-1 text-xs min-w-0 ${task.done ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{task.text}</span>
                  {task.done && <span className="text-[9px] text-success shrink-0">done</span>}
                  <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-error/60 hover:text-error cursor-pointer bg-transparent border-none text-xs">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              )) : (
                <p className="text-xs text-on-surface-variant text-center py-4">No tasks — click + to add one</p>
              )}
            </div>
          </section>

          {/* Shift Notes */}
          <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm w-full min-w-0 max-w-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>note_stack</span>
              <h2 className="text-headline-md text-on-surface">Shift Notes</h2>
              {notes.length > 0 && (
                <span className="text-[10px] text-on-surface-variant ml-auto">{notes.length} notes</span>
              )}
              <button onClick={() => { setShowNoteInput(true); setTimeout(() => noteInputRef.current?.focus(), 50); }}
                className="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center hover:bg-secondary/90 transition-all cursor-pointer border-none shrink-0"
                title="Add Note">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              </button>
            </div>
            <AnimatePresence>
              {showNoteInput && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 mb-3 overflow-hidden">
                  <input ref={noteInputRef} type="text" value={shiftNoteText} onChange={(e) => setShiftNoteText(e.target.value)}
                    placeholder="Enter shift note..." className="flex-1 px-3 py-2 text-xs rounded-xl bg-surface-container-low text-on-surface border border-outline-variant outline-none focus:border-secondary"
                    onKeyDown={(e) => { if (e.key === 'Enter') addShiftNote(); if (e.key === 'Escape') { setShowNoteInput(false); setShiftNoteText(''); } }} />
                  <button onClick={addShiftNote} className="px-3 py-2 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 cursor-pointer border-none whitespace-nowrap">Add</button>
                  <button onClick={() => { setShowNoteInput(false); setShiftNoteText(''); }} className="px-2 py-2 rounded-xl bg-surface-container-high text-on-surface-variant text-xs hover:bg-surface-container-high/80 cursor-pointer border-none">Cancel</button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {notes.length > 0 ? notes.slice(-5).reverse().map(note => (
                <div key={note.id} className="p-2 rounded-lg bg-surface-container-low">
                  <p className="text-xs text-on-surface">{note.text}</p>
                  <p className="text-[9px] text-on-surface-variant mt-0.5">{note.author} · {new Date(note.createdAt).toLocaleTimeString()}</p>
                </div>
              )) : (
                <p className="text-xs text-on-surface-variant text-center py-4">No notes — click + to add one</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Patient Detail Panel */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="rounded-2xl border border-outline-variant bg-surface shadow-sm overflow-hidden w-full min-w-0 max-w-full">
            {/* Header */}
            <div className="flex items-start justify-between p-5 bg-gradient-to-r from-primary/5 to-transparent border-b border-outline-variant">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="shrink-0">
                  <QRCodeCanvas value={selectedPatient.id} size={72} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-on-surface">{selectedPatient.name}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedPatient.status === 'Emergency' ? 'bg-error/10 text-error animate-pulse' : selectedPatient.status === 'Discharged' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>{selectedPatient.status}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedPatient.condition === 'Critical' ? 'bg-error/10 text-error' : selectedPatient.condition === 'Recovering' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>{selectedPatient.condition}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{selectedPatient.id} · {selectedPatient.ward} · {selectedPatient.department} · Dr. {selectedPatient.doctor}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{selectedPatient.age} yrs · {selectedPatient.gender} · {selectedPatient.bloodType} · Admitted: {selectedPatient.admittedDate}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {selectedPatient.status !== 'Discharged' && (
                  <>
                    <button onClick={handleDischarge} className="px-3 py-1.5 rounded-xl bg-success/15 text-success text-xs font-bold hover:bg-success/25 cursor-pointer border-none flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span> Discharge
                    </button>
                    <button onClick={handleDelete} className="px-3 py-1.5 rounded-xl bg-error/10 text-error text-xs font-bold hover:bg-error/20 cursor-pointer border-none flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">delete</span> Delete
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedPatient(null)} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant cursor-pointer border-none bg-transparent">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-outline-variant">
              {[
                { label: 'Consulting Doctor', value: `Dr. ${selectedPatient.doctor}`, icon: 'stethoscope' },
                { label: 'Department', value: selectedPatient.department, icon: 'local_hospital' },
                { label: 'Ward / Room', value: selectedPatient.ward, icon: 'bed' },
                { label: 'Blood Type', value: selectedPatient.bloodType, icon: 'bloodtype' },
                { label: 'Condition', value: selectedPatient.condition, icon: 'monitor_heart' },
                { label: 'Age / Gender', value: `${selectedPatient.age} yrs / ${selectedPatient.gender}`, icon: 'badge' },
                { label: 'Insurance', value: selectedPatient.insuranceProvider || 'N/A', icon: 'verified' },
                { label: 'Emergency Contact', value: selectedPatient.emergencyContact?.name || 'N/A', icon: 'contact_phone' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-outline-variant p-3 bg-surface-container-lowest">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm text-primary">{item.icon}</span>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{item.label}</p>
                  </div>
                  <p className="text-sm font-bold text-on-surface">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Medical Info */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-on-surface mb-1">Medical Notes</h3>
                  <p className="text-xs text-on-surface-variant bg-surface-container-low rounded-xl p-3">{selectedPatient.notes || 'No notes recorded'}</p>
                </div>
                {selectedPatient.allergies?.filter(a => a !== 'None').length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-on-surface mb-1">Allergies</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.allergies.filter(a => a !== 'None').map((a, i) => (
                        <span key={i} className="text-[10px] bg-error/10 text-error px-2 py-0.5 rounded-full font-semibold">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPatient.prescriptions?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-on-surface mb-1">Prescriptions</h3>
                    <div className="space-y-1">
                      {selectedPatient.prescriptions.slice(0, 5).map((med, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low text-xs">
                          <div>
                            <p className="font-semibold text-on-surface">{med.medication}</p>
                            <p className="text-on-surface-variant">{med.dosage} · {med.frequency}</p>
                          </div>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${med.status === 'Active' ? 'bg-success/10 text-success' : 'bg-surface-container-high text-on-surface-variant'}`}>{med.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-on-surface mb-1">Insurance Details</h3>
                  <div className="rounded-xl bg-surface-container-low p-3 text-xs space-y-1">
                    <p className="text-on-surface-variant">Provider: <span className="font-semibold text-on-surface">{selectedPatient.insuranceProvider || 'N/A'}</span></p>
                    <p className="text-on-surface-variant">Policy: <span className="font-semibold text-on-surface">{selectedPatient.insurancePolicy || 'N/A'}</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface mb-1">Emergency Contact</h3>
                  <div className="rounded-xl bg-surface-container-low p-3 text-xs space-y-1">
                    <p className="text-on-surface-variant">Name: <span className="font-semibold text-on-surface">{selectedPatient.emergencyContact?.name || 'N/A'}</span></p>
                    <p className="text-on-surface-variant">Relation: <span className="font-semibold text-on-surface">{selectedPatient.emergencyContact?.relation || 'N/A'}</span></p>
                    <p className="text-on-surface-variant">Phone: <span className="font-semibold text-on-surface">{selectedPatient.emergencyContact?.phone || 'N/A'}</span></p>
                  </div>
                </div>
                {selectedPatient.vitals?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-on-surface mb-1">Latest Vitals</h3>
                    <div className="rounded-xl bg-surface-container-low p-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedPatient.vitals[selectedPatient.vitals.length - 1]).filter(([k]) => k !== 'date' && k !== 'time').slice(0, 6).map(([key, val]) => (
                          <div key={key}>
                            <p className="text-on-surface-variant capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="font-semibold text-on-surface">{val}</p>
                          </div>
                        ))}
                      </div>
                      {selectedPatient.vitals[selectedPatient.vitals.length - 1].date && (
                        <p className="text-[9px] text-on-surface-variant mt-2">{selectedPatient.vitals[selectedPatient.vitals.length - 1].date} {selectedPatient.vitals[selectedPatient.vitals.length - 1].time}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bed Occupancy + Inventory Summary Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr,0.7fr] w-full min-w-0 max-w-full">
        <div className="w-full min-w-0 max-w-full"><BedOccupancyChart data={bedOccupancy} /></div>

        {/* Inventory Status */}
        <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm w-full min-w-0 max-w-full">
          <div className="flex items-center justify-between mb-4 w-full min-w-0">
            <div className="min-w-0 flex-1">
              <h2 className="text-headline-md text-on-surface">Inventory Status</h2>
              <p className="text-body-md text-on-surface-variant">Medical supplies & medications</p>
            </div>
            <button onClick={() => navigate('/admin/inventory')} className="text-body-md font-bold text-primary shrink-0 hover:underline cursor-pointer bg-transparent border-none">View All</button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl bg-surface-container-lowest border border-outline-variant p-3 text-center">
              <p className="text-2xl font-black text-success">{inventorySummary.normal.length}</p>
              <p className="text-label-md text-on-surface-variant mt-0.5">Normal</p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest border border-outline-variant p-3 text-center">
              <p className="text-2xl font-black text-warning">{inventorySummary.low.length}</p>
              <p className="text-label-md text-on-surface-variant mt-0.5">Low Stock</p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest border border-outline-variant p-3 text-center">
              <p className="text-2xl font-black text-error">{inventorySummary.critical.length}</p>
              <p className="text-label-md text-on-surface-variant mt-0.5">Critical</p>
            </div>
          </div>
          <div className="space-y-2 w-full min-w-0">
            {criticalItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant w-full min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-body-md font-bold text-on-surface truncate">{item.name}</p>
                  <p className="text-label-md text-on-surface-variant">{item.stock} {item.unit} · Threshold {item.threshold}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${item.status === 'Critical' ? 'bg-error-container text-error' : 'bg-warning-container text-warning-on-container'}`}>{item.status}</span>
              </div>
            ))}
            {criticalItems.length === 0 && <p className="text-body-md text-on-surface-variant text-center py-4">All inventory items are at normal levels.</p>}
          </div>
        </section>
      </div>

      {/* Workforce Availability */}
      <section className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm w-full min-w-0 max-w-full">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-outline-variant pb-4 w-full min-w-0 max-w-full">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              <h2 className="text-headline-md text-on-surface">Workforce Availability & Attendance</h2>
            </div>
            <p className="text-body-md text-on-surface-variant">Real-time status of hospital roster, active staff duty, and leave records.</p>
          </div>
          <button type="button" onClick={() => navigate('/admin/employees')} className="rounded-xl bg-primary px-4 py-2 text-body-md font-bold text-on-primary transition-all hover:bg-primary/95 shrink-0 cursor-pointer border-none">Manage Roster</button>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 md:grid-cols-5 w-full min-w-0 max-w-full">
          {[
            { label: 'Total', value: totalEmployees, color: 'text-on-surface' },
            { label: 'Present', value: presentEmployees, color: 'text-secondary' },
            { label: 'Available', value: availableEmployees, color: 'text-on-surface' },
            { label: 'On Call', value: onCallEmployees, color: 'text-on-surface' },
            { label: 'On Leave', value: leaveEmployees, color: 'text-error' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-outline-variant p-4 bg-surface-container-lowest w-full min-w-0">
              <p className="text-xs uppercase text-on-surface-variant tracking-wider">{stat.label}</p>
              <h3 className={`mt-1 text-headline-lg font-bold ${stat.color}`}>{stat.value}</h3>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-xl bg-surface-container-low border border-outline-variant w-full min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-md font-bold text-on-surface">Staff Roster Attendance Rate</span>
            <span className="text-body-md font-bold text-secondary">{presenceRate}% Active</span>
          </div>
          <div className="w-full bg-outline-variant/30 h-3 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${presenceRate}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-secondary to-success rounded-full" />
          </div>
          <p className="mt-3 text-body-md text-on-surface-variant leading-relaxed w-full min-w-0">
            <strong>Workforce Analysis:</strong> Out of {totalEmployees} registered employees, {presentEmployees} are present on active duty today ({availableEmployees} Available, {inSurgeryEmployees} in Surgery, {onCallEmployees} on emergency On-Call). {leaveEmployees} employee(s) on leave. Efficiency at <strong>{presenceRate}%</strong>.
          </p>
        </div>
        <div className="mt-6 w-full min-w-0">
          <h4 className="text-body-md font-bold text-on-surface mb-3">Live Roster Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full min-w-0">
            {doctors.map(doctor => (
              <div key={doctor.id} className="flex items-center justify-between p-3 rounded-xl border border-outline-variant bg-surface-container-lowest w-full min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img src={doctor.avatar} alt={doctor.name} className="h-10 w-10 rounded-full border border-outline-variant bg-surface object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md font-bold text-on-surface truncate">{doctor.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{doctor.role || 'Doctor'} · {doctor.department}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0 ${
                  doctor.status === 'Available' ? 'bg-secondary/15 text-secondary' :
                  doctor.status === 'In-Surgery' ? 'bg-error-container text-error' :
                  doctor.status === 'On-Call' ? 'bg-primary/15 text-primary' :
                  doctor.status === 'On Leave' || doctor.status === 'Leave' ? 'bg-warning-container text-warning-on-container' :
                  'bg-surface-container-high text-on-surface-variant'
                }`}>{doctor.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appointments + Daily Reports */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr,0.7fr] w-full min-w-0 max-w-full">
        <section className="rounded-2xl border border-outline-variant bg-surface shadow-sm w-full min-w-0 max-w-full">
          <div className="flex items-center justify-between border-b border-outline-variant p-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                <h2 className="text-headline-md text-on-surface">Appointments Overview</h2>
              </div>
              <p className="text-body-md text-on-surface-variant">Upcoming appointments with direct access to the workflow queue.</p>
            </div>
            <button type="button" onClick={() => navigate('/admin/doctors')} className="text-body-md font-bold text-on-surface shrink-0 cursor-pointer bg-transparent border-none hover:underline">View Calendar</button>
          </div>
          <div className="overflow-x-auto p-5 w-full min-w-0">
            <table className="min-w-[760px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Patient</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Doctor</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Date & Time</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Department</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-outline-variant/40">
                    <td className="px-3 py-4 text-body-md font-bold text-on-surface whitespace-nowrap">{appointment.patient}</td>
                    <td className="px-3 py-4 text-body-md text-on-surface whitespace-nowrap">{appointment.doctor}</td>
                    <td className="px-3 py-4 text-body-md text-on-surface-variant whitespace-nowrap">{formatDateTime(appointment.date, appointment.time)}</td>
                    <td className="px-3 py-4 text-body-md text-on-surface whitespace-nowrap">{appointment.department}</td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-3 py-1 text-label-md whitespace-nowrap ${appointment.status === 'Pending' ? 'bg-pending-bg text-pending-text' : 'bg-secondary/15 text-secondary'}`}>{appointment.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm w-full min-w-0 max-w-full">
          <h2 className="text-headline-md text-on-surface">Daily Reports</h2>
          <div className="mt-4 space-y-3 w-full min-w-0">
            {[
              { name: 'Patient Census Report', icon: 'assessment' },
              { name: 'Financial Summary', icon: 'account_balance' },
              { name: 'Inventory Snapshot', icon: 'inventory_2' },
            ].map((report) => (
              <motion.button key={report.name} whileHover={{ scale: 1.01 }} type="button"
                onClick={() => handleDownload(report.name)}
                className="w-full min-w-0 rounded-xl border border-outline-variant px-4 py-3.5 text-left transition-all hover:bg-surface-container-low hover:shadow-sm flex items-center gap-3 cursor-pointer bg-transparent">
                <span className="material-symbols-outlined text-primary shrink-0">description</span>
                <div className="min-w-0 flex-1">
                  <p className="text-body-md font-bold text-on-surface">{report.name}</p>
                  <p className="text-body-md text-on-surface-variant">Download latest report</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant shrink-0">download</span>
              </motion.button>
            ))}
          </div>
        </section>
      </div>

      {/* Hospital Activity + Quick Actions + OT Schedule */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,0.6fr,0.6fr] w-full min-w-0 max-w-full">
        <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm w-full min-w-0 max-w-full">
          <div className="flex items-center justify-between w-full min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              <h2 className="text-headline-md text-on-surface min-w-0">Hospital Activity</h2>
            </div>
            <button type="button" onClick={() => navigate('/admin/settings')} className="text-body-md font-bold text-on-surface shrink-0 cursor-pointer bg-transparent border-none hover:underline">Audit Logs</button>
          </div>
          <div className="mt-4 space-y-3 w-full min-w-0">
            {activityFeed.slice(0, 5).map((feed) => (
              <motion.div key={feed.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-outline-variant p-4 w-full min-w-0 hover:bg-surface-container-low transition-colors">
                <div className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-lg shrink-0 mt-0.5 ${
                    feed.type === 'admission' ? 'text-primary' :
                    feed.type === 'billing' ? 'text-success' :
                    feed.type === 'discharge' ? 'text-warning' :
                    feed.type === 'medication' ? 'text-info' : 'text-on-surface-variant'
                  }`} style={{ fontVariationSettings: "'FILL' 1" }}>{feed.icon || 'circle'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md text-on-surface">{feed.message}</p>
                    <p className="mt-1 text-label-md text-on-surface-variant">{feed.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Operation Theatre Schedule */}
        <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm w-full min-w-0 max-w-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>surgery</span>
            <h2 className="text-headline-md text-on-surface">Today's OT</h2>
          </div>
          {todaySurgery.length > 0 ? (
            <div className="space-y-3 w-full min-w-0">
              {todaySurgery.map((surgery) => (
                <div key={surgery.id} className="rounded-xl border border-outline-variant p-3 bg-surface-container-lowest w-full min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-body-md font-bold text-on-surface truncate min-w-0">{surgery.patient}</p>
                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                      surgery.priority === 'Emergency' ? 'bg-error-container text-error' :
                      surgery.priority === 'Urgent' ? 'bg-warning-container text-warning-on-container' :
                      'bg-secondary/15 text-secondary'
                    }`}>{surgery.priority}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{surgery.procedure}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-on-surface-variant">
                    <span>{surgery.time}</span><span>·</span><span>{surgery.theatre}</span><span>·</span><span>{surgery.doctor}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-md text-on-surface-variant text-center py-6">No surgeries scheduled for today.</p>
          )}
          <button type="button" onClick={() => navigate('/admin/doctors')}
            className="mt-3 w-full rounded-xl border border-outline-variant py-2 text-body-md font-bold text-on-surface hover:bg-surface-container-low transition-colors text-center cursor-pointer bg-transparent">View Full Schedule</button>
        </section>

        {/* Quick Actions */}
        <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm w-full min-w-0 max-w-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <h2 className="text-headline-md text-on-surface">Quick Actions</h2>
          </div>
          <div className="space-y-3 w-full min-w-0">
            <motion.button whileHover={{ scale: 1.02 }} type="button" onClick={() => navigate('/admin/patients')}
              className="w-full rounded-xl bg-gradient-to-r from-[#5BA0A8] to-[#9ED0CE] px-4 py-3.5 text-body-md font-bold text-white shadow-sm hover:shadow-md transition-all cursor-pointer border-none flex items-center gap-3">
              <span className="material-symbols-outlined">patient_list</span> Open Patient Records
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} type="button" onClick={() => navigate('/admin/financials')}
              className="w-full rounded-xl bg-gradient-to-r from-[#F0C478] to-[#FDE4B8] px-4 py-3.5 text-body-md font-bold text-white shadow-sm hover:shadow-md transition-all cursor-pointer border-none flex items-center gap-3">
              <span className="material-symbols-outlined">account_balance</span> Review Billing Queue
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} type="button" onClick={() => navigate('/admin/emergency')}
              className="w-full rounded-xl bg-gradient-to-r from-[#D4877A] to-[#E8B4AA] px-4 py-3.5 text-body-md font-bold text-white shadow-sm hover:shadow-md transition-all cursor-pointer border-none flex items-center gap-3">
              <span className="material-symbols-outlined">warning</span> Emergency Center
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} type="button" onClick={() => navigate('/admin/settings')}
              className="w-full rounded-xl border border-outline-variant px-4 py-3 text-body-md font-bold text-on-surface hover:bg-surface-container-low transition-all cursor-pointer bg-transparent flex items-center gap-3">
              <span className="material-symbols-outlined">settings</span> Open Settings
            </motion.button>
          </div>
        </section>
      </div>

      {/* Disease Stats - Bottom Bar */}
      <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm w-full min-w-0 max-w-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
          <h2 className="text-headline-md text-on-surface">Disease Statistics</h2>
          <p className="text-body-md text-on-surface-variant">Top conditions across the hospital</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full min-w-0">
          {seedDiseaseStats.map((disease, i) => (
            <motion.div key={disease.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-outline-variant p-4 bg-surface-container-lowest w-full min-w-0 hover:shadow-sm transition-shadow">
              <p className="text-body-md font-bold text-on-surface">{disease.name}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-on-surface">{disease.cases}</span>
                <span className={`text-xs font-bold ${disease.trend.startsWith('+') ? 'text-error' : 'text-success'}`}>{disease.trend}</span>
              </div>
              <div className="mt-2 w-full h-1.5 rounded-full bg-outline-variant/30 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(disease.cases / 500) * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }} className={`h-full rounded-full ${i % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

function downloadReport(reportName, patients, billing) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(0, 53, 95);
  doc.text('CurePulse Hospital Management System', 14, 20);
  doc.setFontSize(14);
  doc.setTextColor(114, 119, 128);
  doc.text(reportName, 14, 30);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 38);
  doc.text(`Operator: Admin Portal`, 14, 44);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 48, 196, 48);

  if (reportName === 'Patient Census Report') {
    const tableColumn = ["Patient ID", "Name", "Age/Gender", "Ward/Dept", "Doctor", "Status", "Condition"];
    const tableRows = patients.map(p => [p.id, p.name, `${p.age} / ${p.gender}`, `${p.ward} (${p.department})`, p.doctor, p.status, p.condition]);
    doc.autoTable({ startY: 52, head: [tableColumn], body: tableRows, headStyles: { fillColor: [0, 53, 95] }, theme: 'striped' });
  } else if (reportName === 'Financial Summary') {
    const tableColumn = ["Invoice ID", "Patient", "Date", "Department", "Method", "Status", "Amount"];
    const tableRows = billing.map(b => [b.id, b.patient, b.date, b.department, b.method, b.status, `INR ${b.amount.toLocaleString('en-IN')}`]);
    const totalPaid = billing.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
    const totalPending = billing.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0);
    doc.autoTable({ startY: 52, head: [tableColumn], body: tableRows, headStyles: { fillColor: [0, 53, 95] }, theme: 'striped' });
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 107, 95);
    doc.text(`Total Paid Revenue: INR ${totalPaid.toLocaleString('en-IN')}`, 14, finalY);
    doc.setTextColor(110, 0, 29);
    doc.text(`Total Pending Collection: INR ${totalPending.toLocaleString('en-IN')}`, 14, finalY + 7);
  } else if (reportName === 'Inventory Snapshot') {
    const items = [];
    const tableColumn = ["Item Name", "Category", "Stock Level", "Threshold", "Status"];
    const tableRows = items.map(i => [i.name, i.category, `${i.stock} ${i.unit}`, i.threshold, i.status]);
    doc.autoTable({ startY: 52, head: [tableColumn], body: tableRows, headStyles: { fillColor: [0, 53, 95] }, theme: 'striped' });
  } else {
    doc.text("Generic report details summarized.", 14, 52);
  }
  doc.save(`${reportName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  toast.success(`${reportName} PDF Downloaded`);
}
