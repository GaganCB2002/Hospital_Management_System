import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import AppointmentDetailModal from '../../components/details/AppointmentDetailModal';
import EmptyState from '../../components/common/EmptyState';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, formatInr } from '../../lib/formatters';

const STATUS_STYLES = {
  'New': { bg: 'bg-primary/15 text-primary', pulse: true },
  'Read': { bg: 'bg-surface-container-high text-on-surface-variant', pulse: false },
  'Hold': { bg: 'bg-tertiary/15 text-tertiary', pulse: false },
  'Confirmed': { bg: 'bg-secondary/15 text-secondary', pulse: false },
  'Rejected': { bg: 'bg-error/15 text-error', pulse: false },
  'Completed': { bg: 'bg-secondary/15 text-secondary', pulse: false },
};

const ACTION_BUTTONS = [
  { label: 'Accept', status: 'Confirmed', icon: 'check_circle', color: 'text-secondary bg-secondary/10 hover:bg-secondary/20 border-secondary/20' },
  { label: 'Reject', status: 'Rejected', icon: 'cancel', color: 'text-error bg-error/10 hover:bg-error/20 border-error/20' },
  { label: 'Mark as Read', status: 'Read', icon: 'visibility', color: 'text-primary bg-primary/10 hover:bg-primary/20 border-primary/20' },
  { label: 'Hold', status: 'Hold', icon: 'pause_circle', color: 'text-tertiary bg-tertiary/10 hover:bg-tertiary/20 border-tertiary/20' },
];

export default function ReceptionistOnlineBookings() {
  const { appointments, updateAppointmentStatus } = useHospital();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const onlineBookings = useMemo(() => appointments.filter((appointment) => appointment.bookingMode === 'Online'), [appointments]);

  const filteredBookings = useMemo(
    () => onlineBookings.filter((appointment) => statusFilter === 'All Status' || appointment.status === statusFilter),
    [onlineBookings, statusFilter],
  );

  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedAppointmentId);

  async function handleAction(appointment, newStatus) {
    const actionKey = `${appointment.id}-${newStatus}`;
    setActionLoading(actionKey);
    try {
      await updateAppointmentStatus(appointment.appointmentId || appointment.id, newStatus, { actor: user?.name || 'Receptionist' });
      toast.success(`Booking ${newStatus === 'Confirmed' ? 'Accepted' : newStatus} successfully`);
    } catch {
      toast.error(`Failed to ${newStatus === 'Confirmed' ? 'accept' : newStatus.toLowerCase()} booking`);
    } finally {
      setActionLoading(null);
    }
  }

  function getStatusStyle(status) {
    return STATUS_STYLES[status] || { bg: 'bg-pending-bg text-pending-text', pulse: false };
  }

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between w-full min-w-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-headline-lg font-bold text-on-surface break-words whitespace-normal">Online Bookings</h1>
          <p className="text-body-md text-on-surface-variant break-words whitespace-normal">
            Track every online patient booking, its current workflow status, and doctor fee details.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-label-md text-on-surface-variant whitespace-nowrap">
            {onlineBookings.length} total
          </span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full sm:w-48 rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface"
          >
            <option>All Status</option>
            <option>New</option>
            <option>Read</option>
            <option>Hold</option>
            <option>Confirmed</option>
            <option>Rejected</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      {filteredBookings.length ? (
        <div className="grid grid-cols-1 gap-4 w-full min-w-0 max-w-full">
          {filteredBookings.map((appointment) => {
            const style = getStatusStyle(appointment.status);

            return (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface w-full min-w-0"
              >
                <div className="flex flex-col gap-4 w-full min-w-0">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between w-full min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-headline-md font-bold text-on-surface break-words whitespace-normal">{appointment.patient}</p>
                        <span className={`rounded-full px-3 py-1 text-label-md font-bold inline-flex items-center gap-1.5 ${style.bg}`}>
                          {style.pulse && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                          {appointment.status === 'New' ? 'New' : appointment.status}
                        </span>
                      </div>
                      <p className="mt-1 text-body-md text-on-surface-variant break-words whitespace-normal">
                        {appointment.doctor} &bull; {appointment.type} &bull; {formatDateTime(appointment.date, appointment.time)}
                      </p>
                      <p className="mt-2 text-label-md text-primary break-words whitespace-normal">
                        {appointment.department} &bull; {formatInr(appointment.fees)} &bull; {appointment.documents?.length || 0} files
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAppointmentId(appointment.id)}
                      className="text-body-md font-bold text-primary hover:underline shrink-0 self-start"
                    >
                      View Details
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-outline-variant/50 dark:border-outline/50 w-full min-w-0">
                    {ACTION_BUTTONS.map((btn) => {
                      const isActive = appointment.status === btn.status;
                      const actionKey = `${appointment.id}-${btn.status}`;
                      const loading = actionLoading === actionKey;
                      return (
                        <button
                          key={btn.status}
                          type="button"
                          disabled={isActive || !!actionLoading}
                          onClick={() => handleAction(appointment, btn.status)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${btn.color} ${isActive ? 'ring-2 ring-inset ring-current' : ''}`}
                        >
                          {loading ? (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          ) : (
                            <span className="material-symbols-outlined text-sm">{btn.icon}</span>
                          )}
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
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
