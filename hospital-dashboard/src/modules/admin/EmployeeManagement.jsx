import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiUsers } from 'react-icons/fi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import DoctorDetailModal from '../../components/details/DoctorDetailModal';
import { useHospital } from '../../context/HospitalContext';
import { formatInr } from '../../lib/formatters';

const initialFormState = {
  name: '',
  doctorId: '',
  role: 'Doctor',
  department: 'Cardiology',
  specialization: '',
  qualification: '',
  experience: '',
  experienceYears: 0,
  phone: '',
  email: '',
  consultationFee: 1500,
  status: 'Available',
  leaveStatus: 'Active Duty',
  rating: 4.5,
  patients: 0,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=employee',
  bio: '',
};

function getStatusTone(status) {
  if (status === 'Available') {
    return 'bg-secondary/15 text-secondary';
  }
  if (status === 'In-Surgery') {
    return 'bg-error-container text-error';
  }
  if (status === 'On-Call') {
    return 'bg-primary/15 text-primary';
  }
  return 'bg-surface-container-high text-on-surface-variant dark:bg-surface';
}

export default function EmployeeManagement() {
  const { doctors, addDoctor, updateDoctor, deleteDoctor } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formState, setFormState] = useState(initialFormState);

  const departments = useMemo(
    () => ['All Departments', ...new Set(doctors.map((doctor) => doctor.department).filter(Boolean))],
    [doctors],
  );

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesSearch = !normalizedQuery || [
        doctor.name,
        doctor.doctorId,
        doctor.department,
        doctor.specialization,
        doctor.email,
        doctor.phone,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));

      const matchesDepartment = departmentFilter === 'All Departments' || doctor.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [departmentFilter, doctors, searchTerm]);

  function openAddModal() {
    setEditingEmployee(null);
    setFormState({
      ...initialFormState,
      doctorId: `DOC-${Date.now().toString().slice(-4)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
    });
    setIsFormModalOpen(true);
  }

  function openEditModal(employee) {
    setEditingEmployee(employee);
    setFormState({
      ...initialFormState,
      ...employee,
      role: employee.role || 'Doctor',
    });
    setIsFormModalOpen(true);
  }

  function closeFormModal() {
    setEditingEmployee(null);
    setFormState(initialFormState);
    setIsFormModalOpen(false);
  }

  async function handleSaveEmployee(event) {
    event.preventDefault();

    if (!formState.name.trim() || !formState.department || !formState.specialization.trim()) {
      toast.error('Name, department, and specialization are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formState,
        experienceYears: Number(formState.experienceYears) || 0,
        consultationFee: Number(formState.consultationFee) || 0,
        patients: Number(formState.patients) || 0,
        rating: Number(formState.rating) || 4.5,
      };

      if (editingEmployee) {
        await updateDoctor(editingEmployee.id, payload, 'Admin');
        toast.success(`${payload.name} updated successfully`);
      } else {
        await addDoctor(payload, 'Admin');
        toast.success(`${payload.name} added successfully`);
      }
      closeFormModal();
    } catch (error) {
      toast.error(error.message || 'Unable to save employee');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteEmployee() {
    if (!employeeToDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoctor(employeeToDelete.id, 'Admin');
      toast.success(`${employeeToDelete.name} deleted successfully`);
      setEmployeeToDelete(null);
      if (selectedEmployee?.id === employeeToDelete.id) {
        setSelectedEmployee(null);
      }
    } catch (error) {
      toast.error(error.message || 'Unable to delete employee');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-headline-lg text-primary dark:text-primary-fixed">Employee Management</h1>
          <p className="text-body-md text-on-surface-variant">
            Admin can view employee details, add new employees, update staff data, and delete employee records.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-body-md font-bold text-white"
        >
          <FiPlus />
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Total Employees</p>
          <h2 className="mt-2 text-display-lg text-on-surface">{doctors.length}</h2>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Available Staff</p>
          <h2 className="mt-2 text-display-lg text-secondary">{doctors.filter((doctor) => doctor.status === 'Available').length}</h2>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Average Fee</p>
          <h2 className="mt-2 text-display-lg text-on-surface">
            {formatInr(
              doctors.length
                ? Math.round(doctors.reduce((sum, doctor) => sum + (Number(doctor.consultationFee) || 0), 0) / doctors.length)
                : 0,
            )}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-surface shadow-sm dark:border-outline dark:bg-surface">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-5 dark:border-outline md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search employee name, ID, department, email..."
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed"
          >
            {departments.map((department) => (
              <option key={department}>{department}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto p-5">
          {filteredEmployees.length ? (
            <table className="min-w-[980px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant dark:border-outline">
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Employee</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Role</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Department</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Contact</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Status</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-outline-variant/40 transition-colors hover:bg-surface-container-low dark:border-outline/40 dark:hover:bg-on-primary-fixed/40">
                    <td className="px-3 py-4">
                      <button type="button" onClick={() => setSelectedEmployee(employee)} className="flex items-center gap-3 text-left">
                        <img src={employee.avatar} alt={employee.name} className="h-12 w-12 rounded-full border border-outline-variant bg-white object-cover" />
                        <div>
                          <p className="text-body-md font-bold text-primary">{employee.name}</p>
                          <p className="text-body-md text-on-surface-variant">{employee.doctorId}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-3 py-4 text-body-md text-on-surface">{employee.role || 'Doctor'}</td>
                    <td className="px-3 py-4">
                      <p className="text-body-md font-bold text-on-surface">{employee.department}</p>
                      <p className="text-body-md text-on-surface-variant">{employee.specialization}</p>
                    </td>
                    <td className="px-3 py-4">
                      <p className="text-body-md text-on-surface">{employee.phone}</p>
                      <p className="text-body-md text-on-surface-variant">{employee.email}</p>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-3 py-1 text-label-md ${getStatusTone(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(employee)}
                          className="rounded-lg border border-outline-variant p-2 text-on-surface transition-colors hover:text-primary dark:border-outline"
                          title="Edit employee"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmployeeToDelete(employee)}
                          className="rounded-lg border border-outline-variant p-2 text-on-surface transition-colors hover:text-error dark:border-outline"
                          title="Delete employee"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon="badge"
              title="No employee records found"
              description="Try another search or add a new employee from the admin panel."
              action={(
                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-body-md font-bold text-white"
                >
                  <FiUsers />
                  Add Employee
                </button>
              )}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        size="lg"
      >
        <form onSubmit={handleSaveEmployee} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-label-md uppercase text-on-surface-variant">Full Name</span>
            <input value={formState.name} onChange={(event) => setFormState({ ...formState, name: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed" />
          </label>
          <label className="space-y-1">
            <span className="text-label-md uppercase text-on-surface-variant">Employee ID</span>
            <input value={formState.doctorId} onChange={(event) => setFormState({ ...formState, doctorId: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed" />
          </label>
          <label className="space-y-1">
            <span className="text-label-md uppercase text-on-surface-variant">Role</span>
            <input value={formState.role} onChange={(event) => setFormState({ ...formState, role: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed" />
          </label>
          <label className="space-y-1">
            <span className="text-label-md uppercase text-on-surface-variant">Department</span>
            <select value={formState.department} onChange={(event) => setFormState({ ...formState, department: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed">
              {departments.filter((department) => department !== 'All Departments').map((department) => (
                <option key={department}>{department}</option>
              ))}
              {!departments.filter((department) => department !== 'All Departments').length ? <option>Cardiology</option> : null}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-label-md uppercase text-on-surface-variant">Specialization</span>
            <input value={formState.specialization} onChange={(event) => setFormState({ ...formState, specialization: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed" />
          </label>
          <label className="space-y-1">
            <span className="text-label-md uppercase text-on-surface-variant">Qualification</span>
            <input value={formState.qualification} onChange={(event) => setFormState({ ...formState, qualification: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed" />
          </label>
          <label className="space-y-1">
            <span className="text-label-md uppercase text-on-surface-variant">Experience</span>
            <input value={formState.experience} onChange={(event) => setFormState({ ...formState, experience: event.target.value })} placeholder="e.g. 8 years" className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed" />
          </label>
          <label className="space-y-1">
            <span className="text-label-md uppercase text-on-surface-variant">Experience Years</span>
            <input type="number" min="0" value={formState.experienceYears} onChange={(event) => setFormState({ ...formState, experienceYears: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed" />
          </label>
          <label className="space-y-1">
            <span className="text-label-md uppercase text-on-surface-variant">Phone</span>
            <input value={formState.phone} onChange={(event) => setFormState({ ...formState, phone: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed" />
          </label>
          <label className="space-y-1">
            <span className="text-label-md uppercase text-on-surface-variant">Email</span>
            <input type="email" value={formState.email} onChange={(event) => setFormState({ ...formState, email: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed" />
          </label>
          <label className="space-y-1">
            <span className="text-label-md uppercase text-on-surface-variant">Consultation Fee</span>
            <input type="number" min="0" value={formState.consultationFee} onChange={(event) => setFormState({ ...formState, consultationFee: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed" />
          </label>
          <label className="space-y-1">
            <span className="text-label-md uppercase text-on-surface-variant">Status</span>
            <select value={formState.status} onChange={(event) => setFormState({ ...formState, status: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed">
              <option>Available</option>
              <option>On-Call</option>
              <option>In-Surgery</option>
              <option>On Leave</option>
            </select>
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-label-md uppercase text-on-surface-variant">Bio</span>
            <textarea rows={4} value={formState.bio} onChange={(event) => setFormState({ ...formState, bio: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed" />
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={closeFormModal} className="rounded-xl border border-outline-variant px-4 py-2 text-body-md dark:border-outline">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="rounded-xl bg-primary px-4 py-2 text-body-md font-bold text-white disabled:opacity-70">
              {isSaving ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>

      <DoctorDetailModal
        doctor={selectedEmployee}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      <ConfirmDialog
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleDeleteEmployee}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employeeToDelete?.name || 'this employee'} from the project?`}
        confirmLabel="Delete Employee"
        loading={isDeleting}
      />
    </div>
  );
}
