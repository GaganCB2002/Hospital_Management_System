import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle,
  FiActivity, FiUsers, FiCalendar, FiHeart, FiArrowRight,
  FiDollarSign, FiTrendingUp, FiCheckCircle, FiClock,
  FiShield, FiServer, FiClock as FiTimer
} from 'react-icons/fi';

const roles = [
  { id: 'doctor', label: 'Doctor' },
  { id: 'receptionist', label: 'Receptionist' },
  { id: 'admin', label: 'Admin' },
  { id: 'patient', label: 'Patient' },
];

const demoCredentials = {
  admin: { email: 'admin@curepulse.com', password: 'demo123', label: 'Full System Access' },
  doctor: { email: 'doctor@curepulse.com', password: 'demo123', label: 'Clinical Dashboard' },
  receptionist: { email: 'receptionist@curepulse.com', password: 'demo123', label: 'Front Desk Portal' },
  patient: { email: 'patient@curepulse.com', password: 'demo123', label: 'Patient Portal' },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

function AnimatedKPICard({ icon: Icon, value, label, color, delay, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm ${
        isDark
          ? 'bg-white/[0.04] border-white/[0.06]'
          : 'bg-white/70 border-white/30 shadow-sm'
      }`}
      whileHover={{ y: -2, scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="text-lg text-white" />
      </div>
      <div className="min-w-0">
        <p className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        <p className={`text-[11px] font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{label}</p>
      </div>
    </motion.div>
  );
}

function MiniChart({ isDark }) {
  const bars = [
    { height: 32, color: 'bg-blue-500' },
    { height: 48, color: 'bg-emerald-500' },
    { height: 28, color: 'bg-violet-500' },
    { height: 52, color: 'bg-amber-500' },
    { height: 40, color: 'bg-rose-500' },
    { height: 56, color: 'bg-cyan-500' },
    { height: 36, color: 'bg-blue-500' },
    { height: 44, color: 'bg-emerald-500' },
    { height: 24, color: 'bg-violet-500' },
    { height: 50, color: 'bg-amber-500' },
  ];

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm ${
      isDark
        ? 'bg-white/[0.04] border-white/[0.06]'
        : 'bg-white/70 border-white/30 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs font-bold ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Weekly Consultations</p>
        <span className={`text-[10px] font-semibold flex items-center gap-1 text-emerald-500`}>
          <FiTrendingUp className="text-xs" /> +12.5%
        </span>
      </div>
      <div className="flex items-end gap-1.5 h-14">
        {bars.map((bar, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: bar.height }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            className={`flex-1 rounded-t-sm ${bar.color} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ minHeight: 4 }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', '', '', ''].map((day, i) => (
          <span key={i} className={`text-[8px] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
            {day || ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed({ isDark }) {
  const activities = [
    { text: 'New patient admitted — ICU Bed 7', time: '2m ago', icon: '🆕' },
    { text: 'Dr. Wilson completed surgery', time: '8m ago', icon: '✅' },
    { text: 'Lab results for room 204 ready', time: '15m ago', icon: '📋' },
    { text: 'Emergency alert — Code Blue', time: '24m ago', icon: '🚨' },
    { text: 'Pharmacy restock completed', time: '42m ago', icon: '💊' },
  ];

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm ${
      isDark
        ? 'bg-white/[0.04] border-white/[0.06]'
        : 'bg-white/70 border-white/30 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs font-bold ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Live Activity Feed</p>
        <span className={`w-2 h-2 rounded-full bg-emerald-500 animate-pulse`} />
      </div>
      <div className="space-y-2.5">
        {activities.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
            className="flex items-start gap-2"
          >
            <span className="text-xs leading-5 shrink-0">{item.icon}</span>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
              <span className={isDark ? 'text-white/80' : 'text-slate-700'}>{item.text}</span>
              <span className={`ml-1.5 text-[9px] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{item.time}</span>
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DashboardMockup({ isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className={`w-full rounded-2xl border overflow-hidden backdrop-blur-sm ${
        isDark
          ? 'bg-white/[0.03] border-white/[0.08] shadow-2xl shadow-black/20'
          : 'bg-white/60 border-white/40 shadow-2xl shadow-black/10'
      }`}
    >
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
        isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-white/20 bg-white/40'
      }`}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className={`text-[10px] font-semibold ml-2 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>CurePulse Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-16 h-3 rounded-full ${isDark ? 'bg-white/[0.06]' : 'bg-white/40'}`} />
          <div className={`w-5 h-5 rounded-full ${isDark ? 'bg-white/[0.08]' : 'bg-white/50'} flex items-center justify-center`}>
            <FiActivity className={`text-[10px] ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
          </div>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <AnimatedKPICard icon={FiUsers} value="1,284" label="Total Patients" color="bg-blue-600" delay={0.2} isDark={isDark} />
          <AnimatedKPICard icon={FiCalendar} value="48" label="Today's Appts" color="bg-emerald-600" delay={0.25} isDark={isDark} />
          <AnimatedKPICard icon={FiHeart} value="96.8%" label="Satisfaction" color="bg-violet-600" delay={0.3} isDark={isDark} />
        </div>
        <MiniChart isDark={isDark} />
        <ActivityFeed isDark={isDark} />
      </div>
    </motion.div>
  );
}

function FloatingOrbs({ isDark }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 ${
          isDark ? 'bg-blue-600/30' : 'bg-blue-400/20'
        }`}
      />
      <motion.div
        animate={{ x: [0, -40, 30, 0], y: [0, 30, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-25 ${
          isDark ? 'bg-emerald-600/25' : 'bg-emerald-400/15'
        }`}
      />
      <motion.div
        animate={{ x: [0, 50, -30, 0], y: [0, -30, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-1/2 -translate-y-1/2 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-violet-600/20' : 'bg-violet-400/10'
        }`}
      />
    </div>
  );
}

function FloatingStatCard({ icon: Icon, value, label, color, top, left, right, bottom, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className={`absolute hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md shadow-lg ${
        isDark
          ? 'bg-slate-900/80 border-white/[0.08] text-white'
          : 'bg-white/90 border-white/30 text-slate-800'
      }`}
      style={{ top, left, right, bottom }}
      whileHover={{ scale: 1.05 }}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="text-sm text-white" />
      </div>
      <div>
        <p className="text-sm font-extrabold leading-tight">{value}</p>
        <p className={`text-[9px] font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{label}</p>
      </div>
    </motion.div>
  );
}

function GoogleSignInButton({ onClick, isLoading, isDark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all duration-300 cursor-pointer ${
        isDark
          ? 'bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.12]'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
      } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>
  );
}

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);
  const { login, loginWithGoogle, rateLimitState, clearRateLimit } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

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

  useEffect(() => {
    setEmail(demoCredentials[selectedRole].email);
    setPassword(demoCredentials[selectedRole].password);
  }, [selectedRole]);

  useEffect(() => {
    if (rateLimitState && !rateLimitState.allowed && rateLimitState.resetInMs > 0) {
      setCountdown(Math.ceil(rateLimitState.resetInMs / 1000));
    }
  }, [rateLimitState]);

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

  const handleSubmit = async (e) => {
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

  const handleGoogleLogin = useCallback(async () => {
    try {
      googleLoginAction();
    } catch {
      setIsLoading(false);
      setError('Google sign-in unavailable. Check your client ID.');
    }
  }, [googleLoginAction]);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const isRateLimited = countdown > 0;

  return (
    <div className={`min-h-screen w-full relative ${
      isDark ? 'bg-[#020817]' : 'bg-slate-50'
    }`}>
      <FloatingOrbs isDark={isDark} />

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full min-h-screen lg:grid lg:grid-cols-2">
        <div className="relative p-8 xl:p-12 lg:flex lg:items-center hidden">
          <div className="w-full max-w-2xl space-y-8">
            <motion.div variants={fadeSlideUp} initial="hidden" animate="visible" className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 shadow-lg shadow-blue-600/20">
                <FiActivity className="text-2xl text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>CurePulse</h1>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  Smart Health Systems
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeSlideUp} initial="hidden" animate="visible">
              <h2 className={`text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                The Future of<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-500">
                  Healthcare Management
                </span>
              </h2>
              <p className={`text-base mt-4 leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                AI-powered platform unifying patient records, appointments, analytics, emergency response, billing, and clinical workflows into one intelligent ecosystem.
              </p>
            </motion.div>

            <motion.div variants={fadeSlideUp} initial="hidden" animate="visible">
              <DashboardMockup isDark={isDark} />
            </motion.div>

            <motion.div
              variants={fadeSlideUp}
              initial="hidden"
              animate="visible"
              className={`grid grid-cols-3 gap-4 pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200/60'}`}
            >
              {[
                { icon: FiShield, text: 'HIPAA Compliant' },
                { icon: FiServer, text: '99.9% Uptime' },
                { icon: FiCheckCircle, text: 'ISO 27001' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <span className={`text-[10px] font-semibold ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <FloatingStatCard icon={FiDollarSign} value="$284K" label="Monthly Revenue" color="bg-emerald-600" top="12%" left="-5%" isDark={isDark} />
          <FloatingStatCard icon={FiTrendingUp} value="+23.5%" label="Growth Rate" color="bg-blue-600" top="45%" right="-8%" left="auto" isDark={isDark} />
          <FloatingStatCard icon={FiClock} value="< 2min" label="Avg. Response" color="bg-violet-600" bottom="15%" left="5%" top="auto" isDark={isDark} />
        </div>

        <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 min-h-screen">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className={`w-full max-w-[440px] rounded-3xl border shadow-2xl backdrop-blur-xl p-6 sm:p-8 md:p-10 ${
              isDark
                ? 'bg-slate-950/60 border-white/[0.08]'
                : 'bg-white/80 border-white/30 shadow-slate-200/50'
            }`}
          >
            <button
              type="button"
              onClick={toggleTheme}
              className={`absolute top-5 right-5 p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer z-20 ${
                isDark
                  ? 'border-white/[0.06] bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'
                  : 'border-slate-200 bg-white/60 text-slate-500 hover:bg-white/80 shadow-sm'
              }`}
              title="Toggle theme"
            >
              <span className="material-symbols-outlined text-lg block">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <div className="flex lg:hidden items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600 shadow-md">
                <FiActivity className="text-lg text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>CurePulse</h1>
                <p className={`text-[8px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  Smart Health Systems
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-7"
            >
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Welcome back</h2>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                Sign in to your medical dashboard
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`flex gap-1 p-1 rounded-xl border mb-6 ${
                isDark ? 'bg-slate-950/60 border-white/[0.06]' : 'bg-slate-100/80 border-slate-200/60'
              }`}
            >
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleClick(role.id)}
                  className={`flex-1 py-2 rounded-lg text-center text-xs font-semibold transition-all duration-300 cursor-pointer border-none ${
                    selectedRole === role.id
                      ? isDark
                        ? 'bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/20'
                        : 'bg-white text-blue-600 shadow-md border border-slate-200/50'
                      : isDark
                        ? 'text-white/30 hover:text-white/60'
                        : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </motion.div>

            {/* Rate Limit Banner */}
            <AnimatePresence>
              {isRateLimited && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${
                    isDark
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/15'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                  }`}
                >
                  <FiTimer className="text-base shrink-0 animate-pulse" />
                  <span>Too many attempts. Try again in {countdown} second{countdown !== 1 ? 's' : ''}.</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/50' : 'text-slate-600'}`} htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm transition-colors ${
                    isDark ? 'text-white/25' : 'text-slate-400'
                  }`} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-white/70 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm'
                    }`}
                    placeholder={demoCredentials[selectedRole].email}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-600'}`} htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    className={`text-xs font-semibold transition-colors cursor-pointer bg-transparent border-none p-0 ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                    }`}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <FiLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm transition-colors ${
                    isDark ? 'text-white/25' : 'text-slate-400'
                  }`} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-white/70 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm'
                    }`}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer bg-transparent border-none p-0.5 ${
                      isDark ? 'text-white/30 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-outline-variant text-blue-600 focus:ring-blue-500/30 cursor-pointer"
                />
                <label htmlFor="remember" className={`text-xs cursor-pointer select-none ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  Remember me
                </label>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
                    isDark
                      ? 'bg-red-500/10 text-red-300 border border-red-500/15'
                      : 'bg-red-50 text-red-600 border border-red-200 shadow-sm'
                  }`}
                >
                  <FiAlertCircle className="text-base shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading || isRateLimited}
                className={`w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] transition-all duration-300 cursor-pointer border-none mt-1 shadow-md flex items-center justify-center gap-2 ${
                  (isLoading || isRateLimited) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : isRateLimited ? (
                  <>
                    <FiTimer className="text-sm animate-pulse" />
                    <span>Wait {countdown}s</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Dashboard</span>
                    <FiArrowRight className="text-sm" />
                  </>
                )}
              </button>
            </motion.form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mt-6 flex items-center gap-3"
            >
              <span className={`flex-1 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
              <span className={`text-xs font-medium ${isDark ? 'text-white/25' : 'text-slate-400'}`}>or continue with</span>
              <span className={`flex-1 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
            </motion.div>

            {/* Google Sign In */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-4"
            >
              <GoogleSignInButton onClick={handleGoogleLogin} isLoading={isLoading} isDark={isDark} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 space-y-4"
            >
              <p className={`text-center text-xs ${isDark ? 'text-white/25' : 'text-slate-400'}`}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className={`font-bold transition-colors cursor-pointer bg-transparent border-none p-0 ${
                    isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  Create Patient Account
                </button>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
