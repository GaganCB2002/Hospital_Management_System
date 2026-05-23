import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import DocumentList from '../documents/DocumentList';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime, formatInr } from '../../lib/formatters';

export default function AppointmentDetailModal({ appointment, isOpen, onClose, onPatientClick, onDoctorClick }) {
  const { updateAppointmentStatus } = useHospital();
  const { user } = useAuth();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!appointment) {
    return null;
  }

  const role = user?.role;
  const canUpdateStatus = role === 'admin' || role === 'receptionist' || role === 'doctor';

  async function handleStatusChange(newStatus) {
    setUpdatingStatus(true);
    try {
      await updateAppointmentStatus(appointment.appointmentId || appointment.id, newStatus, { actor: user?.name || 'Staff' });
      toast.success(`Appointment status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update appointment status');
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Appointment ${appointment.appointmentId || appointment.id}`} size="xl">
      <div className="space-y-6">
        <div className="rounded-2xl bg-surface-container p-4 dark:bg-on-primary-fixed w-full min-w-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-label-md uppercase text-on-surface-variant">Scheduled Visit</p>
              <h3 className="text-headline-lg text-on-surface dark:text-white break-words">{appointment.type}</h3>
              <p className="text-body-md text-on-surface-variant break-words">
                {formatDateTime(appointment.date, appointment.time)} • {appointment.department}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {canUpdateStatus ? (
                <div className="relative flex items-center gap-1">
                  <select
                    value={appointment.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className="rounded-full bg-primary px-3 py-1 text-label-md text-white outline-none cursor-pointer appearance-none pr-6 border-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 6px center',
                    }}
                  >
                    <option value="Pending" className="text-on-surface bg-surface">Pending</option>
                    <option value="Confirmed" className="text-on-surface bg-surface">Confirmed</option>
                    <option value="Checked In" className="text-on-surface bg-surface">Checked In</option>
                    <option value="In Progress" className="text-on-surface bg-surface">In Progress</option>
                    <option value="Completed" className="text-on-surface bg-surface">Completed</option>
                    <option value="Cancelled" className="text-on-surface bg-surface">Cancelled</option>
                    <option value="Rejected" className="text-on-surface bg-surface">Rejected</option>
                    <option value="No-Show" className="text-on-surface bg-surface">No-Show</option>
                  </select>
                  {updatingStatus && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                </div>
              ) : (
                <span className="rounded-full bg-primary px-3 py-1 text-label-md text-white">{appointment.status}</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="space-y-3 rounded-xl border border-outline-variant p-4 dark:border-outline">
            <h4 className="text-headline-md text-on-surface dark:text-white">Patient Details</h4>
            <button type="button" onClick={() => onPatientClick?.(appointment.patientId)} className="text-left text-body-md font-bold text-primary">
              {appointment.patientFullName}
            </button>
            <p className="text-body-md text-on-surface-variant">Patient ID: {appointment.patientId}</p>
            <p className="text-body-md text-on-surface-variant">Contact: {appointment.contactDetails?.phone}</p>
            <p className="text-body-md text-on-surface-variant">{appointment.contactDetails?.email}</p>
          </section>
          <section className="space-y-3 rounded-xl border border-outline-variant p-4 dark:border-outline">
            <h4 className="text-headline-md text-on-surface dark:text-white">Doctor Details</h4>
            <button type="button" onClick={() => onDoctorClick?.(appointment.doctorId)} className="text-left text-body-md font-bold text-primary">
              {appointment.doctorFullName}
            </button>
            <p className="text-body-md text-on-surface-variant">{appointment.doctorSpecialization}</p>
            <p className="text-body-md text-on-surface-variant">Department: {appointment.department}</p>
            <p className="text-body-md text-on-surface-variant">Location: {appointment.location}</p>
            <p className="text-body-md text-on-surface-variant">Consultation Fee: {formatInr(appointment.fees)}</p>
            <p className="text-body-md text-on-surface-variant">Booking Mode: {appointment.bookingMode}</p>
          </section>
        </div>

        <section className="rounded-xl border border-outline-variant p-4 dark:border-outline w-full min-w-0">
          <h4 className="text-headline-md text-on-surface dark:text-white break-words">Notes</h4>
          <p className="mt-2 text-body-md text-on-surface-variant break-words">{appointment.notes || 'No notes added.'}</p>
          {appointment.rejectionReason ? (
            <p className="mt-3 rounded-lg bg-error-container/60 px-3 py-2 text-body-md text-error break-words">
              Rejection reason: {appointment.rejectionReason}
            </p>
          ) : null}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="space-y-3 rounded-xl border border-outline-variant p-4 dark:border-outline">
            <h4 className="text-headline-md text-on-surface dark:text-white">Previous Appointment History</h4>
            {appointment.previousAppointmentHistory?.length ? appointment.previousAppointmentHistory.map((entry) => (
              <div key={entry.id} className="rounded-lg bg-surface-container-low p-3 dark:bg-on-primary-fixed">
                <p className="text-body-md font-bold text-on-surface dark:text-white">{entry.doctor}</p>
                <p className="text-body-md text-on-surface-variant">{formatDate(entry.date)} • {entry.time} • {entry.status}</p>
              </div>
            )) : <p className="text-body-md text-on-surface-variant">Data not present</p>}
          </section>
          <section className="space-y-3 rounded-xl border border-outline-variant p-4 dark:border-outline">
            <h4 className="text-headline-md text-on-surface dark:text-white">Prescription History</h4>
            {appointment.prescriptionHistory?.length ? appointment.prescriptionHistory.map((entry) => (
              <div key={entry.id} className="rounded-lg bg-surface-container-low p-3 dark:bg-on-primary-fixed">
                <p className="text-body-md font-bold text-on-surface dark:text-white">{entry.medication}</p>
                <p className="text-body-md text-on-surface-variant">{entry.dosage} • {entry.frequency}</p>
              </div>
            )) : <p className="text-body-md text-on-surface-variant">Data not present</p>}
          </section>
          <section className="space-y-3 rounded-xl border border-outline-variant p-4 dark:border-outline">
            <h4 className="text-headline-md text-on-surface dark:text-white">Billing Summary</h4>
            <div className="rounded-lg bg-surface-container-low p-3 dark:bg-on-primary-fixed">
              <p className="text-body-md text-on-surface-variant">Total billed</p>
              <p className="text-body-md font-bold text-on-surface dark:text-white">{formatInr(appointment.billingSummary?.totalBilled)}</p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-3 dark:bg-on-primary-fixed">
              <p className="text-body-md text-on-surface-variant">Pending amount</p>
              <p className="text-body-md font-bold text-on-surface dark:text-white">{formatInr(appointment.billingSummary?.pendingAmount)}</p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-3 dark:bg-on-primary-fixed">
              <p className="text-body-md text-on-surface-variant">Invoices</p>
              <p className="text-body-md font-bold text-on-surface dark:text-white">{appointment.billingSummary?.invoiceCount || 0}</p>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="space-y-3 rounded-xl border border-outline-variant p-4 dark:border-outline">
            <h4 className="text-headline-md text-on-surface dark:text-white">Uploaded Documents</h4>
            <DocumentList documents={appointment.documents} emptyMessage="No appointment documents uploaded." />
          </section>
          <section className="space-y-3 rounded-xl border border-outline-variant p-4 dark:border-outline">
            <h4 className="text-headline-md text-on-surface dark:text-white">Doctor Instructions</h4>
            {appointment.doctorInstructions?.length ? appointment.doctorInstructions.map((instruction) => (
              <div key={instruction.id} className="rounded-lg bg-surface-container-low p-3 dark:bg-on-primary-fixed">
                <p className="text-body-md font-bold text-on-surface dark:text-white">{instruction.doctorName}</p>
                <p className="text-body-md text-on-surface-variant">{instruction.note}</p>
                <p className="mt-1 text-label-md text-outline">{formatDate(instruction.createdAt)}</p>
              </div>
            )) : <p className="text-body-md text-on-surface-variant">No doctor instructions yet.</p>}
          </section>
        </div>
      </div>
    </Modal>
  );
}
