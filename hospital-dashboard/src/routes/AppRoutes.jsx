import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../app/layouts/DashboardLayout';
import Login from '../modules/auth/Login';
import Signup from '../modules/auth/Signup';
import LandingPage from '../modules/landing/LandingPage';

// Admin Pages
import AdminDashboard from '../modules/dashboard/admin/AdminDashboard';
import PatientManagement from '../modules/patients/PatientManagement';
import StaffSchedule from '../modules/doctors/StaffSchedule';
import DoctorManagement from '../modules/doctors/DoctorManagement';
import PharmacyInventory from '../modules/pharmacy/PharmacyInventory';
import EmergencyDashboard from '../modules/emergency/EmergencyDashboard';
import FinancialsBilling from '../modules/admin/FinancialsBilling';
import RevenueReports from '../modules/admin/RevenueReports';
import SettingsModule from '../modules/settings/SettingsModule';
import EmployeeManagement from '../modules/admin/EmployeeManagement';
import ProfilePage from '../modules/profile/ProfilePage';

// Doctor Pages
import DoctorDashboard from '../modules/dashboard/doctor/DoctorDashboard';
import DoctorAppointments from '../modules/appointments/DoctorAppointments';
import PatientRecords from '../modules/patients/PatientRecords';
import DoctorProfile from '../modules/doctors/DoctorProfile';
import ConsultationHistory from '../modules/doctors/ConsultationHistory';
import AIHealthAnalytics from '../modules/dashboard/doctor/AIHealthAnalytics';

// Receptionist Pages
import ReceptionistDashboard from '../modules/dashboard/receptionist/ReceptionistDashboard';
import AppointmentsBooking from '../modules/appointments/AppointmentsBooking';
import PatientRegistration from '../modules/patients/PatientRegistration';
import Billing from '../modules/billing/Billing';
import ReceptionistPatients from '../modules/receptionist/ReceptionistPatients';
import ReceptionistOnlineBookings from '../modules/receptionist/ReceptionistOnlineBookings';

// Patient Pages
import PatientDashboard from '../modules/dashboard/patient/PatientDashboard';
import BookAppointment from '../modules/appointments/BookAppointment';
import MedicalHistory from '../modules/patients/MedicalHistory';
import PatientDoctors from '../modules/patients/PatientDoctors';
import PatientDoctorHistory from '../modules/patients/PatientDoctorHistory';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Signup />} />

      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="patients" element={<PatientManagement />} />
        <Route path="doctors" element={<StaffSchedule />} />
        <Route path="doctor-management" element={<DoctorManagement />} />
        <Route path="inventory" element={<PharmacyInventory />} />
        <Route path="emergency" element={<EmergencyDashboard />} />
        <Route path="financials" element={<FinancialsBilling />} />
        <Route path="revenue" element={<RevenueReports />} />
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsModule />} />
      </Route>

      <Route path="/doctor" element={<ProtectedRoute allowedRole="doctor"><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<PatientRecords />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="consultations" element={<ConsultationHistory />} />
        <Route path="ai-insights" element={<AIHealthAnalytics />} />
        <Route path="ai_insights" element={<AIHealthAnalytics />} />
        <Route path="emergency" element={<EmergencyDashboard />} />
        <Route path="settings" element={<SettingsModule />} />
      </Route>

      <Route path="/receptionist" element={<ProtectedRoute allowedRole="receptionist"><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<ReceptionistDashboard />} />
        <Route path="book" element={<AppointmentsBooking />} />
        <Route path="bookings" element={<ReceptionistOnlineBookings />} />
        <Route path="patients" element={<ReceptionistPatients />} />
        <Route path="register" element={<PatientRegistration />} />
        <Route path="billing" element={<Billing />} />
        <Route path="emergency" element={<EmergencyDashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsModule />} />
      </Route>

      <Route path="/patient" element={<ProtectedRoute allowedRole="patient"><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="book" element={<BookAppointment />} />
        <Route path="doctors" element={<PatientDoctors />} />
        <Route path="doctor-history" element={<PatientDoctorHistory />} />
        <Route path="history" element={<MedicalHistory />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsModule />} />
      </Route>

      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
