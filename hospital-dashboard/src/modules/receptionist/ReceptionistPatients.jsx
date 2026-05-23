import { useMemo, useState } from 'react';
import DoctorDetailModal from '../../components/details/DoctorDetailModal';
import PatientDetailModal from '../../components/details/PatientDetailModal';
import EditPatientModal from '../../components/details/EditPatientModal';
import EmptyState from '../../components/common/EmptyState';
import { useHospital } from '../../context/HospitalContext';
import toast from 'react-hot-toast';

export default function ReceptionistPatients() {
  const { patients, doctors, appointments, deletePatient } = useHospital();
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);

  const handleDeletePatient = async (patientId, patientName) => {
    if (window.confirm(`Are you sure you want to delete patient ${patientName}?`)) {
      try {
        await deletePatient(patientId, 'Receptionist');
        toast.success(`Patient ${patientName} deleted successfully`);
      } catch (error) {
        toast.error('Failed to delete patient');
      }
    }
  };

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return patients;
    }
    return patients.filter((patient) =>
      [patient.name, patient.id, patient.doctor, patient.mobile, patient.status, patient.department]
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [patients, search]);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const selectedDoctor = doctors.find((doctor) => doctor.doctorId === selectedDoctorId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Receptionist Patient Details</h1>
          <p className="text-body-md text-on-surface-variant">
            View older patients, admission status, and all appointment booking details from the front desk.
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search patient, ID, doctor, status"
          className="w-full max-w-sm rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface dark:border-outline dark:bg-surface"
        />
      </div>

      {filteredPatients.length ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredPatients.map((patient) => {
            const latestAppointment = appointments.find((appointment) => appointment.patientId === patient.id);
            return (
              <div key={patient.id} className="rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setSelectedPatientId(patient.id)} className="text-left text-headline-md font-bold text-primary">
                        {patient.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPatient(patient)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all cursor-pointer border-none bg-transparent"
                        title="Edit patient details"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPatientId(patient.id)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-info hover:bg-info/10 transition-all cursor-pointer border-none bg-transparent"
                        title="View patient details"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePatient(patient.id, patient.name)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all cursor-pointer border-none bg-transparent"
                        title="Delete patient"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                    <p className="mt-1 text-body-md text-on-surface-variant">
                      {patient.id} • {patient.department} • {patient.status} • {patient.ward}
                    </p>
                    <button type="button" onClick={() => setSelectedDoctorId(patient.doctorId)} className="mt-2 text-body-md font-bold text-on-surface">
                      {patient.doctor}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-on-primary-fixed">
                      <p className="text-label-md uppercase text-on-surface-variant">Admitted</p>
                      <p className="mt-1 text-body-md font-bold text-on-surface">{patient.admittedDate}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-on-primary-fixed">
                      <p className="text-label-md uppercase text-on-surface-variant">Latest Booking</p>
                      <p className="mt-1 text-body-md font-bold text-on-surface">
                        {latestAppointment?.bookingMode || 'Not booked'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-surface-container-lowest p-4 dark:bg-on-primary-fixed">
                      <p className="text-label-md uppercase text-on-surface-variant">Appointment</p>
                      <p className="mt-1 text-body-md font-bold text-on-surface">
                        {latestAppointment?.status || 'No appointment'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="person_search"
          title="No patient records found"
          description="Try a different patient name, ID, doctor, or status."
        />
      )}

      <PatientDetailModal
        patient={selectedPatient}
        isOpen={Boolean(selectedPatient)}
        onClose={() => setSelectedPatientId('')}
        onDoctorClick={setSelectedDoctorId}
      />
      <EditPatientModal
        patient={editingPatient}
        isOpen={Boolean(editingPatient)}
        onClose={() => setEditingPatient(null)}
      />
      <DoctorDetailModal doctor={selectedDoctor} isOpen={Boolean(selectedDoctor)} onClose={() => setSelectedDoctorId('')} />
    </div>
  );
}
