import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AppointmentDetailModal from '../../components/details/AppointmentDetailModal';
import EmptyState from '../../components/common/EmptyState';
import PatientDetailModal from '../../components/details/PatientDetailModal';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { formatDateTime } from '../../lib/formatters';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const {
    appointments,
    patients,
    updateAppointmentStatus,
    addDoctorInstruction,
  } = useHospital();

  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [instructionDrafts, setInstructionDrafts] = useState({});

  const myAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.doctor === user?.name || appointment.doctorId === user?.id || user?.role === 'doctor' && appointment.doctor === user.name),
    [appointments, user],
  );

  const pendingAppointments = myAppointments.filter((appointment) => ['Pending', 'Confirmed', 'Checked In'].includes(appointment.status));
  const completedAppointments = myAppointments.filter((appointment) => ['Completed', 'Cancelled', 'Rejected'].includes(appointment.status));
  const selectedAppointment = myAppointments.find((appointment) => appointment.id === selectedAppointmentId);
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await updateAppointmentStatus(appointmentId, status, { actor: user?.name || 'Doctor' });
      toast.success(`Appointment marked as ${status}.`);
    } catch (error) {
      toast.error(error.message || 'Unable to update appointment.');
    }
  };

  const handleInstructionSave = async (appointmentId) => {
    const note = instructionDrafts[appointmentId];
    if (!note?.trim()) {
      toast.error('Please enter an instruction before saving.');
      return;
    }

    try {
      await addDoctorInstruction(appointmentId, note, user?.name || 'Doctor');
      setInstructionDrafts((current) => ({ ...current, [appointmentId]: '' }));
      toast.success('Doctor instruction shared with patient record.');
    } catch (error) {
      toast.error(error.message || 'Unable to save doctor instruction.');
    }
  };

  const renderAppointmentCard = (appointment) => (
    <div key={appointment.id} className="space-y-4 rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface-container">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button type="button" onClick={() => setSelectedPatientId(appointment.patientId)} className="text-left text-headline-md font-bold text-primary dark:text-primary-fixed-dim">
            {appointment.patient}
          </button>
          <p className="mt-1 text-body-md text-on-surface-variant">
            {appointment.type} • {formatDateTime(appointment.date, appointment.time)} • {appointment.bookingMode}
          </p>
          <p className="mt-1 text-label-md text-on-surface-variant">{appointment.department} • {appointment.location}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setSelectedAppointmentId(appointment.id)} className="rounded-xl border border-outline-variant px-4 py-2 text-body-md font-bold text-on-surface dark:border-outline ">
            View details
          </button>
          {['Pending', 'Confirmed', 'Checked In'].includes(appointment.status) ? (
            <>
              <button type="button" onClick={() => handleStatusChange(appointment.id, 'Completed')} className="rounded-xl bg-secondary px-4 py-2 text-body-md font-bold text-white">
                Complete
              </button>
              <button type="button" onClick={() => handleStatusChange(appointment.id, 'Cancelled')} className="rounded-xl bg-error px-4 py-2 text-body-md font-bold text-white">
                Cancel
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-surface-container-high">
        <p className="text-body-md font-bold text-on-surface ">Doctor Instruction</p>
        <textarea
          rows={3}
          value={instructionDrafts[appointment.id] ?? ''}
          onChange={(event) => setInstructionDrafts((current) => ({ ...current, [appointment.id]: event.target.value }))}
          placeholder="Add medication guidance, follow-up instructions, or documents requested."
          className="mt-3 w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface-container "
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-label-md text-on-surface-variant">
            Latest: {appointment.doctorInstructions?.length ? appointment.doctorInstructions[appointment.doctorInstructions.length - 1].note : 'No instruction yet'}
          </p>
          <button type="button" onClick={() => handleInstructionSave(appointment.id)} className="rounded-xl bg-primary px-4 py-2 text-body-md font-bold text-white">
            Save Instruction
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface ">Doctor Appointments</h1>
        <p className="text-body-md text-on-surface-variant">
          Manage your live queue and send instructions that update patient records instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-headline-md font-bold text-on-surface ">Active Queue</h2>
          {pendingAppointments.length ? pendingAppointments.map(renderAppointmentCard) : (
            <EmptyState
              icon="event_available"
              title="No active appointments"
              description="Pending and confirmed bookings will appear here."
            />
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-headline-md font-bold text-on-surface ">Completed and Closed</h2>
          {completedAppointments.length ? completedAppointments.map(renderAppointmentCard) : (
            <EmptyState
              icon="event_busy"
              title="No closed appointments"
              description="Completed, cancelled, and rejected bookings will appear here."
            />
          )}
        </section>
      </div>

      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointmentId(null)}
        onPatientClick={setSelectedPatientId}
      />
      <PatientDetailModal patient={selectedPatient} isOpen={Boolean(selectedPatient)} onClose={() => setSelectedPatientId('')} />
    </div>
  );
}
