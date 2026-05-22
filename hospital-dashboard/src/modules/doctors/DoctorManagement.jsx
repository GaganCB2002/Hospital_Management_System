import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiStar, FiClock, FiUsers, FiPhone, FiMail, FiAward } from 'react-icons/fi';
import { useHospital } from '../../context/HospitalContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import DoctorDetailModal from '../../components/details/DoctorDetailModal';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  { id: 'all', label: 'All Departments', icon: 'groups' },
  { id: 'Cardiology', label: 'Cardiology', icon: 'favorite' },
  { id: 'Neurology', label: 'Neurology', icon: 'psychology' },
  { id: 'Pediatrics', label: 'Pediatrics', icon: 'child_care' },
  { id: 'Orthopedics', label: 'Orthopedic', icon: 'accessibility' },
  { id: 'Surgery', label: 'General Surgery', icon: 'scalpel' },
  { id: 'General Medicine', label: 'Physician', icon: 'stethoscope' },
  { id: 'Ophthalmology', label: 'Eye Specialist', icon: 'visibility' },
  { id: 'Gastroenterology', label: 'Gastroenterology', icon: 'stomach' },
  { id: 'Dermatology', label: 'Dermatology', icon: 'skin' },
  { id: 'ENT', label: 'ENT', icon: 'hearing' },
  { id: 'Pulmonology', label: 'Pulmonology', icon: 'air' },
  { id: 'Nephrology', label: 'Nephrology', icon: 'kidney' },
  { id: 'Oncology', label: 'Oncology', icon: 'science' },
  { id: 'Radiology', label: 'Radiology', icon: 'radiology' },
  { id: 'Psychiatry', label: 'Psychiatry', icon: 'mood' },
  { id: 'Endocrinology', label: 'Endocrinology', icon: 'monitor_heart' },
  { id: 'Rheumatology', label: 'Rheumatology', icon: 'joints' },
];

const initialForm = {
  name: '', department: 'Cardiology', specialization: '', qualification: '', experience: '', experienceYears: 10,
  status: 'Available', patients: 0, consultationFee: 0, phone: '', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new',
  bio: '', availabilitySchedule: [], performanceStats: { consultations: 0, successRate: '0%', averageWait: '0 mins', monthlyRevenue: 0 },
};

