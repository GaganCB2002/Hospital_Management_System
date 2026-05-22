import { useMemo, useState } from 'react';
import AppointmentDetailModal from '../../components/details/AppointmentDetailModal';
import EmptyState from '../../components/common/EmptyState';
import { useHospital } from '../../context/HospitalContext';
import { formatDateTime, formatInr } from '../../lib/formatters';

export default function ReceptionistOnlineBookings() {
  const { appointments } = useHospital();
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const onlineBookings = useMemo(() => appointments.filter((appointment) => appointment.bookingMode === 'Online'), [appointments]);
  const filteredBookings = useMemo(
    () => onlineBookings.filter((appointment) => statusFilter === 'All Status' || appointment.status === statusFilter),
    [onlineBookings, statusFilter],
  );
  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedAppointmentId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Online Bookings</h1>
          <p className="text-body-md text-on-surface-variant">
            Track every online patient booking, its current workflow status, and doctor fee details.
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full max-w-xs rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface"
        >
          <option>All Status</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Completed</option>
          <option>Rejected</option>
        </select>
      </div>

      {filteredBookings.length ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((appointment) => (
            <button
              key={appointment.id}
              type="button"
              onClick={() => setSelectedAppointmentId(appointment.id)}
              className="rounded-3xl border border-outline-variant bg-surface p-5 text-left shadow-sm transition hover:border-primary dark:border-outline dark:bg-surface"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-headline-md font-bold text-on-surface">{appointment.patient}</p>
                  <p className="mt-1 text-body-md text-on-surface-variant">
                    {appointment.doctor} • {appointment.type} • {formatDateTime(appointment.date, appointment.time)}
                  </p>
                  <p className="mt-2 text-label-md text-primary">
                    {appointment.department} • {formatInr(appointment.fees)} • {appointment.documents?.length || 0} files
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-body-md font-bold text-primary">{appointment.status}</p>
                  <p className="text-label-md text-on-surface-variant">{appointment.bookingSource}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="language"
          title="No online bookings"
          description="Online bookings will appear here once patients submit them from the portal."
        />
      )}

      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointmentId(null)}
      />
    </div>
  );
}
