import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiSearch, FiUserPlus } from 'react-icons/fi';
import AppointmentDetailModal from '../../components/details/AppointmentDetailModal';
import DocumentList from '../../components/documents/DocumentList';
import DocumentUploader from '../../components/documents/DocumentUploader';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { formatDateTime, formatInr } from '../../lib/formatters';

export default function AppointmentsBooking() {
  const { user } = useAuth();
  const {
    doctors,
    patients,
    appointments,
    addAppointment,
    updatePatient,
  } = useHospital();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    type: 'Consultation',
    bookingMode: 'Walk-in',
    patientStatus: 'Active',
    ward: '',
    notes: '',
  });

  const selectedPatient = patients.find((patient) => patient.id === formData.patientId);
  const selectedDoctor = doctors.find((doctor) => doctor.doctorId === formData.doctorId);
  const availableSlots = selectedDoctor?.availabilitySchedule?.flatMap((schedule) => schedule.slots).slice(0, 8)
    || ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const queue = useMemo(
    () => appointments.filter((appointment) => {
      if (!searchTerm.trim()) {
        return true;
      }
      const term = searchTerm.toLowerCase();
      return [appointment.patient, appointment.doctor, appointment.bookingMode, appointment.status]
        .some((value) => value?.toLowerCase().includes(term));
    }),
    [appointments, searchTerm],
  );

  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedAppointmentId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPatient || !selectedDoctor || !formData.date || !formData.time) {
      toast.error('Please select patient, doctor, date, and time slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addAppointment({
        patient: selectedPatient.name,
        patientId: selectedPatient.id,
        doctor: selectedDoctor.name,
        doctorId: selectedDoctor.doctorId,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        status: 'Confirmed',
        department: selectedDoctor.department,
        bookingMode: formData.bookingMode,
        bookingSource: 'Reception Desk',
        patientStatus: formData.patientStatus,
        fees: selectedDoctor.consultationFee,
        notes: formData.notes,
        location: formData.ward || `${selectedDoctor.department} OPD`,
        documents,
      }, user?.name || 'Receptionist');

      await updatePatient(selectedPatient.id, {
        doctorId: selectedDoctor.doctorId,
        doctor: selectedDoctor.name,
        department: selectedDoctor.department,
        status: formData.patientStatus,
        ward: formData.ward || selectedPatient.ward,
      }, user?.name || 'Receptionist');

      toast.success('Appointment booked and shared across dashboards.');
      setFormData({
        patientId: '',
        doctorId: '',
        date: '',
        time: '',
        type: 'Consultation',
        bookingMode: 'Walk-in',
        patientStatus: 'Active',
        ward: '',
        notes: '',
      });
      setDocuments([]);
    } catch (error) {
      toast.error(error.message || 'Unable to create booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface ">Receptionist Booking Desk</h1>
        <p className="text-body-md text-on-surface-variant">
          Capture patient bookings, booking source, uploads, admission status, and doctor assignment from one screen.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface-container xl:col-span-7"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-primary/10 p-4 text-primary dark:bg-surface-container-high ">
            <FiCalendar className="h-6 w-6" />
            <div>
              <h2 className="text-headline-md font-bold">New Appointment Booking</h2>
              <p className="text-body-md text-on-surface-variant">
                Book walk-in, phone, online, or referral appointments and sync them to patient and doctor roles.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-body-md font-bold text-on-surface ">Patient</label>
              <select
                value={formData.patientId}
                onChange={(event) => setFormData((current) => ({ ...current, patientId: event.target.value }))}
                className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface-container-high "
              >
                <option value="">Choose patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name} ({patient.id})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-body-md font-bold text-on-surface ">Doctor</label>
              <select
                value={formData.doctorId}
                onChange={(event) => setFormData((current) => ({ ...current, doctorId: event.target.value, ward: '' }))}
                className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface-container-high "
              >
                <option value="">Choose doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.doctorId} value={doctor.doctorId}>
                    {doctor.name} ({doctor.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-body-md font-bold text-on-surface ">Booking Mode</label>
              <select
                value={formData.bookingMode}
                onChange={(event) => setFormData((current) => ({ ...current, bookingMode: event.target.value }))}
                className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface-container-high "
              >
                <option>Walk-in</option>
                <option>Phone</option>
                <option>Online</option>
                <option>Referral</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-body-md font-bold text-on-surface ">Patient Status</label>
              <select
                value={formData.patientStatus}
                onChange={(event) => setFormData((current) => ({ ...current, patientStatus: event.target.value }))}
                className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface-container-high "
              >
                <option>Active</option>
                <option>Admitted</option>
                <option>Pending</option>
                <option>Emergency</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-body-md font-bold text-on-surface ">Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))}
                className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface-container-high "
              />
            </div>

            <div className="space-y-2">
              <label className="text-body-md font-bold text-on-surface ">Ward / Location</label>
              <input
                type="text"
                value={formData.ward}
                onChange={(event) => setFormData((current) => ({ ...current, ward: event.target.value }))}
                placeholder="Room, ward, or OPD desk"
                className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface-container-high "
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-body-md font-bold text-on-surface ">Time Slot</label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setFormData((current) => ({ ...current, time: slot }))}
                  className={`rounded-2xl border px-4 py-3 text-body-md font-bold transition ${
                    formData.time === slot
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant bg-surface-container-lowest text-on-surface dark:border-outline dark:bg-surface-container-high '
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <FiClock />
                    {slot}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-body-md font-bold text-on-surface ">Notes</label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Add intake notes, special requests, or booking remarks."
              className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface-container-high "
            />
          </div>

          <DocumentUploader
            label="Upload Booking Documents"
            helperText="Attach prescriptions, Aadhaar copies, scanned reports, PDFs, and images for this booking."
            category="Booking Document"
            uploadedBy={user?.name || 'Receptionist'}
            onDocumentsAdded={(nextDocuments) => setDocuments((current) => [...current, ...nextDocuments])}
          />

          {documents.length ? <DocumentList documents={documents} /> : null}

          <div className="flex justify-end border-t border-outline-variant/40 pt-4 dark:border-outline/40">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-body-md font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiUserPlus />
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </motion.form>

        <div className="space-y-6 xl:col-span-5">
          <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface-container">
            <h2 className="text-headline-md font-bold text-on-surface ">Selected Details</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-surface-container-high">
                <p className="text-label-md uppercase text-on-surface-variant">Patient</p>
                <p className="mt-1 text-body-md font-bold text-on-surface ">
                  {selectedPatient ? `${selectedPatient.name} (${selectedPatient.id})` : 'Select patient'}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-surface-container-high">
                <p className="text-label-md uppercase text-on-surface-variant">Doctor Fee / Experience</p>
                <p className="mt-1 text-body-md font-bold text-on-surface ">
                  {selectedDoctor ? `${formatInr(selectedDoctor.consultationFee)} • ${selectedDoctor.experience}` : 'Select doctor'}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-surface-container-high">
                <p className="text-label-md uppercase text-on-surface-variant">Specialization</p>
                <p className="mt-1 text-body-md font-bold text-on-surface ">
                  {selectedDoctor?.specialization || 'Select doctor'}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface-container">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-headline-md font-bold text-on-surface ">Today&apos;s Queue</h2>
              <div className="relative w-full max-w-[220px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="text"
                  placeholder="Search queue"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2 pl-9 pr-3 text-body-md text-on-surface dark:border-outline dark:bg-surface-container-high "
                />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {queue.slice(0, 6).map((appointment) => (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => setSelectedAppointmentId(appointment.id)}
                  className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 text-left dark:border-outline dark:bg-surface-container-high"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-body-md font-bold text-on-surface ">{appointment.patient}</p>
                      <p className="text-body-md text-on-surface-variant">
                        {appointment.doctor} • {formatDateTime(appointment.date, appointment.time)}
                      </p>
                      <p className="mt-1 text-label-md text-primary">{appointment.bookingMode} • {formatInr(appointment.fees)}</p>
                    </div>
                    <span className="rounded-full bg-secondary-container px-2 py-1 text-label-md text-on-secondary-container">
                      {appointment.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointmentId(null)}
      />
    </div>
  );
}
