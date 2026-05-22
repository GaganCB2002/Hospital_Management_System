import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useHospital } from '../../context/HospitalContext';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import ActionMenu from '../../components/common/ActionMenu';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonRows } from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import DoctorDetailModal from '../../components/details/DoctorDetailModal';
import PatientDetailModal from '../../components/details/PatientDetailModal';
import { formatDate, formatInr } from '../../lib/formatters';

const pageSize = 5;

function statusBadge(status) {
  const toneMap = {
    Active: 'bg-primary/15 text-primary',
    Admitted: 'bg-secondary/15 text-secondary',
    Discharged: 'bg-surface-container-high text-on-surface-variant dark:bg-surface',
    Emergency: 'bg-error-container text-error',
    Pending: 'bg-pending-bg text-pending-text',
  };

  return toneMap[status] || 'bg-surface-container-high text-on-surface-variant';
}

export default function PatientManagement() {
  const {
    patients,
    doctors,
    billing,
    queryPatients,
    updatePatient,
    deletePatient,
    createInvoice,
    loading,
  } = useHospital();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);
  const [billingPatientId, setBillingPatientId] = useState('');
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  useEffect(() => {
    let isMounted = true;

    async function loadPatients() {
      if (loading) {
        return;
      }

      setIsFetching(true);
      setFetchError('');
      try {
        const response = await queryPatients({
          query: debouncedSearch,
          department: departmentFilter,
          status: statusFilter,
          page,
          limit: pageSize,
        });

        if (!isMounted) {
          return;
        }

        const nextRecords = response.data.records || [];
        setTotalRecords(response.data.total || 0);
        setHasMore(Boolean(response.data.hasMore));
        setRecords((current) => {
          if (page === 1) {
            return nextRecords;
          }

          const currentIds = new Set(current.map((entry) => entry.id));
          return [...current, ...nextRecords.filter((entry) => !currentIds.has(entry.id))];
        });
      } catch (requestError) {
        if (isMounted) {
          setFetchError(requestError.message || 'Failed to load patient records.');
        }
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    }

    loadPatients();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, departmentFilter, statusFilter, page, queryPatients, loading, patients, reloadToken]);

  const uniqueDepartments = useMemo(
    () => ['All Departments', ...new Set(doctors.map((doctor) => doctor.department))],
    [doctors],
  );

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId),
    [patients, selectedPatientId],
  );
  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === selectedDoctorId || doctor.doctorId === selectedDoctorId || doctor.name === selectedDoctorId),
    [doctors, selectedDoctorId],
  );
  const billingPatient = useMemo(
    () => patients.find((patient) => patient.id === billingPatientId),
    [patients, billingPatientId],
  );
  const billingHistory = useMemo(
    () => billing.filter((invoice) => invoice.patientId === billingPatientId),
    [billing, billingPatientId],
  );

  function resetFilters() {
    setSearchTerm('');
    setDepartmentFilter('All Departments');
    setStatusFilter('All Status');
    setPage(1);
    toast.success('Filters reset');
  }

  async function handleEditSave(event) {
    event.preventDefault();
    try {
      await updatePatient(editingPatient.id, editingPatient, 'Admin');
      toast.success(`Saved updates for ${editingPatient.name}`);
      setEditingPatient(null);
    } catch (requestError) {
      toast.error(requestError.message || 'Unable to save patient changes');
    }
  }

  async function handleDeletePatient() {
    if (!patientToDelete) {
      return;
    }

    setDeleteLoading(true);
    try {
      await deletePatient(patientToDelete.id, 'Admin');
      toast.success(`${patientToDelete.name} record deleted`);
      setPatientToDelete(null);
      setSelectedPatientId('');
    } catch (requestError) {
      toast.error(requestError.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleCreateInvoice(patient) {
    try {
      await createInvoice(patient, 'Admin');
      toast.success(`Invoice generated for ${patient.name}`);
    } catch (requestError) {
      toast.error(requestError.message || 'Unable to generate invoice');
    }
  }

  function handleDownloadReport(patient) {
    const blob = new Blob(
      [
        `Patient Report\nName: ${patient.name}\nPatient ID: ${patient.id}\nStatus: ${patient.status}\nDepartment: ${patient.department}\nDoctor: ${patient.doctor}\nAdmission: ${patient.admittedDate}\n`,
      ],
      { type: 'text/plain' },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${patient.id}_report.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded report for ${patient.name}`);
  }

  function handlePrintReport(patient) {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Unable to open print preview');
      return;
    }

    printWindow.document.write(`
      <html>
        <head><title>${patient.name} Report</title></head>
        <body>
          <h1>${patient.name}</h1>
          <p>Patient ID: ${patient.id}</p>
          <p>Status: ${patient.status}</p>
          <p>Department: ${patient.department}</p>
          <p>Doctor: ${patient.doctor}</p>
          <p>Admitted Date: ${formatDate(patient.admittedDate)}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-headline-lg text-primary dark:text-primary-fixed">Patient Records</h1>
          <p className="text-body-md text-on-surface-variant">
            Search, filter, review full medical history, and complete patient administration tasks.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            placeholder="Search name, ID, mobile, email, doctor"
            className="rounded-xl border border-outline-variant bg-surface px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-surface  md:col-span-2"
          />
          <select
            value={departmentFilter}
            onChange={(event) => {
              setDepartmentFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-outline-variant bg-surface px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-surface "
          >
            {uniqueDepartments.map((department) => (
              <option key={department}>{department}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-outline-variant bg-surface px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-surface "
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Admitted</option>
            <option>Discharged</option>
            <option>Emergency</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={resetFilters} className="rounded-lg border border-outline-variant px-4 py-2 text-body-md dark:border-outline ">
          Clear Filters
        </button>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-surface shadow-sm dark:border-outline dark:bg-surface">
        <div className="overflow-x-auto p-5">
          {isFetching && page === 1 ? <SkeletonRows rows={5} /> : null}
          {!isFetching && fetchError ? (
            <EmptyState
              icon="sync_problem"
              title="Unable to load patient records"
              description={fetchError}
              action={(
                <button type="button" onClick={() => setReloadToken((current) => current + 1)} className="rounded-lg bg-primary px-4 py-2 text-body-md font-bold text-white">
                  Retry
                </button>
              )}
            />
          ) : null}
          {!isFetching && !fetchError && records.length > 0 ? (
            <table className="min-w-[1120px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant dark:border-outline">
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Patient</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Contact</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Department</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Primary Doctor</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Admission</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Status</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((patient) => (
                  <tr key={patient.id} className="border-b border-outline-variant/40 transition-colors hover:bg-surface-container-low dark:border-outline/40 dark:hover:bg-on-primary-fixed/40">
                    <td className="px-3 py-4">
                      <button type="button" onClick={() => setSelectedPatientId(patient.id)} className="text-left">
                        <p className="text-body-md font-bold text-primary">{patient.name}</p>
                        <p className="text-body-md text-on-surface-variant">{patient.id}</p>
                      </button>
                    </td>
                    <td className="px-3 py-4">
                      <p className="text-body-md text-on-surface ">{patient.mobile}</p>
                      <p className="text-body-md text-on-surface-variant">{patient.email}</p>
                    </td>
                    <td className="px-3 py-4 text-body-md text-on-surface ">{patient.department}</td>
                    <td className="px-3 py-4">
                      <button type="button" onClick={() => setSelectedDoctorId(patient.doctorId)} className="text-body-md font-bold text-on-surface ">
                        {patient.doctor}
                      </button>
                    </td>
                    <td className="px-3 py-4">
                      <p className="text-body-md text-on-surface ">{formatDate(patient.admittedDate)}</p>
                      <p className="text-body-md text-on-surface-variant">{patient.ward}</p>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-3 py-1 text-label-md ${statusBadge(patient.status)}`}>{patient.status}</span>
                    </td>
                    <td className="px-3 py-4">
                      <ActionMenu
                        actions={[
                          { label: 'View records', icon: 'visibility', onClick: () => setSelectedPatientId(patient.id) },
                          { label: 'Edit patient', icon: 'edit', onClick: () => setEditingPatient({ ...patient }) },
                          { label: 'Billing', icon: 'payments', onClick: () => setBillingPatientId(patient.id) },
                          { label: 'Download report', icon: 'download', onClick: () => handleDownloadReport(patient) },
                          { label: 'Print report', icon: 'print', onClick: () => handlePrintReport(patient) },
                          { label: 'Delete record', icon: 'delete', onClick: () => setPatientToDelete(patient), destructive: true },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {!isFetching && !fetchError && records.length === 0 ? (
            <EmptyState
              icon="person_off"
              title="No patient records found"
              description="Try another combination of search text, department, or status filter."
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-outline-variant px-5 py-4 dark:border-outline md:flex-row md:items-center md:justify-between">
          <p className="text-body-md text-on-surface-variant">
            Showing {records.length} of {totalRecords} patients
          </p>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={!hasMore || isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-body-md font-bold disabled:opacity-50 dark:border-outline "
          >
            {isFetching && page > 1 ? 'Loading...' : 'Show 5 More Patients'}
            <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
          </button>
        </div>
      </div>

      <PatientDetailModal
        patient={selectedPatient}
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatientId('')}
        onDoctorClick={(doctorName) => {
          setSelectedPatientId('');
          setSelectedDoctorId(doctorName);
        }}
      />
      <DoctorDetailModal doctor={selectedDoctor} isOpen={!!selectedDoctor} onClose={() => setSelectedDoctorId('')} />

      <Modal isOpen={!!editingPatient} onClose={() => setEditingPatient(null)} title="Edit Patient Record" size="lg">
        {editingPatient ? (
          <form onSubmit={handleEditSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-label-md uppercase text-on-surface-variant">Full Name</span>
              <input value={editingPatient.name} onChange={(event) => setEditingPatient({ ...editingPatient, name: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed " />
            </label>
            <label className="space-y-1">
              <span className="text-label-md uppercase text-on-surface-variant">Status</span>
              <select value={editingPatient.status} onChange={(event) => setEditingPatient({ ...editingPatient, status: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed ">
                <option>Active</option>
                <option>Admitted</option>
                <option>Discharged</option>
                <option>Emergency</option>
                <option>Pending</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-label-md uppercase text-on-surface-variant">Mobile</span>
              <input value={editingPatient.mobile} onChange={(event) => setEditingPatient({ ...editingPatient, mobile: event.target.value, phone: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed " />
            </label>
            <label className="space-y-1">
              <span className="text-label-md uppercase text-on-surface-variant">Email</span>
              <input value={editingPatient.email} onChange={(event) => setEditingPatient({ ...editingPatient, email: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed " />
            </label>
            <label className="space-y-1">
              <span className="text-label-md uppercase text-on-surface-variant">Ward</span>
              <input value={editingPatient.ward} onChange={(event) => setEditingPatient({ ...editingPatient, ward: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed " />
            </label>
            <label className="space-y-1">
              <span className="text-label-md uppercase text-on-surface-variant">Department</span>
              <select value={editingPatient.department} onChange={(event) => setEditingPatient({ ...editingPatient, department: event.target.value })} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed ">
                {uniqueDepartments.filter((department) => department !== 'All Departments').map((department) => (
                  <option key={department}>{department}</option>
                ))}
              </select>
            </label>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditingPatient(null)} className="rounded-lg border border-outline-variant px-4 py-2 text-body-md dark:border-outline ">
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-body-md font-bold text-white">
                Save Changes
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal isOpen={!!billingPatient} onClose={() => setBillingPatientId('')} title={billingPatient ? `Billing for ${billingPatient.name}` : 'Billing'} size="lg">
        {billingPatient ? (
          <div className="space-y-4">
            {billingHistory.length ? billingHistory.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-xl border border-outline-variant p-4 dark:border-outline">
                <div>
                  <p className="text-body-md font-bold text-on-surface ">{invoice.id}</p>
                  <p className="text-body-md text-on-surface-variant">{formatDate(invoice.date)} • {invoice.method}</p>
                </div>
                <div className="text-right">
                  <p className="text-body-md font-bold text-on-surface ">{formatInr(invoice.amount)}</p>
                  <p className="text-label-md text-outline">{invoice.status}</p>
                </div>
              </div>
            )) : <EmptyState icon="payments" title="No billing history" description="Data not present" />}
            <button type="button" onClick={() => handleCreateInvoice(billingPatient)} className="w-full rounded-lg bg-primary px-4 py-2 text-body-md font-bold text-white">
              Generate New Invoice
            </button>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        isOpen={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        onConfirm={handleDeletePatient}
        title="Delete Patient Record"
        message={`This will permanently remove ${patientToDelete?.name || 'this patient'} and related appointment/billing records.`}
        confirmLabel="Delete Record"
        loading={deleteLoading}
      />
    </div>
  );
}
