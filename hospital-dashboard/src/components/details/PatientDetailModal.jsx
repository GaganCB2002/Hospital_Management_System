import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import DocumentList from '../documents/DocumentList';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatInr } from '../../lib/formatters';

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 dark:border-outline dark:bg-on-primary-fixed w-full min-w-0">
      <p className="text-label-md uppercase text-on-surface-variant break-words">{label}</p>
      <p className="mt-1 text-body-md font-bold text-on-surface dark:text-white break-words">{value || 'N/A'}</p>
    </div>
  );
}

function TimelineSection({ title, items, renderItem }) {
  return (
    <section className="space-y-3">
      <h4 className="text-headline-md text-on-surface dark:text-white">{title}</h4>
      {items?.length ? (
        <div className="space-y-3">{items.map(renderItem)}</div>
      ) : (
        <p className="text-body-md text-on-surface-variant">Data not present</p>
      )}
    </section>
  );
}

export default function PatientDetailModal({ patient, isOpen, onClose, onDoctorClick, onEdit, onDelete }) {
  const { updatePatient } = useHospital();
  const { user } = useAuth();
  const [localStatus, setLocalStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  if (!patient) {
    return null;
  }

  const role = user?.role;
  const canEdit = role === 'admin' || role === 'receptionist';
  const canDelete = role === 'admin';

  async function handleStatusUpdate(newStatus) {
    setStatusUpdating(true);
    try {
      await updatePatient(patient.id, { status: newStatus }, user?.name || 'Staff');
      toast.success(`Status updated to ${newStatus}`);
      setLocalStatus(newStatus);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  }

  const currentStatus = localStatus || patient.status;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${patient.name} — Patient Record`} size="xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl bg-surface-container p-4 dark:bg-on-primary-fixed md:flex-row md:items-center w-full min-w-0">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`}
            alt={patient.name}
            className="h-20 w-20 rounded-full border border-outline-variant bg-white shrink-0"
          />
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <h3 className="text-headline-lg text-on-surface dark:text-white break-words">{patient.name}</h3>
                <p className="text-body-md text-on-surface-variant break-words">
                  Patient ID: {patient.id} • {patient.age} years • {patient.gender}
                </p>
              </div>
              {(canEdit || canDelete) && (
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {canEdit && (
                    <button
                      onClick={() => onEdit?.(patient)}
                      className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDelete?.(patient)}
                      className="px-3 py-1.5 text-xs font-bold bg-error/10 text-error hover:bg-error/20 rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-label-md text-white shrink-0">{currentStatus}</span>
              <span className="rounded-full bg-secondary px-3 py-1 text-label-md text-white shrink-0">{patient.department}</span>
              <span className="rounded-full bg-surface-container-high px-3 py-1 text-label-md text-on-surface dark:bg-surface dark:text-white shrink-0 min-w-0">
                {patient.condition}
              </span>
              {canEdit && (
                <div className="relative ml-2">
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={statusUpdating}
                    className="text-xs font-bold rounded-lg border border-outline-variant bg-surface px-2 py-1.5 text-on-surface outline-none cursor-pointer appearance-none pr-6"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 4px center',
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Admitted">Admitted</option>
                    <option value="Discharged">Discharged</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                  {statusUpdating && <span className="ml-1 w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" />}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <DetailCard label="Assigned Doctor" value={patient.doctor} />
          <DetailCard label="Ward" value={patient.ward} />
          <DetailCard label="Blood Type" value={patient.bloodType} />
          <DetailCard label="Email" value={patient.email} />
          <DetailCard label="Mobile" value={patient.mobile} />
          <DetailCard label="Emergency Contact" value={`${patient.emergencyContact?.name} • ${patient.emergencyContact?.phone}`} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TimelineSection
            title="Admission History"
            items={patient.admissionHistory}
            renderItem={(entry) => (
              <div key={`${entry.date}-${entry.summary}`} className="rounded-xl border border-outline-variant p-4 dark:border-outline">
                <p className="text-body-md font-bold text-on-surface dark:text-white">{entry.summary}</p>
                <p className="text-body-md text-on-surface-variant">{formatDate(entry.date)} • {entry.status}</p>
              </div>
            )}
          />
          <TimelineSection
            title="Previous Treatments"
            items={patient.previousTreatments}
            renderItem={(entry) => (
              <div key={`${entry.date}-${entry.title}`} className="rounded-xl border border-outline-variant p-4 dark:border-outline">
                <p className="text-body-md font-bold text-on-surface dark:text-white">{entry.title}</p>
                <p className="text-body-md text-on-surface-variant">{entry.outcome}</p>
                <p className="mt-1 text-label-md text-outline">{formatDate(entry.date)}</p>
              </div>
            )}
          />
          <TimelineSection
            title="Lab Reports"
            items={patient.labReports}
            renderItem={(entry) => (
              <div key={entry.id} className="rounded-xl border border-outline-variant p-4 dark:border-outline">
                <p className="text-body-md font-bold text-on-surface dark:text-white">{entry.name}</p>
                <p className="text-body-md text-on-surface-variant">{formatDate(entry.date)} • {entry.status}</p>
              </div>
            )}
          />
          <TimelineSection
            title="Prescriptions"
            items={patient.prescriptions}
            renderItem={(entry) => (
              <div key={entry.id} className="rounded-xl border border-outline-variant p-4 dark:border-outline">
                <p className="text-body-md font-bold text-on-surface dark:text-white">{entry.medication}</p>
                <p className="text-body-md text-on-surface-variant">
                  {entry.dosage} • {entry.frequency} • {entry.status}
                </p>
              </div>
            )}
          />
          <TimelineSection
            title="Diagnosis History"
            items={patient.diagnosisHistory}
            renderItem={(entry) => (
              <div key={entry.id} className="rounded-xl border border-outline-variant p-4 dark:border-outline">
                <p className="text-body-md font-bold text-on-surface dark:text-white">{entry.diagnosis}</p>
                <p className="text-body-md text-on-surface-variant">{entry.doctor}</p>
                <p className="mt-1 text-label-md text-outline">{formatDate(entry.date)}</p>
              </div>
            )}
          />
          <TimelineSection
            title="Surgery History"
            items={patient.surgeryHistory}
            renderItem={(entry) => (
              <div key={entry.id} className="rounded-xl border border-outline-variant p-4 dark:border-outline">
                <p className="text-body-md font-bold text-on-surface dark:text-white">{entry.name}</p>
                <p className="text-body-md text-on-surface-variant">{entry.outcome}</p>
                <p className="mt-1 text-label-md text-outline">{formatDate(entry.date)}</p>
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <h4 className="text-headline-md text-on-surface dark:text-white">Insurance & Allergies</h4>
            <div className="rounded-xl border border-outline-variant p-4 dark:border-outline">
              <p className="text-body-md font-bold text-on-surface dark:text-white">
                {patient.insuranceDetails?.provider} • {patient.insuranceDetails?.policyNumber}
              </p>
              <p className="text-body-md text-on-surface-variant">{patient.insuranceDetails?.coverage}</p>
              <p className="mt-3 text-body-md text-on-surface dark:text-white">
                Allergies: {(patient.allergies || []).join(', ') || 'None'}
              </p>
            </div>
          </section>
          <section className="space-y-3">
            <h4 className="text-headline-md text-on-surface dark:text-white">Billing History</h4>
            {patient.billingHistory?.length ? (
              <div className="space-y-3">
                {patient.billingHistory.map((invoice) => (
                  <div key={invoice.id} className="rounded-xl border border-outline-variant p-4 dark:border-outline">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-body-md font-bold text-on-surface dark:text-white">{invoice.id}</p>
                        <p className="text-body-md text-on-surface-variant">{formatDate(invoice.date)} • {invoice.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-body-md font-bold text-on-surface dark:text-white">{formatInr(invoice.amount)}</p>
                        <p className="text-label-md text-outline">{invoice.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant">Data not present</p>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TimelineSection
            title="Upcoming Appointments"
            items={patient.upcomingAppointments}
            renderItem={(entry) => (
              <div key={entry.id} className="rounded-xl border border-outline-variant p-4 dark:border-outline">
                <p className="text-body-md font-bold text-on-surface dark:text-white">{entry.type}</p>
                <p className="text-body-md text-on-surface-variant">{formatDate(entry.date)} • {entry.time}</p>
              </div>
            )}
          />
          <TimelineSection
            title="Previous Appointments"
            items={patient.previousAppointments}
            renderItem={(entry) => (
              <div key={entry.id} className="rounded-xl border border-outline-variant p-4 dark:border-outline">
                <p className="text-body-md font-bold text-on-surface dark:text-white">{entry.type}</p>
                <p className="text-body-md text-on-surface-variant">{formatDate(entry.date)} • {entry.status}</p>
              </div>
            )}
          />
        </div>

        <section className="space-y-3">
          <h4 className="text-headline-md text-on-surface dark:text-white">Vitals Timeline & Scan Reports</h4>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-outline-variant p-4 dark:border-outline">
              {patient.vitalsTimeline?.map((entry) => (
                <div key={entry.date} className="flex items-center justify-between border-b border-outline-variant/40 py-2 last:border-b-0 dark:border-outline/40">
                  <span className="text-body-md font-bold text-on-surface dark:text-white">{entry.date}</span>
                  <span className="text-body-md text-on-surface-variant">
                    HR {entry.heartRate} • BP {entry.bloodPressure} • O2 {entry.oxygen}%
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-outline-variant p-4 dark:border-outline">
              {(patient.scanReports || []).map((entry) => (
                <div key={entry.id} className="border-b border-outline-variant/40 py-2 last:border-b-0 dark:border-outline/40">
                  <p className="text-body-md font-bold text-on-surface dark:text-white">{entry.name}</p>
                  <p className="text-body-md text-on-surface-variant">{formatDate(entry.date)} • {entry.status}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant p-4 dark:border-outline">
          <h4 className="text-headline-md text-on-surface dark:text-white">Uploaded Documents</h4>
          <DocumentList documents={patient.documents} emptyMessage="No documents uploaded for this patient." />
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant p-4 dark:border-outline">
          <h4 className="text-headline-md text-on-surface dark:text-white">Discharge Summary</h4>
          <p className="text-body-md text-on-surface-variant">{patient.dischargeSummary}</p>
          <button
            type="button"
            onClick={() => onDoctorClick?.(patient.doctorId || patient.doctor)}
            className="rounded-lg bg-primary px-4 py-2 text-body-md font-bold text-white"
          >
            View Assigned Doctor
          </button>
        </section>
      </div>
    </Modal>
  );
}
