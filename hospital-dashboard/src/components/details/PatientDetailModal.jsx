import Modal from '../common/Modal';
import DocumentList from '../documents/DocumentList';
import { formatDate, formatInr } from '../../lib/formatters';

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 dark:border-outline dark:bg-on-primary-fixed">
      <p className="text-label-md uppercase text-on-surface-variant">{label}</p>
      <p className="mt-1 text-body-md font-bold text-on-surface dark:text-white">{value || 'N/A'}</p>
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

export default function PatientDetailModal({ patient, isOpen, onClose, onDoctorClick }) {
  if (!patient) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${patient.name} Medical History`} size="xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl bg-surface-container p-4 dark:bg-on-primary-fixed md:flex-row md:items-center">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`}
            alt={patient.name}
            className="h-20 w-20 rounded-full border border-outline-variant bg-white"
          />
          <div className="flex-1">
            <h3 className="text-headline-lg text-on-surface dark:text-white">{patient.name}</h3>
            <p className="text-body-md text-on-surface-variant">
              Patient ID: {patient.id} • {patient.age} years • {patient.gender}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-label-md text-white">{patient.status}</span>
              <span className="rounded-full bg-secondary px-3 py-1 text-label-md text-white">{patient.department}</span>
              <span className="rounded-full bg-surface-container-high px-3 py-1 text-label-md text-on-surface dark:bg-surface dark:text-white">
                {patient.condition}
              </span>
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
