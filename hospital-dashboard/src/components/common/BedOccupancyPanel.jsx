import { useState } from 'react';
import Modal from './Modal';
import { useHospital } from '../../context/HospitalContext';

function PatientBedCard({ patient, onView }) {
  return (
    <button
      type="button"
      onClick={() => onView(patient)}
      className="w-full rounded-xl border border-outline-variant bg-surface p-4 text-left transition-all hover:border-primary hover:shadow-sm dark:border-outline cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary">person</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-on-surface truncate">{patient.name}</p>
          <p className="text-xs text-on-surface-variant truncate">{patient.ward} &bull; {patient.doctor}</p>
          <p className="text-xs text-on-surface-variant">Admitted: {patient.admittedDate}</p>
        </div>
        <span className={`shrink-0 px-2 py-0.5 text-xs font-bold rounded-full ${
          patient.status === 'Admitted' ? 'bg-secondary/10 text-secondary' :
          patient.status === 'Emergency' ? 'bg-error/10 text-error' :
          'bg-surface-container-high text-on-surface-variant'
        }`}>{patient.status}</span>
      </div>
    </button>
  );
}

function PatientFullCard({ patient, doctors }) {
  const doctor = doctors.find((d) => d.doctorId === patient.doctorId || d.name === patient.doctor);
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`}
          alt=""
          className="w-20 h-20 rounded-full border-2 border-outline-variant bg-surface"
        />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-on-surface">{patient.name}</h3>
          <p className="text-sm text-on-surface-variant">{patient.id} &bull; {patient.age} yrs &bull; {patient.gender}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary">{patient.status}</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-secondary/10 text-secondary">{patient.department}</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-warning/10 text-warning">{patient.condition}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface-container-low p-3 border border-outline-variant dark:border-outline">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant">Bed / Ward</p>
          <p className="text-sm font-bold text-on-surface mt-0.5">{patient.ward || 'Not assigned'}</p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-3 border border-outline-variant dark:border-outline">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant">Admitted Date</p>
          <p className="text-sm font-bold text-on-surface mt-0.5">{patient.admittedDate || 'N/A'}</p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-3 border border-outline-variant dark:border-outline">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant">Doctor</p>
          <p className="text-sm font-bold text-on-surface mt-0.5">{doctor?.name || patient.doctor || 'Unassigned'}</p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-3 border border-outline-variant dark:border-outline">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant">Contact</p>
          <p className="text-sm font-bold text-on-surface mt-0.5">{patient.phone || patient.mobile || 'N/A'}</p>
        </div>
      </div>

      <div className="rounded-xl bg-surface-container-low p-4 border border-outline-variant dark:border-outline">
        <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Current Medications</p>
        {patient.prescriptions?.length ? (
          <div className="space-y-2">
            {patient.prescriptions.slice(0, 4).map((rx, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-medium text-on-surface">{rx.medication}</span>
                <span className="text-xs text-on-surface-variant">{rx.dosage} &bull; {rx.frequency}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant italic">No medications recorded</p>
        )}
      </div>

      <div className="rounded-xl bg-surface-container-low p-4 border border-outline-variant dark:border-outline">
        <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Diagnosis / Disease Details</p>
        {patient.diagnosisHistory?.length ? (
          <div className="space-y-2">
            {patient.diagnosisHistory.slice(0, 3).map((dx, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium text-on-surface">{dx.diagnosis}</p>
                <p className="text-xs text-on-surface-variant">{dx.doctor} &bull; {dx.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant italic">Diagnosis history not available</p>
        )}
      </div>

      {patient.documents?.length ? (
        <div className="rounded-xl bg-surface-container-low p-4 border border-outline-variant dark:border-outline">
          <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">Documents ({patient.documents.length})</p>
          <div className="space-y-1.5">
            {patient.documents.slice(0, 5).map((doc, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-base text-primary">description</span>
                <span className="text-on-surface">{doc.name || `Document ${i + 1}`}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function BedOccupancyPanel() {
  const { patients, doctors, bedOccupancy } = useHospital();
  const [viewPatient, setViewPatient] = useState(null);
  const [expandedWard, setExpandedWard] = useState(null);

  const admittedPatients = patients.filter((p) => ['Admitted', 'Emergency'].includes(p.status));
  const totalBeds = bedOccupancy.reduce((s, w) => s + w.total, 0);
  const occupiedBeds = bedOccupancy.reduce((s, w) => s + w.occupied, 0);
  const emptyBeds = totalBeds - occupiedBeds;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-center">
          <p className="text-2xl font-bold text-primary">{totalBeds}</p>
          <p className="text-[10px] font-bold uppercase text-on-surface-variant mt-0.5">Total Beds</p>
        </div>
        <div className="rounded-xl bg-secondary/10 border border-secondary/20 p-3 text-center">
          <p className="text-2xl font-bold text-secondary">{occupiedBeds}</p>
          <p className="text-[10px] font-bold uppercase text-on-surface-variant mt-0.5">Occupied</p>
        </div>
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{emptyBeds}</p>
          <p className="text-[10px] font-bold uppercase text-on-surface-variant mt-0.5">Available</p>
        </div>
      </div>

      <div className="space-y-2">
        {bedOccupancy.map((ward) => {
          const wardPatients = admittedPatients.filter((p) => p.ward === ward.ward);
          const isExpanded = expandedWard === ward.ward;
          const pct = Math.round((ward.occupied / ward.total) * 100);
          return (
            <div key={ward.ward} className="rounded-xl border border-outline-variant bg-surface overflow-hidden dark:border-outline">
              <button
                type="button"
                onClick={() => setExpandedWard(isExpanded ? null : ward.ward)}
                className="w-full flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors cursor-pointer border-none bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-primary">bed</span>
                  <div className="text-left">
                    <p className="text-sm font-bold text-on-surface">{ward.ward}</p>
                    <p className="text-xs text-on-surface-variant">{ward.occupied}/{ward.total} beds</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-xs font-bold ${pct > 80 ? 'text-error' : pct > 60 ? 'text-warning' : 'text-secondary'}`}>{pct}%</span>
                  <span className="material-symbols-outlined text-lg text-on-surface-variant">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {wardPatients.length ? wardPatients.map((p) => (
                    <PatientBedCard key={p.id} patient={p} onView={setViewPatient} />
                  )) : (
                    <p className="text-sm text-on-surface-variant italic text-center py-3">No patients in this ward</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal isOpen={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient Details" size="md">
        {viewPatient && <PatientFullCard patient={viewPatient} doctors={doctors || []} />}
      </Modal>
    </div>
  );
}
