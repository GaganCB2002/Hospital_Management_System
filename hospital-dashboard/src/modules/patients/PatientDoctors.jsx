import { useMemo, useState } from 'react';
import DoctorDetailModal from '../../components/details/DoctorDetailModal';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { formatInr } from '../../lib/formatters';

export default function PatientDoctors() {
  const { user } = useAuth();
  const { patients, doctors, appointments } = useHospital();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  const patient = useMemo(
    () => patients.find((entry) => entry.name === user?.name || entry.email === user?.email),
    [patients, user],
  );
  const relatedDoctorIds = useMemo(() => {
    const doctorIds = new Set();
    if (patient?.doctorId) {
      doctorIds.add(patient.doctorId);
    }
    appointments
      .filter((appointment) => appointment.patientId === patient?.id || appointment.patient === user?.name)
      .forEach((appointment) => {
        if (appointment.doctorId) {
          doctorIds.add(appointment.doctorId);
        }
      });
    return Array.from(doctorIds);
  }, [appointments, patient, user]);

  const relatedDoctors = doctors.filter((doctor) => relatedDoctorIds.includes(doctor.doctorId));
  const selectedDoctor = doctors.find((doctor) => doctor.doctorId === selectedDoctorId);

  if (!relatedDoctors.length) {
    return (
      <EmptyState
        icon="stethoscope"
        title="No doctor relationship yet"
        description="Once appointments are booked, the doctors you consulted will appear here with full fee and experience details."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface dark:text-white">My Doctors</h1>
        <p className="text-body-md text-on-surface-variant">
          See every doctor connected to your care plan, with experience, fees, ratings, and schedules.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {relatedDoctors.map((doctor) => (
          <button
            key={doctor.doctorId}
            type="button"
            onClick={() => setSelectedDoctorId(doctor.doctorId)}
            className="rounded-3xl border border-outline-variant bg-surface p-6 text-left shadow-sm transition hover:border-primary dark:border-outline dark:bg-surface"
          >
            <div className="flex items-start gap-4">
              <img src={doctor.avatar} alt={doctor.name} className="h-16 w-16 rounded-2xl border border-outline-variant object-cover dark:border-outline" />
              <div className="flex-1">
                <p className="text-headline-md font-bold text-on-surface dark:text-white">{doctor.name}</p>
                <p className="text-body-md text-on-surface-variant">{doctor.specialization}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-surface-container-lowest p-3 dark:bg-on-primary-fixed">
                    <p className="text-label-md uppercase text-on-surface-variant">Experience</p>
                    <p className="mt-1 text-body-md font-bold text-on-surface dark:text-white">{doctor.experience}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-lowest p-3 dark:bg-on-primary-fixed">
                    <p className="text-label-md uppercase text-on-surface-variant">Fees</p>
                    <p className="mt-1 text-body-md font-bold text-on-surface dark:text-white">{formatInr(doctor.consultationFee)}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-lowest p-3 dark:bg-on-primary-fixed">
                    <p className="text-label-md uppercase text-on-surface-variant">Rating</p>
                    <p className="mt-1 text-body-md font-bold text-on-surface dark:text-white">{doctor.rating} / 5</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-lowest p-3 dark:bg-on-primary-fixed">
                    <p className="text-label-md uppercase text-on-surface-variant">Department</p>
                    <p className="mt-1 text-body-md font-bold text-on-surface dark:text-white">{doctor.department}</p>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <DoctorDetailModal doctor={selectedDoctor} isOpen={Boolean(selectedDoctor)} onClose={() => setSelectedDoctorId('')} />
    </div>
  );
}
