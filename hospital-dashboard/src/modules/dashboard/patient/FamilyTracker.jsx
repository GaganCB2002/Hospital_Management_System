import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useHospital } from '../../../context/HospitalContext';
import { useNotifications } from '../../../context/NotificationContext';
import EmptyState from '../../../components/common/EmptyState';
import Modal from '../../../components/common/Modal';
import { formatDate } from '../../../lib/formatters';

export default function FamilyTracker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients } = useHospital();
  const { addNotification } = useNotifications();

  // Local storage key for linked family members, initialized with defaults
  const [linkedFamily, setLinkedFamily] = useState(() => {
    const saved = localStorage.getItem(`curepulse_linked_family_${user?.id || 'guest'}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { /* ignore parse errors */ }
    }
    return [
      { id: 'PT-4473', relationship: 'Sibling' }, // Dhruv Thomas (Admitted/Critical/ICU)
      { id: 'PT-4420', relationship: 'Spouse' }  // Aarav Sharma (Admitted/Recovering/Ortho)
    ];
  });

  const [liveVitals, setLiveVitals] = useState({});
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkRelationship, setLinkRelationship] = useState('Spouse');
  const [messageTargetMember, setMessageTargetMember] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const patient = useMemo(
    () => patients.find((entry) => entry.name === user?.name || entry.email === user?.email),
    [patients, user],
  );

  const familyMembers = useMemo(() => {
    return patients.filter(p => linkedFamily.some(f => f.id === p.id)).map(p => {
      const match = linkedFamily.find(f => f.id === p.id);
      return {
        ...p,
        relationship: match ? match.relationship : 'Relative'
      };
    });
  }, [patients, linkedFamily]);

  // Live vitals telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVitals(prev => {
        const next = { ...prev };
        patients.forEach(p => {
          if (linkedFamily.some(f => f.id === p.id)) {
            const latest = p.vitalsTimeline?.[p.vitalsTimeline.length - 1];
            if (p.status === 'Admitted' || p.status === 'Emergency') {
              const existing = prev[p.id];
              if (!existing) {
                let sys = Number(latest?.systolic || latest?.bloodPressure || 120);
                let dia = Number(latest?.diastolic || Math.max(0, (latest?.bloodPressure || 120) - 20) || 80);
                if (latest?.systolic && latest?.diastolic) { sys = latest.systolic; dia = latest.diastolic; }
                else if (latest?.systolic) { sys = latest.systolic; }
                else if (latest?.diastolic) { dia = latest.diastolic; }
                if (p.id === 'PT-4473') { sys = 142; dia = 92; }
                next[p.id] = {
                  heartRate: Number(latest?.heartRate || 74),
                  oxygen: Number(latest?.oxygen || 98),
                  systolic: sys, diastolic: dia,
                  temperature: Number(latest?.temperature || 98.6),
                  updatedAt: new Date().toLocaleTimeString()
                };
                return;
              }
              const current = existing;
              const hrDelta = Math.floor(Math.random() * 5) - 2;
              const sysDelta = Math.floor(Math.random() * 5) - 2;
              const diaDelta = Math.floor(Math.random() * 3) - 1;
              const o2Delta = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
              const tempDelta = parseFloat((Math.random() * 0.2 - 0.1).toFixed(1));
              const nextSys = Math.min(Math.max(current.systolic + sysDelta, 95), 175);
              const nextDia = Math.min(Math.max(current.diastolic + diaDelta, 60), 105);
              const nextHr = Math.min(Math.max(current.heartRate + hrDelta, 60), 125);
              const nextO2 = Math.min(Math.max(current.oxygen + o2Delta, 90), 100);
              const nextTemp = parseFloat(Math.min(Math.max(current.temperature + tempDelta, 96.5), 102.5).toFixed(1));
              next[p.id] = {
                heartRate: nextHr, oxygen: nextO2,
                systolic: nextSys, diastolic: nextDia,
                temperature: nextTemp,
                updatedAt: new Date().toLocaleTimeString()
              };
            }
          }
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [linkedFamily, patients]);

  const saveLinkedFamily = (nextList) => {
    setLinkedFamily(nextList);
    localStorage.setItem(`curepulse_linked_family_${user?.id || 'guest'}`, JSON.stringify(nextList));
  };

  const filteredPatientsToLink = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return patients.filter(p => {
      // Don't link yourself
      if (p.name === user?.name || p.email === user?.email) return false;
      // Don't list already linked
      if (linkedFamily.some(f => f.id === p.id)) return false;
      
      return p.name.toLowerCase().includes(query) || 
             p.id.toLowerCase().includes(query) || 
             p.email.toLowerCase().includes(query);
    });
  }, [searchQuery, patients, linkedFamily, user]);

  const handleLinkMember = (patientId) => {
    const nextList = [...linkedFamily, { id: patientId, relationship: linkRelationship }];
    saveLinkedFamily(nextList);
    toast.success('Family member linked successfully!');
    setSearchQuery('');
    setIsLinkModalOpen(false);
  };

  const handleUnlinkMember = (patientId) => {
    const nextList = linkedFamily.filter(f => f.id !== patientId);
    saveLinkedFamily(nextList);
    toast.success('Family member unlinked.');
  };

  const handleSendMessageSubmit = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setIsSendingMessage(true);
    
    setTimeout(() => {
      addNotification({
        title: `✉️ Message from Family regarding ${messageTargetMember?.name}`,
        shortDescription: `Family member (${user?.name || 'Relative'}) sent a query about ${messageTargetMember?.name}.`,
        details: `PATIENT: ${messageTargetMember?.name} (ID: ${messageTargetMember?.id})\nWARD: ${messageTargetMember?.ward}\nCURRENT VITALS:\n- BP: ${liveVitals[messageTargetMember?.id]?.systolic || 120}/${liveVitals[messageTargetMember?.id]?.diastolic || 80} mmHg\n- Pulse: ${liveVitals[messageTargetMember?.id]?.heartRate || 75} bpm\n\nMESSAGE:\n"${messageText}"`,
        type: 'info'
      });
      
      toast.success(`Message sent to Dr. ${messageTargetMember?.assignedDoctor?.name || 'Sarah Chen'}`);
      setMessageTargetMember(null);
      setMessageText('');
      setIsSendingMessage(false);
    }, 1000);
  };

  if (!patient) {
    return (
      <EmptyState
        icon="health_and_safety"
        title="Patient profile not linked"
        description="Please complete registration so your dashboard can show family logs."
      />
    );
  }

  const activeTab = 'family-tracker';

  return (
    <div className="space-y-6 pb-8 w-full min-w-0 max-w-full">
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes heart-pulse {
          0%, 100% { transform: scale(1); }
          20% { transform: scale(1.2); }
          40% { transform: scale(1.05); }
          60% { transform: scale(1.25); }
          80% { transform: scale(1.1); }
        }
        .animate-pulse-dot {
          animation: pulse-dot 1.5s infinite;
        }
        .animate-heart-pulse {
          animation: heart-pulse 0.9s infinite;
        }
        @keyframes sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .telemetry-sweep {
          position: relative;
          overflow: hidden;
        }
        .telemetry-sweep::after {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent);
          animation: sweep 3.5s linear infinite;
        }
      `}</style>

      <section className="flex flex-col gap-2 w-full min-w-0 max-w-full">
        <h1 className="text-2xl font-bold text-on-surface break-words whitespace-normal">Welcome back, {patient.name}</h1>
        <p className="text-sm text-on-surface-variant break-words whitespace-normal w-full max-w-full">
          Track doctor appointments, instructions, billing, documents, and your health chart from one place.
        </p>
      </section>

      {/* Tabs Selector */}
      <div className="flex border-b border-outline-variant dark:border-outline gap-2 flex-wrap">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'my-health'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-lg">patient_list</span>
          My Health Dashboard
        </button>
        <button
          onClick={() => navigate('/patient/medication-tracker')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'medication-tracker'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-lg">medical_services</span>
          Medication Tracker
        </button>
        <button
          onClick={() => navigate('/patient/symptom-checker')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'symptom-checker'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-lg">stethoscope</span>
          AI Symptom Checker
        </button>
        <button
          onClick={() => navigate('/patient/virtual-clinic')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer relative ${
            activeTab === 'virtual-clinic'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-lg">videocam</span>
          Virtual Clinic (Live)
          <span className="absolute right-0 top-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </button>
        <button
          onClick={() => navigate('/patient/family-tracker')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer relative ${
            activeTab === 'family-tracker'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-lg">group</span>
          Family Health Monitor
          {familyMembers.some(f => f.status === 'Admitted' || f.status === 'Emergency') && (
            <span className="absolute right-0 top-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </button>
      </div>

      <div className="space-y-6 w-full min-w-0 max-w-full">
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0 max-w-full">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-on-surface">Family Health Tracker</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Monitor live vitals, ICU/Ward telemetry, and admission details of linked family members.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setLinkRelationship('Spouse');
              setIsLinkModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Link Family Member
          </button>
        </section>

        {/* Family Members Grid */}
        <div className="grid grid-cols-1 gap-6 w-full min-w-0 max-w-full">
          {familyMembers.length === 0 ? (
            <div className="rounded-2xl border border-outline-variant bg-surface p-10 text-center dark:border-outline">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3 block">group_off</span>
              <h3 className="text-base font-bold text-on-surface">No family members linked yet</h3>
              <p className="text-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
                Link your family members to monitor their live admission status, ward location, and real-time health telemetry.
              </p>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(true)}
                className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
              >
                Link Your First Member
              </button>
            </div>
          ) : (
            familyMembers.map((member) => {
              const isAdmitted = member.status === 'Admitted' || member.status === 'Emergency';
              const vitals = liveVitals[member.id];
              
              // Blood pressure issues analysis
              let bpIssue = false;
              let bpLabel = "Normal";
              let bpAlertLevel = "normal"; // normal, warning, danger
              
              if (isAdmitted && vitals) {
                const sys = vitals.systolic;
                const dia = vitals.diastolic;
                
                if (sys >= 180 || dia >= 120) {
                  bpIssue = true;
                  bpLabel = "Hypertensive Crisis (Urgent Care Required)";
                  bpAlertLevel = "danger";
                } else if (sys >= 140 || dia >= 90) {
                  bpIssue = true;
                  bpLabel = "Stage 2 Hypertension (BP Issue)";
                  bpAlertLevel = "danger";
                } else if (sys >= 130 || dia >= 80) {
                  bpLabel = "Stage 1 Hypertension";
                  bpAlertLevel = "warning";
                } else if (sys >= 120 && dia < 80) {
                  bpLabel = "Elevated";
                  bpAlertLevel = "warning";
                } else if (sys < 90 || dia < 60) {
                  bpIssue = true;
                  bpLabel = "Hypotension (Low BP Issue)";
                  bpAlertLevel = "danger";
                }
              }

              return (
                <div
                  key={member.id}
                  className={`rounded-2xl border border-outline-variant bg-surface shadow-sm overflow-hidden dark:border-outline transition-all duration-300 w-full min-w-0 max-w-full ${
                    isAdmitted && bpIssue ? 'ring-2 ring-error/40 shadow-error/10' : ''
                  }`}
                >
                  {/* Header Bar */}
                  <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant dark:border-outline flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-on-surface text-base leading-none">{member.name}</h3>
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-primary-container text-on-primary-container">
                            {member.relationship}
                          </span>
                          {isAdmitted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 animate-pulse border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot"></span>
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1.5">
                          ID: {member.id} &bull; {member.age} yrs &bull; {member.gender} &bull; Blood: {member.bloodType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <button
                        type="button"
                        onClick={() => handleUnlinkMember(member.id)}
                        className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                        title="Unlink Family Member"
                      >
                        <span className="material-symbols-outlined text-lg">link_off</span>
                      </button>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    {isAdmitted ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0 max-w-full">
                        {/* Live ICU Telemetry Screen (Dark-Theme style) */}
                        <div className="lg:col-span-7 bg-slate-950 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-inner relative overflow-hidden telemetry-sweep flex flex-col justify-between min-h-[300px]" style={{ backgroundColor: '#020617' }}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-emerald-400 text-sm animate-pulse-dot">sensors</span>
                              <span className="text-[10px] tracking-widest text-emerald-400 uppercase font-black">ICU Telemetry • {member.ward || 'Observation Ward'}</span>
                            </div>
                            <span className="text-[9px] text-slate-500 uppercase font-mono">Sync: {vitals?.updatedAt || 'connecting...'}</span>
                          </div>

                          {/* Vitals Digital readout Grid */}
                          <div className="grid grid-cols-2 gap-4 my-2">
                            {/* Pulse / Heart Rate */}
                            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between" style={{ backgroundColor: '#0f172a' }}>
                              <div>
                                <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Pulse Rate</p>
                                <p className="text-3xl font-black text-red-500 font-mono mt-1">
                                  {vitals?.heartRate || '--'}
                                  <span className="text-xs font-normal text-slate-400 ml-1">bpm</span>
                                </p>
                              </div>
                              <span className="material-symbols-outlined text-red-500 text-3xl animate-heart-pulse">monitor_heart</span>
                            </div>

                            {/* Blood Pressure ("bread pleasure") */}
                            <div className={`p-3 bg-slate-900/60 rounded-xl border flex items-center justify-between transition-colors ${
                              bpAlertLevel === 'danger' ? 'border-red-900/60 bg-red-950/20' : 'border-slate-800'
                            }`} style={{ backgroundColor: '#0f172a' }}>
                              <div>
                                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Blood Pressure</p>
                                <p className={`text-3xl font-black font-mono mt-1 ${
                                  bpAlertLevel === 'danger' ? 'text-red-500' : 'text-cyan-400'
                                }`}>
                                  {vitals ? `${vitals.systolic}/${vitals.diastolic}` : '--/--'}
                                  <span className="text-xs font-normal text-slate-400 ml-1">mmHg</span>
                                </p>
                              </div>
                              <span className={`material-symbols-outlined text-3xl ${
                                bpAlertLevel === 'danger' ? 'text-red-500 animate-pulse' : 'text-cyan-400'
                              }`}>
                                favorite
                              </span>
                            </div>

                            {/* Oxygen SpO2 */}
                            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between" style={{ backgroundColor: '#0f172a' }}>
                              <div>
                                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Oxygen Saturation</p>
                                <p className="text-3xl font-black text-amber-400 font-mono mt-1">
                                  {vitals?.oxygen || '--'}
                                  <span className="text-xs font-normal text-slate-400 ml-1">% SpO2</span>
                                </p>
                              </div>
                              <span className="material-symbols-outlined text-amber-400 text-3xl">opacity</span>
                            </div>

                            {/* Temp */}
                            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between" style={{ backgroundColor: '#0f172a' }}>
                              <div>
                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Body Temp</p>
                                <p className="text-3xl font-black text-emerald-400 font-mono mt-1">
                                  {vitals?.temperature || '--'}
                                  <span className="text-xs font-normal text-slate-400 ml-1">°F</span>
                                </p>
                              </div>
                              <span className="material-symbols-outlined text-emerald-400 text-3xl">thermostat</span>
                            </div>
                          </div>

                          {/* Waveform graphic */}
                          <div className="border-t border-slate-900 pt-3 flex flex-col justify-end">
                            <svg className="w-full h-8 opacity-60" viewBox="0 0 100 20" preserveAspectRatio="none">
                              <path
                                d="M0,10 H20 L22,8 L24,12 L26,4 L28,16 L30,10 H50 L52,8 L54,12 L56,4 L58,16 L60,10 H80 L82,8 L84,12 L86,4 L88,16 L90,10 H100"
                                fill="none"
                                stroke={bpAlertLevel === 'danger' ? '#EF4444' : '#10B981'}
                                strokeWidth="1.5"
                              />
                            </svg>
                            <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                              <span>Dynamic ECG Monitor Simulator</span>
                              <span className={`flex items-center gap-1 ${
                                bpAlertLevel === 'danger' ? 'text-red-500 animate-pulse font-extrabold' : 'text-emerald-400 font-bold'
                              }`}>
                                Status: {bpLabel}
                              </span>
                            </div>
                          </div>

                          {/* Hypertensive / BP Issue Warning Banner */}
                          {bpIssue && (
                            <div className="mt-3 p-3 border border-red-800/40 rounded-xl flex items-start gap-2.5 animate-pulse text-left" style={{ backgroundColor: 'rgba(69, 10, 10, 0.4)' }}>
                              <span className="material-symbols-outlined text-red-500 shrink-0 mt-0.5">warning</span>
                              <div>
                                <span className="text-xs font-extrabold text-red-400 block uppercase">BLOOD PRESSURE ISSUE</span>
                                <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                                  Admit patient is experiencing blood pressure issues (<strong>{vitals.systolic}/{vitals.diastolic} mmHg</strong>). Attending physician, Dr. {member.doctor || 'Sarah Chen'}, is supervising ward care.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Admitting info & Operations */}
                        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 dark:border-outline space-y-3.5">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-primary text-xl">hotel</span>
                              <div>
                                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Admission Location</p>
                                <p className="text-sm font-extrabold text-on-surface mt-0.5">{member.ward || 'General ICU Ward'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-primary text-xl">person_play</span>
                              <div>
                                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Attending Physician</p>
                                <p className="text-sm font-extrabold text-on-surface mt-0.5">Dr. {member.doctor || 'Sarah Chen'}</p>
                                <p className="text-xs text-on-surface-variant">{member.department || 'Cardiology'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                              <div>
                                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Admitted Since</p>
                                <p className="text-sm font-extrabold text-on-surface mt-0.5">{formatDate(member.admittedDate)}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-primary text-xl">clinical_notes</span>
                              <div>
                                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Clinical Condition</p>
                                <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full mt-1.5 ${
                                  member.condition === 'Critical' 
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 animate-pulse'
                                    : member.condition === 'Recovering'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                }`}>
                                  {member.condition || 'Stable'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Triage & Operations Panel */}
                          <div className="space-y-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                toast.success(`Broadcasting live update request for ${member.name}. Nurse triage station has been notified.`);
                              }}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-low px-4 py-2.5 text-sm font-bold text-on-surface transition-all cursor-pointer border-none"
                            >
                              <span className="material-symbols-outlined text-lg">sync_saved_locally</span>
                              Request Nurse Triage Update
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setMessageTargetMember(member);
                                setMessageText('');
                              }}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary/10 hover:bg-primary/20 px-4 py-2.5 text-sm font-bold text-primary transition-all cursor-pointer border-none"
                            >
                              <span className="material-symbols-outlined text-lg">chat</span>
                              Message Attending Doctor
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                toast.success(`Calling ${member.ward || 'Ward'} Nursing Desk... +91 80 4567 8104`);
                              }}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 px-4 py-2.5 text-sm font-bold text-secondary transition-all cursor-pointer border-none"
                            >
                              <span className="material-symbols-outlined text-lg">call</span>
                              Contact Ward Nurse Desk
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Non-admitted patient details (Discharged/Outpatient) */
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-on-surface-variant text-base">check_circle_outline</span>
                            <span className="text-sm font-bold text-on-surface-variant">Outpatient Status</span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              member.status === 'Discharged'
                                ? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-400'
                            }`}>
                              {member.status || 'Active'}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            This member is not currently admitted. You can book outpatient consults or access clinical notes for them.
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => navigate('/patient/book')}
                            className="rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface transition-colors cursor-pointer border-none"
                          >
                            Book Appointment
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              toast.success(`Viewing care plans for ${member.name}`);
                            }}
                            className="rounded-xl bg-primary/10 hover:bg-primary/20 px-4 py-2 text-xs font-bold text-primary transition-colors cursor-pointer border-none"
                          >
                            View Care Plans
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Link Family Member Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Link a Family Member"
        size="sm"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Enter your family member's details to link their patient profile and track their real-time hospital care and live vitals.
          </p>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">Search Patient</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3.5 text-on-surface-variant text-base">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name, Patient ID, or Email..."
                className="w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-4 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors dark:border-outline"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">Relationship</label>
            <select
              value={linkRelationship}
              onChange={(e) => setLinkRelationship(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors dark:border-outline cursor-pointer"
            >
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Relative">Relative</option>
            </select>
          </div>

          {searchQuery.trim() && (
            <div className="border border-outline-variant dark:border-outline rounded-xl p-2 max-h-48 overflow-y-auto space-y-1 bg-surface-container-low">
              <p className="text-[10px] font-bold text-on-surface-variant px-2 py-1 uppercase tracking-wider">Search Results</p>
              {filteredPatientsToLink.length === 0 ? (
                <p className="text-xs text-on-surface-variant p-2 italic text-center">No patients found (excluding yourself and already linked members)</p>
              ) : (
                filteredPatientsToLink.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                    onClick={() => handleLinkMember(p.id)}
                  >
                    <div>
                      <p className="text-sm font-bold text-on-surface">{p.name}</p>
                      <p className="text-[10px] text-on-surface-variant">ID: {p.id} &bull; {p.gender} &bull; Status: {p.status}</p>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 transition-colors border-none cursor-pointer"
                    >
                      Link
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-outline-variant dark:border-outline">
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(false)}
              className="px-4 py-2.5 border border-outline-variant rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Message Attending Doctor Modal */}
      <Modal
        isOpen={!!messageTargetMember}
        onClose={() => setMessageTargetMember(null)}
        title={messageTargetMember ? `Message Dr. ${messageTargetMember.doctor || 'Assigned Physician'}` : 'Message Physician'}
        size="sm"
      >
        {messageTargetMember && (
          <form onSubmit={handleSendMessageSubmit} className="space-y-4 text-left">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Your message regarding <strong>{messageTargetMember.name}</strong>'s live telemetry will be sent directly to the attending doctor's dashboard.
            </p>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">Message Content</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors resize-none dark:border-outline"
                placeholder="E.g., I noticed their blood pressure is rising. Is this normal post-surgery?..."
                required
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant dark:border-outline">
              <button
                type="button"
                onClick={() => setMessageTargetMember(null)}
                className="px-4 py-2.5 border border-outline-variant rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSendingMessage}
                className="px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer border-none"
              >
                {isSendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
