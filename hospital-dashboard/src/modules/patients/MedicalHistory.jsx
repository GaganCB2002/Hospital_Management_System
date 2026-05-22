import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ClinicalNotesCard, { NotesEmptyState } from '../../components/common/ClinicalNotesCard';
import DocumentList from '../../components/documents/DocumentList';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDate, formatDateTime, formatInr } from '../../lib/formatters';

export default function MedicalHistory() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { patients, appointments } = useHospital();
  const patient = useMemo(
    () => patients.find((entry) => entry.name === user?.name || entry.email === user?.email),
    [patients, user],
  );
  const patientAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.patientId === patient?.id || appointment.patient === user?.name),
    [appointments, patient, user],
  );

  if (!patient) {
    return (
      <EmptyState
        icon="history"
        title="Medical history not available"
        description="Register or book an appointment so we can build your health timeline."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface dark:text-white">Medical History</h1>
        <p className="text-body-md text-on-surface-variant">
          Review appointments, prescriptions, instructions, billing, and uploaded files in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface-container xl:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Vitals Trend</h2>
              <p className="text-body-md text-on-surface-variant">Latest readings captured in your patient timeline.</p>
            </div>
            <span className="rounded-full bg-surface-container-low px-3 py-1 text-label-md text-on-surface dark:bg-surface-container-high dark:text-white">
              Last {patient.vitalsTimeline?.length || 0} entries
            </span>
          </div>
          <div className="mt-6 h-72 w-full min-w-0 relative">
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patient.vitalsTimeline || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" stroke={isDark ? '#cbd5e1' : '#475569'} />
                  <YAxis stroke={isDark ? '#cbd5e1' : '#475569'} />
                  <Tooltip />
                  <Line type="monotone" dataKey="heartRate" stroke="#ba1a1a" strokeWidth={3} name="Heart Rate" />
                  <Line type="monotone" dataKey="bloodPressure" stroke="#00355f" strokeWidth={3} name="Blood Pressure" />
                  <Line type="monotone" dataKey="oxygen" stroke="#006b5f" strokeWidth={3} name="Oxygen" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-primary to-primary-container p-6 text-on-primary shadow-sm xl:col-span-4">
          <h2 className="text-headline-md font-bold">Active Prescriptions</h2>
          <div className="mt-4 space-y-3">
            {patient.prescriptions?.length ? patient.prescriptions.map((prescription) => (
              <div key={prescription.id} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-body-md font-bold">{prescription.medication}</p>
                  <span className="rounded-full bg-white/20 px-2 py-1 text-label-md">{prescription.status}</span>
                </div>
                <p className="mt-2 text-body-md text-white/85">{prescription.dosage} • {prescription.frequency}</p>
                <p className="mt-1 text-label-md text-white/70">Valid until {formatDate(prescription.endDate)}</p>
              </div>
            )) : (
              <p className="text-body-md text-white/80">No active prescriptions available.</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface-container">
        <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Consultation and Doctor Instructions</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-outline-variant/40 text-label-md uppercase text-on-surface-variant dark:border-outline/40">
                <th className="pb-3">Date</th>
                <th className="pb-3">Doctor</th>
                <th className="pb-3">Appointment</th>
                <th className="pb-3">Fees</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Latest Instruction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 dark:divide-outline/30">
              {patientAppointments.length ? patientAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-surface-container-lowest dark:hover:bg-[#1a2d42]/40">
                  <td className="py-4 text-body-md font-bold text-on-surface dark:text-white">{formatDateTime(appointment.date, appointment.time)}</td>
                  <td className="py-4 text-body-md text-on-surface dark:text-white">{appointment.doctor}</td>
                  <td className="py-4 text-body-md text-on-surface-variant">
                    {appointment.type} • {appointment.bookingMode}
                  </td>
                  <td className="py-4 text-body-md text-on-surface dark:text-white">{formatInr(appointment.fees)}</td>
                  <td className="py-4 text-body-md text-primary">{appointment.status}</td>
                  <td className="py-4 text-body-md text-on-surface-variant">
                    {appointment.doctorInstructions?.length
                      ? appointment.doctorInstructions[appointment.doctorInstructions.length - 1].note
                      : 'No instructions yet'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-8">
                    <EmptyState
                      icon="event_busy"
                      title="No consultation records"
                      description="Booked and completed appointments will appear here."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface-container">
          <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Doctor Notes Timeline</h2>
          <div className="mt-4 space-y-3">
            {patient.doctorInstructionLog?.length ? patient.doctorInstructionLog.map((instruction) => (
              <ClinicalNotesCard
                key={`${instruction.id}-${instruction.createdAt}`}
                doctorName={instruction.doctorName}
                date={formatDate(instruction.createdAt)}
                notes={instruction.note}
                priority="normal"
              />
            )) : (
              <NotesEmptyState />
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface-container">
          <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Billing Summary</h2>
          <div className="mt-4 space-y-3">
            {patient.billingHistory?.length ? patient.billingHistory.map((invoice) => (
              <div key={invoice.id} className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-surface-container-high">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-body-md font-bold text-on-surface dark:text-white">{invoice.id}</p>
                    <p className="text-body-md text-on-surface-variant">{formatDate(invoice.date)} • {invoice.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-body-md font-bold text-on-surface dark:text-white">{formatInr(invoice.amount)}</p>
                    <p className="text-label-md text-primary">{invoice.status}</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-body-md text-on-surface-variant">No billing history available.</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface-container">
        <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Uploaded Reports and Documents</h2>
        <div className="mt-4">
          <DocumentList documents={patient.documents} emptyMessage="No documents uploaded yet." />
        </div>
      </section>
    </div>
  );
}
