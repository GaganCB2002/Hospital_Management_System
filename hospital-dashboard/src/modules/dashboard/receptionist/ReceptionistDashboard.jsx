import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AppointmentDetailModal from '../../../components/details/AppointmentDetailModal';
import EmptyState from '../../../components/common/EmptyState';
import BedOccupancyPanel from '../../../components/common/BedOccupancyPanel';
import { useAuth } from '../../../context/AuthContext';
import { useHospital } from '../../../context/HospitalContext';
import { useTheme } from '../../../context/ThemeContext';
import { formatDateTime, formatInr } from '../../../lib/formatters';

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { appointments, patients, billing } = useHospital();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const bookingModeStats = useMemo(() => {
    const groups = ['Walk-in', 'Phone', 'Online', 'Referral'];
    return groups.map((mode, index) => ({
      name: mode,
      value: appointments.filter((appointment) => appointment.bookingMode === mode).length,
      color: ['#00355f', '#006b5f', '#0f4c81', '#ba1a1a'][index],
    }));
  }, [appointments]);

  const todayCollection = billing
    .filter((invoice) => invoice.status === 'Paid')
    .reduce((total, invoice) => total + invoice.amount, 0);
  const admittedPatients = patients.filter((patient) => patient.status === 'Admitted');
  const olderPatients = [...patients].sort((first, second) => new Date(first.admittedDate) - new Date(second.admittedDate)).slice(0, 5);
  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedAppointmentId);

  const cards = [
    { title: 'Total Bookings', value: appointments.length, detail: 'Across all channels' },
    { title: 'Online Bookings', value: appointments.filter((appointment) => appointment.bookingMode === 'Online').length, detail: 'Visible in online bookings queue' },
    { title: 'Admitted Patients', value: admittedPatients.length, detail: 'Shared with doctor dashboards' },
    { title: 'Collections', value: formatInr(todayCollection), detail: 'Paid invoices recorded' },
  ];

  return (
    <div className="space-y-6 pb-xl">
      <header className="flex flex-col gap-2">
        <p className="text-label-md font-bold uppercase tracking-widest text-primary">Front Desk Operations</p>
        <h1 className="text-headline-lg font-bold text-on-surface">Good day, {user?.name?.split(' ')[0] || 'Receptionist'}</h1>
        <p className="text-body-md text-on-surface-variant">
          Manage patient details, booking channels, admissions, and queue visibility for doctors from one connected dashboard.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
            <p className="text-label-md uppercase text-on-surface-variant">{card.title}</p>
            <p className="mt-3 text-headline-md font-bold text-on-surface">{card.value}</p>
            <p className="mt-2 text-body-md text-on-surface-variant">{card.detail}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface xl:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline-md font-bold text-on-surface">Booking Modes</h2>
              <p className="text-body-md text-on-surface-variant">Every front-desk and online channel in one chart.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/receptionist/bookings')}
              className="rounded-xl border border-outline-variant px-4 py-2 text-body-md font-bold text-on-surface dark:border-outline"
            >
              View online bookings
            </button>
          </div>
          <div className="mt-6 h-72 w-full min-w-0 relative">
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingModeStats}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke={isDark ? '#94A3B8' : '#475569'} />
                  <YAxis allowDecimals={false} stroke={isDark ? '#94A3B8' : '#475569'} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    {bookingModeStats.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface xl:col-span-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-headline-md font-bold text-on-surface">Bed Occupancy</h2>
              <p className="text-body-md text-on-surface-variant">Real-time ward bed availability and admitted patient details.</p>
            </div>
          </div>
          <BedOccupancyPanel />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface xl:col-span-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline-md font-bold text-on-surface">Older Patients</h2>
              <p className="text-body-md text-on-surface-variant">Longer-running records and their latest booking context.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/receptionist/patients')}
              className="rounded-xl bg-primary px-4 py-2 text-body-md font-bold text-white"
            >
              Open patient details
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {olderPatients.length ? olderPatients.map((patient) => {
              const latestAppointment = appointments.find((appointment) => appointment.patientId === patient.id);
              return (
                <div key={patient.id} className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-on-primary-fixed">
                  <p className="text-body-md font-bold text-on-surface">{patient.name}</p>
                  <p className="text-body-md text-on-surface-variant">
                    {patient.id} • {patient.status} • Admitted {patient.admittedDate}
                  </p>
                  <p className="mt-1 text-label-md text-primary">
                    {latestAppointment ? `${latestAppointment.bookingMode} • ${latestAppointment.doctor}` : 'No recent appointment'}
                  </p>
                </div>
              );
            }) : (
              <EmptyState icon="groups" title="No patient records" description="Registered patient details will appear here." />
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface">Live Appointment Queue</h2>
            <p className="text-body-md text-on-surface-variant">
              Click any booking to inspect patient, doctor, billing, and uploaded appointment data.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {appointments.slice(0, 6).map((appointment) => (
            <button
              key={appointment.id}
              type="button"
              onClick={() => setSelectedAppointmentId(appointment.id)}
              className="w-full rounded-2xl border border-outline-variant p-4 text-left transition hover:border-primary dark:border-outline"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-body-md font-bold text-on-surface">{appointment.patient}</p>
                  <p className="text-body-md text-on-surface-variant">
                    {appointment.doctor} • {formatDateTime(appointment.date, appointment.time)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-body-md font-bold text-primary">{appointment.bookingMode}</p>
                  <p className="text-label-md text-on-surface-variant">{appointment.status}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointmentId(null)}
      />
    </div>
  );
}
