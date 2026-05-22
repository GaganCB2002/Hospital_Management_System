import Modal from '../common/Modal';
import DocumentList from '../documents/DocumentList';
import { formatDate, formatDateTime, formatInr } from '../../lib/formatters';

export default function AppointmentDetailModal({ appointment, isOpen, onClose, onPatientClick, onDoctorClick }) {
  if (!appointment) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Appointment ${appointment.appointmentId}`} size="xl">
      <div className="space-y-6">
        <div className="rounded-2xl bg-surface-container p-4 dark:bg-on-primary-fixed">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-label-md uppercase text-on-surface-variant">Scheduled Visit</p>
              <h3 className="text-headline-lg text-on-surface dark:text-white">{appointment.type}</h3>
              <p className="text-body-md text-on-surface-variant">
                {formatDateTime(appointment.date, appointment.time)} • {appointment.department}
              </p>
            </div>
            <span className="rounded-full bg-primary px-3 py-1 text-label-md text-white">{appointment.status}</span>
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

        <section className="rounded-xl border border-outline-variant p-4 dark:border-outline">
          <h4 className="text-headline-md text-on-surface dark:text-white">Notes</h4>
          <p className="mt-2 text-body-md text-on-surface-variant">{appointment.notes || 'No notes added.'}</p>
          {appointment.rejectionReason ? (
            <p className="mt-3 rounded-lg bg-error-container/60 px-3 py-2 text-body-md text-error">
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
