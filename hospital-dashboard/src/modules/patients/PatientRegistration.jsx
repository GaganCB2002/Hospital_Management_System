import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiActivity, FiInfo, FiSave, FiUserCheck } from 'react-icons/fi';
import DocumentList from '../../components/documents/DocumentList';
import DocumentUploader from '../../components/documents/DocumentUploader';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';

const initialForm = {
  name: '',
  age: '',
  gender: 'Male',
  phone: '',
  email: '',
  bloodType: 'A+',
  condition: 'Stable',
  doctorId: '',
  department: '',
  address: '',
  emergencyName: '',
  emergencyRelation: '',
  emergencyPhone: '',
  insuranceProvider: '',
  insurancePolicy: '',
  status: 'Pending',
  ward: 'Pending Triage',
  bookingMode: 'Walk-in',
  notes: '',
};

export default function PatientRegistration() {
  const { user } = useAuth();
  const { doctors, addPatient } = useHospital();
  const [formData, setFormData] = useState(initialForm);
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDoctor = doctors.find((doctor) => doctor.doctorId === formData.doctorId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and phone are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addPatient({
        name: formData.name,
        age: Number(formData.age) || 0,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        bloodType: formData.bloodType,
        condition: formData.condition,
        doctorId: formData.doctorId,
        doctor: selectedDoctor?.name || '',
        department: selectedDoctor?.department || formData.department || 'General',
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyName,
          relation: formData.emergencyRelation,
          phone: formData.emergencyPhone,
        },
        insuranceProvider: formData.insuranceProvider || 'Self Pay',
        insurancePolicy: formData.insurancePolicy || 'SELF-PAY',
        status: formData.status,
        ward: formData.ward,
        bookingMode: formData.bookingMode,
        notes: formData.notes,
        admittedDate: new Date().toISOString().split('T')[0],
        documents,
      }, user?.name || 'Receptionist');

      toast.success('Patient registered successfully.');
      setFormData(initialForm);
      setDocuments([]);
    } catch (error) {
      toast.error(error.message || 'Unable to register patient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">Patient Registration</h1>
        <p className="text-body-md text-on-surface-variant">
          Capture patient demographics, doctor assignment, booking source, admission status, and supporting documents.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-sm dark:border-outline dark:bg-surface-container"
      >
        <div className="border-b border-outline-variant/30 bg-primary/5 p-6 dark:border-outline/30 dark:bg-surface-container-high">
          <div className="mb-2 flex items-center gap-3 text-on-surface">
            <FiUserCheck className="h-6 w-6" />
            <h2 className="text-headline-md font-bold">New Patient Intake</h2>
          </div>
          <p className="text-body-md text-on-surface-variant">
            Admissions created here are reflected in the receptionist dashboard and doctor dashboard immediately.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 p-6">
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-body-md font-bold uppercase tracking-wider text-on-surface">
              <FiInfo className="text-primary" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <input className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" placeholder="Full name *" value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} />
              <input className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" placeholder="Phone *" value={formData.phone} onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))} />
              <input className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" placeholder="Email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} />
              <input className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" placeholder="Age" type="number" value={formData.age} onChange={(event) => setFormData((current) => ({ ...current, age: event.target.value }))} />
              <select className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" value={formData.gender} onChange={(event) => setFormData((current) => ({ ...current, gender: event.target.value }))}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <select className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" value={formData.bloodType} onChange={(event) => setFormData((current) => ({ ...current, bloodType: event.target.value }))}>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O+</option>
                <option>O-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
              <input className="md:col-span-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" placeholder="Residential address" value={formData.address} onChange={(event) => setFormData((current) => ({ ...current, address: event.target.value }))} />
            </div>
          </section>

          <section>
            <h3 className="mb-4 flex items-center gap-2 text-body-md font-bold uppercase tracking-wider text-on-surface">
              <FiActivity className="text-secondary" />
              Admission and Care Details
            </h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <select className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" value={formData.doctorId} onChange={(event) => setFormData((current) => ({ ...current, doctorId: event.target.value }))}>
                <option value="">Assign doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.doctorId} value={doctor.doctorId}>{doctor.name} ({doctor.department})</option>
                ))}
              </select>
              <input className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" placeholder="Department" value={selectedDoctor?.department || formData.department} onChange={(event) => setFormData((current) => ({ ...current, department: event.target.value }))} />
              <select className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
                <option>Pending</option>
                <option>Active</option>
                <option>Admitted</option>
                <option>Emergency</option>
              </select>
              <input className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" placeholder="Ward / Room" value={formData.ward} onChange={(event) => setFormData((current) => ({ ...current, ward: event.target.value }))} />
              <select className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" value={formData.condition} onChange={(event) => setFormData((current) => ({ ...current, condition: event.target.value }))}>
                <option>Stable</option>
                <option>Observation</option>
                <option>Critical</option>
                <option>Recovering</option>
              </select>
              <select className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" value={formData.bookingMode} onChange={(event) => setFormData((current) => ({ ...current, bookingMode: event.target.value }))}>
                <option>Walk-in</option>
                <option>Phone</option>
                <option>Online</option>
                <option>Referral</option>
              </select>
              <textarea className="md:col-span-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" rows={3} placeholder="Clinical or admission notes" value={formData.notes} onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))} />
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-body-md font-bold uppercase tracking-wider text-on-surface">Emergency and Insurance</h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <input className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" placeholder="Emergency contact name" value={formData.emergencyName} onChange={(event) => setFormData((current) => ({ ...current, emergencyName: event.target.value }))} />
              <input className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" placeholder="Relationship" value={formData.emergencyRelation} onChange={(event) => setFormData((current) => ({ ...current, emergencyRelation: event.target.value }))} />
              <input className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" placeholder="Emergency phone" value={formData.emergencyPhone} onChange={(event) => setFormData((current) => ({ ...current, emergencyPhone: event.target.value }))} />
              <input className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" placeholder="Insurance provider" value={formData.insuranceProvider} onChange={(event) => setFormData((current) => ({ ...current, insuranceProvider: event.target.value }))} />
              <input className="md:col-span-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 dark:border-outline dark:bg-surface-container-high" placeholder="Policy number" value={formData.insurancePolicy} onChange={(event) => setFormData((current) => ({ ...current, insurancePolicy: event.target.value }))} />
            </div>
          </section>

          <DocumentUploader
            label="Upload ID Proof, Reports, and PDFs"
            helperText="Attach Aadhaar copies, scan reports, lab PDFs, images, and all important intake files."
            category="Patient Intake"
            uploadedBy={user?.name || 'Receptionist'}
            onDocumentsAdded={(nextDocuments) => setDocuments((current) => [...current, ...nextDocuments])}
          />

          {documents.length ? <DocumentList documents={documents} /> : null}

          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4 dark:border-outline/30">
            <button
              type="button"
              onClick={() => {
                setFormData(initialForm);
                setDocuments([]);
              }}
              className="text-body-md font-bold text-on-surface-variant"
            >
              Clear form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-body-md font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSave />
              {isSubmitting ? 'Saving...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
