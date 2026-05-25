import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useHospital } from '../../../context/HospitalContext';
import { useNotifications } from '../../../context/NotificationContext';
import EmptyState from '../../../components/common/EmptyState';

export default function MedicationTracker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients } = useHospital();
  const { addNotification } = useNotifications();

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

  // Pill Reminder State
  const [medicationLogs, setMedicationLogs] = useState(() => {
    const saved = localStorage.getItem(`curepulse_med_logs_${user?.id || 'guest'}`);
    return saved ? JSON.parse(saved) : {};
  });
  
  const [refillRequests, setRefillRequests] = useState(() => {
    const saved = localStorage.getItem(`curepulse_refill_reqs_${user?.id || 'guest'}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Pill reminders logic and data
  const myPills = useMemo(() => {
    const rxPills = patient?.prescriptions?.map((rx, idx) => ({
      id: `rx-${idx}`,
      name: rx.medication,
      dosage: rx.dosage,
      frequency: rx.frequency,
      timeOfDay: rx.frequency?.toLowerCase().includes('night') || rx.frequency?.toLowerCase().includes('bed') ? 'Night' : rx.frequency?.toLowerCase().includes('noon') || rx.frequency?.toLowerCase().includes('lunch') ? 'Noon' : 'Morning',
      isRx: true
    })) || [];
    
    const wellnessPills = [
      { id: 'well-1', name: 'Multivitamin', dosage: '1 Capsule', frequency: 'Daily', timeOfDay: 'Morning', isRx: false },
      { id: 'well-2', name: 'Omega-3 Fish Oil', dosage: '1 Capsule', frequency: 'Daily', timeOfDay: 'Noon', isRx: false },
      { id: 'well-3', name: 'Vitamin D3', dosage: '1 Tablet', frequency: 'Weekly', timeOfDay: 'Morning', isRx: false }
    ];
    
    return rxPills.length > 0 ? [...rxPills, ...wellnessPills] : wellnessPills;
  }, [patient]);

  const handleTogglePill = (pillName, status) => {
    const today = new Date().toISOString().split('T')[0];
    const newLogs = { ...medicationLogs };
    if (!newLogs[today]) newLogs[today] = {};
    
    if (newLogs[today][pillName] === status) {
      delete newLogs[today][pillName];
    } else {
      newLogs[today][pillName] = status;
    }
    
    setMedicationLogs(newLogs);
    localStorage.setItem(`curepulse_med_logs_${user?.id || 'guest'}`, JSON.stringify(newLogs));
    
    if (status === 'taken') {
      toast.success(`${pillName} marked as taken!`);
    } else {
      toast.error(`${pillName} marked as skipped.`);
    }
  };

  const handleRequestRefill = (pillName) => {
    if (refillRequests.includes(pillName)) {
      toast.error('Refill request already pending for this medication.');
      return;
    }
    const newList = [...refillRequests, pillName];
    setRefillRequests(newList);
    localStorage.setItem(`curepulse_refill_reqs_${user?.id || 'guest'}`, JSON.stringify(newList));
    
    toast.success(`Refill request submitted for ${pillName}! Processing with Pharmacy.`);
    
    addNotification({
      title: `💊 Prescription Refill Request: ${patient?.name || user?.name}`,
      shortDescription: `Patient ${patient?.name || user?.name} requested a refill for ${pillName}.`,
      details: `PATIENT PROFILE:\n- Name: ${patient?.name || user?.name}\n- Patient ID: ${patient?.id || 'N/A'}\n- Contact: ${patient?.phone || 'N/A'}\n\nREFILL DETAILS:\n- Medication: ${pillName}\n- Attending Doctor: Dr. ${patient?.doctor || 'Sarah Chen'}\n- Department: ${patient?.department || 'General'}\n\nACTION REQUESTED:\nVerify prescription validity and coordinate home dispatch.`,
      type: 'pharmacy'
    });
  };

  if (!patient) {
    return (
      <EmptyState
        icon="health_and_safety"
        title="Patient profile not linked"
        description="Please complete registration so your dashboard can show medication plans, refills, and records."
      />
    );
  }

  const activeTab = 'medication-tracker';

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

      <div className="space-y-6 w-full min-w-0 max-w-full text-left">
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0 max-w-full">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-on-surface">Daily Medication Adherence</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Mark your daily doses as taken or skipped to monitor compliance stats.
            </p>
          </div>
          {/* Adherence Compliance Widget */}
          <div className="shrink-0 flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl border border-outline-variant dark:border-outline">
            <span className="material-symbols-outlined text-secondary text-2xl">insights</span>
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Weekly Compliance</p>
              <p className="text-lg font-black text-secondary">
                {(() => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const logs = medicationLogs[todayStr] || {};
                  const total = myPills.length;
                  const taken = Object.values(logs).filter(s => s === 'taken').length;
                  return total > 0 ? Math.round((taken / total) * 100) : 100;
                })()}%
              </p>
            </div>
          </div>
        </section>

        {/* Time of Day Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full min-w-0 max-w-full">
          {['Morning', 'Noon', 'Night'].map((time) => {
            const timePills = myPills.filter(p => p.timeOfDay === time);
            const timeIcons = {
              Morning: 'light_mode',
              Noon: 'wb_sunny',
              Night: 'bedtime'
            };
            const timeColors = {
              Morning: 'text-amber-500 bg-amber-100/50 dark:bg-amber-950/20',
              Noon: 'text-orange-500 bg-orange-100/50 dark:bg-orange-950/20',
              Night: 'text-indigo-500 bg-indigo-100/50 dark:bg-indigo-950/20'
            };

            return (
              <div key={time} className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className={`material-symbols-outlined p-2 rounded-xl text-lg ${timeColors[time]}`}>
                      {timeIcons[time]}
                    </span>
                    <h3 className="font-extrabold text-on-surface text-base">{time} Doses</h3>
                  </div>

                  <div className="space-y-3">
                    {timePills.length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic py-6 text-center">No pills scheduled</p>
                    ) : (
                      timePills.map(pill => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const pillStatus = medicationLogs[todayStr]?.[pill.name];
                        const isRefillPending = refillRequests.includes(pill.name);

                        return (
                          <div key={pill.id} className="p-3 bg-surface-container-low rounded-xl border border-outline-variant dark:border-outline space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-sm font-bold text-on-surface leading-tight break-words">{pill.name}</h4>
                                  {pill.isRx && (
                                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-primary/10 text-primary uppercase">EHR Rx</span>
                                  )}
                                </div>
                                <p className="text-xs text-on-surface-variant mt-1">{pill.dosage} &bull; {pill.frequency}</p>
                              </div>

                              <div className="flex gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePill(pill.name, 'taken')}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    pillStatus === 'taken'
                                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                                      : 'bg-surface hover:bg-emerald-500/10 text-on-surface-variant hover:text-emerald-500 border-outline-variant dark:border-outline'
                                  }`}
                                  title="Mark Taken"
                                >
                                  <span className="material-symbols-outlined text-base">check</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePill(pill.name, 'skipped')}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    pillStatus === 'skipped'
                                      ? 'bg-error text-white border-error shadow-md shadow-error/20'
                                      : 'bg-surface hover:bg-error/10 text-on-surface-variant hover:text-error border-outline-variant dark:border-outline'
                                  }`}
                                  title="Mark Skipped"
                                >
                                  <span className="material-symbols-outlined text-base">close</span>
                                </button>
                              </div>
                            </div>

                            {pill.isRx && (
                              <div className="flex items-center justify-between border-t border-outline-variant/60 dark:border-outline/60 pt-2 text-[10px]">
                                <span className="text-on-surface-variant">Pharmacy refill desk</span>
                                <button
                                  type="button"
                                  disabled={isRefillPending}
                                  onClick={() => handleRequestRefill(pill.name)}
                                  className={`font-black uppercase flex items-center gap-1 cursor-pointer border-none bg-transparent ${
                                    isRefillPending ? 'text-amber-500 font-bold' : 'text-primary hover:underline'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-xs">local_shipping</span>
                                  {isRefillPending ? 'Refill Pending' : 'Request Refill'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Refill Desk Logs */}
        {refillRequests.length > 0 && (
          <section className="rounded-2xl border border-outline-variant bg-surface p-5 dark:border-outline">
            <h3 className="font-extrabold text-on-surface text-base mb-3.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              Active Refill Deliveries
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {refillRequests.map((med, idx) => (
                <div key={idx} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant dark:border-outline flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{med}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">Dispensed by CurePulse ER Pharmacy</p>
                    <div className="w-32 bg-outline-variant dark:bg-outline h-1.5 rounded-full overflow-hidden mt-3.5">
                      <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-[10px] text-primary font-bold block mt-1">In Transit - Courier Assigned</span>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-primary animate-bounce">package_2</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