export default function DoctorManagement() {
  const { doctors, addDoctor, updateDoctor, deleteDoctor } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDepartment, setActiveDepartment] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const departmentCounts = useMemo(() => {
    const counts = { all: doctors.length };
    doctors.forEach(d => { counts[d.department] = (counts[d.department] || 0) + 1; });
    return counts;
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let results = doctors;
    if (activeDepartment !== 'all') {
      results = results.filter(d => d.department === activeDepartment);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      results = results.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        (d.specialization || '').toLowerCase().includes(q) ||
        (d.phone || '').includes(q) ||
        (d.email || '').toLowerCase().includes(q) ||
        (d.status || '').toLowerCase().includes(q) ||
        (d.experience || '').toLowerCase().includes(q)
      );
    }
    return results;
  }, [doctors, activeDepartment, searchTerm]);

  function handleOpenModal(doctor = null) {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({ ...doctor });
    } else {
      setEditingDoctor(null);
      setFormData({ ...initialForm, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}` });
    }
    setIsModalOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      ...formData,
      experienceYears: Number(formData.experienceYears) || 10,
      patients: Number(formData.patients) || 0,
      consultationFee: Number(formData.consultationFee) || 0,
    };
    if (editingDoctor) {
      updateDoctor(editingDoctor.id, data);
      toast.success('Doctor profile updated');
    } else {
      addDoctor(data);
      toast.success('New doctor added');
    }
    setIsModalOpen(false);
  }

  function handleDelete() {
    if (deleteTarget) {
      deleteDoctor(deleteTarget.id);
      toast.success('Doctor removed');
      setDeleteTarget(null);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'Available': return 'bg-secondary text-white';
      case 'In-Surgery': return 'bg-warning text-white';
      case 'On-Call': return 'bg-primary text-white';
      case 'On Leave': case 'Leave': return 'bg-surface-container-high text-on-surface-variant';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  }

  function getStatusDot(status) {
    switch (status) {
      case 'Available': return 'bg-secondary';
      case 'In-Surgery': return 'bg-warning';
      case 'On-Call': return 'bg-primary';
      default: return 'bg-on-surface-variant/40';
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Doctor Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">{doctors.length} doctors across {Object.keys(departmentCounts).length - 1} departments</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-sm cursor-pointer">
          <FiPlus /> Add Doctor
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-surface rounded-xl border border-outline-variant p-4 shadow-sm">
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search doctors, departments, specializations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-on-surface-variant/60"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer border-none bg-transparent">
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div className="overflow-x-auto hide-scrollbar -mx-1 px-1">
        <div className="flex gap-1.5 pb-1 min-w-max">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveDepartment(dept.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none ${
                activeDepartment === dept.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface text-on-surface-variant hover:bg-surface-container-high border border-outline-variant'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{dept.icon}</span>
              <span>{dept.label}</span>
              <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                activeDepartment === dept.id ? 'bg-white/20' : 'bg-surface-container-high text-on-surface-variant'
              }`}>{departmentCounts[dept.id] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDepartment + searchTerm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
        >
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-surface rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              {/* Card Header */}
              <div className="relative h-28 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-t-xl overflow-hidden">
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={() => handleOpenModal(doctor)} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-on-surface hover:text-primary shadow-sm transition-colors cursor-pointer border-none" title="Edit">
                    <FiEdit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteTarget(doctor)} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-on-surface hover:text-error shadow-sm transition-colors cursor-pointer border-none" title="Delete">
                    <FiTrash2 size={13} />
                  </button>
                </div>
                <div className="absolute -bottom-10 left-5">
                  <div className="relative">
                    <img src={doctor.avatar} alt={doctor.name} className="w-20 h-20 rounded-xl border-2 border-surface object-cover bg-surface shadow-md" />
                    <div className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-surface ${getStatusDot(doctor.status)}`} />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="pt-12 px-4 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button
                      onClick={() => setSelectedDoctor(doctor)}
                      className="text-left text-sm font-bold text-on-surface hover:text-primary transition-colors cursor-pointer border-none bg-transparent p-0 leading-tight"
                    >
                      {doctor.name}
                    </button>
                    <p className="text-xs text-on-surface-variant mt-0.5 truncate">{doctor.specialization}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusColor(doctor.status)}`}>{doctor.status}</span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <FiAward size={12} /> {doctor.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock size={12} /> {doctor.experienceYears || doctor.experience || 'N/A'}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-on-surface-variant">
                  {doctor.rating && (
                    <span className="flex items-center gap-0.5">
                      <FiStar size={12} className="text-yellow-500" />
                      {doctor.rating}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <FiUsers size={12} /> {doctor.patients || doctor.assignedPatients?.length || 0} patients
                  </span>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 pt-3 border-t border-outline-variant/50 flex items-center gap-1.5">
                  <button onClick={() => setSelectedDoctor(doctor)} className="flex-1 px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors cursor-pointer border-none">
                    View Profile
                  </button>
                  <a href={`tel:${doctor.phone}`} className="px-2.5 py-1.5 text-xs text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent">
                    <FiPhone size={14} />
                  </a>
                  <a href={`mailto:${doctor.email}`} className="px-2.5 py-1.5 text-xs text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent">
                    <FiMail size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">medical_services</span>
          <h3 className="text-lg font-bold text-on-surface">No doctors found</h3>
          <p className="text-sm text-on-surface-variant mt-1">Try adjusting search or department filter</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Full Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Department</label>
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors">
                {DEPARTMENTS.filter(d => d.id !== 'all').map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Specialization</label>
              <input required type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Qualification</label>
              <input type="text" value={formData.qualification || ''} onChange={e => setFormData({...formData, qualification: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Experience (Years)</label>
              <input type="number" min="1" max="50" value={formData.experienceYears || 10} onChange={e => setFormData({...formData, experienceYears: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors">
                <option value="Available">Available</option>
                <option value="On-Call">On-Call</option>
                <option value="In-Surgery">In-Surgery</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Phone</label>
              <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Email</label>
              <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Consultation Fee</label>
              <input type="number" min="0" value={formData.consultationFee || 0} onChange={e => setFormData({...formData, consultationFee: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Patients Count</label>
              <input type="number" min="0" value={formData.patients || 0} onChange={e => setFormData({...formData, patients: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Bio</label>
            <textarea rows={3} value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 border border-outline-variant rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer">{editingDoctor ? 'Update Doctor' : 'Add Doctor'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Doctor"
        message={deleteTarget ? `Are you sure you want to remove ${deleteTarget.name} from the system? This action cannot be undone.` : ''}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Doctor Detail Modal */}
      <DoctorDetailModal
        doctor={selectedDoctor}
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
      />
    </div>
  );
}
