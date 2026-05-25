import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import PatientDetailModal from '../../components/details/PatientDetailModal';
import DoctorDetailModal from '../../components/details/DoctorDetailModal';
import AppointmentDetailModal from '../../components/details/AppointmentDetailModal';
import EditPatientModal from '../../components/details/EditPatientModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useHospital } from '../../context/HospitalContext';
import { useNotifications } from '../../context/NotificationContext';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

function SearchDropdown({ results, onSelectPatient, onSelectDoctor, onSelectAppointment, onNavigate }) {
  const hasResults = [results?.patients, results?.doctors, results?.appointments, results?.billing].some((arr) => arr?.length);

  return (
    <div className="absolute left-0 top-12 z-30 w-full min-w-0 overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-xl">
      {hasResults ? (
        <div className="max-h-[420px] overflow-y-auto p-2 w-full min-w-0">
          {results?.patients?.length > 0 && (
            <div className="mb-3 last:mb-0">
              <p className="px-3 py-2 text-label-md uppercase text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">patient_list</span> Patients
              </p>
              {results.patients.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectPatient(item)}
                  className="w-full min-w-0 rounded-xl px-3 py-3 text-left hover:bg-surface-container-low flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-on-surface-variant/60 text-lg">person</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md font-bold text-on-surface break-words">{item.name}</p>
                    <p className="text-body-md text-on-surface-variant break-words">{item.id} &bull; {item.department} &bull; {item.status}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {results?.doctors?.length > 0 && (
            <div className="mb-3 last:mb-0">
              <p className="px-3 py-2 text-label-md uppercase text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">stethoscope</span> Doctors
              </p>
              {results.doctors.map((item) => (
                <button
                  key={item.doctorId || item.id}
                  type="button"
                  onClick={() => onSelectDoctor(item)}
                  className="w-full min-w-0 rounded-xl px-3 py-3 text-left hover:bg-surface-container-low flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-on-surface-variant/60 text-lg">stethoscope</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md font-bold text-on-surface break-words">{item.name}</p>
                    <p className="text-body-md text-on-surface-variant break-words">{item.specialization} &bull; {item.department} &bull; {item.status}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {results?.appointments?.length > 0 && (
            <div className="mb-3 last:mb-0">
              <p className="px-3 py-2 text-label-md uppercase text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">event</span> Appointments
              </p>
              {results.appointments.map((item) => (
                <button
                  key={item.appointmentId || item.id}
                  type="button"
                  onClick={() => onSelectAppointment(item)}
                  className="w-full min-w-0 rounded-xl px-3 py-3 text-left hover:bg-surface-container-low flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-on-surface-variant/60 text-lg">event</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md font-bold text-on-surface break-words">{item.patient || item.doctor}</p>
                    <p className="text-body-md text-on-surface-variant break-words">{item.appointmentId || item.id} &bull; {item.type} &bull; {item.status}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {results?.billing?.length > 0 && (
            <div className="mb-0">
              <p className="px-3 py-2 text-label-md uppercase text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">payments</span> Billing
              </p>
              {results.billing.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onNavigate('/admin/financials'); }}
                  className="w-full min-w-0 rounded-xl px-3 py-3 text-left hover:bg-surface-container-low flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-on-surface-variant/60 text-lg">receipt</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md font-bold text-on-surface break-words">{item.id}</p>
                    <p className="text-body-md text-on-surface-variant break-words">{item.patient} &bull; {item.department} &bull; {item.status}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 text-body-md text-on-surface-variant break-words">No matching records found</div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { doctors, patients, globalSearch, deletePatient } = useHospital();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ patients: [], doctors: [], appointments: [], billing: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [deletePatientTarget, setDeletePatientTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const notifRef = useRef(null);
  const notifBtnRef = useRef(null);
  const profileRef = useRef(null);
  const profileBtnRef = useRef(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    clearAllNotifications,
    deleteNotification,
  } = useNotifications();

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  useEffect(() => {
    let isMounted = true;

    async function runSearch() {
      if (!debouncedSearch.trim()) {
        setSearchResults({ patients: [], doctors: [], appointments: [], billing: [] });
        return;
      }

      try {
        const response = await globalSearch(debouncedSearch);
        if (isMounted) {
          setSearchResults(response.data);
          setShowSearchResults(true);
        }
      } catch {
        if (isMounted) {
          setSearchResults({ patients: [], doctors: [], appointments: [], billing: [] });
        }
      }
    }

    runSearch();
    return () => { isMounted = false; };
  }, [debouncedSearch, globalSearch]);

  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const closeProfileMenu = useCallback(() => {
    setShowProfileMenu(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target) &&
        notifBtnRef.current &&
        !notifBtnRef.current.contains(event.target)
      ) {
        closeNotifications();
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(event.target)
      ) {
        closeProfileMenu();
      }
    }

    function handleEscKey(event) {
      if (event.key === 'Escape') {
        closeNotifications();
        closeProfileMenu();
      }
    }

    if (showNotifications || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showNotifications, showProfileMenu, closeNotifications, closeProfileMenu]);

  function handleToggleNotifications() {
    setShowNotifications((prev) => !prev);
  }

  const totalDocs = doctors?.length || 0;
  const presentDocs = doctors?.filter((doctor) => doctor.status === 'Available' || doctor.status === 'In-Surgery').length || 0;
  const leaveDocs = doctors?.filter((doctor) => doctor.status === 'On-Call' || doctor.status === 'Leave').length || 0;
  const profilePath = useMemo(() => {
    return `/${user?.role || 'admin'}/profile`;
  }, [user]);

  function handleNavigate(path) {
    setShowSearchResults(false);
    setSearchTerm('');
    navigate(path);
  }

  function handleSelectPatient(patient) {
    setShowSearchResults(false);
    setSearchTerm('');
    setSelectedPatient(patient);
  }

  function handleSelectDoctor(doctor) {
    setShowSearchResults(false);
    setSearchTerm('');
    setSelectedDoctor(doctor);
  }

  function handleSelectAppointment(appointment) {
    setShowSearchResults(false);
    setSearchTerm('');
    setSelectedAppt(appointment);
  }

  async function handleDeletePatient() {
    if (!deletePatientTarget) return;
    setDeleting(true);
    try {
      await deletePatient(deletePatientTarget.id, user?.name || 'Admin');
      toast.success('Patient record deleted');
      setDeletePatientTarget(null);
      setSelectedPatient(null);
    } catch {
      toast.error('Failed to delete patient');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <header className="h-16 shrink-0 border-b border-outline-variant bg-surface">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex items-center gap-lg">
          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              value={searchTerm}
              onFocus={() => setShowSearchResults(Boolean(searchTerm.trim()))}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low pl-xl pr-md py-xs text-body-md outline-none transition-all focus:ring-2 focus:ring-primary"
              placeholder="Search EHR, Staff, or Wards..."
              type="text"
            />
            {showSearchResults && searchTerm.trim() ? (
              <SearchDropdown
                results={searchResults}
                onSelectPatient={handleSelectPatient}
                onSelectDoctor={handleSelectDoctor}
                onSelectAppointment={handleSelectAppointment}
                onNavigate={handleNavigate}
              />
            ) : null}
          </div>
          {user?.role === 'admin' && (
            <div className="hidden items-center gap-md md:flex">
              <nav className="flex gap-md">
                <NavLink to="/admin/dashboard" end className={({ isActive }) => `${isActive ? 'border-b-2 border-secondary text-secondary' : 'text-on-surface-variant hover:text-primary'} pb-xs text-label-md font-bold transition-colors`}>Ward View</NavLink>
                <NavLink to="/admin/emergency" className={({ isActive }) => `${isActive ? 'border-b-2 border-error text-error' : 'text-on-surface-variant hover:text-error'} pb-xs text-label-md font-bold transition-colors`}>Emergency</NavLink>
                <NavLink to="/admin/inventory" className={({ isActive }) => `${isActive ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-primary'} pb-xs text-label-md font-bold transition-colors`}>Pharmacy</NavLink>
              </nav>
              <div className="ml-4 flex items-center gap-sm rounded-full border border-outline-variant bg-surface-container-lowest px-md py-1 text-[10px] font-bold tracking-wider">
                <span className="uppercase text-on-surface-variant">Doctors:</span>
                <span className="text-primary">Total {totalDocs}</span>
                <span className="text-on-surface-variant">•</span>
                <span className="text-secondary">Present {presentDocs}</span>
                <span className="text-on-surface-variant">•</span>
                <span className="text-error">HEL {leaveDocs}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-md">
          <div className="flex gap-sm border-r border-outline-variant pr-md">
            <button onClick={toggleTheme} className="rounded-lg p-xs transition-all hover:bg-surface-container-high" title="Toggle Theme">
              <span className="material-symbols-outlined text-on-surface-variant">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <div className="relative" ref={notifRef}>
              <button
                ref={notifBtnRef}
                onClick={handleToggleNotifications}
                className="rounded-lg p-xs transition-all hover:bg-surface-container-high relative"
              >
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-error text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 top-14 z-50 w-[380px] min-w-[320px] max-w-[95vw] max-h-[500px] overflow-y-auto rounded-2xl border border-outline-variant bg-surface shadow-2xl"
                    style={{ overscrollBehavior: 'contain' }}
                  >
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline-variant bg-surface/95 backdrop-blur-md px-5 py-4 w-full min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-primary text-xl shrink-0">notifications</span>
                        <span className="text-base font-extrabold text-on-surface break-words whitespace-normal">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary shrink-0">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => { clearAllNotifications(); toast.success('All notifications cleared'); }}
                          className="text-xs font-bold text-error hover:text-error/80 hover:underline transition-colors cursor-pointer border-none bg-transparent"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {notifications.length > 0 ? (
                      <div className="divide-y divide-outline-variant w-full min-w-0">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`flex items-start gap-3 px-4 py-3 border-b border-outline-variant transition-all duration-200 w-full min-w-0 ${
                              n.type === 'emergency'
                                ? 'bg-error-container/10 border-l-4 border-error'
                                : !n.read
                                ? 'bg-primary-fixed/30'
                                : 'hover:bg-surface-container-low'
                            }`}
                          >
                            <div
                              className={`shrink-0 mt-0.5 h-8 w-8 rounded-full flex items-center justify-center ${
                                n.type === 'success' ? 'bg-secondary/15 text-secondary'
                                : n.type === 'warning' ? 'bg-warning/15 text-warning'
                                : n.type === 'emergency' ? 'bg-error/15 text-error animate-pulse border border-error/30'
                                : 'bg-primary/10 text-primary'
                              }`}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {n.type === 'success' ? 'check_circle' 
                                : n.type === 'warning' ? 'warning' 
                                : n.type === 'emergency' ? 'emergency' 
                                : 'info'}
                              </span>
                            </div>
                            <div
                              onClick={() => { setSelectedNotification(n); markAsRead(n.id); closeNotifications(); }}
                              className="flex-1 min-w-0 cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-2 w-full min-w-0">
                                <p className={`text-sm leading-snug font-bold text-on-surface break-words min-w-0 flex-1 ${!n.read ? '' : ''}`}>
                                  {n.title}
                                </p>
                                <span className="shrink-0 text-[10px] font-medium text-on-surface-variant whitespace-nowrap">{n.time}</span>
                              </div>
                              <p className="text-sm text-on-surface-variant leading-relaxed break-words whitespace-normal mt-1">
                                {n.shortDescription}
                              </p>
                            </div>
                            <button
                              onClick={() => { deleteNotification(n.id); toast.success('Notification removed'); }}
                              className="shrink-0 self-start mt-1 h-7 w-7 rounded-full flex items-center justify-center text-on-surface-variant/60 hover:text-error hover:bg-error/10 transition-all duration-200 cursor-pointer border-none bg-transparent"
                              title="Remove"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-14 px-6 w-full min-w-0">
                        <div className="h-14 w-14 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">notifications_off</span>
                        </div>
                        <p className="text-base font-bold text-on-surface text-center w-full">No notifications</p>
                        <p className="text-sm text-on-surface-variant mt-1 text-center w-full break-words">You are all caught up. New updates will appear here.</p>
                      </div>
                    )}

                    {notifications.length > 0 && (
                      <div className="sticky bottom-0 border-t border-outline-variant bg-surface/95 backdrop-blur-md px-5 py-3 w-full min-w-0">
                        <button
                          onClick={() => { markAllAsRead?.(); toast.success('All marked as read'); }}
                          className="w-full rounded-xl bg-primary/10 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer border-none"
                        >
                          Mark All as Read
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => toast.success('Recent activity is visible on your dashboard cards and audit logs.')} className="hidden rounded-lg p-xs transition-all hover:bg-surface-container-high sm:block">
              <span className="material-symbols-outlined text-on-surface-variant">history</span>
            </button>
          </div>

          {user?.role === 'receptionist' ? (
            <button onClick={() => navigate('/receptionist/register')} className="hidden rounded-lg bg-primary px-md py-sm text-on-primary transition-all active:scale-95 sm:block">
              Admit Patient
            </button>
          ) : null}

          <div className="relative flex cursor-pointer items-center gap-sm pl-sm" ref={profileRef}>
            <button
              ref={profileBtnRef}
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-sm cursor-pointer border-none bg-transparent p-0"
            >
              <img
                className="h-10 w-10 rounded-full object-cover ring-2 ring-outline-variant"
                alt="Profile"
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              />
              <div className="hidden flex-col md:flex text-left min-w-0">
                <span className="text-label-md font-bold text-on-surface break-words whitespace-normal">{user?.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant break-words whitespace-normal">{user?.role}</span>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-48 min-w-0 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-lg z-50"
                >
                  <div className="w-full min-w-0">
                    <button onClick={() => { navigate(profilePath); setShowProfileMenu(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-surface-container-low text-on-surface break-words">My Profile</button>
                    <button onClick={() => { navigate(`/${user?.role || 'admin'}/settings`); setShowProfileMenu(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-surface-container-low text-on-surface break-words">Settings</button>
                    <button onClick={() => { logout(); setShowProfileMenu(false); }} className="w-full px-4 py-3 text-left text-sm text-error hover:bg-error/10 break-words">Sign Out</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      </header>

      <Modal isOpen={!!selectedNotification} onClose={() => setSelectedNotification(null)} title="" size="sm">
        {selectedNotification && (
          <>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant">
              <span className={`material-symbols-outlined shrink-0 ${
                selectedNotification.type === 'emergency' ? 'text-error animate-pulse' : 'text-primary'
              }`}>
                {selectedNotification.type === 'success' ? 'check_circle' 
                : selectedNotification.type === 'warning' ? 'warning' 
                : selectedNotification.type === 'emergency' ? 'emergency' 
                : 'info'}
              </span>
              <h3 className={`text-lg font-bold ${
                selectedNotification.type === 'emergency' ? 'text-error font-extrabold' : 'text-on-surface'
              }`}>{selectedNotification.title}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-on-surface-variant">
                <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  selectedNotification.type === 'emergency'
                    ? 'bg-error text-white font-extrabold'
                    : 'bg-surface-container-high'
                }`}>{selectedNotification.type}</span>
                <span className="whitespace-nowrap">{selectedNotification.time}</span>
              </div>
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{selectedNotification.details}</p>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-outline-variant pt-4">
              <button onClick={() => { markAsUnread(selectedNotification.id); setSelectedNotification(null); toast.success('Marked as unread'); }} className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-low cursor-pointer">
                Mark Unread
              </button>
              <button onClick={() => { deleteNotification(selectedNotification.id); setSelectedNotification(null); toast.success('Notification cleared'); }} className="rounded-xl bg-error px-4 py-2 text-sm font-bold text-white hover:bg-error/90 cursor-pointer">
                Clear Notification
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Search Result Detail Modals */}
      <PatientDetailModal
        patient={selectedPatient}
        isOpen={!!selectedPatient}
        onClose={() => { setSelectedPatient(null); setEditPatient(null); setDeletePatientTarget(null); }}
        onDoctorClick={(id) => {
          const doc = doctors.find((d) => d.doctorId === id || d.id === id);
          if (doc) handleSelectDoctor(doc);
        }}
        onEdit={(pat) => setEditPatient(pat)}
        onDelete={(pat) => setDeletePatientTarget(pat)}
      />

      {selectedPatient && (user?.role === 'admin' || user?.role === 'receptionist') && (
        <EditPatientModal
          patient={editPatient || selectedPatient}
          isOpen={!!editPatient}
          onClose={() => setEditPatient(null)}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletePatientTarget}
        onClose={() => setDeletePatientTarget(null)}
        onConfirm={handleDeletePatient}
        title="Delete Patient Record"
        message={`Are you sure you want to delete ${deletePatientTarget?.name}'s record? This action cannot be undone and will also remove all related appointments and billing data.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete Record'}
        loading={deleting}
        tone="danger"
      />

      <DoctorDetailModal
        doctor={selectedDoctor}
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
      />

      <AppointmentDetailModal
        appointment={selectedAppt}
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        onPatientClick={(id) => {
          const pat = patients.find((p) => p.id === id);
          if (pat) handleSelectPatient(pat);
        }}
        onDoctorClick={(id) => {
          const doc = doctors.find((d) => d.doctorId === id || d.id === id);
          if (doc) handleSelectDoctor(doc);
        }}
      />
    </>
  );
}
