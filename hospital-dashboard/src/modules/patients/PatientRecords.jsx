import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFileText, FiPlus, FiUser } from 'react-icons/fi';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function PatientRecords() {
  const { user } = useAuth();
  const { patients } = useHospital();
  
  // Doctor sees their assigned patients or all if admin testing
  const myPatients = patients.filter(p => p.doctor === user.name || user.role === 'doctor');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  const filteredPatients = myPatients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPrescription = (e) => {
    e.preventDefault();
    toast.success('Prescription added successfully');
    setIsPrescriptionModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface dark:text-white">Patient Records</h1>
        <p className="text-sm text-on-surface-variant">View medical histories and add prescriptions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl p-4 shadow-sm flex flex-col h-[70vh]">
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input 
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg text-sm focus:outline-none focus:border-primary dark:text-white"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredPatients.map(patient => (
              <div 
                key={patient.id} 
                onClick={() => setSelectedPatient(patient)}
                className={`p-3 rounded-xl cursor-pointer transition-colors border ${
                  selectedPatient?.id === patient.id 
                    ? 'bg-primary-container text-on-primary-container border-primary-container' 
                    : 'bg-surface-container-lowest dark:bg-surface-container-high border-outline-variant/30 hover:border-primary/50 text-on-surface dark:text-white'
                }`}
              >
                <p className="font-bold text-sm">{patient.name}</p>
                <p className={`text-xs ${selectedPatient?.id === patient.id ? 'text-on-primary-container/80' : 'text-outline'}`}>
                  {patient.gender}, {patient.age}y • {patient.bloodType}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Detail View */}
        <div className="lg:col-span-2 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl p-6 shadow-sm min-h-[70vh]">
          {selectedPatient ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
              <div className="flex items-start justify-between border-b border-outline-variant/30 dark:border-outline pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-2xl font-bold shrink-0">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface dark:text-white">{selectedPatient.name}</h2>
                    <p className="text-sm text-outline">ID: {selectedPatient.id} • Admitted: {selectedPatient.admittedDate}</p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-surface-container-high dark:bg-surface-container-high text-on-surface dark:text-white border border-outline-variant/30">
                      Condition: {selectedPatient.condition}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-container transition-colors"
                >
                  <FiPlus /> New Prescription
                </button>
              </div>

              <div className="mt-6 flex-1">
                <h3 className="text-lg font-bold text-on-surface dark:text-white mb-4 flex items-center gap-2">
                  <FiFileText /> Medical History
                </h3>
                <div className="p-4 border border-outline-variant/30 rounded-xl bg-surface-container-lowest dark:bg-surface-container-high">
                  <p className="text-sm text-on-surface-variant mb-2">No detailed medical history recorded for this patient yet.</p>
                  <p className="text-xs text-outline italic">System note: Integration with legacy EHR pending.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-outline">
              <FiUser className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a patient from the list to view their records</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isPrescriptionModalOpen} onClose={() => setIsPrescriptionModalOpen(false)} title="Write Prescription">
        <form onSubmit={handleAddPrescription} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-on-surface-variant">Patient</label>
            <input type="text" value={selectedPatient?.name || ''} disabled className="w-full px-3 py-2 bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg text-sm text-outline cursor-not-allowed" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-on-surface-variant">Medication Name</label>
            <input required type="text" className="w-full px-3 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg text-sm focus:border-primary focus:outline-none dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-on-surface-variant">Dosage</label>
              <input required type="text" placeholder="e.g. 500mg" className="w-full px-3 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg text-sm focus:border-primary focus:outline-none dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-on-surface-variant">Frequency</label>
              <select className="w-full px-3 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg text-sm focus:border-primary focus:outline-none dark:text-white">
                <option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>As needed</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-on-surface-variant">Notes</label>
            <textarea rows="3" className="w-full px-3 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg text-sm focus:border-primary focus:outline-none dark:text-white"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsPrescriptionModalOpen(false)} className="px-4 py-2 text-sm font-medium text-outline hover:text-on-surface transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-container transition-colors">Save Prescription</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
