import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

export default function EditPatientModal({ patient, isOpen, onClose }) {
  const { updatePatient, doctors } = useHospital();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const f = form ?? patient;

  if (!patient) return null;

  function handleChange(field, value) {
    setForm((prev) => ({ ...(prev ?? patient), [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...(form ?? patient) };
      delete payload.admissionHistory;
      delete payload.previousTreatments;
      delete payload.labReports;
      delete payload.prescriptions;
      delete payload.diagnosisHistory;
      delete payload.surgeryHistory;
      delete payload.billingHistory;
      delete payload.upcomingAppointments;
      delete payload.previousAppointments;
      delete payload.vitalsTimeline;
      delete payload.scanReports;
      delete payload.documents;
      delete payload.dischargeSummary;
      delete payload.emergencyContact;
      delete payload.insuranceDetails;
      delete payload.personalDetails;

      const selectedDoctor = doctors.find((d) => d.doctorId === (form?.doctorId || patient.doctorId));
      if (selectedDoctor) {
        payload.doctor = selectedDoctor.name;
        payload.department = selectedDoctor.department;
      }

      await updatePatient(patient.id, payload, user?.name || 'Receptionist');
      toast.success('Patient details updated successfully');
      setForm(null);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update patient');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => { setForm(null); onClose(); }} title="Edit Patient Details" size="lg">
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Full Name</label>
            <input value={f.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface dark:border-outline dark:bg-on-primary-fixed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Age</label>
            <input type="number" value={f.age || ''} onChange={(e) => handleChange('age', Number(e.target.value))} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface dark:border-outline dark:bg-on-primary-fixed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Gender</label>
            <select value={f.gender || 'Male'} onChange={(e) => handleChange('gender', e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface dark:border-outline dark:bg-on-primary-fixed">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Blood Type</label>
            <select value={f.bloodType || 'A+'} onChange={(e) => handleChange('bloodType', e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface dark:border-outline dark:bg-on-primary-fixed">
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
              <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Phone</label>
            <input value={f.phone || f.mobile || ''} onChange={(e) => handleChange('phone', e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface dark:border-outline dark:bg-on-primary-fixed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Email</label>
            <input type="email" value={f.email || ''} onChange={(e) => handleChange('email', e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface dark:border-outline dark:bg-on-primary-fixed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Assigned Doctor</label>
            <select value={f.doctorId || ''} onChange={(e) => handleChange('doctorId', e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface dark:border-outline dark:bg-on-primary-fixed">
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.doctorId} value={d.doctorId}>{d.name} ({d.department})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Department</label>
            <input value={f.department || ''} onChange={(e) => handleChange('department', e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface dark:border-outline dark:bg-on-primary-fixed" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Status</label>
            <select value={f.status || 'Pending'} onChange={(e) => handleChange('status', e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface dark:border-outline dark:bg-on-primary-fixed">
              <option>Pending</option><option>Active</option><option>Admitted</option>
              <option>Discharged</option><option>Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Ward / Room</label>
            <input value={f.ward || ''} onChange={(e) => handleChange('ward', e.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface dark:border-outline dark:bg-on-primary-fixed" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Address</label>
          <textarea value={f.address || ''} onChange={(e) => handleChange('address', e.target.value)} rows={2} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface dark:border-outline dark:bg-on-primary-fixed" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
          <button onClick={() => { setForm(null); onClose(); }} className="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-60 cursor-pointer border-none flex items-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
