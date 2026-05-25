import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useHospital } from '../../../context/HospitalContext';
import EmptyState from '../../../components/common/EmptyState';

export default function SymptomChecker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, doctors } = useHospital();

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

  // AI Symptom Checker State
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [triageResult, setTriageResult] = useState(null);
  const [isTriageLoading, setIsTriageLoading] = useState(false);

  if (!patient) {
    return (
      <EmptyState
        icon="health_and_safety"
        title="Patient profile not linked"
        description="Please complete registration so your dashboard can show symptom checker."
      />
    );
  }

  const activeTab = 'symptom-checker';

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
        <section className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline">
          <h2 className="text-lg font-bold text-on-surface mb-1.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">psychology</span>
            CurePulse AI Clinical Triage
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Select symptoms you are experiencing to run a mock AI clinical assessment, severity triage, and discover matched medical specialists.
          </p>

          {/* Symptoms checklist */}
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Select Symptoms</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  'Chest Pain', 'Shortness of breath', 'High Fever', 'Dry Cough',
                  'Severe Headache', 'Dizziness', 'Sore Throat', 'Abdominal Pain',
                  'Skin Rash', 'Nausea / Vomiting', 'Joint Swelling', 'Vision Blurriness'
                ].map(symptom => {
                  const isChecked = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
                        } else {
                          setSelectedSymptoms([...selectedSymptoms, symptom]);
                        }
                      }}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-primary/10 border-primary text-primary font-bold'
                          : 'bg-surface border-outline-variant hover:border-primary/50 text-on-surface dark:border-outline'
                      }`}
                    >
                      <span>{symptom}</span>
                      {isChecked && <span className="material-symbols-outlined text-xs">done</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedSymptoms([]);
                  setTriageResult(null);
                }}
                className="px-4 py-2 border border-outline-variant rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer border-none bg-transparent"
              >
                Clear Symptoms
              </button>
              <button
                type="button"
                disabled={selectedSymptoms.length === 0 || isTriageLoading}
                onClick={() => {
                  setIsTriageLoading(true);
                  setTriageResult(null);
                  setTimeout(() => {
                    setIsTriageLoading(false);
                    
                    let severity = 'low';
                    let assessment = 'Your selected symptoms represent mild wellness alerts. Rest and ensure hydration. Consider consulting general practitioners if symptoms persist.';
                    let department = 'General Medicine';
                    
                    if (selectedSymptoms.includes('Chest Pain') || selectedSymptoms.includes('Shortness of breath')) {
                      severity = 'critical';
                      assessment = 'CRITICAL ALERT: Chest pain or shortness of breath requires immediate clinical evaluation. Trigger emergency response or report to ER triage desks immediately.';
                      department = 'Cardiology';
                    } else if (selectedSymptoms.includes('High Fever') || selectedSymptoms.includes('Severe Headache')) {
                      severity = 'high';
                      assessment = 'HIGH PRIORITY: High fevers and severe headaches should be evaluated by clinical staff to rule out systemic infections. Book a pediatric or general practitioner review.';
                      department = 'General Medicine';
                    } else if (selectedSymptoms.includes('Vision Blurriness')) {
                      severity = 'medium';
                      department = 'Ophthalmology';
                      assessment = 'MODERATE PRIORITY: Vision changes require opthalmological review and stress tests.';
                    } else if (selectedSymptoms.includes('Joint Swelling')) {
                      severity = 'medium';
                      department = 'Orthopedics';
                      assessment = 'MODERATE PRIORITY: Joint swelling or pain suggests local injury or orthopedic flare-up. Schedule physiotherapy consults.';
                    } else if (selectedSymptoms.includes('Skin Rash')) {
                      severity = 'low';
                      department = 'Dermatology';
                      assessment = 'LOW PRIORITY: Mild skin rashes can be assessed via outpatient checkups or digital photos.';
                    }
                    
                    setTriageResult({ severity, assessment, department });
                  }, 1500);
                }}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all disabled:opacity-50 cursor-pointer border-none flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-xs">analytics</span>
                {isTriageLoading ? 'Running Triage...' : 'Analyze Symptoms'}
              </button>
            </div>
          </div>
        </section>

        {/* AI Loader */}
        {isTriageLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-surface rounded-2xl border border-outline-variant dark:border-outline">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
            <p className="text-sm font-extrabold text-on-surface animate-pulse">Consulting CurePulse AI Triage Engine...</p>
            <p className="text-xs text-on-surface-variant max-w-xs">Analyzing symptoms against EHR clinical logs & department directories...</p>
          </div>
        )}

        {/* Triage Result Card */}
        {triageResult && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0 max-w-full animate-fadeIn">
            <div className="lg:col-span-6 rounded-2xl border border-outline-variant bg-surface p-5 dark:border-outline">
              <h3 className="font-extrabold text-on-surface text-base mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">clinical_notes</span>
                AI Assessment Report
              </h3>

              <div className={`p-4 rounded-xl border flex items-start gap-3 text-left ${
                triageResult.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                triageResult.severity === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                triageResult.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
              }`}>
                <span className="material-symbols-outlined shrink-0 mt-0.5">
                  {triageResult.severity === 'critical' ? 'emergency' : 'warning'}
                </span>
                <div>
                  <span className="text-xs font-black uppercase block tracking-wider">
                    Severity: {triageResult.severity} priority
                  </span>
                  <p className="text-xs text-on-surface leading-relaxed mt-1.5">
                    {triageResult.assessment}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-surface-container-low rounded-xl text-xs space-y-1.5">
                <p className="text-on-surface-variant font-semibold">Recommended Specialty: <strong className="text-on-surface">{triageResult.department}</strong></p>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  Disclaimer: AI clinical triage is simulated to direct patient care and does not constitute a formal diagnosis. If you face a medical crisis, call standard ER emergency lines.
                </p>
              </div>
            </div>

            {/* Matched Doctors */}
            <div className="lg:col-span-6 rounded-2xl border border-outline-variant bg-surface p-5 dark:border-outline flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-on-surface text-base mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">groups</span>
                  Matching Specialists
                </h3>
                <p className="text-xs text-on-surface-variant mb-4">
                  Based on symptoms, we found these matches in our {triageResult.department} department:
                </p>

                <div className="space-y-2.5">
                  {(() => {
                    const matches = doctors.filter(doc => doc.department === triageResult.department).slice(0, 2);
                    return matches.length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic p-3 text-center">No immediate matching doctors available.</p>
                    ) : (
                      matches.map(doc => (
                        <div key={doc.id} className="p-3 bg-surface-container-low rounded-xl border border-outline-variant dark:border-outline flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden">
                              <img src={doc.avatar || 'https://via.placeholder.com/150'} alt={doc.name} className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-on-surface">{doc.name}</h4>
                              <p className="text-[10px] text-on-surface-variant mt-0.5">{doc.specialization} &bull; {doc.experience}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate('/patient/book')}
                            className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/95 transition-colors border-none cursor-pointer"
                          >
                            Book Consult
                          </button>
                        </div>
                      ))
                    );
                  })()}
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant dark:border-outline mt-4 text-right">
                <button
                  type="button"
                  onClick={() => navigate('/patient/book')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all cursor-pointer border-none"
                >
                  Go to Appointment Booking
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
