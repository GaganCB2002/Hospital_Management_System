import { useMemo } from 'react';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { formatDateTime, formatInr } from '../../lib/formatters';

export default function PatientDoctorHistory() {
  const { user } = useAuth();
  const { patients, appointments } = useHospital();
  const patient = useMemo(
    () => patients.find((entry) => entry.name === user?.name || entry.email === user?.email),
    [patients, user],
  );
  const history = useMemo(
    () => appointments.filter((appointment) => appointment.patientId === patient?.id || appointment.patient === user?.name),
    [appointments, patient, user],
  );

  if (!history.length) {
    return (
      <EmptyState
        icon="history"
        title="Doctor history is empty"
        description="Appointments and doctor interactions will appear here after your bookings are created."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface dark:text-white">Doctor History</h1>
        <p className="text-body-md text-on-surface-variant">
          Every doctor appointment with fees, experience, booking mode, and instructions.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="border-b border-outline-variant/40 text-label-md uppercase text-on-surface-variant dark:border-outline/40">
              <th className="pb-3">Doctor</th>
              <th className="pb-3">Experience</th>
              <th className="pb-3">Appointment</th>
              <th className="pb-3">Mode</th>
              <th className="pb-3">Fees</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Instruction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 dark:divide-outline/30">
            {history.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-surface-container-lowest dark:hover:bg-on-primary-fixed/30">
                <td className="py-4">
                  <p className="text-body-md font-bold text-on-surface dark:text-white">{appointment.doctor}</p>
                  <p className="text-body-md text-on-surface-variant">{appointment.doctorSpecialization}</p>
                </td>
                <td className="py-4 text-body-md text-on-surface dark:text-white">{appointment.doctorProfile?.experience || 'N/A'}</td>
                <td className="py-4 text-body-md text-on-surface-variant">
                  {appointment.type} • {formatDateTime(appointment.date, appointment.time)}
                </td>
                <td className="py-4 text-body-md text-on-surface dark:text-white">{appointment.bookingMode}</td>
                <td className="py-4 text-body-md text-on-surface dark:text-white">{formatInr(appointment.fees)}</td>
                <td className="py-4 text-body-md text-primary">{appointment.status}</td>
                <td className="py-4 text-body-md text-on-surface-variant">
                  {appointment.doctorInstructions?.length
                    ? appointment.doctorInstructions[appointment.doctorInstructions.length - 1].note
                    : 'No instruction added'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
