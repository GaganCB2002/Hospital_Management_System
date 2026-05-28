import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';

export default function Sidebar({ isCollapsed, toggleSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoClicked, setLogoClicked] = useState(false);

  useEffect(() => {
    if (logoClicked) {
      const timer = setTimeout(() => setLogoClicked(false), 800);
      return () => clearTimeout(timer);
    }
  }, [logoClicked]);

  const handleLogoClick = () => {
    setLogoClicked(true);
    toggleSidebar();
  };

  const getNavLinks = () => {
    switch(user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
          { name: 'My Profile', path: '/admin/profile', icon: 'person' },
          { name: 'Employees', path: '/admin/employees', icon: 'badge' },
          { name: 'Patient Records', path: '/admin/patients', icon: 'patient_list' },
          { name: 'DR Details', path: '/admin/doctor-management', icon: 'stethoscope' },
          { name: 'Staff Schedule', path: '/admin/doctors', icon: 'calendar_month' },
          { name: 'Financials', path: '/admin/financials', icon: 'account_balance' },
          { name: 'Revenue', path: '/admin/revenue', icon: 'payments' },
          { name: 'Visitor Details', path: '/admin/visitors', icon: 'visibility' },
        ];
      case 'doctor':
        return [
          { name: 'Dashboard', path: '/doctor/dashboard', icon: 'dashboard' },
          { name: 'Appointments', path: '/doctor/appointments', icon: 'event' },
          { name: 'Patient Records', path: '/doctor/patients', icon: 'patient_list' },
          { name: 'My Profile', path: '/doctor/profile', icon: 'person' },
          { name: 'Consultations', path: '/doctor/consultations', icon: 'history' },
          { name: 'AI Health Analytics', path: '/doctor/ai-insights', icon: 'monitoring' },
        ];
      case 'receptionist':
        return [
          { name: 'Dashboard', path: '/receptionist/dashboard', icon: 'dashboard' },
          { name: 'My Profile', path: '/receptionist/profile', icon: 'person' },
          { name: 'Book Appointment', path: '/receptionist/book', icon: 'calendar_add_on' },
          { name: 'Online Bookings', path: '/receptionist/bookings', icon: 'language' },
          { name: 'Patient Details', path: '/receptionist/patients', icon: 'groups' },
          { name: 'Registration', path: '/receptionist/register', icon: 'person_add' },
          { name: 'Billing', path: '/receptionist/billing', icon: 'payments' },
        ];
      case 'nurse':
        return [
          { name: 'Dashboard', path: '/nurse/dashboard', icon: 'dashboard', section: '' },
          { name: 'My Profile', path: '/nurse/profile', icon: 'person' },
          { name: 'Emergency Alert', path: '/nurse/dashboard', icon: 'warning', section: 'emergency' },
          { name: 'QR Scanner', path: '/nurse/dashboard', icon: 'qr_code_scanner', section: 'scanner' },
          { name: 'Medication', path: '/nurse/dashboard', icon: 'medical_services', section: 'medication' },
          { name: 'Patient Queries', path: '/nurse/dashboard', icon: 'contact_support', section: 'queries' },
          { name: 'Support', path: '/nurse/dashboard', icon: 'help_center', section: 'support' },
        ];
      case 'patient':
        return [
          { name: 'Dashboard', path: '/patient/dashboard', icon: 'dashboard' },
          { name: 'Medication Tracker', path: '/patient/medication-tracker', icon: 'medical_services' },
          { name: 'AI Symptom Checker', path: '/patient/symptom-checker', icon: 'stethoscope' },
          { name: 'Virtual Clinic', path: '/patient/virtual-clinic', icon: 'videocam' },
          { name: 'Family Health Monitor', path: '/patient/family-tracker', icon: 'group' },
          { name: 'My Profile', path: '/patient/profile', icon: 'person' },
          { name: 'Book Appointment', path: '/patient/book', icon: 'calendar_add_on' },
          { name: 'My Doctors', path: '/patient/doctors', icon: 'stethoscope' },
          { name: 'Doctor History', path: '/patient/doctor-history', icon: 'history_edu' },
          { name: 'Medical History', path: '/patient/history', icon: 'history' },
        ];
      default: return [];
    }
  };

  const navLinks = getNavLinks();
  const settingsPath = user ? `/${user.role}/settings` : '/login';
  const emergencyPath = user ? `/${user.role}/emergency` : '/login';
  const currentSection = new URLSearchParams(location.search).get('section') || '';

  const isNurseSectionActive = useCallback((link) => {
    if (link.path === '/nurse/profile') return location.pathname === link.path;
    if (link.section !== undefined) return currentSection === link.section;
    return false;
  }, [location.pathname, currentSection]);

  const handleNurseNav = useCallback((link) => {
    if (link.path === '/nurse/profile') {
      navigate(link.path);
    } else if (link.section !== undefined) {
      const params = new URLSearchParams(location.search);
      if (link.section) params.set('section', link.section);
      else params.delete('section');
      navigate(`${link.path}?${params.toString()}`);
    } else {
      navigate(link.path);
    }
  }, [navigate, location.search]);

  return (
    <aside className={`shrink-0 h-screen ${isCollapsed ? 'w-20' : 'w-72'} bg-nav-bg text-nav-text border-r border-white/10 flex flex-col py-lg transition-all duration-300`}>
      <div className={`px-sm mb-xl flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-lg'} gap-md`}>
          <div className="flex items-center gap-md">
            <div
              onClick={handleLogoClick}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer shadow-sm transition-all duration-300 relative ${logoClicked ? 'ring-2 ring-[#F0C478] ring-offset-2 ring-offset-nav-bg scale-110' : ''}`}
              style={{
                background: 'linear-gradient(135deg, #5BA0A8, #85C4B0)',
              }}
            >
              <svg viewBox="0 0 36 36" className="w-6 h-6 fill-white">
                <path d="M18 4C12 4 8 8 8 14v2a2 2 0 002 2h2v-4c0-3.3 2.7-6 6-6s6 2.7 6 6v4h2a2 2 0 002-2v-2c0-6-4-10-10-10z" opacity="0.85"/>
                <path d="M14 18h-4a2 2 0 00-2 2v2c0 6 4 10 10 10s10-4 10-10v-2a2 2 0 00-2-2h-4v2a4 4 0 01-8 0v-2z"/>
                <rect x="16.5" y="14" width="3" height="10" rx="1"/>
                <rect x="12" y="17.5" width="12" height="3" rx="1"/>
              </svg>
              {logoClicked && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F0C478] animate-ping" />
              )}
            </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-headline-sm text-white font-bold tracking-tight truncate w-full">CurePulse</span>
              <span className="text-[10px] text-nav-text uppercase tracking-widest font-bold truncate w-full">
                {user?.role ? `${user.role} Portal` : 'Clinical Management'}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button onClick={toggleSidebar} className="text-nav-text hover:text-nav-active p-1 rounded-lg shrink-0 block cursor-pointer">
            <span className="material-symbols-outlined">menu_open</span>
          </button>
        )}
      </div>

      <nav className="flex-1 px-sm space-y-xs overflow-y-auto hide-scrollbar">
        {navLinks.map((link) => {
          if (user?.role === 'nurse' && link.section !== undefined) {
            const isActive = isNurseSectionActive(link);
            return (
              <button key={link.name} onClick={() => handleNurseNav(link)}
                title={isCollapsed ? link.name : undefined}
                className={`flex items-center w-full ${isCollapsed ? 'justify-center p-2 mx-auto w-12 h-12' : 'gap-md px-md py-sm'} rounded-xl transition-all duration-300 border-l-4 btn-press-effect cursor-pointer ${
                  isActive
                    ? 'nav-link-active'
                    : 'text-nav-text hover:text-nav-active hover:bg-white/10 border-transparent'
                }`}>
                <span className="material-symbols-outlined text-xl">{link.icon}</span>
                {!isCollapsed && <span className="text-sm truncate min-w-0">{link.name}</span>}
              </button>
            );
          }
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path.endsWith('dashboard')}
              title={isCollapsed ? link.name : undefined}
               className={({ isActive }) =>
                `flex items-center ${isCollapsed ? 'justify-center p-2 mx-auto w-12 h-12' : 'gap-md px-md py-sm'} rounded-xl transition-all duration-300 border-l-4 btn-press-effect ${
                  isActive
                    ? 'nav-link-active'
                    : 'text-nav-text hover:text-nav-active hover:bg-white/10 border-transparent'
                }`
              }
            >
              <span className="material-symbols-outlined text-xl">{link.icon}</span>
              {!isCollapsed && <span className="text-sm truncate min-w-0">{link.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-sm space-y-xs">
        {user?.role !== 'patient' && user?.role !== 'nurse' && (
          <button onClick={() => {
            if (user?.role === 'nurse') {
              const params = new URLSearchParams(location.search);
              params.set('section', 'emergency');
              navigate(`/nurse/dashboard?${params.toString()}`);
            } else {
              navigate(emergencyPath);
            }
          }} className={`w-full bg-error/90 hover:bg-error text-white font-bold text-sm py-2 px-4 rounded-lg flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-center'} gap-2 transition-all shadow-sm cursor-pointer`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            {!isCollapsed && <span className="truncate">Emergency Alert</span>}
          </button>
        )}
        <button type="button" title={isCollapsed ? 'Settings' : undefined} onClick={() => navigate(settingsPath)} className={`flex items-center ${isCollapsed ? 'justify-center mx-auto w-12 h-12' : 'gap-md px-md py-sm'} rounded-lg text-nav-text hover:text-nav-active hover:bg-white/10 transition-all cursor-pointer w-full`}>
          <span className="material-symbols-outlined">settings</span>
          {!isCollapsed && <span className="text-sm truncate">Settings</span>}
        </button>
        {user?.role !== 'nurse' && (
          <button type="button" title={isCollapsed ? 'Support' : undefined} onClick={() => {
            toast.success('Support team has been notified');
          }} className={`flex items-center ${isCollapsed ? 'justify-center mx-auto w-12 h-12' : 'gap-md px-md py-sm'} rounded-lg text-nav-text hover:text-nav-active hover:bg-white/10 transition-all cursor-pointer w-full`}>
            <span className="material-symbols-outlined">contact_support</span>
            {!isCollapsed && <span className="text-sm truncate">Support</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
