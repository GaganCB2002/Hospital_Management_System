import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ScrollReveal from '../../components/common/ScrollReveal';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiActivity, FiUsers, FiCalendar, FiAward, FiHeart } from 'react-icons/fi';

const roles = [
  { id: 'doctor', label: 'Doctor' },
  { id: 'receptionist', label: 'Receptionist' },
  { id: 'admin', label: 'Admin' },
  { id: 'patient', label: 'Patient' },
];

const hospitalStats = [
  { icon: FiUsers, value: '12K+', label: 'Patients Treated' },
  { icon: FiAward, value: '20+', label: 'Expert Doctors' },
  { icon: FiCalendar, value: '15+', label: 'Years Legacy' },
  { icon: FiHeart, value: '98%', label: 'Satisfaction' },
];

const featureSlides = [
  { title: '24/7 Emergency Care', subtitle: 'Round-the-clock trauma & critical care services' },
  { title: 'Advanced Diagnostics', subtitle: 'State-of-the-art imaging & pathology labs' },
  { title: 'Digital Health Records', subtitle: 'Secure, instant access to your medical history' },
];

function FeatureRotator({ slides }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-white font-semibold text-sm">{slides[current].title}</p>
          <p className="text-white/60 text-xs mt-1">{slides[current].subtitle}</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-1.5 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer border-none ${
              i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(email, password, selectedRole);
    if (result.success) {
      navigate(`/${selectedRole}/dashboard`);
    } else {
      setError('Invalid credentials. Use demo123 as password.');
    }
  };

  const handleDemoLogin = (role) => {
    setSelectedRole(role);
    setEmail(`${role}@curepulse.com`);
    setPassword('demo123');
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-cover bg-center bg-no-repeat relative overflow-y-auto"
      style={{ backgroundImage: `url('/login-bg.png')` }}
    >
      {/* Dark Overlay with Blur */}
      <div className={`absolute inset-0 transition-colors duration-300 ${
        isDark ? 'bg-[#060B18]/75 backdrop-blur-[3px]' : 'bg-slate-900/40 backdrop-blur-[2px]'
      }`} />

      {/* Main Glassmorphic Card Container */}
      <div className={`relative w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] transition-all duration-300 ${
        isDark 
          ? 'bg-slate-950/45 border-white/[0.08] text-white' 
          : 'bg-white/70 border-white/30 text-slate-800'
      }`}>
        
        {/* Left Column: Brand & Info Panel (Only visible on lg screens) */}
        <div className={`hidden lg:flex lg:col-span-5 flex-col justify-between p-10 relative overflow-hidden border-r ${
          isDark ? 'border-white/[0.08] bg-slate-950/20' : 'border-white/20 bg-white/30'
        }`}>
          {/* Logo & Headline */}
          <div>
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 shadow-md">
                  <FiActivity className="text-2xl text-white animate-pulse" />
                </div>
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>CurePulse</h1>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.25em] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    Smart Health Systems
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h2 className={`text-3xl font-extrabold leading-tight mt-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Your Health,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">Our Mission</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className={`text-sm mt-3 max-w-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                A state-of-the-art clinical management portal offering 24/7 care, streamlined scheduling, and premium diagnostics.
              </p>
            </ScrollReveal>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3.5 my-6">
            {hospitalStats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={0.3 + i * 0.1} distance={20}>
                <div className={`rounded-xl p-3.5 border transition-all duration-300 hover:scale-[1.02] ${
                  isDark 
                    ? 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08]' 
                    : 'bg-white/45 border-white/50 hover:bg-white/60 shadow-sm'
                }`}>
                  <stat.icon className="text-emerald-500 text-lg mb-1.5" />
                  <p className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  <p className={`text-[11px] font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Featured Slides */}
          <ScrollReveal delay={0.7}>
            <FeatureRotator slides={featureSlides} />
          </ScrollReveal>
        </div>

        {/* Right Column: Form Panel (Takes up full space on sm/md, 7 cols on lg) */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center relative">
          
          {/* Theme Toggle Button */}
          <div className="absolute top-6 right-6">
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                isDark
                  ? 'border-white/[0.08] bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'
                  : 'border-slate-200 bg-white/50 text-slate-500 hover:bg-white/80 shadow-sm'
              }`}
              title="Toggle theme"
            >
              <span className="material-symbols-outlined text-lg block">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          {/* Form Content Wrapper */}
          <div className="w-full max-w-[420px] mx-auto">
            {/* Welcoming Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <h2 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Welcome back</h2>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                Sign in to manage your medical dashboard
              </p>
            </motion.div>

            {/* Role Tabs Selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`flex gap-1 p-1 rounded-xl border mb-6 ${
                isDark ? 'bg-slate-950/40 border-white/[0.08]' : 'bg-slate-100/60 border-slate-200/80 shadow-inner'
              }`}
            >
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleDemoLogin(role.id)}
                  className={`flex-1 py-2 rounded-lg text-center text-xs font-semibold transition-all duration-300 cursor-pointer border-none ${
                    selectedRole === role.id
                      ? isDark
                        ? 'bg-blue-600/25 text-blue-400 shadow-sm border border-blue-500/20'
                        : 'bg-white text-blue-600 shadow-md border border-slate-200/50'
                      : isDark
                        ? 'text-white/40 hover:text-white/70'
                        : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </motion.div>

            {/* Actual Credentials Form */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/60' : 'text-slate-600'}`} htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-base transition-colors ${
                    isDark ? 'text-white/30' : 'text-slate-400'
                  }`} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-950/30 border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30'
                        : 'bg-white/80 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm'
                    }`}
                    placeholder={`${selectedRole}@curepulse.com`}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-white/60' : 'text-slate-600'}`} htmlFor="password">
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
                  <FiLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-base transition-colors ${
                    isDark ? 'text-white/30' : 'text-slate-400'
                  }`} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-950/30 border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30'
                        : 'bg-white/80 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm'
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
                    {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/[0.08] bg-slate-950/30 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
                />
                <label htmlFor="remember" className={`text-xs cursor-pointer select-none ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
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
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] transition-all duration-300 cursor-pointer border-none mt-2 shadow-md"
              >
                Sign in to Dashboard
              </button>
            </motion.form>

            {/* Form Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-6 space-y-4"
            >
              <p className={`text-center text-xs ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                Don't have an account yet?{' '}
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

              {/* Quick Access Info Card */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                isDark
                  ? 'bg-slate-950/40 border-white/[0.06] hover:bg-slate-950/50'
                  : 'bg-slate-50/80 border-slate-200/60 hover:bg-slate-50 shadow-sm'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-md bg-gradient-to-br from-blue-500 to-emerald-500">
                    <FiActivity className="text-[10px] text-white" />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    Demo Quick Access
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Password: <span className={`font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>demo123</span>
                  </p>
                  <p className={`text-[10px] leading-relaxed ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                    💡 Click any role tab above to automatically autofill demo email and credentials.
                  </p>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
