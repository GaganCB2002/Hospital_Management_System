import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useHospital } from '../../context/HospitalContext';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { formatDateTime, formatInr } from '../../lib/formatters';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonRows } from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import AppointmentDetailModal from '../../components/details/AppointmentDetailModal';
import DoctorDetailModal from '../../components/details/DoctorDetailModal';
import PatientDetailModal from '../../components/details/PatientDetailModal';

const pageSize = 5;

function statusBadge(status) {
  const toneMap = {
    Confirmed: 'bg-secondary/15 text-secondary',
    Pending: 'bg-pending-bg text-pending-text',
    Rejected: 'bg-error-container text-error',
    Completed: 'bg-primary/15 text-primary',
  };

  return toneMap[status] || 'bg-surface-container-high text-on-surface-variant dark:bg-surface';
}

export default function StaffSchedule() {
  const {
    appointments,
    doctors,
    patients,
    queryAppointments,
    updateAppointmentStatus,
    loading,
    error,
  } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [page, setPage] = useState(1);
  const [pageState, setPageState] = useState({ records: [], total: 0, hasMore: false });
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [showAllModal, setShowAllModal] = useState(false);
  const [rejectingAppointment, setRejectingAppointment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [mutationId, setMutationId] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(searchTerm, 350);

  useEffect(() => {
    let isMounted = true;

    async function loadAppointments() {
      if (loading) {
        return;
      }

      setIsFetching(true);
      setFetchError('');
      try {
        const response = await queryAppointments({
          query: debouncedSearch,
          status: statusFilter,
          page,
          limit: pageSize,
        });
        if (isMounted) {
          setPageState(response.data);
        }
      } catch (requestError) {
        if (isMounted) {
          setFetchError(requestError.message || 'Failed to load appointment queue.');
        }
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    }

    loadAppointments();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, loading, page, queryAppointments, statusFilter, appointments, reloadToken]);

  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === selectedAppointmentId),
    [appointments, selectedAppointmentId],
  );
  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === selectedDoctorId || doctor.doctorId === selectedDoctorId || doctor.name === selectedDoctorId),
    [doctors, selectedDoctorId],
  );
  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId || patient.name === selectedPatientId),
    [patients, selectedPatientId],
  );

  const pendingCount = appointments.filter((appointment) => appointment.status === 'Pending').length;
  const confirmedRevenue = appointments
    .filter((appointment) => appointment.status === 'Confirmed')
    .reduce((total, appointment) => total + (appointment.billingSummary?.totalBilled || 0), 0);

  async function handleApprove(appointment) {
    setMutationId(appointment.id);
    try {
      await updateAppointmentStatus(appointment.id, 'Confirmed', { actor: 'Admin' });
      toast.success(`Approved ${appointment.appointmentId}`);
    } catch (requestError) {
      toast.error(requestError.message || 'Approval failed');
    } finally {
      setMutationId('');
    }
  }

  async function handleReject() {
    if (!rejectingAppointment || !rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    setMutationId(rejectingAppointment.id);
    try {
      await updateAppointmentStatus(rejectingAppointment.id, 'Rejected', {
        rejectionReason: rejectionReason.trim(),
        actor: 'Admin',
      });
      toast.success(`Rejected ${rejectingAppointment.appointmentId}`);
      setRejectingAppointment(null);
      setRejectionReason('');
    } catch (requestError) {
      toast.error(requestError.message || 'Rejection failed');
    } finally {
      setMutationId('');
    }
  }

  const appointmentRows = pageState.records || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Pending Workflow Queue</p>
          <h2 className="mt-2 text-display-lg text-on-surface ">{pendingCount}</h2>
          <p className="text-body-md text-on-surface-variant">Requests waiting for approval or rejection.</p>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Doctors on Roster</p>
          <h2 className="mt-2 text-display-lg text-on-surface ">{doctors.length}</h2>
          <p className="text-body-md text-on-surface-variant">Availability schedules and appointment ownership are linked.</p>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Confirmed Billing Snapshot</p>
          <h2 className="mt-2 text-display-lg text-on-surface ">{formatInr(confirmedRevenue)}</h2>
          <p className="text-body-md text-on-surface-variant">Total billed value across approved appointments.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-surface shadow-sm dark:border-outline dark:bg-surface">
        <div className="flex flex-col gap-4 border-b border-outline-variant p-5 dark:border-outline lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-headline-lg text-primary dark:text-primary-fixed">Upcoming Appointments</h2>
            <p className="text-body-md text-on-surface-variant">
              Working queue with searchable appointment detail, doctor detail, and patient history links.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={searchTerm}
              onChange={(event) => {
                setPage(1);
                setSearchTerm(event.target.value);
              }}
              placeholder="Search patient, doctor, ID, type..."
              className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed "
            />
            <select
              value={statusFilter}
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value);
              }}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed "
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Rejected</option>
              <option>Completed</option>
            </select>
            <button
              type="button"
              onClick={() => setShowAllModal(true)}
              className="rounded-xl bg-primary px-4 py-2 text-body-md font-bold text-white"
            >
              View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto p-5">
          {isFetching ? <SkeletonRows rows={5} /> : null}
          {!isFetching && (fetchError || error) ? (
            <EmptyState
              icon="sync_problem"
              title="Unable to load appointments"
              description={fetchError || error}
              action={(
                <button type="button" onClick={() => setReloadToken((current) => current + 1)} className="rounded-lg bg-primary px-4 py-2 text-body-md font-bold text-white">
                  Retry
                </button>
              )}
            />
          ) : null}
          {!isFetching && !fetchError && !error && appointmentRows.length > 0 ? (
            <table className="min-w-[980px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant dark:border-outline">
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Appointment</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Patient</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Doctor</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Schedule</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Status</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Workflow</th>
                </tr>
              </thead>
              <tbody>
                {appointmentRows.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-outline-variant/40 transition-colors hover:bg-surface-container-low dark:border-outline/40 dark:hover:bg-on-primary-fixed/50">
                    <td className="px-3 py-4">
                      <button type="button" onClick={() => setSelectedAppointmentId(appointment.id)} className="text-left">
                        <p className="text-body-md font-bold text-primary">{appointment.appointmentId}</p>
                        <p className="text-body-md text-on-surface-variant">{appointment.type}</p>
                      </button>
                    </td>
                    <td className="px-3 py-4">
                      <button type="button" onClick={() => setSelectedPatientId(appointment.patientId)} className="text-left">
                        <p className="text-body-md font-bold text-on-surface ">{appointment.patient}</p>
                        <p className="text-body-md text-on-surface-variant">{appointment.patientId}</p>
                      </button>
                    </td>
                    <td className="px-3 py-4">
                      <button type="button" onClick={() => setSelectedDoctorId(appointment.doctorId)} className="text-left">
                        <p className="text-body-md font-bold text-on-surface ">{appointment.doctor}</p>
                        <p className="text-body-md text-on-surface-variant">{appointment.doctorSpecialization}</p>
                      </button>
                    </td>
                    <td className="px-3 py-4 text-body-md text-on-surface-variant">{formatDateTime(appointment.date, appointment.time)}</td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-3 py-1 text-label-md ${statusBadge(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      {appointment.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(appointment)}
                            disabled={mutationId === appointment.id}
                            className="rounded-lg bg-secondary px-3 py-2 text-body-md font-bold text-white disabled:opacity-70"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingAppointment(appointment);
                              setRejectionReason(appointment.rejectionReason || '');
                            }}
                            disabled={mutationId === appointment.id}
                            className="rounded-lg bg-error px-3 py-2 text-body-md font-bold text-white disabled:opacity-70"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setSelectedAppointmentId(appointment.id)} className="text-body-md font-bold text-primary">
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {!isFetching && !fetchError && !error && appointmentRows.length === 0 ? (
            <EmptyState
              icon="event_busy"
              title="Data not present"
              description="No appointment records matched the current search and workflow filters."
            />
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-outline-variant px-5 py-4 dark:border-outline">
          <p className="text-body-md text-on-surface-variant">
            Showing {appointmentRows.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, pageState.total)} of {pageState.total}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-outline-variant px-4 py-2 text-body-md disabled:opacity-50 dark:border-outline "
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={!pageState.hasMore}
              className="rounded-lg border border-outline-variant px-4 py-2 text-body-md disabled:opacity-50 dark:border-outline "
            >
              Show 5 More
            </button>
          </div>
        </div>
      </div>

      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointmentId('')}
        onPatientClick={(patientId) => {
          setSelectedAppointmentId('');
          setSelectedPatientId(patientId);
        }}
        onDoctorClick={(doctorId) => {
          setSelectedAppointmentId('');
          setSelectedDoctorId(doctorId);
        }}
      />
      <DoctorDetailModal doctor={selectedDoctor} isOpen={!!selectedDoctor} onClose={() => setSelectedDoctorId('')} />
      <PatientDetailModal
        patient={selectedPatient}
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatientId('')}
        onDoctorClick={(doctorName) => {
          setSelectedPatientId('');
          setSelectedDoctorId(doctorName);
        }}
      />

      <Modal isOpen={showAllModal} onClose={() => setShowAllModal(false)} title={`All Appointments (${appointments.length})`} size="xl">
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <button
              key={appointment.id}
              type="button"
              onClick={() => {
                setShowAllModal(false);
                setSelectedAppointmentId(appointment.id);
              }}
              className="flex w-full items-center justify-between rounded-xl border border-outline-variant px-4 py-3 text-left transition-colors hover:bg-surface-container-low dark:border-outline dark:hover:bg-on-primary-fixed"
            >
              <div>
                <p className="text-body-md font-bold text-on-surface ">{appointment.patient} • {appointment.doctor}</p>
                <p className="text-body-md text-on-surface-variant">{appointment.appointmentId} • {formatDateTime(appointment.date, appointment.time)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-label-md ${statusBadge(appointment.status)}`}>{appointment.status}</span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={!!rejectingAppointment} onClose={() => setRejectingAppointment(null)} title="Reject Appointment" size="md">
        <div className="space-y-4">
          <p className="text-body-md text-on-surface-variant">
            Add a rejection reason for {rejectingAppointment?.appointmentId}. This will be saved with the appointment workflow history.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed "
            placeholder="Enter rejection reason"
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setRejectingAppointment(null)} className="rounded-lg border border-outline-variant px-4 py-2 text-body-md dark:border-outline ">
              Cancel
            </button>
            <button type="button" onClick={handleReject} disabled={mutationId === rejectingAppointment?.id} className="rounded-lg bg-error px-4 py-2 text-body-md font-bold text-white disabled:opacity-70">
              Save Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
