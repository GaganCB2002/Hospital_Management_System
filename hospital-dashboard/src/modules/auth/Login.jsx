import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useHospital } from '../../context/HospitalContext';
import {
  FiEye, FiEyeOff, FiAlertCircle,
  FiMoon, FiSun,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const roles = [
  { id: 'doctor', label: 'Doctor' },
  { id: 'nurse', label: 'Nurse' },
  { id: 'receptionist', label: 'Receptionist' },
  { id: 'admin', label: 'Admin' },
  { id: 'patient', label: 'Patient' },
];

const demoCredentials = {
  admin: { email: 'admin@curepulse.com', password: 'demo123', label: 'Full System Access' },
  doctor: { email: 'doctor@curepulse.com', password: 'demo123', label: 'Clinical Dashboard' },
  nurse: { email: 'nurse@curepulse.com', password: 'demo123', label: 'Nurse Station Portal' },
  receptionist: { email: 'receptionist@curepulse.com', password: 'demo123', label: 'Front Desk Portal' },
  patient: { email: 'patient@curepulse.com', password: 'demo123', label: 'Patient Portal' },
};

function FloatingOrbs({ isDark }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 ${
          isDark ? 'bg-[#5BA0A8]/15' : 'bg-[#5BA0A8]/20'
        }`}
      />
      <motion.div
        animate={{ x: [0, -40, 30, 0], y: [0, 30, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-25 ${
          isDark ? 'bg-[#85C4B0]/12' : 'bg-[#85C4B0]/15'
        }`}
      />
      <motion.div
        animate={{ x: [0, 50, -30, 0], y: [0, -30, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-1/2 -translate-y-1/2 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-[#A8CCD8]/10' : 'bg-[#A8CCD8]/15'
        }`}
      />
    </div>
  );
}

export default function Login() {
  const location = useLocation();
  const isActive = location.pathname === '/signup';
  const [selectedRole, setSelectedRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);
  
  const { login, loginWithGoogle, signup, clearRateLimit } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { addPatient, addAppointment } = useHospital();
  const navigate = useNavigate();

  const handleForgotPasswordClick = () => {
    toast.error('Forgot Password is not working because there is no backend as well as database for this.', {
      id: 'auth-forgot-password-warning',
      duration: 6000,
    });
  };

  const [signupData, setSignupData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '', age: '', gender: 'Male', role: 'patient',
  });
  const [showPreview, setShowPreview] = useState(false);

  const googleLoginAction = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await userInfoRes.json();
        const result = loginWithGoogle({
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        });
        if (result.success) {
          navigate('/patient/dashboard');
        } else {
          setError(result.error || 'Google sign-in failed.');
        }
      } catch {
        setError('Could not fetch Google profile.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setIsLoading(false);
      setError('Google sign-in was cancelled or failed.');
    },
    flow: 'implicit',
  });

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail(demoCredentials[role].email);
    setPassword(demoCredentials[role].password);
  };

  useEffect(() => {
    if (countdown <= 0) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          clearRateLimit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [countdown, clearRateLimit]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    if (countdown > 0) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(email, password, selectedRole);
    setIsLoading(false);
    if (result.success) {
      navigate(`/${selectedRole}/dashboard`);
    } else {
      setError(result.error || 'Invalid credentials.');
      if (result.rateLimit && !result.rateLimit.allowed) {
        setCountdown(Math.ceil(result.rateLimit.resetInMs / 1000));
      }
    }
  };

  const handleReview = (e) => {
    e.preventDefault();
    setError('');
    if (countdown > 0) return;
    if (!signupData.firstName || !signupData.lastName || !signupData.email || !signupData.password || !signupData.phone || !signupData.age) {
      setError('Please fill in all fields.');
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setShowPreview(true);
  };

  const handleConfirmSignUp = async () => {
    setError('');
    if (countdown > 0) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = signup(signupData);
    if (result.success) {
      try {
        const fullName = `${signupData.firstName} ${signupData.lastName}`.trim();
        if (signupData.role === 'patient') {
          const newPatient = await addPatient({
            name: fullName,
            email: signupData.email,
            age: Number(signupData.age) || 0,
            gender: signupData.gender || 'Unknown',
            phone: signupData.phone || '',
            status: 'Pending',
            doctor: 'Unassigned',
            department: 'General',
            ward: 'Pending Triage',
            bookingMode: 'Online',
          }, fullName);

          await addAppointment({
            patient: fullName,
            patientId: newPatient?.id || `PT-${Date.now().toString().slice(-4)}`,
            doctor: 'Unassigned',
            type: 'Consultation',
            date: new Date().toISOString().split('T')[0],
            time: '09:00 AM',
            department: 'General',
            fees: 0,
            bookingMode: 'Online',
            status: 'New',
          }, fullName);
        }
      } catch (err) {
        console.error('Failed to create patient record:', err);
      }
      navigate(`/${signupData.role}/dashboard`);
    } else {
      setError(result.error || 'Registration failed.');
      if (result.rateLimit && !result.rateLimit.allowed) {
        setCountdown(Math.ceil(result.rateLimit.resetInMs / 1000));
      }
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = useCallback(async () => {
    try {
      googleLoginAction();
    } catch {
      setIsLoading(false);
      setError('Google sign-in unavailable. Check your client ID.');
    }
  }, [googleLoginAction]);

  const handleRoleClick = (role) => {
    handleRoleSelect(role);
    setError('');
  };

  const isRateLimited = countdown > 0;
  const toggleGradient = 'bg-gradient-to-r from-[#85C4B0] to-[#5BA0A8]';

  return (
    <div className={`min-h-screen w-full relative flex items-center justify-center ${isDark ? 'bg-[#0F1718]' : 'bg-gradient-to-br from-[#E3F2F0] to-[#F7FAF9]'} transition-colors duration-300`}>
      <FloatingOrbs isDark={isDark} />

      {/* Screen Dark/Light Mode Toggle */}
      <button
        onClick={toggleTheme}
        type="button"
        aria-label="Toggle Theme"
        className="absolute top-6 right-6 p-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm cursor-pointer z-[2000]"
      >
        {isDark ? <FiSun className="text-base" /> : <FiMoon className="text-base" />}
      </button>

      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 mx-4 w-full max-w-[768px]">
        <div
          className={`relative overflow-hidden w-full min-h-[580px] rounded-[30px] shadow-xl ${isDark ? 'bg-slate-950' : 'bg-white'} transition-all duration-305 border border-slate-200/10`}
        >
          {/* Sign Up Form Panel */}
          <div
            className={`absolute top-0 h-full w-1/2 transition-all duration-700 ease-in-out ${
              isActive
                ? 'opacity-100 z-[5] translate-x-full pointer-events-auto'
                : 'opacity-0 z-[1] translate-x-0 pointer-events-none'
            }`}
          >
            <div className="h-full w-full overflow-y-auto hide-scrollbar py-6">
              <form onSubmit={handleReview} className="flex flex-col items-center justify-start px-8 min-h-full">
                {!showPreview ? (
                  <>
                    <h1 className={`text-2xl font-extrabold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Account</h1>
                    <div className="flex gap-2 my-2">
                      {['google', 'facebook', 'github', 'linkedin'].map((s, i) => (
                        <button key={i} type="button" onClick={handleGoogleLogin}
                          className={`w-8.5 h-8.5 rounded-[20%] border ${isDark ? 'border-white/[0.15] hover:bg-white/[0.08]' : 'border-[#ccc] hover:bg-slate-100'} flex items-center justify-center transition-colors cursor-pointer bg-transparent`}
                        >
                          {s === 'google' && (
                            <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                          )}
                          {s === 'facebook' && <span className={`text-sm font-bold ${isDark ? 'text-white/70' : 'text-slate-600'}`}>f</span>}
                          {s === 'github' && (
                            <svg viewBox="0 0 24 24" className={`w-4 h-4 ${isDark ? 'fill-white/70' : 'fill-slate-600'}`}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                          )}
                          {s === 'linkedin' && <span className={`text-sm font-bold ${isDark ? 'text-white/70' : 'text-slate-655'}`}>in</span>}
                        </button>
                      ))}
                    </div>
                    <span className={`text-[10px] mb-2 ${isDark ? 'text-white/50' : 'text-slate-550'}`}>or use your email for registration</span>

                    <div className="grid grid-cols-2 gap-2.5 w-full mb-2">
                      <input type="text" placeholder="First Name" value={signupData.firstName}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        className={`w-full px-3 py-2 text-xs rounded-xl outline-none ${isDark ? 'bg-white/[0.06] text-white border border-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-800'}`} required />
                      <input type="text" placeholder="Last Name" value={signupData.lastName}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        className={`w-full px-3 py-2 text-xs rounded-xl outline-none ${isDark ? 'bg-white/[0.06] text-white border border-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-800'}`} required />
                    </div>

                    <input type="email" placeholder="Email" value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className={`w-full px-3 py-2 text-xs rounded-xl outline-none mb-2 ${isDark ? 'bg-white/[0.06] text-white border border-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-800'}`} required />

                    <input type="tel" placeholder="Phone Number" value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      className={`w-full px-3 py-2 text-xs rounded-xl outline-none mb-2 ${isDark ? 'bg-white/[0.06] text-white border border-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-800'}`} required />

                    <div className="grid grid-cols-2 gap-2.5 w-full mb-2">
                      <input type="number" placeholder="Age" value={signupData.age}
                        onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                        className={`w-full px-3 py-2 text-xs rounded-xl outline-none ${isDark ? 'bg-white/[0.06] text-white border border-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-800'}`} required min="1" max="120" />
                      <select value={signupData.gender}
                        onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                        className={`w-full px-3 py-2 text-xs rounded-xl outline-none ${isDark ? 'bg-white/[0.06] text-white border border-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 w-full mb-2">
                      <div className="relative">
                        <input type={showSignupPw ? 'text' : 'password'} placeholder="Password" value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          className={`w-full px-3 py-2 text-xs rounded-xl outline-none pr-8 ${isDark ? 'bg-white/[0.06] text-white border border-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-800'}`} required />
                        <button type="button" onClick={() => setShowSignupPw(!showSignupPw)}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                          {showSignupPw ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                        </button>
                      </div>
                      <input type={showSignupPw ? 'text' : 'password'} placeholder="Confirm" value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className={`w-full px-3 py-2 text-xs rounded-xl outline-none ${isDark ? 'bg-white/[0.06] text-white border border-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-800'}`} required />
                    </div>

                    <select value={signupData.role}
                      onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                      className={`w-full px-3 py-2 text-xs rounded-xl outline-none mb-3 ${isDark ? 'bg-white/[0.06] text-white border border-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="admin">Administrator</option>
                    </select>

                    <button type="submit" disabled={isLoading || isRateLimited}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors cursor-pointer border-none ${(isLoading || isRateLimited) ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      {isRateLimited ? `Wait ${countdown}s` : 'Review Details'}
                    </button>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                        className={`mt-2 flex items-center gap-2 p-2 rounded-xl text-xs w-full ${isDark ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-600'}`}>
                        <FiAlertCircle className="shrink-0 animate-bounce" /><span>{error}</span>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <>
                    <h1 className={`text-2xl font-extrabold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Review Your Details</h1>

                    <div className="w-full space-y-2 mb-4">
                      {[
                        { label: 'First Name', value: signupData.firstName },
                        { label: 'Last Name', value: signupData.lastName },
                        { label: 'Email', value: signupData.email },
                        { label: 'Phone', value: signupData.phone },
                        { label: 'Age', value: signupData.age },
                        { label: 'Gender', value: signupData.gender },
                        { label: 'Role', value: signupData.role.charAt(0).toUpperCase() + signupData.role.slice(1) },
                        { label: 'Password', value: '••••••••' },
                      ].map((field) => (
                        <div key={field.label} className={`flex justify-between items-center px-3 py-2 rounded-xl text-xs ${isDark ? 'bg-white/[0.06]' : 'bg-slate-50'}`}>
                          <span className={`font-medium ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{field.label}</span>
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{field.value || '—'}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 w-full">
                      <button type="button" onClick={() => setShowPreview(false)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 cursor-pointer transition-colors ${
                          isDark ? 'border-slate-700 text-white/70 hover:bg-white/[0.05]' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}>
                        Edit
                      </button>
                      <button type="button" onClick={handleConfirmSignUp} disabled={isLoading || isRateLimited}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors cursor-pointer border-none ${(isLoading || isRateLimited) ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        {isLoading ? 'Creating Account...' : isRateLimited ? `Wait ${countdown}s` : 'Confirm & Create Account'}
                      </button>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                        className={`mt-2 flex items-center gap-2 p-2 rounded-xl text-xs w-full ${isDark ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-600'}`}>
                        <FiAlertCircle className="shrink-0 animate-bounce" /><span>{error}</span>
                      </motion.div>
                    )}
                  </>
                )}
              </form>
            </div>
          </div>

          {/* Sign In Form Panel */}
          <div
            className={`absolute top-0 h-full w-1/2 transition-all duration-700 ease-in-out ${
              !isActive
                ? 'opacity-100 z-[2] translate-x-0 pointer-events-auto'
                : 'opacity-0 z-[1] translate-x-full pointer-events-none'
            }`}
          >
            <form onSubmit={handleSignIn} className="flex items-center justify-center flex-col px-10 h-full w-full">
              <h1 className={`text-2xl font-extrabold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Sign In</h1>
              <div className="flex gap-2 my-3.5">
                {['google', 'facebook', 'github', 'linkedin'].map((s, i) => (
                  <button key={i} type="button" onClick={handleGoogleLogin}
                    className={`w-9 h-9 rounded-[20%] border ${isDark ? 'border-white/[0.15] hover:bg-white/[0.08]' : 'border-[#ccc] hover:bg-slate-100'} flex items-center justify-center transition-colors cursor-pointer bg-transparent`}
                  >
                    {s === 'google' && (
                      <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    )}
                    {s === 'facebook' && <span className={`text-sm font-bold ${isDark ? 'text-white/70' : 'text-slate-600'}`}>f</span>}
                    {s === 'github' && (
                      <svg viewBox="0 0 24 24" className={`w-4 h-4 ${isDark ? 'fill-white/70' : 'fill-slate-600'}`}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    )}
                    {s === 'linkedin' && <span className={`text-sm font-bold ${isDark ? 'text-white/70' : 'text-slate-605'}`}>in</span>}
                  </button>
                ))}
              </div>
              <span className={`text-xs mb-3.5 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>or use your email password</span>

              <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'} w-full mb-3 border border-slate-200/10`}>
                {roles.map((role) => (
                  <button key={role.id} type="button" onClick={() => handleRoleClick(role.id)}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer border-none ${
                      selectedRole === role.id
                        ? `${isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-white text-sky-650 shadow-sm'}`
                        : `${isDark ? 'text-white/30' : 'text-slate-400'}`
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>

              <input type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl outline-none mb-2 ${isDark ? 'bg-white/[0.06] text-white border border-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-850'}`} required />

              <div className="relative w-full mb-2">
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl outline-none pr-9 ${isDark ? 'bg-white/[0.06] text-white border border-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-850'}`} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                  {showPassword ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                </button>
              </div>

              <div className="flex items-center justify-between w-full mb-3.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="accent-sky-500 cursor-pointer" />
                  <span className={`text-[10px] font-semibold ${isDark ? 'text-white/50' : 'text-slate-505'}`}>Remember me</span>
                </label>
                <button type="button" onClick={handleForgotPasswordClick} className={`text-[10px] font-bold bg-transparent border-none cursor-pointer ${isDark ? 'text-primary' : 'text-[#5BA0A8] hover:underline'}`}>
                  Forgot Password?
                </button>
              </div>

              <button type="submit" disabled={isLoading || isRateLimited}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors cursor-pointer border-none ${(isLoading || isRateLimited) ? 'opacity-60 cursor-not-allowed' : ''}`}>
                {isLoading ? 'Signing in...' : isRateLimited ? `Wait ${countdown}s` : 'Sign In'}
              </button>

              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className={`mt-2 flex items-center gap-2 p-2 rounded-xl text-xs w-full ${isDark ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-600'}`}>
                  <FiAlertCircle className="shrink-0" /><span>{error}</span>
                </motion.div>
              )}
            </form>
          </div>

          {/* Toggle Sliding Container */}
          <div
            className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-700 ease-in-out z-[1000] ${
              isActive ? '-translate-x-full rounded-[0_150px_100px_0]' : 'rounded-[150px_0_0_100px]'
            }`}
          >
            <div
              className={`relative -left-full h-full w-[200%] transition-all duration-700 ease-in-out ${toggleGradient} ${
                isActive ? 'translate-x-1/2' : 'translate-x-0'
              }`}
            >
              {/* Left Slide Panel (Prompts to go to Sign In) */}
              <div
                className={`absolute w-1/2 h-full flex items-center justify-center flex-col px-8 text-center top-0 transition-all duration-700 ease-in-out ${
                  isActive ? 'translate-x-0' : '-translate-x-full'
                } text-white`}
              >
                {/* CurePulse Logo */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm backdrop-blur-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <svg viewBox="0 0 36 36" className="w-5.5 h-5.5 fill-white">
                      <path d="M18 4C12 4 8 8 8 14v2a2 2 0 002 2h2v-4c0-3.3 2.7-6 6-6s6 2.7 6 6v4h2a2 2 0 002-2v-2c0-6-4-10-10-10z" opacity="0.85"/>
                      <path d="M14 18h-4a2 2 0 00-2 2v2c0 6 4 10 10 10s10-4 10-10v-2a2 2 0 00-2-2h-4v2a4 4 0 01-8 0v-2z"/>
                      <rect x="16.5" y="14" width="3" height="10" rx="1"/>
                      <rect x="12" y="17.5" width="12" height="3" rx="1"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-black leading-none">CurePulse</h3>
                    <p className="text-[7.5px] font-bold text-white/60 tracking-wider uppercase">Smart Health Systems</p>
                  </div>
                </div>

                <h1 className="text-2xl font-black mb-3">The Future of <br />Healthcare Management</h1>
                <p className="text-xs text-white/80 mb-6 leading-relaxed">Enter your personal details to sign in to your medical dashboard</p>
                <button type="button" onClick={() => navigate('/login')}
                  className="px-8 py-2 rounded-xl border-2 border-white text-white text-xs font-bold bg-transparent hover:bg-white/10 transition-colors cursor-pointer">
                  Sign In
                </button>
              </div>

              {/* Right Slide Panel (Prompts to go to Sign Up) */}
              <div
                className={`absolute w-1/2 h-full flex items-center justify-center flex-col px-8 text-center top-0 right-0 transition-all duration-700 ease-in-out ${
                  isActive ? 'translate-x-[200%]' : 'translate-x-0'
                } text-white`}
              >
                {/* CurePulse Logo */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm backdrop-blur-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <svg viewBox="0 0 36 36" className="w-5.5 h-5.5 fill-white">
                      <path d="M18 4C12 4 8 8 8 14v2a2 2 0 002 2h2v-4c0-3.3 2.7-6 6-6s6 2.7 6 6v4h2a2 2 0 002-2v-2c0-6-4-10-10-10z" opacity="0.85"/>
                      <path d="M14 18h-4a2 2 0 00-2 2v2c0 6 4 10 10 10s10-4 10-10v-2a2 2 0 00-2-2h-4v2a4 4 0 01-8 0v-2z"/>
                      <rect x="16.5" y="14" width="3" height="10" rx="1"/>
                      <rect x="12" y="17.5" width="12" height="3" rx="1"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-black leading-none">CurePulse</h3>
                    <p className="text-[7.5px] font-bold text-white/60 tracking-wider uppercase">Smart Health Systems</p>
                  </div>
                </div>

                <h1 className="text-2xl font-black mb-3">The Future of <br />Healthcare Management</h1>
                <p className="text-xs text-white/80 mb-6 leading-relaxed">Register with your personal details to access all features</p>
                <button type="button" onClick={() => navigate('/signup')}
                  className="px-8 py-2 rounded-xl border-2 border-white text-white text-xs font-bold bg-transparent hover:bg-white/10 transition-colors cursor-pointer">
                  Sign Up
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
