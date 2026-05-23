import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiUploadCloud,
  FiPhone,
  FiMail,
  FiBookOpen,
  FiGlobe,
  FiActivity,
  FiAlertCircle,
  FiStar,
  FiAward,
  FiBriefcase,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import DocumentList from '../../components/documents/DocumentList';
import DocumentUploader from '../../components/documents/DocumentUploader';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { formatInr } from '../../lib/formatters';

export default function BookAppointment() {
  const { user } = useAuth();
  const { doctors, patients, addAppointment } = useHospital();
  const patient = useMemo(
    () => patients.find((entry) => entry.name === user?.name || entry.email === user?.email),
    [patients, user],
  );

  const [formData, setFormData] = useState({
    department: '',
    doctorId: '',
    date: '',
    time: '',
    type: 'Consultation',
    notes: '',
    preferredContact: patient?.mobile || '',
  });
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (patient?.mobile && !formData.preferredContact) {
      const timer = setTimeout(() => {
        setFormData((current) => ({ ...current, preferredContact: patient.mobile }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [patient?.mobile, formData.preferredContact]);

  const departments = Array.from(new Set(doctors.map((doctor) => doctor.department))).sort();
  const filteredDoctors = formData.department
    ? doctors.filter((doctor) => doctor.department === formData.department)
    : doctors;
  const selectedDoctor = doctors.find((doctor) => doctor.doctorId === formData.doctorId);

  // Filter slots dynamically by selected date's day of week
  const dateSlots = useMemo(() => {
    if (!selectedDoctor) return [];
    if (!formData.date) {
      // Default: Return all slots for the doctor
      return selectedDoctor.availabilitySchedule?.flatMap((schedule) => schedule.slots) || [];
    }
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [year, month, day] = formData.date.split('-').map(Number);
    const selectedDayName = days[new Date(year, month - 1, day).getDay()];
    const daySchedule = selectedDoctor.availabilitySchedule?.find(
      (s) => s.day.toLowerCase() === selectedDayName.toLowerCase()
    );
    if (daySchedule && daySchedule.slots && daySchedule.slots.length > 0) {
      return daySchedule.slots;
    }
    // Fallback to all slots if no specific day schedule is found
    return selectedDoctor.availabilitySchedule?.flatMap((schedule) => schedule.slots) || [];
  }, [selectedDoctor, formData.date]);

  const availableSlots = useMemo(() => {
    if (dateSlots.length > 0) return dateSlots;
    return ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
  }, [dateSlots]);

  // Split slots into Morning (AM) and Evening (PM)
  const morningSlots = useMemo(() => {
    return availableSlots.filter(
      (slot) =>
        slot.toUpperCase().includes('AM') ||
        slot.toLowerCase().includes('morning') ||
        slot.toLowerCase().includes('08:') ||
        slot.toLowerCase().includes('09:') ||
        slot.toLowerCase().includes('10:') ||
        slot.toLowerCase().includes('11:')
    );
  }, [availableSlots]);

  const eveningSlots = useMemo(() => {
    return availableSlots.filter((slot) => !morningSlots.includes(slot));
  }, [availableSlots, morningSlots]);

  // Simulate booked slots (e.g. odd-indexed slots)
  const getSlotIndexInAll = (slot) => availableSlots.indexOf(slot);
  const isBooked = (slot) => {
    const idx = getSlotIndexInAll(slot);
    return idx !== -1 && idx % 2 === 1;
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.department) {
      nextErrors.department = 'Department is required';
    }
    if (!formData.doctorId) {
      nextErrors.doctorId = 'Doctor selection is required';
    }
    if (!formData.date) {
      nextErrors.date = 'Preferred date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        nextErrors.date = 'Date cannot be in the past';
      }
    }
    if (!formData.time) {
      nextErrors.time = 'Appointment slot selection is required';
    }
    if (!formData.preferredContact.trim()) {
      nextErrors.preferredContact = 'Contact number is required';
    } else if (!/^[+0-9\s-]{6,15}$/.test(formData.preferredContact.trim())) {
      nextErrors.preferredContact = 'Please enter a valid contact number (6-15 digits)';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the validation errors in the form.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addAppointment(
        {
          patient: patient?.name || user?.name,
          patientId: patient?.id || '',
          doctor: selectedDoctor.name,
          doctorId: selectedDoctor.doctorId,
          department: selectedDoctor.department,
          doctorSpecialization: selectedDoctor.specialization,
          date: formData.date,
          time: formData.time,
          type: formData.type,
          status: 'Pending',
          notes: formData.notes,
          contactPhone: formData.preferredContact,
          contactEmail: patient?.email || user?.email || '',
          bookingMode: 'Online',
          bookingSource: 'Patient Portal',
          fees: selectedDoctor.consultationFee,
          documents,
        },
        user?.name || 'Patient',
      );

      toast.success('Appointment request sent successfully.');
      setFormData({
        department: '',
        doctorId: '',
        date: '',
        time: '',
        type: 'Consultation',
        notes: '',
        preferredContact: patient?.mobile || '',
      });
      setDocuments([]);
      setErrors({});
    } catch (error) {
      toast.error(error.message || 'Unable to book appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-label-md font-bold text-success dark:bg-success/20">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Available
          </span>
        );
      case 'in-surgery':
      case 'in ot':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-error/15 px-2.5 py-1 text-label-md font-bold text-error dark:bg-error/20">
            <span className="h-1.5 w-1.5 rounded-full bg-error animate-pulse" />
            In Surgery
          </span>
        );
      case 'on-call':
      case 'on call':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-info/15 px-2.5 py-1 text-label-md font-bold text-info dark:bg-info/20">
            <span className="h-1.5 w-1.5 rounded-full bg-info animate-pulse" />
            On-Call
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-outline/15 px-2.5 py-1 text-label-md font-bold text-on-surface-variant dark:bg-outline/25">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  if (!doctors.length) {
    return (
      <EmptyState
        icon="calendar_month"
        title="Doctor schedule not available"
        description="Doctor profiles must be configured before online appointments can be booked."
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-headline-lg font-bold text-on-surface">Book Doctor Appointment</h1>
        <p className="text-body-md text-on-surface-variant">
          Review doctor experience, fees, availability, and upload records before sending your request.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <motion.form
          id="booking-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface-container lg:col-span-7"
        >
          <div className="rounded-2xl bg-primary p-6 text-on-primary">
            <FiCalendar className="mb-3 h-10 w-10 opacity-80" />
            <h2 className="text-headline-md font-bold">Online Appointment Request</h2>
            <p className="mt-1 text-body-md text-white/90">
              Booking mode: Online. Your uploaded files and request notes will be visible to reception and the doctor.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-body-md font-bold text-on-surface">Department</label>
              <select
                value={formData.department}
                onChange={(event) => {
                  setFormData((current) => ({
                    ...current,
                    department: event.target.value,
                    doctorId: '',
                    time: '',
                  }));
                  setErrors((curr) => ({ ...curr, department: '', doctorId: '', time: '' }));
                }}
                className={`w-full rounded-2xl border bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface dark:bg-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                  errors.department ? 'border-error ring-1 ring-error/20' : 'border-outline-variant dark:border-outline'
                }`}
              >
                <option value="">Choose department</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-body-sm text-error font-medium">{errors.department}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-body-md font-bold text-on-surface">Appointment Type</label>
              <select
                value={formData.type}
                onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value }))}
                className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option>Consultation</option>
                <option>Follow-up</option>
                <option>Check-up</option>
                <option>Second Opinion</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-body-md font-bold text-on-surface">Doctor</label>
              <select
                value={formData.doctorId}
                onChange={(event) => {
                  setFormData((current) => ({ ...current, doctorId: event.target.value, time: '' }));
                  setErrors((curr) => ({ ...curr, doctorId: '', time: '' }));
                }}
                disabled={!formData.department}
                className={`w-full rounded-2xl border bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface disabled:cursor-not-allowed disabled:opacity-60 dark:bg-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                  errors.doctorId ? 'border-error ring-1 ring-error/20' : 'border-outline-variant dark:border-outline'
                }`}
              >
                <option value="">Choose doctor</option>
                {filteredDoctors.map((doctor) => (
                  <option key={doctor.doctorId} value={doctor.doctorId}>
                    {doctor.name} ({doctor.specialization}) — {formatInr(doctor.consultationFee)}
                  </option>
                ))}
              </select>
              {errors.doctorId && (
                <p className="text-body-sm text-error font-medium">{errors.doctorId}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-body-md font-bold text-on-surface">Preferred Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(event) => {
                  setFormData((current) => ({ ...current, date: event.target.value, time: '' }));
                  setErrors((curr) => ({ ...curr, date: '', time: '' }));
                }}
                className={`w-full rounded-2xl border bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface dark:bg-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                  errors.date ? 'border-error ring-1 ring-error/20' : 'border-outline-variant dark:border-outline'
                }`}
              />
              {errors.date && (
                <p className="text-body-sm text-error font-medium">{errors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-body-md font-bold text-on-surface">Contact Number</label>
              <input
                type="text"
                value={formData.preferredContact}
                onChange={(event) => {
                  setFormData((current) => ({ ...current, preferredContact: event.target.value }));
                  setErrors((curr) => ({ ...curr, preferredContact: '' }));
                }}
                placeholder="+91 XXXXX XXXXX"
                className={`w-full rounded-2xl border bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface dark:bg-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                  errors.preferredContact ? 'border-error ring-1 ring-error/20' : 'border-outline-variant dark:border-outline'
                }`}
              />
              {errors.preferredContact && (
                <p className="text-body-sm text-error font-medium">{errors.preferredContact}</p>
              )}
            </div>
          </div>

          {/* Slots Section */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col gap-1 border-t border-outline-variant/40 pt-4 dark:border-outline/40">
              <label className="text-body-md font-bold text-on-surface">Available Slots</label>
              {!selectedDoctor ? (
                <p className="text-body-sm text-on-surface-variant">Please choose a doctor to view availability schedule.</p>
              ) : formData.date ? (
                <p className="text-body-sm text-on-surface-variant font-medium">
                  Showing slots for {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}.
                </p>
              ) : (
                <p className="text-body-sm text-on-surface-variant font-medium">Choose a date to filter slots by day of week.</p>
              )}
            </div>

            {selectedDoctor && (
              <div className="space-y-5">
                {/* Morning Slots */}
                {morningSlots.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                      <FiSun className="text-amber-500 shrink-0 h-4.5 w-4.5" />
                      <span>Morning Slots</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {morningSlots.map((slot) => {
                        const booked = isBooked(slot);
                        const selected = formData.time === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={booked}
                            onClick={() => {
                              setFormData((current) => ({ ...current, time: slot }));
                              setErrors((curr) => ({ ...curr, time: '' }));
                            }}
                            className={`group relative rounded-2xl border px-3 py-2.5 text-body-sm font-bold transition-all duration-200 ${
                              selected
                                ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                                : booked
                                ? 'border-outline-variant/30 bg-surface-container text-on-surface-variant/40 line-through cursor-not-allowed opacity-50 dark:border-outline/20 dark:bg-surface-container-high'
                                : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary/50 hover:bg-primary/5 dark:border-outline dark:bg-surface-container-high dark:hover:border-primary/50'
                            }`}
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              <FiClock className={`shrink-0 ${selected ? 'text-primary' : booked ? 'text-on-surface-variant/20' : 'text-on-surface-variant'}`} />
                              <span>{slot}</span>
                              {booked && (
                                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-error/15 px-1 py-0.5 text-[8px] font-bold text-error uppercase tracking-wider border border-error/20 dark:bg-error/25">
                                  Booked
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Evening Slots */}
                {eveningSlots.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                      <FiMoon className="text-indigo-500 shrink-0 h-4.5 w-4.5" />
                      <span>Evening Slots</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {eveningSlots.map((slot) => {
                        const booked = isBooked(slot);
                        const selected = formData.time === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={booked}
                            onClick={() => {
                              setFormData((current) => ({ ...current, time: slot }));
                              setErrors((curr) => ({ ...curr, time: '' }));
                            }}
                            className={`group relative rounded-2xl border px-3 py-2.5 text-body-sm font-bold transition-all duration-200 ${
                              selected
                                ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                                : booked
                                ? 'border-outline-variant/30 bg-surface-container text-on-surface-variant/40 line-through cursor-not-allowed opacity-50 dark:border-outline/20 dark:bg-surface-container-high'
                                : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary/50 hover:bg-primary/5 dark:border-outline dark:bg-surface-container-high dark:hover:border-primary/50'
                            }`}
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              <FiClock className={`shrink-0 ${selected ? 'text-primary' : booked ? 'text-on-surface-variant/20' : 'text-on-surface-variant'}`} />
                              <span>{slot}</span>
                              {booked && (
                                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-error/15 px-1 py-0.5 text-[8px] font-bold text-error uppercase tracking-wider border border-error/20 dark:bg-error/25">
                                  Booked
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {morningSlots.length === 0 && eveningSlots.length === 0 && (
                  <p className="text-body-md text-error font-medium">No available slots for the selected doctor or date. Please choose another date.</p>
                )}

                {errors.time && (
                  <p className="text-body-sm text-error font-medium">{errors.time}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-outline-variant/40 pt-4 dark:border-outline/40">
            <label className="text-body-md font-bold text-on-surface">Symptoms / Notes</label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Describe your concern, previous reports, or anything the doctor should know."
              className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <DocumentUploader
            label="Upload Prescriptions, Reports, or PDFs"
            helperText="Upload PDFs, images, prescriptions, scans, and other files that should go with this booking."
            category="Appointment Upload"
            uploadedBy={user?.name || 'Patient'}
            onDocumentsAdded={(nextDocuments) => setDocuments((current) => [...current, ...nextDocuments])}
          />

          {documents.length ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-body-md font-bold text-on-surface">
                <FiUploadCloud />
                Uploaded documents
              </div>
              <DocumentList documents={documents} />
            </div>
          ) : null}

          <div className="flex justify-end border-t border-outline-variant/40 pt-4 dark:border-outline/40">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-body-md font-bold text-white transition hover:bg-primary/95 focus:ring-2 focus:ring-primary/20 outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiCheckCircle />
              {isSubmitting ? 'Submitting...' : 'Send Appointment Request'}
            </button>
          </div>
        </motion.form>

        <div className="space-y-6 lg:col-span-5">
          <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface-container">
            <h2 className="text-headline-md font-bold text-on-surface">Selected Doctor Details</h2>
            
            <AnimatePresence mode="wait">
              {selectedDoctor ? (
                <motion.div
                  key={selectedDoctor.doctorId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="mt-5 space-y-5"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 pb-5 border-b border-outline-variant/60 dark:border-outline/40">
                    <img
                      src={selectedDoctor.avatar}
                      alt={selectedDoctor.name}
                      className="h-24 w-24 rounded-3xl object-cover border-2 border-outline-variant shadow-md dark:border-outline"
                    />
                    <div className="space-y-1 min-w-0 w-full break-words">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {getStatusBadge(selectedDoctor.status)}
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-label-md font-bold text-primary dark:bg-primary/20">
                          <FiStar className="fill-primary text-primary h-3.5 w-3.5" />
                          <span>{selectedDoctor.rating} / 5</span>
                        </span>
                      </div>
                      <h3 className="text-body-lg font-bold text-on-surface leading-tight">{selectedDoctor.name}</h3>
                      <p className="text-body-md font-bold text-primary leading-tight">{selectedDoctor.specialization}</p>
                      <p className="text-label-md text-on-surface-variant">{selectedDoctor.department}</p>
                    </div>
                  </div>

                  {selectedDoctor.status?.toLowerCase() === 'on-call' && (
                    <div className="flex items-start gap-2.5 rounded-2xl bg-error/10 p-3.5 text-error border border-error/20 dark:bg-error/15">
                      <FiAlertCircle className="mt-0.5 shrink-0 h-5 w-5" />
                      <div>
                        <p className="text-body-md font-bold leading-tight">Emergency On-Call Duty Active</p>
                        <p className="text-label-md text-error/85 mt-1">This doctor is currently handling urgent and emergency requests. Bookings may experience slight delays.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-surface-container-lowest p-4 border border-outline-variant/40 dark:bg-surface-container-high dark:border-outline/40">
                      <div className="flex items-center gap-1.5 text-label-md uppercase font-bold text-on-surface-variant mb-1">
                        <FiAward className="text-primary shrink-0" />
                        <span>Qualification</span>
                      </div>
                      <p className="text-body-md font-bold text-on-surface break-words leading-snug">{selectedDoctor.qualification}</p>
                    </div>

                    <div className="rounded-2xl bg-surface-container-lowest p-4 border border-outline-variant/40 dark:bg-surface-container-high dark:border-outline/40">
                      <div className="flex items-center gap-1.5 text-label-md uppercase font-bold text-on-surface-variant mb-1">
                        <FiBriefcase className="text-primary shrink-0" />
                        <span>Experience</span>
                      </div>
                      <p className="text-body-md font-bold text-on-surface leading-snug">{selectedDoctor.experience}</p>
                    </div>

                    <div className="rounded-2xl bg-surface-container-lowest p-4 border border-outline-variant/40 dark:bg-surface-container-high dark:border-outline/40">
                      <div className="flex items-center gap-1.5 text-label-md uppercase font-bold text-on-surface-variant mb-1">
                        <FiActivity className="text-primary shrink-0" />
                        <span>Consultation Fee</span>
                      </div>
                      <p className="text-body-md font-bold text-on-surface leading-snug">{formatInr(selectedDoctor.consultationFee)}</p>
                    </div>

                    <div className="rounded-2xl bg-surface-container-lowest p-4 border border-outline-variant/40 dark:bg-surface-container-high dark:border-outline/40">
                      <div className="flex items-center gap-1.5 text-label-md uppercase font-bold text-on-surface-variant mb-1">
                        <FiClock className="text-primary shrink-0" />
                        <span>Shift Timing</span>
                      </div>
                      <p className="text-body-sm font-bold text-on-surface break-words leading-tight">{selectedDoctor.shiftTiming}</p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-2xl bg-surface-container-lowest/50 p-4 border border-outline-variant/40 dark:bg-surface-container-high/50 dark:border-outline/40">
                    <p className="text-label-md font-bold uppercase text-on-surface-variant mb-1">Contact & Languages</p>
                    <div className="flex items-center gap-3 text-body-md text-on-surface">
                      <FiPhone className="text-on-surface-variant shrink-0" />
                      <a href={`tel:${selectedDoctor.phone}`} className="hover:text-primary transition">{selectedDoctor.phone}</a>
                    </div>
                    <div className="flex items-center gap-3 text-body-md text-on-surface">
                      <FiMail className="text-on-surface-variant shrink-0" />
                      <a href={`mailto:${selectedDoctor.email}`} className="hover:text-primary transition break-all leading-tight">{selectedDoctor.email}</a>
                    </div>
                    <div className="flex items-center gap-3 text-body-md text-on-surface pt-1 border-t border-outline-variant/30 dark:border-outline/30">
                      <FiGlobe className="text-on-surface-variant shrink-0" />
                      <span className="text-body-md">
                        {selectedDoctor.languages ? selectedDoctor.languages.join(', ') : 'English, Hindi'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-body-md font-bold text-on-surface flex items-center gap-2">
                      <FiBookOpen className="text-primary shrink-0" /> About Doctor
                    </h4>
                    <p className="text-body-md text-on-surface-variant leading-relaxed italic bg-surface-container-lowest/30 p-3 rounded-xl border border-dashed border-outline-variant dark:bg-surface-container-high/30 dark:border-outline/40">
                      "{selectedDoctor.bio || 'Dedicated medical professional committed to providing exceptional patient care and clinical outcomes.'}"
                    </p>
                  </div>

                  <div className="rounded-2xl border border-outline-variant/60 p-4 dark:border-outline/60">
                    <p className="text-body-md font-bold text-on-surface flex items-center gap-2 mb-3">
                      <FiCalendar className="text-primary shrink-0" /> Regular Weekly Availability
                    </p>
                    <div className="space-y-2">
                      {selectedDoctor.availabilitySchedule?.map((schedule) => (
                        <div key={schedule.day} className="flex justify-between items-center rounded-xl bg-surface-container-lowest px-4 py-2.5 border border-outline-variant/20 dark:bg-surface-container-high dark:border-outline/20">
                          <span className="text-body-md font-bold text-on-surface">{schedule.day}</span>
                          <span className="text-label-md bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-bold dark:bg-primary/20">
                            {schedule.slots.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const element = document.getElementById('booking-form');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="w-full sm:hidden inline-flex items-center justify-center gap-2 rounded-2xl border border-primary px-4 py-3 text-body-md font-bold text-primary hover:bg-primary/10 transition mt-2"
                  >
                    Fill Appointment Form
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4"
                >
                  <EmptyState
                    icon="stethoscope"
                    title="Select a doctor"
                    description="Doctor fees, experience, qualification, and availability will appear here."
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface-container">
            <h2 className="text-headline-md font-bold text-on-surface">Patient Snapshot</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-surface-container-high">
                <p className="text-label-md uppercase text-on-surface-variant">Patient ID</p>
                <p className="mt-1 text-body-md font-bold text-on-surface">{patient?.id || 'Not linked yet'}</p>
              </div>
              <div className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-surface-container-high">
                <p className="text-label-md uppercase text-on-surface-variant">Assigned Doctor</p>
                <p className="mt-1 text-body-md font-bold text-on-surface">{patient?.assignedDoctor?.name || 'Will be assigned after booking'}</p>
              </div>
              <div className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-surface-container-high">
                <p className="text-label-md uppercase text-on-surface-variant">Existing Records</p>
                <p className="mt-1 text-body-md font-bold text-on-surface">
                  {patient?.documents?.length || 0} uploaded documents
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
