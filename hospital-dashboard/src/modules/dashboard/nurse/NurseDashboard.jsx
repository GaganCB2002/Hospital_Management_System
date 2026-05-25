import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useHospital } from '../../../context/HospitalContext';
import { useAuth } from '../../../context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiUser, FiActivity, FiDroplet, FiAlertCircle,
  FiCheckCircle, FiXCircle, FiEdit2, FiTrash2, FiCamera,
  FiPhone, FiMessageSquare, FiClock, FiHeart, FiThermometer,
  FiWind, FiPlus, FiCheckSquare, FiFileText,
  FiSend, FiUsers, FiGrid, FiList, FiBell,
  FiCoffee, FiMoon, FiSunrise, FiClipboard,
  FiChevronDown, FiMail
} from 'react-icons/fi';

const NURSE_STORAGE_KEY = 'curepulse_nurse_local';

function loadNurseData() {
  try {
    const raw = localStorage.getItem(NURSE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { doseLog: {}, tasks: [], shiftNotes: [], completedCalls: [], medicationSchedule: [] };
  } catch { return { doseLog: {}, tasks: [], shiftNotes: [], completedCalls: [], medicationSchedule: [] }; }
}

function saveNurseData(data) {
  localStorage.setItem(NURSE_STORAGE_KEY, JSON.stringify(data));
}

export default function NurseDashboard() {
  const { user } = useAuth();
  const { patients, updatePatient, deletePatient } = useHospital();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterWard, setFilterWard] = useState('all');
  const [viewMode, setViewMode] = useState('ward');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetailTab, setPatientDetailTab] = useState('info');
  const [editingPatient, setEditingPatient] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [nurseLocal, setNurseLocal] = useState(loadNurseData);
  const [contactingDoctor, setContactingDoctor] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [shiftNoteText, setShiftNoteText] = useState('');
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);
  const [cameraResult, setCameraResult] = useState('');
  const [vitalForm, setVitalForm] = useState({ heartRate: '', bpSystolic: '', bpDiastolic: '', temperature: '', oxygen: '', glucose: '', notes: '' });
  const activeSection = searchParams.get('section') || 'dashboard';
  const [patientCalls, setPatientCalls] = useState([]);
  const [expandedSupportCard, setExpandedSupportCard] = useState(null);

  const renderEmergency = () => {
    const emergencyPatients = patients.filter(p => p.status === 'Emergency' || p.condition === 'Critical');
    const emergencyContacts = [
      { role: 'Emergency Doctor', name: 'Dr. Sarah Connor', phone: 'Ext. 9110', available: true },
      { role: 'Code Blue Team', name: 'Rapid Response', phone: 'Ext. 1999', available: true },
      { role: 'ICU Nurse Lead', name: 'Nina Williams', phone: 'Ext. 9123', available: true },
      { role: 'Security Desk', name: 'Main Gate', phone: 'Ext. 1000', available: false },
    ];
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-rose-500/20 to-red-500/10 border border-rose-500/30 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
            <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <FiAlertCircle /> Emergency Protocol Active
            </h2>
            <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold">{emergencyPatients.length} active</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {emergencyContacts.map((contact, i) => (
              <div key={i} className="bg-background/60 rounded-xl p-3 border border-white/5">
                <p className="text-[10px] text-on-surface-variant font-semibold">{contact.role}</p>
                <p className="text-sm font-bold text-on-background">{contact.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-primary font-semibold">{contact.phone}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${contact.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {contact.available ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-surface rounded-xl p-5 shadow-sm border border-white/5">
            <h3 className="font-bold text-on-background text-sm mb-3 flex items-center gap-2">
              <FiActivity className="text-rose-400" /> Critical / Emergency Patients
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {emergencyPatients.length > 0 ? emergencyPatients.map(p => (
                <div key={p.id} onClick={() => handleViewPatient(p)}
                  className="p-3 rounded-xl bg-background border border-rose-500/20 hover:border-rose-500/40 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shrink-0" />
                        <p className="text-sm font-bold text-on-background truncate">{p.name}</p>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${p.status === 'Emergency' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>{p.status}</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">{p.ward} · {p.department} · Dr. {p.doctor}</p>
                      <p className="text-[10px] text-on-surface-variant">Condition: {p.condition} · Blood: {p.bloodType}</p>
                      {p.allergies?.length > 0 && (
                        <p className="text-[9px] text-rose-400 mt-0.5">⚠ Allergies: {p.allergies.join(', ')}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); handleViewPatient(p); }}
                        className="px-2 py-1 rounded text-[8px] font-bold bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer border-none">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <FiCheckCircle className="text-3xl text-emerald-400/30 mx-auto mb-2" />
                  <p className="text-xs text-emerald-400">No emergency cases at this time</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-xl p-5 shadow-sm border border-white/5">
            <h3 className="font-bold text-on-background text-sm mb-3 flex items-center gap-2">
              <FiClipboard className="text-amber-400" /> Emergency Protocol
            </h3>
            <div className="space-y-2">
              {[
                { step: '1', title: 'Assess & Stabilize', desc: 'Check ABC, vital signs, alert Code team if needed' },
                { step: '2', title: 'Notify Doctor', desc: 'Page attending physician immediately' },
                { step: '3', title: 'Prepare Equipment', desc: 'Crash cart, defibrillator, O2, suction ready' },
                { step: '4', title: 'Administer Meds', desc: 'As per standing emergency orders' },
                { step: '5', title: 'Document', desc: 'Record all interventions in patient chart' },
              ].map((item, i) => (
                <div key={i} className="flex gap-2 p-2 rounded-lg bg-background">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{item.step}</span>
                  <div>
                    <p className="text-[11px] font-semibold text-on-background">{item.title}</p>
                    <p className="text-[9px] text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSupport = () => {
    const supportContacts = [
      { department: 'IT Help Desk', contact: 'Ext. 2000', phone: '+1 (555) 200-1000', email: 'it@curepulse.com', hours: '24/7', icon: '🖥️', description: 'Report system issues, password resets, hardware/software problems, and network connectivity concerns.' },
      { department: 'Clinical Support', contact: 'Ext. 2001', phone: '+1 (555) 200-1001', email: 'clinical@curepulse.com', hours: '6 AM - 10 PM', icon: '🩺', description: 'Clinical supply requests, equipment issues, procedure guidance, and patient care coordination.' },
      { department: 'Pharmacy', contact: 'Ext. 2002', phone: '+1 (555) 200-1002', email: 'pharmacy@curepulse.com', hours: '24/7', icon: '💊', description: 'Medication queries, dosage verification, drug interaction checks, and urgent pharmacy requests.' },
      { department: 'Lab Services', contact: 'Ext. 2003', phone: '+1 (555) 200-1003', email: 'lab@curepulse.com', hours: '6 AM - 8 PM', icon: '🔬', description: 'Lab result inquiries, specimen collection issues, test status tracking, and report delivery.' },
      { department: 'Maintenance', contact: 'Ext. 2004', phone: '+1 (555) 200-1004', email: 'maintenance@curepulse.com', hours: '7 AM - 7 PM', icon: '🔧', description: 'Facility repairs, HVAC issues, plumbing, electrical faults, and general infrastructure maintenance.' },
    ];
    return (
      <div className="space-y-6">
        <div className="bg-surface rounded-xl p-5 shadow-sm border border-white/5">
          <h2 className="text-lg font-bold text-on-background flex items-center gap-2 mb-4">
            <FiMessageSquare className="text-primary" /> Support & Help Desk
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {supportContacts.map((s, i) => (
              <div key={i}>
                <div onClick={() => setExpandedSupportCard(expandedSupportCard === i ? null : i)}
                  className="bg-background rounded-xl p-4 border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{s.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-on-background">{s.department}</p>
                      <p className="text-[11px] text-primary font-semibold mt-0.5">{s.contact}</p>
                      <p className="text-[9px] text-on-surface-variant">{s.email}</p>
                      <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full mt-1 inline-block">{s.hours}</span>
                    </div>
                    <motion.div animate={{ rotate: expandedSupportCard === i ? 180 : 0 }} className="text-on-surface-variant mt-1">
                      <FiChevronDown size={14} />
                    </motion.div>
                  </div>
                </div>
                <AnimatePresence>
                  {expandedSupportCard === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="bg-background/80 border border-t-0 border-white/5 rounded-b-xl p-4 space-y-3">
                        <p className="text-[10px] text-on-surface-variant leading-relaxed">{s.description}</p>
                        <div className="flex flex-wrap gap-3">
                          <a href={`tel:${s.phone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/20 transition-colors no-underline">
                            <FiPhone size={12} /> {s.phone}
                          </a>
                          <a href={`mailto:${s.email}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[11px] font-semibold hover:bg-blue-500/20 transition-colors no-underline">
                            <FiMail size={12} /> {s.email}
                          </a>
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-[11px] font-semibold">
                            <FiClock size={12} /> {s.hours}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface rounded-xl p-5 shadow-sm border border-white/5">
            <h3 className="font-bold text-on-background text-sm mb-3 flex items-center gap-2">
              <FiSend className="text-primary" /> Submit a Request
            </h3>
            <div className="space-y-3">
              <select className="w-full px-3 py-2 text-xs rounded-xl bg-background text-on-background border border-white/10 outline-none focus:border-primary">
                <option value="">Select request type...</option>
                <option value="it">IT / System Issue</option>
                <option value="clinical">Clinical Supply Request</option>
                <option value="pharmacy">Pharmacy Query</option>
                <option value="lab">Lab Result Issue</option>
                <option value="maintenance">Facility / Maintenance</option>
                <option value="other">Other</option>
              </select>
              <textarea placeholder="Describe your issue in detail..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-background text-on-background border border-white/10 outline-none focus:border-primary min-h-[80px] resize-none" />
              <button onClick={() => toast.success('Support request submitted. A team member will contact you shortly.')}
                className="w-full px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 cursor-pointer border-none">
                Submit Request
              </button>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-5 shadow-sm border border-white/5">
            <h3 className="font-bold text-on-background text-sm mb-3 flex items-center gap-2">
              <FiClock className="text-amber-400" /> Recent Support Activity
            </h3>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {(nurseLocal.messages || []).slice(-8).reverse().map((msg, i) => (
                <div key={i} className="p-3 rounded-lg bg-background">
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] font-semibold text-on-background">To: {msg.to}</p>
                    <span className="text-[8px] text-on-surface-variant">{new Date(msg.sentAt).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{msg.message}</p>
                </div>
              ))}
              {(!nurseLocal.messages || nurseLocal.messages.length === 0) && (
                <p className="text-xs text-on-surface-variant text-center py-6">No support activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScanner = () => (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl p-6 shadow-sm border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-on-background flex items-center gap-2">
            <FiCamera className="text-primary" /> QR Code Scanner
          </h2>
          <div className="flex items-center gap-3">
            {scannerReady && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">Back Camera Active</span>}
            <button onClick={() => {
              setSection('');
              const params = new URLSearchParams(searchParams);
              params.delete('section');
              setSearchParams(params, { replace: true });
            }}
              className="px-3 py-1.5 rounded-xl bg-white/10 text-on-surface-variant text-xs font-bold hover:bg-white/20 cursor-pointer border-none">
              Close
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-6">
          <div id="nurse-qr-reader" ref={scannerRef}
            className="w-full max-w-md h-80 rounded-xl overflow-hidden bg-background border border-white/10 mx-auto" />
          {!scannerReady && activeSection !== 'scanner' && (
            <button onClick={() => setSection('scanner')}
              className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer border-none flex items-center gap-2">
              <FiCamera /> Open Back Camera
            </button>
          )}
          {scannerReady && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Camera is scanning — point at a patient's QR code
            </p>
          )}
          <div className="w-full max-w-md space-y-2">
            <p className="text-xs text-on-surface-variant text-center">Or manually enter Patient ID:</p>
            <div className="flex gap-2">
              <input type="text" value={cameraResult} onChange={(e) => setCameraResult(e.target.value)}
                placeholder="e.g. AD-9204, PT-4420"
                className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-background text-on-background border border-white/10 outline-none focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleManualScan()} />
              <button onClick={handleManualScan}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 cursor-pointer border-none flex items-center gap-2">
                <FiSearch /> Find
              </button>
            </div>
            {cameraResult && (
              <p className="text-xs text-on-surface-variant bg-background rounded-lg p-3 text-center">{cameraResult}</p>
            )}
          </div>
        </div>
      </div>

      {selectedPatient && (
        <div className="bg-surface rounded-xl p-5 shadow-sm border border-white/5">
          <div className="flex items-center gap-4">
            <QRCodeCanvas value={selectedPatient.id} size={80} />
            <div>
              <p className="text-lg font-bold text-on-background">{selectedPatient.name}</p>
              <p className="text-xs text-on-surface-variant">{selectedPatient.id} · {selectedPatient.ward} · {selectedPatient.department}</p>
              <p className="text-xs text-on-surface-variant">Dr. {selectedPatient.doctor} · Status: {selectedPatient.status} · {selectedPatient.condition}</p>
            </div>
            <button onClick={() => handleViewPatient(selectedPatient)}
              className="ml-auto px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 cursor-pointer border-none">
              Open Details
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const allDoctors = useMemo(() => {
    return patients.filter(p => p.doctor).map(p => ({
      id: p.id,
      name: p.doctor,
      department: p.department,
      specialization: p.condition,
      patients: 1,
      status: 'Available',
      phone: 'Ext. 5000'
    })).reduce((acc, doc) => {
      const existing = acc.find(d => d.name === doc.name);
      if (existing) existing.patients += 1;
      else acc.push(doc);
      return acc;
    }, []);
  }, [patients]);

  const handleViewPatient = useCallback((p) => {
    setSelectedPatient(p);
    setPatientDetailTab('info');
    setEditingPatient(false);
  }, []);

  const setSection = useCallback((section) => {
    const params = new URLSearchParams(searchParams);
    if (section) params.set('section', section);
    else params.delete('section');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleManualScan = useCallback(() => {
    if (!cameraResult.trim()) { toast.error('Enter a patient ID'); return; }
    const found = patients.find(p => p.id.toLowerCase() === cameraResult.trim().toLowerCase());
    if (found) {
      setSelectedPatient(found);
      toast.success(`Patient ${found.name} found`);
    } else {
      toast.error('No patient found with that ID');
    }
  }, [cameraResult, patients]);

  const handleDischarge = useCallback(() => {
    if (!selectedPatient) return;
    updatePatient(selectedPatient.id, { status: 'Discharged', condition: 'Recovering' });
    toast.success(`${selectedPatient.name} discharged`);
    setSelectedPatient(null);
  }, [selectedPatient, updatePatient]);

  const handleDelete = useCallback(() => {
    if (!selectedPatient) return;
    deletePatient(selectedPatient.id);
    toast.success(`${selectedPatient.name} record deleted`);
    setSelectedPatient(null);
  }, [selectedPatient, deletePatient]);

  const startEditing = useCallback(() => {
    setEditForm({
      name: selectedPatient.name,
      age: selectedPatient.age,
      gender: selectedPatient.gender,
      ward: selectedPatient.ward,
      condition: selectedPatient.condition,
      notes: selectedPatient.notes || '',
    });
    setEditingPatient(true);
  }, [selectedPatient]);

  const handleSaveEdit = useCallback(() => {
    if (!selectedPatient || !editForm.name?.trim()) { toast.error('Name is required'); return; }
    updatePatient(selectedPatient.id, editForm);
    setSelectedPatient({ ...selectedPatient, ...editForm });
    setEditingPatient(false);
    toast.success('Patient details updated');
  }, [selectedPatient, editForm, updatePatient]);

  const getDoseKey = useCallback((pid, med) => `${pid}::${med}`, []);
  const isDoseGiven = useCallback((pid, med) => {
    const key = getDoseKey(pid, med);
    return !!nurseLocal.doseLog[key];
  }, [nurseLocal.doseLog, getDoseKey]);

  const markDose = useCallback((medKey, doctorName) => {
    const data = loadNurseData();
    data.doseLog[medKey] = {
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      administeredBy: user?.name || 'Nurse',
      doctor: doctorName || 'Unassigned',
      timestamp: new Date().toISOString(),
      status: 'Given'
    };
    saveNurseData(data);
    setNurseLocal(data);
    toast.success('Dose recorded successfully');
  }, [user]);

  const recordVitals = useCallback(() => {
    if (!selectedPatient || !vitalForm.heartRate || !vitalForm.temperature) {
      toast.error('Heart rate and temperature are required');
      return;
    }
    const vitals = {
      heartRate: vitalForm.heartRate,
      bloodPressure: vitalForm.bpSystolic || '120',
      temperature: vitalForm.temperature,
      oxygen: vitalForm.oxygen || '98',
      glucose: vitalForm.glucose || '110',
      date: new Date().toISOString().split('T')[0],
      recordedAt: new Date().toISOString(),
    };
    const timeline = [...(selectedPatient.vitalsTimeline || []), vitals];
    updatePatient(selectedPatient.id, { vitalsTimeline: timeline });
    setSelectedPatient({ ...selectedPatient, vitalsTimeline: timeline });
    setVitalForm({ heartRate: '', bpSystolic: '', bpDiastolic: '', temperature: '', oxygen: '', glucose: '', notes: '' });
    toast.success('Vitals recorded');
  }, [selectedPatient, vitalForm, updatePatient]);

  const contactDoctor = useCallback((doc) => {
    setContactingDoctor(doc);
    setMessageText(`Regarding ${selectedPatient?.name || 'patient'} (${selectedPatient?.id || 'N/A'}): `);
  }, [selectedPatient]);

  const sendMessage = useCallback(() => {
    if (!contactingDoctor || !messageText.trim()) { toast.error('Message cannot be empty'); return; }
    const data = loadNurseData();
    data.messages = [...(data.messages || []), { to: contactingDoctor.name, message: messageText, sentAt: new Date().toISOString() }];
    saveNurseData(data);
    setNurseLocal(data);
    toast.success(`Message sent to ${contactingDoctor.name}`);
    setContactingDoctor(null);
    setMessageText('');
  }, [contactingDoctor, messageText]);

  useEffect(() => {
    const isScanner = activeSection === 'scanner';
    if (!isScanner) {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.stop().catch(() => {});
        scannerInstanceRef.current = null;
      }
      return;
    }
    const Html5QrcodeModule = Html5Qrcode;
    const scanner = new Html5QrcodeModule('nurse-qr-reader');
    scannerInstanceRef.current = scanner;
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        const found = patients.find(p => p.id === decodedText || p.name?.toLowerCase() === decodedText.toLowerCase());
        if (found) {
          setSelectedPatient(found);
          setCameraResult(decodedText);
          toast.success(`Scanned: ${found.name}`);
          scanner.stop().catch(() => {});
        } else {
          toast.error('Patient not found');
        }
      },
      () => void 0
    ).then(() => {
      setScannerReady(true);
    }).catch(() => {
      setScannerReady(false);
    });
    return () => {
      scanner.stop().catch(() => {});
      setScannerReady(false);
    };
  }, [activeSection, patients]);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const raw = localStorage.getItem('curepulse_last_patient_call');
        if (raw) {
          const call = JSON.parse(raw);
          const completed = nurseLocal.completedCalls || [];
          if (call && !completed.includes(call.patientId) && !patientCalls.find(c => c.patientId === call.patientId)) {
            setPatientCalls(prev => [call, ...prev]);
          }
        }
      } catch { /* ignore parse errors */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [nurseLocal.completedCalls, patientCalls]);

  const renderDashboard = () => {
    const totalPatients = patients.length;
    const totalMedications = patients.reduce((s, p) => s + (p.prescriptions?.length || 0), 0);
    const wardPatients = filterWard === 'all' ? patients : patients.filter(p => p.ward === filterWard);
    const filtered = wardPatients.filter(p =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const wards = [...new Set(patients.map(p => p.ward).filter(Boolean))];
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Patients', value: totalPatients, icon: FiUsers, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Patient Calls', value: patientCalls.filter(c => !(nurseLocal.completedCalls || []).includes(c.patientId)).length, icon: FiBell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Active Medications', value: totalMedications, icon: FiDroplet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Bed Occupancy', value: `${Math.round((totalPatients / 60) * 100)}%`, icon: FiActivity, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} rounded-xl p-4 border border-white/5`}>
              <div className="flex items-center justify-between mb-2"><stat.icon className={`text-lg ${stat.color}`} /><span className="text-2xl font-black text-on-background">{stat.value}</span></div>
              <p className="text-xs text-on-surface-variant">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface rounded-xl p-5 shadow-sm border border-white/5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-on-background flex items-center gap-2"><FiUsers className="text-primary" /> Patient Overview</h2>
            <div className="flex items-center gap-2">
              <div className="flex bg-background rounded-lg p-0.5">
                <button onClick={() => setViewMode('ward')} className={`px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer border-none ${viewMode === 'ward' ? 'bg-primary text-white' : 'text-on-surface-variant bg-transparent hover:text-on-background'}`}><FiGrid size={12} /></button>
                <button onClick={() => setViewMode('list')} className={`px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer border-none ${viewMode === 'list' ? 'bg-primary text-white' : 'text-on-surface-variant bg-transparent hover:text-on-background'}`}><FiList size={12} /></button>
              </div>
              <div className="relative"><FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[11px]" /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search patients..." className="w-40 pl-7 pr-3 py-1.5 text-[11px] rounded-lg bg-background text-on-background border border-white/10 outline-none focus:border-primary" /></div>
              <select value={filterWard} onChange={e => setFilterWard(e.target.value)} className="px-2.5 py-1.5 text-[11px] rounded-lg bg-background text-on-background border border-white/10 outline-none focus:border-primary">
                <option value="all">All Wards</option>
                {wards.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
          {viewMode === 'ward' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(p => (
                <div key={p.id} onClick={() => handleViewPatient(p)} className="p-3 rounded-xl bg-background border border-white/5 hover:border-primary/20 cursor-pointer transition-all">
                  <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{p.name?.[0]}</div>
                    <div className="min-w-0 flex-1"><p className="text-xs font-bold text-on-background truncate">{p.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{p.id} · {p.ward}</p></div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${p.status === 'Emergency' ? 'bg-rose-500/20 text-rose-400' : p.status === 'Discharged' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'}`}>{p.status}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[9px] text-on-surface-variant"><span>Dr. {p.doctor}</span><span>·</span><span>Condition: {p.condition}</span></div>
                </div>
              ))}
              {filtered.length === 0 && <p className="col-span-full text-xs text-on-surface-variant text-center py-8">No patients match your search</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs"><thead><tr className="border-b border-white/5"><th className="text-left py-2 px-2 text-on-surface-variant font-semibold">ID</th><th className="text-left py-2 px-2 text-on-surface-variant font-semibold">Name</th><th className="text-left py-2 px-2 text-on-surface-variant font-semibold">Ward</th><th className="text-left py-2 px-2 text-on-surface-variant font-semibold">Doctor</th><th className="text-left py-2 px-2 text-on-surface-variant font-semibold">Condition</th><th className="text-left py-2 px-2 text-on-surface-variant font-semibold">Status</th></tr></thead>
                <tbody>{filtered.map(p => (<tr key={p.id} onClick={() => handleViewPatient(p)} className="border-b border-white/5 hover:bg-white/5 cursor-pointer"><td className="py-2 px-2 text-primary font-semibold">{p.id}</td><td className="py-2 px-2 text-on-background font-semibold">{p.name}</td><td className="py-2 px-2 text-on-surface-variant">{p.ward}</td><td className="py-2 px-2 text-on-surface-variant">{p.doctor}</td><td className="py-2 px-2"><span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${p.condition === 'Critical' ? 'bg-rose-500/20 text-rose-400' : p.condition === 'Recovering' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{p.condition}</span></td><td className="py-2 px-2"><span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${p.status === 'Emergency' ? 'bg-rose-500/20 text-rose-400' : p.status === 'Discharged' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'}`}>{p.status}</span></td></tr>))}</tbody>
              </table>
              {filtered.length === 0 && <p className="text-xs text-on-surface-variant text-center py-6">No patients match your search</p>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface rounded-xl p-5 shadow-sm border border-white/5">
            <h3 className="font-bold text-on-background text-sm mb-3 flex items-center gap-2"><FiClipboard className="text-primary" /> Task List</h3>
            <div className="flex items-center gap-2 mb-3">
              <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Add a task..." className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-background text-on-background border border-white/10 outline-none focus:border-primary"
                onKeyDown={e => { if (e.key === 'Enter' && newTaskText.trim()) { const data = loadNurseData(); data.tasks = [...(data.tasks || []), { id: Date.now(), text: newTaskText.trim(), done: false }]; saveNurseData(data); setNurseLocal(data); setNewTaskText(''); toast.success('Task added'); } }} />
              <button onClick={() => { if (newTaskText.trim()) { const data = loadNurseData(); data.tasks = [...(data.tasks || []), { id: Date.now(), text: newTaskText.trim(), done: false }]; saveNurseData(data); setNurseLocal(data); setNewTaskText(''); toast.success('Task added'); } }}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold hover:bg-primary/90 cursor-pointer border-none"><FiPlus size={14} /></button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {(nurseLocal.tasks || []).map(t => (
                <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5">
                  <button onClick={() => { const data = loadNurseData(); data.tasks = data.tasks.map(task => task.id === t.id ? { ...task, done: !task.done } : task); saveNurseData(data); setNurseLocal(data); }}
                    className="cursor-pointer border-none bg-transparent p-0"><FiCheckSquare className={`text-sm ${t.done ? 'text-emerald-400' : 'text-on-surface-variant'}`} /></button>
                  <span className={`flex-1 text-xs ${t.done ? 'text-on-surface-variant line-through' : 'text-on-background'}`}>{t.text}</span>
                  <button onClick={() => { const data = loadNurseData(); data.tasks = data.tasks.filter(task => task.id !== t.id); saveNurseData(data); setNurseLocal(data); }}
                    className="cursor-pointer border-none bg-transparent p-0 text-rose-400 hover:text-rose-300"><FiTrash2 size={12} /></button>
                </div>
              ))}
              {(!nurseLocal.tasks || nurseLocal.tasks.length === 0) && <p className="text-xs text-on-surface-variant text-center py-4">No tasks yet</p>}
            </div>
          </div>
          <div className="bg-surface rounded-xl p-5 shadow-sm border border-white/5">
            <h3 className="font-bold text-on-background text-sm mb-3 flex items-center gap-2"><FiFileText className="text-primary" /> Shift Notes</h3>
            <div className="flex gap-2 mb-3">
              <input type="text" value={shiftNoteText} onChange={e => setShiftNoteText(e.target.value)} placeholder="Add a shift note..." className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-background text-on-background border border-white/10 outline-none focus:border-primary"
                onKeyDown={e => { if (e.key === 'Enter' && shiftNoteText.trim()) { const data = loadNurseData(); data.shiftNotes = [...(data.shiftNotes || []), { id: Date.now(), text: shiftNoteText.trim(), time: new Date().toLocaleString() }]; saveNurseData(data); setNurseLocal(data); setShiftNoteText(''); } }} />
              <button onClick={() => { if (shiftNoteText.trim()) { const data = loadNurseData(); data.shiftNotes = [...(data.shiftNotes || []), { id: Date.now(), text: shiftNoteText.trim(), time: new Date().toLocaleString() }]; saveNurseData(data); setNurseLocal(data); setShiftNoteText(''); } }}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold hover:bg-primary/90 cursor-pointer border-none"><FiPlus size={14} /></button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {(nurseLocal.shiftNotes || []).slice().reverse().map(n => (
                <div key={n.id} className="px-3 py-2 rounded-lg bg-background"><p className="text-xs text-on-background">{n.text}</p><p className="text-[9px] text-on-surface-variant mt-0.5">{n.time}</p></div>
              ))}
              {(!nurseLocal.shiftNotes || nurseLocal.shiftNotes.length === 0) && <p className="text-xs text-on-surface-variant text-center py-4">No shift notes yet</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMedication = () => {
    const totalScheduled = patients.reduce((s, p) => s + (p.prescriptions?.filter(m => m.status === 'Active').length || 0), 0);
    const totalGiven = Object.keys(nurseLocal.doseLog || {}).length;
    const compliance = totalScheduled > 0 ? Math.round((totalGiven / totalScheduled) * 100) : 0;
    const timeSlots = [
      { label: 'Morning', icon: FiSunrise, time: '08:00 AM', color: 'from-amber-400 to-orange-500' },
      { label: 'Midday', icon: FiCoffee, time: '12:00 PM', color: 'from-sky-400 to-blue-500' },
      { label: 'Evening', icon: FiMoon, time: '06:00 PM', color: 'from-indigo-400 to-purple-500' },
      { label: 'Night', icon: FiClock, time: '10:00 PM', color: 'from-slate-500 to-slate-700' },
    ];
    const activePatients = patients.filter(p => p.prescriptions?.some(m => m.status === 'Active'));
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Scheduled', value: totalScheduled, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Given', value: totalGiven, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Pending', value: Math.max(0, totalScheduled - totalGiven), color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Compliance', value: `${compliance}%`, color: compliance > 80 ? 'text-emerald-400' : compliance > 50 ? 'text-amber-400' : 'text-rose-400', bg: 'bg-surface' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-xl p-3 border border-white/5`}><p className={`text-lg font-black ${s.color}`}>{s.value}</p><p className="text-[10px] text-on-surface-variant">{s.label}</p></div>
          ))}
        </div>

        {timeSlots.map((slot, si) => {
          const slotPatients = activePatients.filter(p => !getDoseKey(p.id, si.toString()) || !nurseLocal.doseLog[`${p.id}::${si}`]);
          return (
            <div key={si} className="bg-surface rounded-xl shadow-sm border border-white/5 overflow-hidden">
              <div className={`bg-gradient-to-r ${slot.color} px-5 py-3`}>
                <div className="flex items-center gap-2"><slot.icon className="text-white text-lg" /><h3 className="font-bold text-white text-sm">{slot.label} ({slot.time})</h3></div>
              </div>
              <div className="p-4 space-y-2">
                {slotPatients.length > 0 ? slotPatients.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-start justify-between p-3 rounded-xl bg-background border border-white/5">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-xs font-bold text-on-background">{p.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{p.id} · {p.ward} · Dr. {p.doctor}</p>
                      <p className="text-[10px] text-on-surface-variant">Condition: {p.condition} · Allergies: {p.allergies?.join(', ') || 'None'}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.prescriptions?.filter(m => m.status === 'Active').slice(0, 2).map((med, mi) => {
                          const medKey = getDoseKey(p.id, med.medication);
                          const given = isDoseGiven(p.id, med.medication);
                          return (
                            <div key={mi} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-semibold ${given ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/10 text-primary'}`}>
                              <span>{med.medication} {med.dosage}</span>
                              {given ? <FiCheckCircle size={8} /> : (
                                <button onClick={(e) => { e.stopPropagation(); const inp = document.getElementById(`dose-${p.id}-${mi}`); markDose(medKey, inp?.value || ''); }}
                                  className="cursor-pointer border-none bg-transparent p-0 text-primary hover:text-emerald-400"><FiPlus size={8} /></button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col gap-1">{p.prescriptions?.filter(m => m.status === 'Active').slice(0, 2).map((med, mi) => (
                      <div key={mi} className="flex items-center gap-1">
                        <input type="text" id={`dose-${p.id}-${mi}`} placeholder="Dr. name" className="w-20 px-1.5 py-0.5 text-[8px] rounded bg-surface border border-white/10 outline-none focus:border-primary" />
                      </div>
                    ))}</div>
                  </div>
                )) : <p className="text-xs text-on-surface-variant text-center py-4">All medications administered for this time slot</p>}
              </div>
            </div>
          );
        })}

        <div className="bg-surface rounded-xl p-5 shadow-sm border border-white/5">
          <h3 className="font-bold text-on-background text-sm mb-3 flex items-center gap-2"><FiClipboard className="text-primary" /> Administration Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-2 px-2 text-on-surface-variant font-semibold">Time</th>
                  <th className="text-left py-2 px-2 text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 px-2 text-on-surface-variant font-semibold">Medication</th>
                  <th className="text-left py-2 px-2 text-on-surface-variant font-semibold">Dosage</th>
                  <th className="text-left py-2 px-2 text-on-surface-variant font-semibold">Doctor</th>
                  <th className="text-left py-2 px-2 text-on-surface-variant font-semibold">Given By</th>
                  <th className="text-left py-2 px-2 text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(nurseLocal.doseLog || {}).map(entryPair => {
                  const key = entryPair[0];
                  const entry = entryPair[1];
                  const pid = key.split('::')[0];
                  const medName = key.split('::')[1];
                  const pat = patients.find(p => p.id === pid);
                  return (
                    <tr key={key} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 px-2 text-on-surface-variant">{entry.time}</td>
                      <td className="py-2 px-2 text-on-background font-semibold">{pat?.name || pid}</td>
                      <td className="py-2 px-2 text-on-surface-variant">{medName}</td>
                      <td className="py-2 px-2 text-on-surface-variant">{pat?.prescriptions?.find(m => m.medication === medName)?.dosage || '—'}</td>
                      <td className="py-2 px-2 text-on-surface-variant">{entry.doctor || '—'}</td>
                      <td className="py-2 px-2 text-on-surface-variant">{entry.administeredBy}</td>
                      <td className="py-2 px-2">
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-400">{entry.status || 'Given'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {Object.keys(nurseLocal.doseLog || {}).length === 0 && <p className="text-xs text-on-surface-variant text-center py-6">No medications administered yet</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderPatientQueries = () => {
    const activeCalls = patientCalls.filter(c => !(nurseLocal.completedCalls || []).includes(c.patientId));
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2"><FiBell className="text-amber-400" /><h2 className="text-sm font-bold text-on-background">Active Patient Calls <span className="text-[10px] font-normal text-on-surface-variant">({activeCalls.length} pending)</span></h2></div>
        {activeCalls.length > 0 ? activeCalls.map((call, i) => (
          <div key={i} className="bg-surface rounded-xl p-4 shadow-sm border border-white/5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-on-background">{call.patientName || 'Unknown Patient'}</p>
                  <p className="text-xs text-on-surface-variant">{call.patientId} · {call.ward || 'N/A'} · {call.department || 'N/A'}</p>
                  <p className="text-xs text-on-surface-variant">Reason: {call.reason || 'General assistance'} · {call.condition ? `Condition: ${call.condition}` : ''}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => {
                  setSelectedPatient(patients.find(p => p.id === call.patientId));
                  toast.success(`Attending to ${call.patientName}`);
                }}
                  className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 cursor-pointer border-none">Attend</button>
                <button onClick={() => {
                  const data = loadNurseData();
                  data.completedCalls = [...(data.completedCalls || []), call.patientId];
                  saveNurseData(data);
                  setNurseLocal(data);
                  toast.success(`Call from ${call.patientName} marked complete`);
                }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 cursor-pointer border-none">Complete</button>
                <button onClick={() => {
                  const data = loadNurseData();
                  data.completedCalls = [...(data.completedCalls || []), call.patientId];
                  saveNurseData(data);
                  setNurseLocal(data);
                  setPatientCalls(prev => prev.filter(c => c.patientId !== call.patientId));
                }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/30 cursor-pointer border-none">Dismiss</button>
              </div>
            </div>
            <p className="text-[9px] text-on-surface-variant mt-2">Called at {call.timestamp ? new Date(call.timestamp).toLocaleString() : 'recently'}</p>
          </div>
        )) : (
          <div className="bg-surface rounded-xl p-8 text-center border border-white/5"><FiCheckCircle className="text-3xl text-emerald-400/30 mx-auto mb-2" /><p className="text-xs text-on-surface-variant">No pending patient calls</p></div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-background">
            {activeSection === 'medication' ? 'Medication Administration' :
             activeSection === 'queries' ? 'Patient Queries' :
             activeSection === 'scanner' ? 'QR Scanner' :
             activeSection === 'emergency' ? 'Emergency Alert' :
             activeSection === 'support' ? 'Support Center' :
             'Nurse Station'}
          </h1>
          <p className="text-sm text-on-surface-variant">
            {user?.name || 'Nurse'} · {user?.department || 'Ward'} ·{' '}
            <span className="text-primary font-semibold">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 p-0.5 rounded-lg bg-background">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
              { id: 'medication', label: 'Meds', icon: FiDroplet },
              { id: 'queries', label: 'Queries', icon: FiBell },
              { id: 'emergency', label: 'Emergency', icon: FiAlertCircle },
              { id: 'support', label: 'Support', icon: FiMessageSquare },
            ].map(tab => (
              <button key={tab.id} onClick={() => setSection(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border-none ${
                  activeSection === tab.id ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-background bg-transparent'
                }`}>
                <tab.icon className="text-sm" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeSection === 'medication' ? renderMedication() :
       activeSection === 'queries' ? renderPatientQueries() :
       activeSection === 'scanner' ? renderScanner() :
       activeSection === 'emergency' ? renderEmergency() :
       activeSection === 'support' ? renderSupport() :
       renderDashboard()}

      {/* Patient Detail Panel */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            className="bg-surface rounded-xl shadow-lg border border-white/5 overflow-hidden mt-6">
            <div className="flex items-start justify-between p-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-white/5">
              <div className="flex items-center gap-4">
                <QRCodeCanvas value={selectedPatient.id} size={80} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-on-background">{selectedPatient.name}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedPatient.status === 'Emergency' ? 'bg-rose-500/20 text-rose-400 animate-pulse' : selectedPatient.status === 'Discharged' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'}`}>{selectedPatient.status}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedPatient.condition === 'Critical' ? 'bg-rose-500/20 text-rose-400' : selectedPatient.condition === 'Recovering' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{selectedPatient.condition}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{selectedPatient.id} · {selectedPatient.ward} · {selectedPatient.department} · Dr. {selectedPatient.doctor}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {selectedPatient.status !== 'Discharged' && (
                  <>
                    <button onClick={handleDischarge} className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 cursor-pointer border-none flex items-center gap-1"><FiCheckCircle /> Discharge</button>
                    <button onClick={handleDelete} className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/30 cursor-pointer border-none flex items-center gap-1"><FiTrash2 /> Delete</button>
                  </>
                )}
                <button onClick={() => setSelectedPatient(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant cursor-pointer border-none bg-transparent"><FiXCircle className="text-lg" /></button>
              </div>
            </div>

            <div className="flex gap-1 px-5 pt-3 pb-0 border-b border-white/5 bg-background/30">
              {[
                { id: 'info', label: 'Info & Vitals', icon: FiHeart },
                { id: 'meds', label: 'Medications', icon: FiDroplet },
                { id: 'record', label: 'Record Vitals', icon: FiActivity },
                { id: 'contact', label: 'Contact Doctor', icon: FiMessageSquare },
              ].map(tab => (
                <button key={tab.id} onClick={() => { setPatientDetailTab(tab.id); setEditingPatient(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer border-none ${patientDetailTab === tab.id ? 'bg-surface text-primary border-b-2 border-primary' : 'bg-transparent text-on-surface-variant hover:text-on-background hover:bg-white/5'}`}>
                  <tab.icon className="text-sm" /> {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {patientDetailTab === 'info' && (
                <div className="space-y-3">
                  {editingPatient ? (
                    <div className="space-y-3 bg-background rounded-xl p-4">
                      <h3 className="font-bold text-on-background text-sm">Edit Patient</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="text-[10px] text-on-surface-variant block mb-1">Full Name</label>
                          <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-surface text-on-background border border-white/10 outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] text-on-surface-variant block mb-1">Age</label>
                          <input type="number" value={editForm.age || ''} onChange={(e) => setEditForm(f => ({ ...f, age: Number(e.target.value) }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-surface text-on-background border border-white/10 outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] text-on-surface-variant block mb-1">Gender</label>
                          <select value={editForm.gender || ''} onChange={(e) => setEditForm(f => ({ ...f, gender: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-surface text-on-background border border-white/10 outline-none focus:border-primary">
                            <option>Male</option><option>Female</option><option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-on-surface-variant block mb-1">Ward</label>
                          <input type="text" value={editForm.ward || ''} onChange={(e) => setEditForm(f => ({ ...f, ward: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-surface text-on-background border border-white/10 outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] text-on-surface-variant block mb-1">Condition</label>
                          <input type="text" value={editForm.condition || ''} onChange={(e) => setEditForm(f => ({ ...f, condition: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-surface text-on-background border border-white/10 outline-none focus:border-primary" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] text-on-surface-variant block mb-1">Notes</label>
                          <textarea value={editForm.notes || ''} onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-surface text-on-background border border-white/10 outline-none focus:border-primary" rows={3} />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={handleSaveEdit} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 cursor-pointer border-none">Save</button>
                        <button onClick={() => setEditingPatient(false)} className="px-4 py-2 rounded-xl bg-white/10 text-on-surface-variant text-xs font-bold hover:bg-white/20 cursor-pointer border-none">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                        {[
                          { label: 'Age', value: selectedPatient.age },
                          { label: 'Blood', value: selectedPatient.bloodType },
                          { label: 'Ward', value: selectedPatient.ward },
                          { label: 'Condition', value: selectedPatient.condition },
                          { label: 'Doctor', value: selectedPatient.doctor },
                          { label: 'Admitted', value: selectedPatient.admittedDate || 'N/A' },
                        ].map(f => (
                          <div key={f.label} className="flex flex-col px-2 py-1.5 rounded-lg bg-background">
                            <span className="text-[9px] text-on-surface-variant">{f.label}</span>
                            <span className="text-xs font-semibold text-on-background">{f.value || '—'}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedPatient.allergies?.map((a, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[9px] font-semibold">⚠ {a}</span>
                        ))}
                        <button onClick={startEditing} className="ml-auto px-2 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-bold hover:bg-primary/20 cursor-pointer border-none flex items-center gap-1"><FiEdit2 size={10} /> Edit</button>
                      </div>
                      {selectedPatient.notes && (
                        <p className="text-[10px] text-on-surface-variant bg-background rounded-lg px-2.5 py-1.5">{selectedPatient.notes}</p>
                      )}
                      <div>
                        <h3 className="font-bold text-on-background text-xs mb-1">Latest Vitals</h3>
                        <div className="grid grid-cols-4 gap-1.5">
                          {selectedPatient.vitalsTimeline?.length > 0 ? (
                            (() => {
                              const v = selectedPatient.vitalsTimeline[selectedPatient.vitalsTimeline.length - 1];
                              return <>
                                <div className="p-1.5 rounded-lg bg-background text-center"><FiHeart className="text-rose-400 mx-auto mb-0.5 text-[10px]" /><p className="text-sm font-black text-on-background">{v.heartRate}</p><p className="text-[7px] text-on-surface-variant">HR</p></div>
                                <div className="p-1.5 rounded-lg bg-background text-center"><FiThermometer className="text-amber-400 mx-auto mb-0.5 text-[10px]" /><p className="text-sm font-black text-on-background">{v.bloodPressure}/{v.bloodPressure - 20}</p><p className="text-[7px] text-on-surface-variant">BP</p></div>
                                <div className="p-1.5 rounded-lg bg-background text-center"><FiThermometer className="text-amber-400 mx-auto mb-0.5 text-[10px]" /><p className="text-sm font-black text-on-background">{v.temperature}°</p><p className="text-[7px] text-on-surface-variant">Temp</p></div>
                                <div className="p-1.5 rounded-lg bg-background text-center"><FiWind className="text-sky-400 mx-auto mb-0.5 text-[10px]" /><p className="text-sm font-black text-on-background">{v.oxygen}%</p><p className="text-[7px] text-on-surface-variant">SpO2</p></div>
                              </>;
                            })()
                          ) : (
                            <p className="col-span-4 text-[10px] text-on-surface-variant text-center py-2 bg-background rounded-lg">No vitals recorded</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {patientDetailTab === 'meds' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-on-background text-sm flex items-center gap-2">
                    <FiDroplet className="text-primary" /> Prescribed Medications · <span className="text-[10px] font-normal text-on-surface-variant">{selectedPatient.prescriptions?.filter(m => m.status === 'Active').length || 0} active</span>
                  </h3>
                  <div className="grid gap-2">
                    {selectedPatient.prescriptions?.length > 0 ? selectedPatient.prescriptions.map((med, idx) => {
                      const medKey = getDoseKey(selectedPatient.id, med.medication);
                      const given = isDoseGiven(selectedPatient.id, med.medication);
                      const doseInfo = nurseLocal.doseLog[medKey];
                      return (
                        <div key={idx} className={`p-3 rounded-xl border transition-colors ${given ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-background border-white/5'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-on-background">{med.medication}</p>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${med.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>{med.status}</span>
                              </div>
                              <p className="text-[11px] text-on-surface-variant mt-0.5">{med.dosage} · {med.frequency} · {med.duration}</p>
                              {given && doseInfo && (
                                <p className="text-[9px] text-emerald-400 mt-0.5">
                                  <FiCheckCircle className="inline mr-0.5" />
                                  Given at {doseInfo.time} by {doseInfo.administeredBy} · {doseInfo.doctor && `Dr. ${doseInfo.doctor}`}
                                </p>
                              )}
                              {!given && (
                                <div className="mt-1.5 flex gap-1">
                                  <input type="text" id={`doctor-assign-${idx}`} placeholder="Doctor name (optional)"
                                    className="w-32 px-2 py-1 text-[8px] rounded bg-surface border border-white/10 outline-none focus:border-primary" />
                                  <button onClick={() => {
                                    const doctorName = document.getElementById(`doctor-assign-${idx}`).value;
                                    markDose(medKey, doctorName);
                                  }}
                                    className="px-2.5 py-1 rounded bg-primary/10 text-primary text-[8px] font-bold hover:bg-primary/20 cursor-pointer border-none">
                                    Give Dose
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-xs text-on-surface-variant text-center py-6 bg-background rounded-xl">No medications prescribed</p>
                    )}
                  </div>
                </div>
              )}

              {patientDetailTab === 'record' && (
                <div className="max-w-lg">
                  <h3 className="font-bold text-on-background text-sm mb-3 flex items-center gap-2"><FiActivity className="text-primary" /> Record Vitals</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Heart Rate (bpm)', key: 'heartRate', placeholder: '72' },
                      { label: 'Systolic BP', key: 'bpSystolic', placeholder: '120' },
                      { label: 'Diastolic BP', key: 'bpDiastolic', placeholder: '80' },
                      { label: 'Temperature (°F)', key: 'temperature', placeholder: '98.6' },
                      { label: 'SpO2 (%)', key: 'oxygen', placeholder: '98' },
                      { label: 'Glucose (mg/dL)', key: 'glucose', placeholder: '110' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="text-[10px] text-on-surface-variant block mb-1">{field.label}</label>
                        <input type="number" step="any" value={vitalForm[field.key]} onChange={(e) => setVitalForm(f => ({ ...f, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-background text-on-background border border-white/10 outline-none focus:border-primary" />
                      </div>
                    ))}
                  </div>
                  <textarea value={vitalForm.notes} onChange={(e) => setVitalForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Additional notes" className="w-full px-3 py-2 text-xs rounded-xl bg-background text-on-background border border-white/10 outline-none focus:border-primary mt-3" rows={2} />
                  <button onClick={recordVitals} className="mt-3 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer border-none flex items-center gap-2"><FiCheckCircle /> Record</button>
                </div>
              )}

              {patientDetailTab === 'contact' && (
                <div className="space-y-4">
                  {selectedPatient.assignedDoctor ? (
                    <div className="max-w-md">
                      <h3 className="font-bold text-on-background text-sm mb-3 flex items-center gap-2"><FiMessageSquare className="text-primary" /> Contact Doctor</h3>
                      <div className="p-4 rounded-xl bg-background border border-white/5 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><FiUser className="text-primary" /></div>
                          <div>
                            <p className="font-bold text-on-background text-sm">{selectedPatient.assignedDoctor.name}</p>
                            <p className="text-xs text-on-surface-variant">{selectedPatient.assignedDoctor.department} · {selectedPatient.assignedDoctor.specialization}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => toast.success(`Calling ${selectedPatient.assignedDoctor.phone || 'N/A'}`)}
                            className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 cursor-pointer border-none flex items-center justify-center gap-1.5"><FiPhone /> Call</button>
                          <button onClick={() => { setContactingDoctor(selectedPatient.assignedDoctor); setMessageText(`Regarding ${selectedPatient.name} (${selectedPatient.id}): `); }}
                            className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 cursor-pointer border-none flex items-center justify-center gap-1.5"><FiMessageSquare /> Message</button>
                        </div>
                      </div>
                    </div>
                  ) : <p className="text-xs text-on-surface-variant bg-background rounded-xl p-4">No doctor assigned</p>}

                  <div>
                    <h3 className="font-bold text-on-background text-sm mb-2 flex items-center gap-2"><FiUsers className="text-primary" /> All Doctors On Duty</h3>
                    <div className="max-h-48 overflow-y-auto space-y-1.5">
                      {allDoctors.filter(d => d.status === 'Available').map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-white/5">
                          <div className="min-w-0 flex-1 mr-2">
                            <p className="text-xs font-semibold text-on-background truncate">{doc.name}</p>
                            <p className="text-[10px] text-on-surface-variant">{doc.department} · {doc.patients} patients</p>
                          </div>
                          <button onClick={() => contactDoctor(doc)}
                            className="shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 cursor-pointer border-none flex items-center gap-1"><FiMessageSquare /> Message</button>
                        </div>
                      ))}
                      {allDoctors.filter(d => d.status === 'Available').length === 0 && <p className="text-xs text-on-surface-variant text-center py-2">No doctors available</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Patient Navigation */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-background/30">
              <button onClick={() => {
                const idx = patients.findIndex(p => p.id === selectedPatient?.id);
                if (idx > 0) handleViewPatient(patients[idx - 1]);
              }} disabled={patients.findIndex(p => p.id === selectedPatient?.id) <= 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-none disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 text-on-surface-variant hover:bg-white/10 hover:text-on-background">
                ← Previous
              </button>
              <span className="text-[10px] text-on-surface-variant">
                {patients.findIndex(p => p.id === selectedPatient?.id) + 1} / {patients.length}
              </span>
              <button onClick={() => {
                const idx = patients.findIndex(p => p.id === selectedPatient?.id);
                if (idx < patients.length - 1) handleViewPatient(patients[idx + 1]);
              }} disabled={patients.findIndex(p => p.id === selectedPatient?.id) >= patients.length - 1}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-none bg-primary text-white hover:bg-primary/90">
                Next →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Doctor Modal */}
      <AnimatePresence>
        {contactingDoctor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setContactingDoctor(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-on-background flex items-center gap-2"><FiMessageSquare className="text-primary" /> Send Message</h3>
                <button onClick={() => setContactingDoctor(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant cursor-pointer border-none bg-transparent"><FiXCircle /></button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><FiUser className="text-primary" /></div>
                <div>
                  <p className="font-bold text-on-background text-sm">{contactingDoctor.name}</p>
                  <p className="text-xs text-on-surface-variant">{contactingDoctor.department} · {contactingDoctor.phone || 'N/A'}</p>
                </div>
              </div>
              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-background text-on-background border border-white/10 outline-none focus:border-primary transition-colors resize-none"
                rows={4} placeholder="Type your message..." />
              <div className="flex gap-2 mt-3">
                <button onClick={sendMessage} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer border-none flex items-center justify-center gap-2"><FiSend /> Send</button>
                <button onClick={() => setContactingDoctor(null)} className="px-4 py-2.5 rounded-xl bg-white/10 text-on-surface-variant text-xs font-bold hover:bg-white/20 cursor-pointer border-none">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
