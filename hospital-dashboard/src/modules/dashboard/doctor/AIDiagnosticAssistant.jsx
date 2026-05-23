import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTheme } from '../../../context/ThemeContext';

const symptomsDB = [
  { symptom: 'Fever', associated: ['Viral Infection', 'Influenza', 'COVID-19', 'Typhoid'], severity: 'medium' },
  { symptom: 'Cough', associated: ['Common Cold', 'Bronchitis', 'Pneumonia', 'COVID-19'], severity: 'low' },
  { symptom: 'Headache', associated: ['Migraine', 'Tension Headache', 'Sinusitis', 'Hypertension'], severity: 'low' },
  { symptom: 'Chest Pain', associated: ['Angina', 'Costochondritis', 'GERD', 'Anxiety'], severity: 'high' },
  { symptom: 'Shortness of Breath', associated: ['Asthma', 'COPD', 'Pneumonia', 'Anxiety'], severity: 'high' },
  { symptom: 'Fatigue', associated: ['Anemia', 'Hypothyroidism', 'Depression', 'Diabetes'], severity: 'low' },
  { symptom: 'Joint Pain', associated: ['Osteoarthritis', 'Rheumatoid Arthritis', 'Gout', 'Dengue'], severity: 'medium' },
  { symptom: 'Abdominal Pain', associated: ['Gastritis', 'Appendicitis', 'IBS', 'Food Poisoning'], severity: 'medium' },
  { symptom: 'Nausea/Vomiting', associated: ['Gastroenteritis', 'Food Poisoning', 'Migraine', 'Pregnancy'], severity: 'medium' },
  { symptom: 'Skin Rash', associated: ['Allergic Reaction', 'Eczema', 'Chickenpox', 'Measles'], severity: 'low' },
  { symptom: 'Sore Throat', associated: ['Tonsillitis', 'Pharyngitis', 'Common Cold', 'Strep Throat'], severity: 'low' },
  { symptom: 'Dizziness', associated: ['Vertigo', 'Anemia', 'Hypotension', 'Dehydration'], severity: 'medium' },
  { symptom: 'Back Pain', associated: ['Muscle Strain', 'Herniated Disc', 'Sciatica', 'Kidney Infection'], severity: 'medium' },
  { symptom: 'Eye Redness', associated: ['Conjunctivitis', 'Allergies', 'Dry Eye', 'Uveitis'], severity: 'low' },
  { symptom: 'Frequent Urination', associated: ['UTI', 'Diabetes', 'Prostate Issues', 'Pregnancy'], severity: 'medium' },
  { symptom: 'Weight Loss', associated: ['Hyperthyroidism', 'Diabetes', 'GI Disorders', 'Depression'], severity: 'medium' },
  { symptom: 'Swollen Lymph Nodes', associated: ['Viral Infection', 'Tuberculosis', 'Lymphoma', 'HIV'], severity: 'high' },
  { symptom: 'Night Sweats', associated: ['Tuberculosis', 'HIV', 'Lymphoma', 'Menopause'], severity: 'medium' },
];

const medicationsDB = [
  { name: 'Paracetamol', category: 'Analgesic', interactions: ['Warfarin', 'Carbamazepine', 'Phenytoin'], sideEffects: ['Liver toxicity (high dose)'] },
  { name: 'Ibuprofen', category: 'NSAID', interactions: ['Aspirin', 'Warfarin', 'Methotrexate', 'SSRIs'], sideEffects: ['GI bleeding', 'Kidney issues'] },
  { name: 'Amoxicillin', category: 'Antibiotic', interactions: ['Methotrexate', 'Warfarin', 'Allopurinol'], sideEffects: ['Rash', 'Diarrhea'] },
  { name: 'Metformin', category: 'Antidiabetic', interactions: ['Contrast Dye', 'Topiramate', 'Corticosteroids'], sideEffects: ['Lactic acidosis', 'GI upset'] },
  { name: 'Omeprazole', category: 'PPI', interactions: ['Clopidogrel', 'Methotrexate', 'Digoxin'], sideEffects: ['Vitamin B12 deficiency', 'Bone fracture'] },
  { name: 'Amlodipine', category: 'CCB', interactions: ['Simvastatin', 'CYP3A4 Inhibitors', 'Beta Blockers'], sideEffects: ['Edema', 'Hypotension'] },
  { name: 'Atorvastatin', category: 'Statin', interactions: ['Amiodarone', 'Diltiazem', 'Grapefruit Juice'], sideEffects: ['Myopathy', 'Liver enzyme elevation'] },
  { name: 'Losartan', category: 'ARB', interactions: ['Lithium', 'Potassium Supplements', 'NSAIDs'], sideEffects: ['Hyperkalemia', 'Dizziness'] },
  { name: 'Aspirin', category: 'Antiplatelet', interactions: ['Ibuprofen', 'Warfarin', 'Clopidogrel', 'Methotrexate'], sideEffects: ['GI bleeding', 'Reye syndrome'] },
  { name: 'Warfarin', category: 'Anticoagulant', interactions: ['Aspirin', 'Ibuprofen', 'Paracetamol', 'Amoxicillin', 'Fluconazole'], sideEffects: ['Bleeding', 'Purple toes syndrome'] },
  { name: 'Prednisolone', category: 'Corticosteroid', interactions: ['NSAIDs', 'Vaccines', 'Diuretics'], sideEffects: ['Osteoporosis', 'Hyperglycemia'] },
  { name: 'Salbutamol', category: 'Bronchodilator', interactions: ['Beta Blockers', 'TCAs', 'MAOIs'], sideEffects: ['Tremor', 'Tachycardia'] },
];

