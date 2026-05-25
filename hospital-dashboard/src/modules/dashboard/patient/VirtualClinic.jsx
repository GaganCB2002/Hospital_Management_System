import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useHospital } from '../../../context/HospitalContext';
import EmptyState from '../../../components/common/EmptyState';

export default function VirtualClinic() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients } = useHospital();

  // Load linked family to show indicator dot in tab bar
  const [linkedFamily] = useState(() => {
    const saved = localStorage.getItem(`curepulse_linked_family_${user?.id || 'guest'}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { /* ignore */ }
    }
    return [
      { id: 'PT-4473', relationship: 'Sibling' },
      { id: 'PT-4420', relationship: 'Spouse' }
    ];
  });

  const familyMembers = useMemo(() => {
    return patients.filter(p => linkedFamily.some(f => f.id === p.id)).map(p => {
      const match = linkedFamily.find(f => f.id === p.id);
      return {
        ...p,
        relationship: match ? match.relationship : 'Relative'
      };
    });
  }, [patients, linkedFamily]);

  const patient = useMemo(
    () => patients.find((entry) => entry.name === user?.name || entry.email === user?.email),
    [patients, user],
  );

  // Telehealth State
  const [telehealthState, setTelehealthState] = useState('idle'); // 'idle' | 'calling' | 'connected'
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [telehealthTimer, setTelehealthTimer] = useState(0);

  // Telehealth Call duration timer & doctor responses
  useEffect(() => {
    let interval;
    if (telehealthState === 'connected') {
      interval = setInterval(() => {
        setTelehealthTimer(prev => prev + 1);
      }, 1000);
    } else {
      const timeout = setTimeout(() => setTelehealthTimer(0), 0);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
    return () => clearInterval(interval);
  }, [telehealthState]);

  const sendTelehealthMessage = (text) => {
    if (!text.trim()) return;
    
    const userMsg = { sender: 'patient', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    
    setTimeout(() => {
      let docText = `I understand. Let's make sure we monitor this. How are you feeling overall today?`;
      const query = text.toLowerCase();
      
      if (query.includes('hello') || query.includes('hi')) {
        docText = `Hello! How can I help you today? We are reviewing your latest telemetry data.`;
      } else if (query.includes('bp') || query.includes('pressure') || query.includes('bread pleasure') || query.includes('hypertension')) {
        docText = `Your blood pressure trends look stable today. Make sure to take your prescribed beta-blockers and log your readings.`;
      } else if (query.includes('pain') || query.includes('hurt')) {
        docText = `I see. If the pain is acute, please take the prescribed pain reliever. I'll make a clinical note in your file.`;
      } else if (query.includes('thank') || query.includes('thanks')) {
        docText = `You're welcome! Keep tracking your vitals. I am signing off your virtual session notes.`;
      }
      
      const docMsg = {
        sender: 'doctor',
        text: docText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, docMsg]);
    }, 1500);
  };

  const handleStartCall = () => {
    setTelehealthState('calling');
    setTimeout(() => {
      setTelehealthState('connected');
      setChatMessages([
        { sender: 'doctor', text: `Hello ${patient?.name || user?.name}, I am Dr. ${patient?.assignedDoctor?.name || 'Sarah Chen'}. Welcome to your virtual check-up.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 2000);
  };

  const handleEndCall = () => {
    setTelehealthState('idle');
    toast.success('Consultation ended. Consultation summary uploaded to your portal.');
  };

  if (!patient) {
    return (
      <EmptyState
        icon="health_and_safety"
        title="Patient profile not linked"
        description="Please complete registration so your dashboard can show appointments and virtual clinic desk."
      />
    );
  }

  const activeTab = 'virtual-clinic';

  return (
    <div className="space-y-6 pb-8 w-full min-w-0 max-w-full">
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

      <div className="w-full min-w-0 max-w-full flex flex-col items-center justify-center text-left">
        {telehealthState === 'idle' && (
          <div className="rounded-2xl border border-outline-variant bg-surface p-8 dark:border-outline w-full min-w-0 max-w-full flex flex-col items-center justify-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-primary animate-pulse">videocam</span>
            <div className="w-full max-w-md whitespace-normal break-words text-center leading-relaxed flex flex-col items-center">
              <h3 className="text-lg font-extrabold text-on-surface">Telehealth Video Consult Desk</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mt-2">
                Connect directly with your attending doctor (Dr. {patient.assignedDoctor?.name || 'Sarah Chen'}) in a virtual digital check-up room. No installs needed.
              </p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl text-left border border-outline-variant dark:border-outline space-y-2 w-full max-w-md min-w-0 flex-1">
              <p className="text-xs font-bold text-on-surface flex items-center gap-1.5 whitespace-normal break-words">
                <span className="material-symbols-outlined text-xs text-primary font-bold">check_circle</span>
                Audio/Video telemetry test: Normal
              </p>
              <p className="text-xs font-bold text-on-surface flex items-center gap-1.5 whitespace-normal break-words">
                <span className="material-symbols-outlined text-xs text-primary font-bold">check_circle</span>
                Broadband connection latency: 15ms (Excellent)
              </p>
              <p className="text-xs font-bold text-on-surface flex items-center gap-1.5 whitespace-normal break-words">
                <span className="material-symbols-outlined text-xs text-primary font-bold">check_circle</span>
                Virtual physician: Dr. {patient.assignedDoctor?.name || 'Sarah Chen'} (Cardiology) is on stand-by
              </p>
            </div>
            <div className="w-full max-w-md">
              <button
                type="button"
                onClick={handleStartCall}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-white hover:bg-primary/95 transition-all cursor-pointer shadow-md shadow-primary/20 hover:scale-[1.01] border-none"
              >
                Join Virtual Consultation
              </button>
            </div>
          </div>
        )}

        {telehealthState === 'calling' && (
          <div className="rounded-2xl border border-outline-variant bg-slate-950 p-12 text-slate-100 w-full min-w-0 max-w-full flex flex-col items-center justify-center space-y-6 min-h-[350px]" style={{ backgroundColor: '#020617' }}>
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-25"></span>
              <div className="relative rounded-full h-16 w-16 bg-primary/20 border-2 border-primary flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl animate-bounce">wifi_calling</span>
              </div>
            </div>
            <div>
              <p className="text-base font-extrabold tracking-widest text-primary animate-pulse">ESTABLISHING VIRTUAL LINK...</p>
              <p className="text-xs text-slate-400 mt-2">Connecting camera telemetry & medical video feeds...</p>
            </div>
          </div>
        )}

        {telehealthState === 'connected' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0 max-w-full">
            {/* Virtual Video Call Panel */}
            <div className="lg:col-span-8 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between min-h-[450px]" style={{ backgroundColor: '#020617' }}>
              {/* Header info */}
              <div className="p-4 border-b border-slate-900 flex justify-between items-center" style={{ backgroundColor: '#0f172a' }}>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-300">Consultation Live • {Math.floor(telehealthTimer / 60)}:{(telehealthTimer % 60).toString().padStart(2, '0')}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">E2E ENCRYPTED CLINICAL CHANNEL</span>
              </div>

              {/* Video Feed representation */}
              <div className="flex-1 relative flex items-center justify-center bg-slate-900 p-4" style={{ backgroundColor: '#0f172a' }}>
                {isVideoOff ? (
                  <div className="text-center space-y-2">
                    <span className="material-symbols-outlined text-4xl text-slate-600">videocam_off</span>
                    <p className="text-xs text-slate-500">Camera feed disabled</p>
                  </div>
                ) : (
                  <div className="w-full h-64 rounded-xl overflow-hidden relative border border-slate-850 bg-slate-950 flex items-center justify-center" style={{ backgroundColor: '#020617' }}>
                    <img
                      src={patient.assignedDoctor?.avatar || 'https://via.placeholder.com/300'}
                      alt="Doctor feed"
                      className="h-full w-full object-cover opacity-90 filter brightness-95"
                    />
                    <div className="absolute left-3 bottom-3 px-3 py-1 bg-black/60 rounded-lg backdrop-blur-md border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-emerald-400">mic</span>
                      Dr. {patient.assignedDoctor?.name || 'Sarah Chen'} (Assigned Physician)
                    </div>
                    
                    {/* Local self picture-in-picture */}
                    <div className="absolute right-3 top-3 w-28 h-20 rounded-lg overflow-hidden border border-white/10 bg-slate-800 hidden sm:flex items-center justify-center" style={{ backgroundColor: '#1e293b' }}>
                      <span className="material-symbols-outlined text-slate-500 text-lg">person</span>
                      <div className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[8px] text-white">You</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Call Controls */}
              <div className="p-4 bg-slate-900/60 border-t border-slate-900 flex justify-center gap-4" style={{ backgroundColor: '#0f172a' }}>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full border transition-all cursor-pointer ${
                    isMuted ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  <span className="material-symbols-outlined text-xl">{isMuted ? 'mic_off' : 'mic'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-full border transition-all cursor-pointer ${
                    isVideoOff ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  <span className="material-symbols-outlined text-xl">{isVideoOff ? 'videocam_off' : 'videocam'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white border border-red-600 shadow-md shadow-red-600/20 transition-all cursor-pointer"
                  title="End Call"
                >
                  <span className="material-symbols-outlined text-xl">call_end</span>
                </button>
              </div>
            </div>

            {/* Virtual Chat Panel */}
            <div className="lg:col-span-4 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline flex flex-col justify-between min-h-[450px]">
              <div>
                <h3 className="font-extrabold text-on-surface text-base mb-3 flex items-center gap-2 border-b border-outline-variant dark:border-outline pb-2">
                  <span className="material-symbols-outlined text-primary">chat</span>
                  Live Call Chat
                </h3>
                
                {/* Chat feed */}
                <div className="space-y-3 h-72 overflow-y-auto pr-1 text-xs custom-scrollbar">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                        msg.sender === 'patient'
                          ? 'bg-primary text-white text-right'
                          : 'bg-surface-container-low text-on-surface text-left'
                      }`}>
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-on-surface-variant mt-1 px-1 font-mono">{msg.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendTelehealthMessage(chatInput);
                }}
                className="mt-4 pt-3 border-t border-outline-variant dark:border-outline flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors dark:border-outline"
                  required
                />
                <button
                  type="submit"
                  className="p-2 bg-primary text-white rounded-lg hover:bg-primary/95 transition-all border-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
