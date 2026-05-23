import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUser, FiCalendar, FiActivity, FiClipboard } from 'react-icons/fi';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { formatDate } from '../../lib/formatters';

function PatientSidebar({ patients, selectedPatient, onSelect, searchTerm, onSearchChange }) {
  return (
    <div className="bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl p-4 shadow-sm flex flex-col h-full w-full min-w-0">
      <div className="flex items-center justify-between mb-4 w-full min-w-0">
        <h2 className="text-sm font-bold text-on-surface dark:text-white">Patients</h2>
        <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-lg">{patients.length}</span>
      </div>
      <div className="relative mb-4 w-full min-w-0">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
        <input type="text" placeholder="Search patients..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl text-sm focus:outline-none focus:border-primary dark:text-white"
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 w-full min-w-0">
        {patients.map(patient => {
          const latestVital = patient.vitalsTimeline?.[patient.vitalsTimeline.length - 1];
          return (
            <div key={patient.id} onClick={() => onSelect(patient)}
              className={`p-3 rounded-xl cursor-pointer transition-all border w-full min-w-0 ${
                selectedPatient?.id === patient.id
                  ? 'bg-primary text-on-primary border-primary shadow-md'
                  : 'bg-surface-container-lowest dark:bg-surface-container-high border-outline-variant/30 hover:border-primary/50 text-on-surface dark:text-white'
              }`}
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  selectedPatient?.id === patient.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                }`}>{patient.name?.charAt(0)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">{patient.name}</p>
                  <p className={`text-xs ${selectedPatient?.id === patient.id ? 'text-white/70' : 'text-outline'}`}>
                    {patient.gender}, {patient.age}y &bull; {patient.bloodType || 'O+'}
                  </p>
                  {latestVital && (
                    <p className={`text-[10px] mt-0.5 ${selectedPatient?.id === patient.id ? 'text-white/50' : 'text-outline/70'}`}>
                      HR {latestVital.heartRate} &bull; BP {latestVital.bloodPressure} &bull; SpO2 {latestVital.oxygen}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VitalsTimelineView({ vitals }) {
  if (!vitals?.length) return <p className="text-xs text-on-surface-variant italic">No vitals data available</p>;
  return (
    <div className="space-y-1.5 w-full min-w-0">
      {vitals.map((v, i) => (
        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/50 dark:border-outline/30 w-full min-w-0">
          <span className="text-xs font-bold text-on-surface dark:text-white">{v.date}</span>
          <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
            <span>HR <strong className="text-on-surface dark:text-white">{v.heartRate}</strong></span>
            <span>BP <strong className="text-on-surface dark:text-white">{v.bloodPressure}</strong></span>
            <span>O2 <strong className="text-on-surface dark:text-white">{v.oxygen}%</strong></span>
            <span>Temp <strong className="text-on-surface dark:text-white">{v.temperature}°F</strong></span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryList({ items, renderItem, emptyMessage }) {
  if (!items?.length) return <p className="text-xs text-on-surface-variant italic">{emptyMessage || 'No records available'}</p>;
  return (
    <div className="space-y-1.5 w-full min-w-0">
      {items.map((item, i) => (
        <div key={item.id || i} className="p-2.5 rounded-lg bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/50 dark:border-outline/30 w-full min-w-0">
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none shrink-0 ${
        active ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
      }`}
    >
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
      {count !== undefined && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${active ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>{count}</span>
      )}
    </button>
  );
}

function PatientDetailView({ patient, isDark }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!patient) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 text-on-surface-variant w-full min-w-0">
        <FiUser className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-sm font-medium">Select a patient from the list</p>
        <p className="text-xs mt-1">View complete medical records, vitals, and history</p>
      </div>
    );
  }

  const latestVital = patient.vitalsTimeline?.[patient.vitalsTimeline.length - 1];
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'person', count: null },
    { id: 'vitals', label: 'Vitals', icon: 'monitor_heart', count: patient.vitalsTimeline?.length },
    { id: 'diagnoses', label: 'Diagnoses', icon: 'biotech', count: patient.diagnosisHistory?.length },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'medication', count: patient.prescriptions?.length },
    { id: 'lab-reports', label: 'Lab Reports', icon: 'lab_profile', count: patient.labReports?.length },
    { id: 'history', label: 'History', icon: 'history', count: null },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-6 border-b border-outline-variant/30 dark:border-outline w-full min-w-0">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-md">
          {patient.name?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-start justify-between gap-3 w-full min-w-0">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-on-surface dark:text-white truncate">{patient.name}</h2>
              <p className="text-sm text-on-surface-variant">ID: {patient.id} &bull; Admitted: {patient.admittedDate || 'N/A'}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                patient.status === 'Admitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                patient.status === 'Emergency' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                patient.status === 'Discharged' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>{patient.status}</span>
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">{patient.department}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2 w-full min-w-0">
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">{patient.gender}, {patient.age}y</span>
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">Blood: {patient.bloodType || 'O+'}</span>
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded truncate max-w-[200px]">{patient.condition}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 mt-4 pb-2 overflow-x-auto w-full min-w-0">
        {tabs.map((tab) => (
          <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} icon={tab.icon} label={tab.label} count={tab.count} />
        ))}
      </div>

      <div className="flex-1 mt-4 overflow-y-auto w-full min-w-0">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 w-full min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full min-w-0">
                {[
                  { label: 'Attending Doctor', value: patient.doctor || patient.assignedDoctor?.name || 'N/A', icon: 'stethoscope' },
                  { label: 'Ward / Room', value: patient.ward || 'N/A', icon: 'bed' },
                  { label: 'Contact', value: patient.mobile || patient.phone || 'N/A', icon: 'call' },
                  { label: 'Email', value: patient.email || 'N/A', icon: 'mail' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-outline-variant dark:border-outline p-3 bg-surface-container-lowest dark:bg-[#0f172a] w-full min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-outline">{item.icon}</span>
                      <span className="text-[10px] text-on-surface-variant">{item.label}</span>
                    </div>
                    <p className="text-xs font-bold text-on-surface dark:text-white mt-1 truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full min-w-0">
                <div className="rounded-xl border border-outline-variant dark:border-outline p-3 bg-surface-container-lowest dark:bg-[#0f172a] w-full min-w-0">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Insurance Details</p>
                  <p className="text-xs font-bold text-on-surface dark:text-white">{patient.insuranceDetails?.provider || 'N/A'}</p>
                  <p className="text-[10px] text-on-surface-variant">{patient.insuranceDetails?.policyNumber || 'N/A'} &bull; {patient.insuranceDetails?.coverage || 'N/A'}</p>
                </div>
                <div className="rounded-xl border border-outline-variant dark:border-outline p-3 bg-surface-container-lowest dark:bg-[#0f172a] w-full min-w-0">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies?.length > 0 ? patient.allergies.map((a, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{a}</span>
                    )) : <span className="text-xs text-on-surface-variant italic">No known allergies</span>}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-outline-variant dark:border-outline p-3 bg-surface-container-lowest dark:bg-[#0f172a] w-full min-w-0">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Vitals (Latest)</p>
                <div className="grid grid-cols-4 gap-2 w-full min-w-0">
                  {[
                    { label: 'Heart Rate', value: latestVital?.heartRate || '--', unit: 'BPM', color: '#ef4444' },
                    { label: 'Blood Pressure', value: latestVital?.bloodPressure || '--', unit: 'mmHg', color: '#3b82f6' },
                    { label: 'SpO2', value: latestVital?.oxygen ? `${latestVital.oxygen}%` : '--', unit: '', color: '#10b981' },
                    { label: 'Temperature', value: latestVital?.temperature || '--', unit: '°F', color: '#f59e0b' },
                  ].map((v) => (
                    <div key={v.label} className="flex flex-col items-center text-center p-2 rounded-lg bg-surface dark:bg-slate-900/50">
                      <span className="text-[9px] text-on-surface-variant">{v.label}</span>
                      <span className="text-sm font-black text-on-surface dark:text-white mt-0.5" style={{ color: v.color }}>{v.value}</span>
                      {v.unit && <span className="text-[9px] text-on-surface-variant">{v.unit}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'vitals' && (
            <motion.div key="vitals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full min-w-0">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Vitals Timeline</p>
              <VitalsTimelineView vitals={patient.vitalsTimeline} />
            </motion.div>
          )}

          {activeTab === 'diagnoses' && (
            <motion.div key="diagnoses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full min-w-0">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Diagnosis History</p>
              <HistoryList items={patient.diagnosisHistory} emptyMessage="No diagnosis records"
                renderItem={(d) => (
                  <div className="flex items-center justify-between w-full min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-on-surface dark:text-white truncate">{d.diagnosis}</p>
                      <p className="text-[10px] text-on-surface-variant">{d.doctor} &bull; {d.date}</p>
                    </div>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">chevron_right</span>
                  </div>
                )}
              />
            </motion.div>
          )}

          {activeTab === 'prescriptions' && (
            <motion.div key="prescriptions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full min-w-0">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Current Prescriptions</p>
              <HistoryList items={patient.prescriptions} emptyMessage="No prescriptions"
                renderItem={(p) => (
                  <div className="flex items-center justify-between w-full min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-on-surface dark:text-white truncate">{p.medication}</p>
                      <p className="text-[10px] text-on-surface-variant">{p.dosage} &bull; {p.frequency}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      p.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      p.status === 'Completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    }`}>{p.status || 'Active'}</span>
                  </div>
                )}
              />
            </motion.div>
          )}

          {activeTab === 'lab-reports' && (
            <motion.div key="lab-reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3 w-full min-w-0">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Lab Reports</p>
              <HistoryList items={patient.labReports} emptyMessage="No lab reports"
                renderItem={(r) => (
                  <div className="flex items-center justify-between w-full min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-on-surface dark:text-white truncate">{r.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{r.date}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{r.status}</span>
                  </div>
                )}
              />
              {patient.scanReports?.length > 0 && (
                <div className="w-full min-w-0">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 mt-4">Scan Reports</p>
                  <HistoryList items={patient.scanReports} emptyMessage="No scan reports"
                    renderItem={(s) => (
                      <div className="flex items-center justify-between w-full min-w-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-on-surface dark:text-white truncate">{s.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{s.date}</p>
                        </div>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{s.status}</span>
                      </div>
                    )}
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 w-full min-w-0">
              <div className="w-full min-w-0">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Admission History</p>
                <HistoryList items={patient.admissionHistory} emptyMessage="No admission history"
                  renderItem={(a) => (
                    <div className="w-full min-w-0">
                      <p className="text-xs font-bold text-on-surface dark:text-white truncate">{a.summary}</p>
                      <p className="text-[10px] text-on-surface-variant">{a.date} &bull; {a.status}</p>
                    </div>
                  )}
                />
              </div>
              <div className="w-full min-w-0">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Previous Treatments</p>
                <HistoryList items={patient.previousTreatments} emptyMessage="No treatment history"
                  renderItem={(t) => (
                    <div className="w-full min-w-0">
                      <p className="text-xs font-bold text-on-surface dark:text-white truncate">{t.title}</p>
                      <p className="text-[10px] text-on-surface-variant">{t.outcome} &bull; {t.date}</p>
                    </div>
                  )}
                />
              </div>
              <div className="w-full min-w-0">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Billing History</p>
                <HistoryList items={patient.billingHistory} emptyMessage="No billing records"
                  renderItem={(b) => (
                    <div className="flex items-center justify-between w-full min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-on-surface dark:text-white truncate">{b.id}</p>
                        <p className="text-[10px] text-on-surface-variant">{b.date} &bull; {b.method}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-on-surface dark:text-white">{formatDate(b.amount) ? b.amount : `$${b.amount || 0}`}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          b.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                        }`}>{b.status}</span>
                      </div>
                    </div>
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function PatientRecords() {
  const { user } = useAuth();
  const { patients } = useHospital();
  const { isDark } = useTheme();

  const myPatients = useMemo(() =>
    patients.filter(p => p.doctor === user?.name || p.doctorId === user?.doctorId || user?.role === 'doctor'),
    [patients, user]
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  const filteredPatients = myPatients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.condition?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPrescription = (e) => {
    e.preventDefault();
    toast.success('Prescription added successfully');
    setIsPrescriptionModalOpen(false);
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0 max-w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-on-surface dark:text-white">Patient Records</h1>
          <p className="text-sm text-on-surface-variant">View complete medical profiles, histories, and records</p>
        </div>
        {selectedPatient && (
          <button onClick={() => setIsPrescriptionModalOpen(true)}
            className="px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary/90 transition-all cursor-pointer border-none flex items-center gap-2 shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Prescription
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0 max-w-full">
        <div className="lg:col-span-4 xl:col-span-3 h-[calc(100vh-16rem)] w-full min-w-0">
          <PatientSidebar
            patients={filteredPatients}
            selectedPatient={selectedPatient}
            onSelect={setSelectedPatient}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        <div className="lg:col-span-8 xl:col-span-9 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl p-6 shadow-sm min-h-[70vh] w-full min-w-0 max-w-full overflow-hidden">
          <PatientDetailView patient={selectedPatient} isDark={isDark} />
        </div>
      </div>

      <Modal isOpen={isPrescriptionModalOpen} onClose={() => setIsPrescriptionModalOpen(false)} title="Write Prescription" size="md">
        <form onSubmit={handleAddPrescription} className="space-y-4 w-full min-w-0">
          <div className="space-y-1 w-full min-w-0">
            <label className="text-xs font-medium text-on-surface-variant">Patient</label>
            <input type="text" value={selectedPatient?.name || ''} disabled className="w-full px-3 py-2.5 bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl text-sm text-outline cursor-not-allowed" />
          </div>
          <div className="space-y-1 w-full min-w-0">
            <label className="text-xs font-medium text-on-surface-variant">Medication Name</label>
            <input required type="text" placeholder="e.g. Amoxicillin" className="w-full px-3 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl text-sm focus:border-primary focus:outline-none dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4 w-full min-w-0">
            <div className="space-y-1 w-full min-w-0">
              <label className="text-xs font-medium text-on-surface-variant">Dosage</label>
              <input required type="text" placeholder="e.g. 500mg" className="w-full px-3 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl text-sm focus:border-primary focus:outline-none dark:text-white" />
            </div>
            <div className="space-y-1 w-full min-w-0">
              <label className="text-xs font-medium text-on-surface-variant">Frequency</label>
              <select className="w-full px-3 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl text-sm focus:border-primary focus:outline-none dark:text-white">
                <option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>As needed</option>
              </select>
            </div>
          </div>
          <div className="space-y-1 w-full min-w-0">
            <label className="text-xs font-medium text-on-surface-variant">Duration</label>
            <input type="text" placeholder="e.g. 7 days" className="w-full px-3 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl text-sm focus:border-primary focus:outline-none dark:text-white" />
          </div>
          <div className="space-y-1 w-full min-w-0">
            <label className="text-xs font-medium text-on-surface-variant">Notes</label>
            <textarea rows="3" placeholder="Additional instructions..." className="w-full px-3 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl text-sm focus:border-primary focus:outline-none dark:text-white resize-none"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3 w-full min-w-0">
            <button type="button" onClick={() => setIsPrescriptionModalOpen(false)} className="px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary/90 transition-all cursor-pointer border-none shadow-sm">Save Prescription</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