function DiagnosisTab({ isDark }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSymptoms = symptomsDB.filter((s) =>
    s.symptom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const diagnoses = useMemo(() => {
    if (selectedSymptoms.length === 0) return [];
    const matches = {};
    selectedSymptoms.forEach((sym) => {
      const entry = symptomsDB.find((s) => s.symptom === sym);
      if (entry) {
        entry.associated.forEach((d) => {
          matches[d] = (matches[d] || 0) + 1;
        });
      }
    });
    return Object.entries(matches)
      .map(([diagnosis, count]) => ({
        diagnosis,
        confidence: Math.round((count / selectedSymptoms.length) * 100),
        matches: count,
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }, [selectedSymptoms]);

  const handleClear = () => {
    setSelectedSymptoms([]);
    setSearchTerm('');
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search symptoms..."
        className={`w-full px-3 py-2 text-sm rounded-xl border outline-none transition-all mb-4 ${
          isDark
            ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50'
            : 'bg-white/70 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 shadow-sm'
        }`}
      />
      <div className="flex flex-wrap gap-1.5 mb-4">
        {selectedSymptoms.map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => toggleSymptom(sym)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-full border cursor-pointer transition-all ${
              isDark
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            {sym} &times;
          </button>
        ))}
        {selectedSymptoms.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1 text-[11px] font-bold rounded-full border cursor-pointer border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto mb-4">
        {filteredSymptoms.map((entry) => (
          <button
            key={entry.symptom}
            type="button"
            onClick={() => toggleSymptom(entry.symptom)}
            disabled={selectedSymptoms.includes(entry.symptom)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-full border cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'border-white/[0.08] text-white/60 hover:bg-white/[0.06]'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {entry.symptom}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {diagnoses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl border p-4 ${
              isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              Suggested Diagnoses ({diagnoses.length})
            </p>
            <div className="space-y-2">
              {diagnoses.slice(0, 5).map((d, i) => (
                <div key={d.diagnosis} className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-5 shrink-0 ${i === 0 ? 'text-emerald-500' : isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{d.diagnosis}</span>
                      <span className={`text-xs font-bold shrink-0 ml-2 ${d.confidence >= 70 ? 'text-emerald-500' : d.confidence >= 40 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {d.confidence}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          d.confidence >= 70 ? 'bg-emerald-500' : d.confidence >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${d.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className={`mt-3 text-[10px] ${isDark ? 'text-white/25' : 'text-slate-400'}`}>
              Select at least 2-3 symptoms for better accuracy. Always confirm with clinical tests.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PrescribingTab({ isDark }) {
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMeds = medicationsDB.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMed = (name) => {
    setSelectedMeds((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const interactions = useMemo(() => {
    if (selectedMeds.length < 2) return [];
    const results = [];
    for (let i = 0; i < selectedMeds.length; i++) {
      for (let j = i + 1; j < selectedMeds.length; j++) {
        const medA = medicationsDB.find((m) => m.name === selectedMeds[i]);
        const medB = medicationsDB.find((m) => m.name === selectedMeds[j]);
        if (medA && medB) {
          const aInteractsWithB = medA.interactions.some((int) =>
            int.toLowerCase() === medB.name.toLowerCase()
          );
          const bInteractsWithA = medB.interactions.some((int) =>
            int.toLowerCase() === medA.name.toLowerCase()
          );
          if (aInteractsWithB || bInteractsWithA) {
            results.push({
              pair: `${medA.name} + ${medB.name}`,
              severity: 'caution',
              note: 'Potential drug-drug interaction detected. Monitor patient closely.',
            });
          }
        }
      }
    }
    return results;
  }, [selectedMeds]);

  const sideEffects = useMemo(() => {
    if (selectedMeds.length === 0) return [];
    const effects = [];
    selectedMeds.forEach((name) => {
      const med = medicationsDB.find((m) => m.name === name);
      if (med) {
        med.sideEffects.forEach((se) => {
          effects.push({ medication: med.name, effect: se });
        });
      }
    });
    return effects;
  }, [selectedMeds]);

  const handleClear = () => {
    setSelectedMeds([]);
    setSearchTerm('');
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search medications..."
        className={`w-full px-3 py-2 text-sm rounded-xl border outline-none transition-all mb-4 ${
          isDark
            ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50'
            : 'bg-white/70 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 shadow-sm'
        }`}
      />
      <div className="flex flex-wrap gap-1.5 mb-4">
        {selectedMeds.map((med) => (
          <button
            key={med}
            type="button"
            onClick={() => toggleMed(med)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-full border cursor-pointer transition-all ${
              isDark
                ? 'bg-violet-600/20 text-violet-400 border-violet-500/30 hover:bg-violet-600/30'
                : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
            }`}
          >
            {med} &times;
          </button>
        ))}
        {selectedMeds.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1 text-[11px] font-bold rounded-full border cursor-pointer border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto mb-4">
        {filteredMeds.map((med) => (
          <button
            key={med.name}
            type="button"
            onClick={() => toggleMed(med.name)}
            disabled={selectedMeds.includes(med.name)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-full border cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'border-white/[0.08] text-white/60 hover:bg-white/[0.06]'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {med.name}
            <span className={`ml-1 opacity-50 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{med.category}</span>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {interactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl border p-4 mb-3 ${
              isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
              Drug Interactions Detected
            </p>
            {interactions.map((int, i) => (
              <div key={i} className={`flex items-start gap-2 text-sm py-1.5 ${i > 0 ? 'border-t border-amber-500/15 mt-1.5 pt-1.5' : ''}`}>
                <span className="material-symbols-outlined text-base text-amber-500 shrink-0 mt-0.5">warning</span>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>{int.pair}</p>
                  <p className={`text-xs ${isDark ? 'text-amber-300/60' : 'text-amber-600/70'}`}>{int.note}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {sideEffects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl border p-4 ${
              isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              Side Effect Profile
            </p>
            {sideEffects.map((se, i) => (
              <div key={i} className="flex items-start gap-2 text-sm py-1">
                <span className="material-symbols-outlined text-base text-red-400 shrink-0 mt-0.5">info</span>
                <div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{se.medication}:</span>{' '}
                  <span className={isDark ? 'text-white/60' : 'text-slate-500'}>{se.effect}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {selectedMeds.length > 0 && interactions.length === 0 && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${
          isDark ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/15' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          <span className="material-symbols-outlined text-base">check_circle</span>
          No known drug-drug interactions detected between selected medications.
        </div>
      )}
      {selectedMeds.length === 0 && (
        <p className={`text-xs text-center py-4 ${isDark ? 'text-white/25' : 'text-slate-400'}`}>
          Select two or more medications to check for drug interactions.
        </p>
      )}
    </div>
  );
}

function SummarizeTab({ isDark }) {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState(null);

  const handleSummarize = () => {
    if (!inputText.trim()) {
      toast.error('Please enter clinical notes to summarize.');
      return;
    }
    const lines = inputText.split(/[.\n]+/).filter(Boolean).map((l) => l.trim());
    if (lines.length <= 3) {
      setSummary({
        keyPoints: lines,
        diagnosis: 'Insufficient text for AI summarization. Please provide more detailed clinical notes.',
        recommendations: [],
      });
      toast.success('Summary generated (limited details due to short input)');
      return;
    }
    const keyPoints = lines.slice(0, Math.min(5, lines.length));
    const diagnosisKeywords = ['diagnos', 'impression', 'assessment', 'opinion', 'finding', 'conclusion'];
    const treatmentKeywords = ['prescrib', 'medication', 'treatment', 'therapy', 'recommend', 'advised', 'suggest', 'follow-up', 'follow up'];
    const diagnosisLine = lines.find((l) =>
      diagnosisKeywords.some((kw) => l.toLowerCase().includes(kw))
    ) || lines[0];
    const recommendationLines = lines.filter((l) =>
      treatmentKeywords.some((kw) => l.toLowerCase().includes(kw))
    );
    setSummary({
      keyPoints,
      diagnosis: diagnosisLine,
      recommendations: recommendationLines.length > 0 ? recommendationLines : ['Follow standard clinical protocol.'],
    });
    toast.success('Clinical notes summarized successfully');
  };

  const handleClear = () => {
    setInputText('');
    setSummary(null);
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste clinical notes, doctor-patient conversation, or examination findings here..."
        rows={5}
        className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all resize-none ${
          isDark
            ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50'
            : 'bg-white/70 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 shadow-sm'
        }`}
      />
      <div className="flex items-center gap-2 mt-3">
        <button
          type="button"
          onClick={handleSummarize}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:from-blue-500 hover:to-emerald-500 transition-all cursor-pointer border-none flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          Generate Summary
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 text-xs font-bold rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer bg-transparent"
        >
          Clear
        </button>
        <span className={`text-[10px] ml-auto ${isDark ? 'text-white/25' : 'text-slate-400'}`}>
          {inputText.length} characters
        </span>
      </div>
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-4 rounded-xl border p-4 space-y-4 ${
              isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <span className="material-symbols-outlined text-sm">summarize</span>
                AI Summary
              </p>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                {summary.diagnosis}
              </p>
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <span className="material-symbols-outlined text-sm">checklist</span>
                Key Points
              </p>
              <ul className="space-y-1">
                {summary.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                    <span className={isDark ? 'text-white/70' : 'text-slate-600'}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            {summary.recommendations.length > 0 && (
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                  <span className="material-symbols-outlined text-sm">stethoscope</span>
                  Recommendations
                </p>
                <ul className="space-y-1">
                  {summary.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="material-symbols-outlined text-sm text-violet-400 shrink-0 mt-0.5">arrow_forward</span>
                      <span className={isDark ? 'text-white/70' : 'text-slate-600'}>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const tabs = [
  { id: 'diagnosis', label: 'AI Diagnosis', icon: 'biotech', component: DiagnosisTab },
  { id: 'prescribing', label: 'Smart Prescribing', icon: 'medication', component: PrescribingTab },
  { id: 'summarize', label: 'Clinical Summarization', icon: 'summarize', component: SummarizeTab },
];

export default function AIDiagnosticAssistant() {
  const [activeTab, setActiveTab] = useState('diagnosis');
  const { isDark } = useTheme();

  const ActiveComponent = tabs.find((t) => t.id === activeTab).component;

  return (
    <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline w-full min-w-0 max-w-full">
      <div className="flex items-center justify-between mb-5 w-full min-w-0 max-w-full">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
            <h2 className="text-headline-md font-bold text-on-surface dark:text-white break-words whitespace-normal">
              AI Diagnostic Assistant
            </h2>
          </div>
          <p className="text-body-md text-on-surface-variant break-words whitespace-normal mt-0.5">
            Augment clinical decisions with machine learning insights
          </p>
        </div>
      </div>
      <div className={`flex gap-1 p-1 rounded-xl border mb-5 ${
        isDark ? 'bg-slate-950/60 border-white/[0.06]' : 'bg-slate-100/80 border-slate-200/60'
      }`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-center text-xs font-semibold transition-all duration-300 cursor-pointer border-none ${
              activeTab === tab.id
                ? isDark
                  ? 'bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/20'
                  : 'bg-white text-blue-600 shadow-md border border-slate-200/50'
                : isDark
                  ? 'text-white/30 hover:text-white/60'
                  : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full min-w-0 max-w-full"
      >
        <ActiveComponent isDark={isDark} />
      </motion.div>
      <div className={`mt-5 pt-3 border-t flex items-center justify-between ${
        isDark ? 'border-white/[0.06]' : 'border-slate-200/60'
      }`}>
        <p className={`text-[10px] ${isDark ? 'text-white/25' : 'text-slate-400'}`}>
          AI suggestions are advisory. Always verify with clinical judgment.
        </p>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
          <span className={`text-[10px] font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>ML v2.1</span>
        </div>
      </div>
    </section>
  );
}
