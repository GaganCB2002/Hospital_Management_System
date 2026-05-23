import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import ClinicalNotesCard, { NotesEmptyState } from '../../../components/common/ClinicalNotesCard';
import EmptyState from '../../../components/common/EmptyState';
import Modal from '../../../components/common/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import AppointmentDetailModal from '../../../components/details/AppointmentDetailModal';
import { useAuth } from '../../../context/AuthContext';
import { useHospital } from '../../../context/HospitalContext';
import { useTheme } from '../../../context/ThemeContext';
import { useNotifications } from '../../../context/NotificationContext';
import { formatDate, formatDateTime, formatInr } from '../../../lib/formatters';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { patients, appointments, billing, updateAppointment } = useHospital();
  const { addNotification } = useNotifications();
  
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('Cardiac / Chest Pain');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [isAlerting, setIsAlerting] = useState(false);
  const [alertDispatched, setAlertDispatched] = useState(false);

  const patient = useMemo(
    () => patients.find((entry) => entry.name === user?.name || entry.email === user?.email),
    [patients, user],
  );

  const myAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.patientId === patient?.id || appointment.patient === user?.name),
    [appointments, patient, user],
  );
  const upcomingAppointments = myAppointments.filter((appointment) => ['Pending', 'Confirmed', 'Checked In'].includes(appointment.status));
  const nextAppointment = upcomingAppointments[0] || null;
  const unpaidInvoices = billing.filter((invoice) => invoice.patientId === patient?.id && invoice.status === 'Pending');
  const appointmentStats = [
    { name: 'Pending', value: myAppointments.filter((appointment) => appointment.status === 'Pending').length, color: isDark ? '#F59E0B' : '#B7791F' },
    { name: 'Confirmed', value: myAppointments.filter((appointment) => appointment.status === 'Confirmed').length, color: '#0E8F6A' },
    { name: 'Completed', value: myAppointments.filter((appointment) => appointment.status === 'Completed').length, color: isDark ? '#60A5FA' : '#0F4C81' },
    { name: 'Rejected', value: myAppointments.filter((appointment) => appointment.status === 'Rejected').length, color: isDark ? '#EF4444' : '#D64545' },
  ];

  const availableSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  function openReschedule(appointment) {
    setRescheduleTarget(appointment);
    setRescheduleDate(appointment.date);
    setRescheduleTime(appointment.time);
    setRescheduleNotes('');
  }

  async function handleRescheduleSubmit(event) {
    event.preventDefault();
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('Please select a new date and time.');
      return;
    }
    setIsRescheduling(true);
    try {
      await updateAppointment(rescheduleTarget.appointmentId, {
        date: rescheduleDate,
        time: rescheduleTime,
        notes: rescheduleNotes ? `${rescheduleTarget.notes || ''} | Rescheduled: ${rescheduleNotes}` : rescheduleTarget.notes,
        status: 'Pending',
      }, user?.name || 'Patient');
      toast.success('Appointment rescheduled successfully');
      setRescheduleTarget(null);
    } catch {
      toast.error('Failed to reschedule appointment');
    } finally {
      setIsRescheduling(false);
    }
  }

  async function handleCancelAppointment() {
    try {
      await updateAppointment(cancelTarget.appointmentId, {
        status: 'Cancelled',
        notes: `${cancelTarget.notes || ''} | Cancelled by patient`,
      }, user?.name || 'Patient');
      toast.success('Appointment cancelled');
      setCancelTarget(null);
    } catch {
      toast.error('Failed to cancel appointment');
    }
  }

  function handleEmergencySubmit(event) {
    event.preventDefault();
    setIsAlerting(true);
    
    // Simulate telemetry and routing lag
    setTimeout(() => {
      setIsAlerting(false);
      setAlertDispatched(true);
      
      const doctorName = patient.assignedDoctor?.name || 'Dr. Sarah Chen';
      const reason = emergencyReason;
      const notes = emergencyNotes;
      const latestVitals = patient.vitalsTimeline?.[0] || null;

      // 1. Alert Receptionist
      addNotification({
        title: '🚨 CRITICAL EMERGENCY ALERT',
        shortDescription: `Patient ${patient.name} requested emergency assistance for ${reason}.`,
        details: `PATIENT PROFILE:\n- Name: ${patient.name}\n- Registered Email: ${patient.email}\n- Phone: ${patient.phone || '+91 98765 43210'}\n- Age/Gender: ${patient.age || '42'} / ${patient.gender || 'Male'}\n\nEMERGENCY DETAILS:\n- Primary Complaint: ${reason}\n- Patient Notes: "${notes || 'No additional details provided'}"\n- Current Vitals (EHR): HR: ${latestVitals?.heartRate || '74'} bpm, SpO2: ${latestVitals?.oxygen || '98'}%\n\nACTION REQUIRED:\n1. Contact patient at registered mobile.\n2. Coordinate ambulance dispatch immediately.\n3. Verify ER bed availability (Active Bed Occupancy: ER).`,
        type: 'emergency',
      });

      // 2. Alert Assigned Doctor
      addNotification({
        title: `🚨 PATIENT EMERGENCY: ${doctorName}`,
        shortDescription: `Your assigned patient ${patient.name} triggered a ${reason} alert.`,
        details: `ATTENTION: ${doctorName}\n\nPatient ${patient.name} has reported a critical emergency.\n\nCLINICAL STATUS:\n- Complaint: ${reason}\n- Symptoms/Notes: "${notes || 'No additional details provided'}"\n- Assigned Doctor: ${doctorName}\n- Department: ${patient.assignedDoctor?.department || 'Cardiology'}\n- Last Recorded Vitals:\n  * Heart Rate: ${latestVitals?.heartRate || '74'} bpm\n  * Oxygen Saturation (SpO2): ${latestVitals?.oxygen || '98'}%\n\nACTION REQUESTED:\nPlease contact the ER desk or review clinical history to guide the triage team.`,
        type: 'emergency',
      });

      toast.error('EMERGENCY ACTIVE: Receptionist and Doctor notified!');
    }, 2500);
  }

  if (!patient) {
    return (
      <EmptyState
        icon="health_and_safety"
        title="Patient profile not linked"
        description="Please complete registration so your dashboard can show appointments, doctor history, billing, and uploaded records."
        action={(
          <button
            type="button"
            onClick={() => navigate('/patient/book')}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
          >
            Book Appointment
          </button>
        )}
      />
    );
  }

  const cards = [
    {
      title: 'Next Appointment',
      value: nextAppointment ? formatDateTime(nextAppointment.date, nextAppointment.time) : 'No pending visit',
      detail: nextAppointment ? `${nextAppointment.doctor} • ${nextAppointment.department}` : 'Book a new appointment',
    },
    {
      title: 'Assigned Doctor',
      value: patient.assignedDoctor?.name || 'Not assigned',
      detail: patient.assignedDoctor ? `${patient.assignedDoctor.experience} • ${formatInr(patient.assignedDoctor.consultationFee)}` : 'Doctor details will appear here',
    },
    {
      title: 'Pending Bills',
      value: formatInr(unpaidInvoices.reduce((total, invoice) => total + invoice.amount, 0)),
      detail: `${unpaidInvoices.length} pending invoice${unpaidInvoices.length === 1 ? '' : 's'}`,
    },
    {
      title: 'Uploaded Documents',
      value: `${patient.documents?.length || 0}`,
      detail: 'PDF, images, prescriptions, and reports',
    },
  ];

  return (
    <div className="space-y-6 pb-8 w-full min-w-0">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-on-surface">Welcome back, {patient.name}</h1>
        <p className="text-sm text-on-surface-variant">
          Track doctor appointments, instructions, billing, documents, and your health chart from one place.
        </p>
      </section>

      {/* Emergency Assistance Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-error/30 bg-gradient-to-r from-error/5 to-error/15 dark:from-error/10 dark:to-error/25 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error text-white shadow-md">
              <span className="material-symbols-outlined text-2xl animate-pulse">emergency</span>
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-200"></span>
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold text-error dark:text-error-container">Emergency Medical Assistance</h2>
              <p className="text-sm text-on-surface-variant mt-0.5">Need immediate medical attention? Contact our 24/7 hotline or request emergency ambulance & staff dispatch.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <a href="tel:+918045678100" className="inline-flex items-center gap-2 rounded-xl bg-error px-4 py-2.5 text-sm font-extrabold text-white hover:bg-error/95 hover:shadow-lg transition-all active:scale-95">
              <span className="material-symbols-outlined text-lg">call</span>
              Call 24/7 Hotline
            </a>
            <button type="button" onClick={() => {
              setIsEmergencyModalOpen(true);
              setEmergencyReason('Cardiac / Chest Pain');
              setEmergencyNotes('');
              setAlertDispatched(false);
              setIsAlerting(false);
            }} className="inline-flex items-center gap-2 rounded-xl border border-error bg-surface px-4 py-2.5 text-sm font-extrabold text-error hover:bg-error/5 dark:hover:bg-error/10 transition-all active:scale-95 cursor-pointer">
              <span className="material-symbols-outlined text-lg">emergency_share</span>
              Request Dispatch
            </button>
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="w-full min-w-0 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm transition-shadow hover:shadow-md dark:border-outline">
            <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant break-words">{card.title}</p>
            <p className="mt-3 text-xl font-bold text-on-surface break-words">{card.value}</p>
            <p className="mt-2 text-sm text-on-surface-variant break-words">{card.detail}</p>
          </div>
        ))}
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
        <section className="col-span-1 lg:col-span-7 rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Vitals Timeline</h2>
              <p className="text-sm text-on-surface-variant">Live view of your latest recorded vitals.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/patient/history')}
              className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors shrink-0 cursor-pointer dark:border-outline"
            >
              View full history
            </button>
          </div>
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patient.vitalsTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" opacity={0.3} />
                <XAxis dataKey="date" stroke="var(--color-on-surface-variant)" fontSize={12} />
                <YAxis stroke="var(--color-on-surface-variant)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-outline)',
                    borderRadius: '8px',
                    color: 'var(--color-on-surface)',
                  }}
                />
                <Line type="monotone" dataKey="heartRate" stroke="#D64545" strokeWidth={3} name="Heart Rate" activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="oxygen" stroke="#0F4C81" strokeWidth={3} name="Oxygen" activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="col-span-1 lg:col-span-5 rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Appointment Status Mix</h2>
            <p className="text-sm text-on-surface-variant">Every doctor booking in your portal.</p>
          </div>
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" opacity={0.3} />
                <XAxis dataKey="name" stroke="var(--color-on-surface-variant)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--color-on-surface-variant)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-outline)',
                    borderRadius: '8px',
                    color: 'var(--color-on-surface)',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {appointmentStats.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Discharge Report Section */}
      {patient.dischargeSummary && patient.status === 'Discharged' && (
        <section className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">assignment</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Discharge Report</h2>
              <p className="text-sm text-on-surface-variant">Summary of your treatment and follow-up plan</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl bg-surface-container-low p-4 border border-outline-variant dark:border-outline">
                <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Disease / Condition Details</p>
                <p className="text-sm text-on-surface leading-relaxed">{patient.dischargeSummary}</p>
              </div>
              {patient.diagnosisHistory?.length ? (
                <div className="rounded-xl bg-surface-container-low p-4 border border-outline-variant dark:border-outline">
                  <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Diagnosis History</p>
                  <div className="space-y-2">
                    {patient.diagnosisHistory.map((dx, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="material-symbols-outlined text-base text-primary mt-0.5">stethoscope</span>
                        <div>
                          <p className="font-medium text-on-surface">{dx.diagnosis}</p>
                          <p className="text-xs text-on-surface-variant">{dx.doctor} &bull; {dx.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {patient.prescriptions?.length ? (
                <div className="rounded-xl bg-surface-container-low p-4 border border-outline-variant dark:border-outline">
                  <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Ongoing Medications</p>
                  <div className="space-y-2">
                    {patient.prescriptions.map((rx, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/50 dark:bg-black/10">
                        <span className="font-medium text-on-surface">{rx.medication}</span>
                        <span className="text-xs text-on-surface-variant">{rx.dosage} &bull; {rx.frequency} &bull; {rx.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="space-y-4">
              {patient.documents?.length ? (
                <div className="rounded-xl bg-surface-container-low p-4 border border-outline-variant dark:border-outline">
                  <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Documents ({patient.documents.length})</p>
                  <div className="space-y-2">
                    {patient.documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-base text-primary">description</span>
                        <span className="text-on-surface text-xs truncate">{doc.name || `Document ${i + 1}`}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-2 italic">These documents can be viewed and downloaded for future reference.</p>
                </div>
              ) : null}
              {patient.labReports?.length ? (
                <div className="rounded-xl bg-surface-container-low p-4 border border-outline-variant dark:border-outline">
                  <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Lab Reports</p>
                  <div className="space-y-1.5">
                    {patient.labReports.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="material-symbols-outlined text-base text-secondary">lab_profile</span>
                        <span className="text-on-surface">{r.name}</span>
                        <span className="text-on-surface-variant ml-auto">{r.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {patient.surgeryHistory?.length ? (
                <div className="rounded-xl bg-surface-container-low p-4 border border-outline-variant dark:border-outline">
                  <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Surgery History</p>
                  {patient.surgeryHistory.map((s, i) => (
                    <div key={i} className="text-sm py-1">
                      <p className="font-medium text-on-surface">{s.name}</p>
                      <p className="text-xs text-on-surface-variant">{s.date} &bull; {s.outcome}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* Visits & Instructions Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
        <section className="col-span-1 lg:col-span-7 rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Upcoming Visits</h2>
              <p className="text-sm text-on-surface-variant">Appointments booked from online and front desk channels.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/patient/book')}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors shrink-0 cursor-pointer"
            >
              Book appointment
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingAppointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="rounded-xl border border-outline-variant p-4 bg-surface dark:border-outline w-full min-w-0">
                <div className="flex flex-col gap-3 w-full min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 w-full min-w-0">
                    <div className="flex-1 min-w-0 w-full">
                      <button
                        type="button"
                        onClick={() => setSelectedAppointment(appointment)}
                        className="text-left text-sm font-bold text-primary hover:underline cursor-pointer border-none bg-transparent p-0 break-words"
                      >
                        {appointment.doctor}
                      </button>
                      <p className="text-sm text-on-surface-variant mt-0.5 break-words">
                        {appointment.type} &bull; {appointment.department} &bull; {formatDateTime(appointment.date, appointment.time)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-primary break-words">{appointment.bookingMode || 'Clinic'}</span>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${
                        appointment.status === 'Confirmed'
                          ? 'bg-confirmed-bg text-confirmed-text'
                          : appointment.status === 'Pending'
                          ? 'bg-pending-bg text-pending-text'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/50 dark:border-outline/50 flex-wrap w-full min-w-0">
                    <button
                      type="button"
                      onClick={() => openReschedule(appointment)}
                      className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer border-none"
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelTarget(appointment)}
                      className="px-3 py-1.5 text-xs font-bold text-error bg-error/10 hover:bg-error/20 rounded-lg transition-colors cursor-pointer border-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(appointment)}
                      className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer border-none ml-auto"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/50 mb-2 block">event_busy</span>
                <p className="text-sm text-on-surface-variant">No upcoming appointments</p>
              </div>
            )}
          </div>
        </section>

        <section className="col-span-1 lg:col-span-5 rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline">
          <h2 className="text-lg font-bold text-on-surface">Latest Doctor Instructions</h2>
          <p className="text-sm text-on-surface-variant mb-4">Post-consultation guidance and notes.</p>
          <div className="space-y-3">
            {patient.doctorInstructionLog?.length ? patient.doctorInstructionLog.slice(0, 4).map((instruction) => (
              <ClinicalNotesCard
                key={instruction.id}
                doctorName={instruction.doctorName}
                date={formatDate(instruction.createdAt)}
                notes={instruction.note}
                priority="medium"
                patientName={patient.name}
                patientId={patient.id}
                patientAge={patient.age ? `${patient.age} yrs` : undefined}
                patientDob={patient.dob}
              />
            )) : (
              <NotesEmptyState />
            )}
          </div>
        </section>
      </div>

      {/* Reschedule Modal */}
      <Modal isOpen={!!rescheduleTarget} onClose={() => setRescheduleTarget(null)} title="Reschedule Appointment" size="sm">
        {rescheduleTarget && (
          <form onSubmit={handleRescheduleSubmit} className="space-y-5">
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant dark:border-outline">
              <p className="text-sm font-bold text-on-surface">{rescheduleTarget.doctor}</p>
              <p className="text-xs text-on-surface-variant mt-1">{rescheduleTarget.department} &bull; {rescheduleTarget.type}</p>
              <p className="text-xs text-on-surface-variant mt-1">Current: {formatDateTime(rescheduleTarget.date, rescheduleTarget.time)}</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1.5">New Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors dark:border-outline"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1.5">New Time Slot</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setRescheduleTime(slot)}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                      rescheduleTime === slot
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface text-on-surface border-outline-variant hover:border-primary hover:text-primary dark:border-outline'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1.5">Reason for Rescheduling (optional)</label>
              <textarea
                value={rescheduleNotes}
                onChange={(e) => setRescheduleNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors resize-none dark:border-outline"
                placeholder="Tell us why you need to reschedule..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant dark:border-outline">
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="px-4 py-2.5 border border-outline-variant rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRescheduling}
                className="px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelAppointment}
        title="Cancel Appointment"
        message={
          cancelTarget
            ? `Are you sure you want to cancel your ${cancelTarget.type} appointment with ${cancelTarget.doctor} on ${formatDateTime(cancelTarget.date, cancelTarget.time)}?`
            : ''
        }
        confirmText="Yes, Cancel Appointment"
        cancelText="Keep Appointment"
        variant="danger"
      />

      {/* Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
      />

      {/* Emergency Modal */}
      <Modal isOpen={isEmergencyModalOpen} onClose={() => {
        if (!isAlerting) setIsEmergencyModalOpen(false);
      }} title="Request Emergency Medical Services" size="sm">
        {!isAlerting && !alertDispatched && (
          <form onSubmit={handleEmergencySubmit} className="space-y-5">
            <div className="bg-error/10 dark:bg-error/20 border border-error/30 rounded-xl p-4 flex gap-3 items-start">
              <span className="material-symbols-outlined text-error shrink-0 mt-0.5 animate-pulse">warning</span>
              <div className="text-xs text-on-surface-variant leading-relaxed">
                <span className="font-extrabold text-error block mb-0.5">HIGH-PRIORITY CHANNEL</span>
                Submitting this alert immediately notifies the on-duty ER receptionist and your assigned doctor, 
                Dr. {patient.assignedDoctor?.name || 'Sarah Chen'}. An ambulance team will be prepared.
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1.5">What is the medical emergency for?</label>
              <select
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-error outline-none transition-colors dark:border-outline cursor-pointer"
                required
              >
                <option value="Cardiac / Chest Pain">Cardiac / Chest Pain</option>
                <option value="Severe Breathing Difficulty">Severe Breathing Difficulty</option>
                <option value="Trauma / Injury / Bleeding">Trauma / Injury / Bleeding</option>
                <option value="Severe Allergic Reaction">Severe Allergic Reaction</option>
                <option value="Loss of Consciousness / Fainting">Loss of Consciousness / Fainting</option>
                <option value="Other Critical Emergency">Other Critical Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1.5">Notes / Current Location Description (optional)</label>
              <textarea
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-error outline-none transition-colors resize-none dark:border-outline"
                placeholder="E.g., Severe pain radiating to shoulder, current location is 2nd Floor, Room 204..."
              />
            </div>

            <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant dark:border-outline text-center">
              <p className="text-xs text-on-surface-variant">Standard Emergency Hotline:</p>
              <a href="tel:+918045678100" className="text-lg font-black text-primary hover:underline block mt-0.5">+91 80456 78100</a>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant dark:border-outline">
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(false)}
                className="px-4 py-2.5 border border-outline-variant rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 bg-error text-white text-sm font-bold rounded-lg hover:bg-error/90 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-error/20"
              >
                <span className="material-symbols-outlined text-sm">emergency_share</span>
                Trigger Emergency Alert
              </button>
            </div>
          </form>
        )}

        {isAlerting && (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-20"></span>
              <div className="relative rounded-full h-20 w-20 bg-error/10 border-2 border-error flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-4xl text-error animate-bounce">wifi_calling</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-error animate-pulse w-full">DIALING CUREPULSE ER DISPATCH...</p>
              <p className="text-xs text-on-surface-variant mt-2 w-full max-w-[280px]">Connecting telemetry details and routing live emergency notifications to receptionist and your doctor...</p>
            </div>
            <div className="w-48 bg-outline-variant/30 h-1.5 rounded-full overflow-hidden relative">
              <div className="bg-error h-full rounded-full absolute left-0 top-0 animate-pulse w-full"></div>
            </div>
          </div>
        )}

        {alertDispatched && (
          <div className="py-6 text-center space-y-5">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-on-surface w-full">Emergency Response Activated</h3>
              <p className="text-sm text-on-surface-variant w-full max-w-[320px] mx-auto">
                Your emergency request for <strong className="text-error">{emergencyReason}</strong> has been transmitted.
              </p>
            </div>
            
            <div className="bg-surface-container-low rounded-xl p-4 text-left text-xs border border-outline-variant dark:border-outline space-y-2.5">
              <div className="flex gap-2 items-center text-on-surface font-bold">
                <span className="material-symbols-outlined text-sm text-emerald-500">done</span>
                <span>Receptionist Emily Roberts alerted</span>
              </div>
              <div className="flex gap-2 items-center text-on-surface font-bold">
                <span className="material-symbols-outlined text-sm text-emerald-500">done</span>
                <span>Dr. {patient.assignedDoctor?.name || 'Sarah Chen'} notified</span>
              </div>
              <div className="flex gap-2 items-center text-on-surface font-bold">
                <span className="material-symbols-outlined text-sm text-emerald-500">done</span>
                <span>GPS / Location telemetry sent</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(false)}
                className="w-full px-4 py-2.5 bg-on-surface text-surface text-sm font-bold rounded-lg hover:bg-on-surface/90 transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
