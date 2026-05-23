import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Sidebar({ isCollapsed, toggleSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();

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
        ];
      case 'doctor':
        return [
          { name: 'Dashboard', path: '/doctor/dashboard', icon: 'dashboard' },
          { name: 'Appointments', path: '/doctor/appointments', icon: 'event' },
          { name: 'Patient Records', path: '/doctor/patients', icon: 'patient_list' },
          { name: 'My Profile', path: '/doctor/profile', icon: 'person' },
          { name: 'Consultations', path: '/doctor/consultations', icon: 'history' },
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
      case 'patient':
        return [
          { name: 'Dashboard', path: '/patient/dashboard', icon: 'dashboard' },
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

  return (
    <aside className={`shrink-0 h-screen ${isCollapsed ? 'w-20' : 'w-72'} bg-nav-bg text-on-primary border-r border-white/10 flex flex-col py-lg transition-all duration-300`}>
      <div className={`px-sm mb-xl flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-lg'} gap-md`}>
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer shadow-sm" onClick={toggleSidebar}>
            <span className="material-symbols-outlined text-on-primary text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-headline-sm text-on-primary font-bold tracking-tight truncate w-full">CurePulse</span>
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
        {navLinks.map((link) => (
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
        ))}
      </nav>

      <div className="mt-auto px-sm space-y-xs">
        {user?.role !== 'patient' && (
          <button onClick={() => navigate(emergencyPath)} className={`w-full bg-error/90 hover:bg-error text-white font-bold text-sm py-2 px-4 rounded-lg flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-center'} gap-2 transition-all shadow-sm cursor-pointer`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            {!isCollapsed && <span className="truncate">Emergency Alert</span>}
          </button>
        )}
        <button type="button" title={isCollapsed ? 'Settings' : undefined} onClick={() => navigate(settingsPath)} className={`flex items-center ${isCollapsed ? 'justify-center mx-auto w-12 h-12' : 'gap-md px-md py-sm'} rounded-lg text-nav-text hover:text-nav-active hover:bg-white/10 transition-all cursor-pointer w-full`}>
          <span className="material-symbols-outlined">settings</span>
          {!isCollapsed && <span className="text-sm truncate">Settings</span>}
        </button>
        <button type="button" title={isCollapsed ? 'Support' : undefined} onClick={() => toast.success('Support team has been notified')} className={`flex items-center ${isCollapsed ? 'justify-center mx-auto w-12 h-12' : 'gap-md px-md py-sm'} rounded-lg text-nav-text hover:text-nav-active hover:bg-white/10 transition-all cursor-pointer w-full`}>
          <span className="material-symbols-outlined">contact_support</span>
          {!isCollapsed && <span className="text-sm truncate">Support</span>}
        </button>
      </div>
    </aside>
  );
}
