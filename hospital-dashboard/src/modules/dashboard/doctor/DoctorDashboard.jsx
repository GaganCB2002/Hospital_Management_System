import { useMemo } from 'react';
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
import EmptyState from '../../../components/common/EmptyState';
import BedOccupancyPanel from '../../../components/common/BedOccupancyPanel';
import { useAuth } from '../../../context/AuthContext';
import { useHospital } from '../../../context/HospitalContext';
import { useTheme } from '../../../context/ThemeContext';
import { formatDateTime, formatInr } from '../../../lib/formatters';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { doctors, appointments, patients } = useHospital();

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
    { name: 'Pending', value: myAppointments.filter((appointment) => appointment.status === 'Pending').length, color: isDark ? '#3B82F6' : '#00355f' },
    { name: 'Confirmed', value: myAppointments.filter((appointment) => appointment.status === 'Confirmed').length, color: isDark ? '#10B981' : '#006b5f' },
    { name: 'Completed', value: myAppointments.filter((appointment) => appointment.status === 'Completed').length, color: isDark ? '#3B82F6' : '#0f4c81' },
    { name: 'Rejected', value: myAppointments.filter((appointment) => appointment.status === 'Rejected').length, color: isDark ? '#EF4444' : '#ba1a1a' },
  ];
  const revenueEstimate = myAppointments
    .filter((appointment) => ['Confirmed', 'Completed', 'Checked In'].includes(appointment.status))
    .reduce((total, appointment) => total + Number(appointment.fees || doctor?.consultationFee || 0), 0);

  if (!doctor) {
    return (
      <EmptyState
        icon="stethoscope"
        title="Doctor profile not available"
        description="Please sign in with a linked doctor account to see live patient and appointment data."
      />
    );
  }

  const cards = [
    { title: "Today's Appointments", value: myAppointments.length, detail: `${myAppointments.filter((appointment) => appointment.status === 'Pending').length} pending approvals` },
    { title: 'Assigned Patients', value: myPatients.length, detail: `${inPatients.length} admitted or emergency` },
    { title: 'Revenue Estimate', value: formatInr(revenueEstimate), detail: `Consultation fee ${formatInr(doctor.consultationFee)}` },
    { title: 'Performance Rating', value: `${doctor.rating} / 5`, detail: doctor.performanceStats?.successRate || 'Success rate pending' },
  ];

  return (
    <div className="space-y-6 pb-xl">
      <header className="flex flex-col gap-2">
        <h1 className="text-headline-lg font-bold text-on-surface dark:text-white">Good day, {doctor.name}</h1>
        <p className="text-body-md text-on-surface-variant">
          Admissions from reception and appointment changes from patients are reflected here automatically.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline">
            <p className="text-label-md uppercase text-on-surface-variant">{card.title}</p>
            <p className="mt-3 text-headline-md font-bold text-on-surface dark:text-white">{card.value}</p>
            <p className="mt-2 text-body-md text-on-surface-variant">{card.detail}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full min-w-0">
        <section className="col-span-1 lg:col-span-7 rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Live Schedule</h2>
              <p className="text-body-md text-on-surface-variant">Every booking assigned to your profile.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/doctor/appointments')}
              className="rounded-xl bg-primary px-4 py-2 text-body-md font-bold text-white"
            >
              Manage appointments
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {myAppointments.slice(0, 6).map((appointment) => (
              <div key={appointment.id} className="rounded-2xl border border-outline-variant p-4 dark:border-outline">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-body-md font-bold text-on-surface dark:text-white">{appointment.patient}</p>
                    <p className="text-body-md text-on-surface-variant">
                      {appointment.type} • {formatDateTime(appointment.date, appointment.time)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-body-md font-bold text-primary dark:text-primary-fixed-dim">{appointment.status}</p>
                    <p className="text-label-md text-on-surface-variant">{appointment.bookingMode}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-1 lg:col-span-5 rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline w-full min-w-0 overflow-hidden">
          <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Appointment Status Overview</h2>
          <div className="mt-6 h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentStatusStats}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke={isDark ? '#94A3B8' : '#475569'} />
                <YAxis allowDecimals={false} stroke={isDark ? '#94A3B8' : '#475569'} />
                <Tooltip />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {appointmentStatusStats.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Bed Occupancy</h2>
            <p className="text-body-md text-on-surface-variant">
              Real-time ward bed status and admitted patient details.
            </p>
          </div>
        </div>
        <BedOccupancyPanel />
      </section>

      <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface dark:text-white">Admitted Patient Board</h2>
            <p className="text-body-md text-on-surface-variant">
              Front-desk admission updates appear here immediately for your rounds.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {inPatients.length ? inPatients.map((patient) => (
            <div key={patient.id} className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-on-primary-fixed">
              <p className="text-body-md font-bold text-on-surface dark:text-white">{patient.name}</p>
              <p className="mt-1 text-body-md text-on-surface-variant">
                {patient.id} • {patient.status} • {patient.ward}
              </p>
              <p className="mt-2 text-label-md text-primary dark:text-primary-fixed-dim">{patient.condition}</p>
            </div>
          )) : (
            <div className="lg:col-span-3 w-full min-w-0">
              <EmptyState
                icon="ward"
                title="No admitted patients"
                description="Patients marked admitted or emergency by reception will appear here."
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
