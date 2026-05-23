import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiEye, FiEyeOff, FiActivity, FiAlertCircle,
  FiArrowLeft, FiShield, FiServer, FiCheckCircle
} from 'react-icons/fi';

function FloatingOrbs({ isDark }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 ${
          isDark ? 'bg-emerald-600/30' : 'bg-emerald-400/20'
        }`}
      />
      <motion.div
        animate={{ x: [0, -40, 30, 0], y: [0, 30, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-25 ${
          isDark ? 'bg-blue-600/25' : 'bg-blue-400/15'
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

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', age: '', gender: 'Male', role: 'patient',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone || !formData.age) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = signup(formData);
    setIsLoading(false);
    if (result.success) {
      navigate(`/${formData.role}/dashboard`);
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                type="button"
                onClick={() => navigate('/login')}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer bg-transparent border-none p-0 mb-6 ${
                  isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FiArrowLeft className="text-sm" />
                Back to Sign In
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 shadow-lg shadow-blue-600/20">
                  <FiActivity className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>CurePulse</h1>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Smart Health Systems
                  </p>
                </div>
              </div>

              <h2 className={`text-3xl xl:text-4xl font-extrabold leading-[1.1] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Join the<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-500">
                  Healthcare Network
                </span>
              </h2>
              <p className={`text-base mt-3 leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                Create your account to access your personal health records, book appointments, track prescriptions, and manage billing — all in one place.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className={`grid grid-cols-2 gap-4 pt-6 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200/60'}`}
            >
              <div className="space-y-1">
                <p className={`text-2xl font-extrabold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>100%</p>
                <p className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Encrypted Data</p>
              </div>
              <div className="space-y-1">
                <p className={`text-2xl font-extrabold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>24/7</p>
                <p className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Patient Support</p>
              </div>
              <div className="flex items-center gap-2">
                <FiShield className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-[10px] font-semibold ${isDark ? 'text-white/40' : 'text-slate-400'}`}>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <FiServer className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-[10px] font-semibold ${isDark ? 'text-white/40' : 'text-slate-400'}`}>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-[10px] font-semibold ${isDark ? 'text-white/40' : 'text-slate-400'}`}>ISO 27001</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 min-h-screen">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className={`w-full max-w-[520px] rounded-3xl border shadow-2xl backdrop-blur-xl p-6 sm:p-8 md:p-10 ${
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
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Create an Account</h2>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                Fill in your details to establish your institutional record
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-600'}`} htmlFor="firstName">First Name</label>
                  <input
                    id="firstName" name="firstName" type="text"
                    value={formData.firstName} onChange={handleChange}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-white/70 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm'
                    }`}
                    placeholder="John" required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-600'}`} htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName" name="lastName" type="text"
                    value={formData.lastName} onChange={handleChange}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-white/70 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm'
                    }`}
                    placeholder="Doe" required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-600'}`} htmlFor="email">Email ID</label>
                  <input
                    id="email" name="email" type="email"
                    value={formData.email} onChange={handleChange}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-white/70 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm'
                    }`}
                    placeholder="john@example.com" required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-600'}`} htmlFor="phone">Phone Number</label>
                  <input
                    id="phone" name="phone" type="tel"
                    value={formData.phone} onChange={handleChange}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-white/70 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm'
                    }`}
                    placeholder="+1 234 567 890" required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-600'}`} htmlFor="age">Age</label>
                  <input
                    id="age" name="age" type="number"
                    value={formData.age} onChange={handleChange}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-white/70 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm'
                    }`}
                    placeholder="Years old" required min="1" max="120"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-600'}`} htmlFor="gender">Gender</label>
                  <select
                    id="gender" name="gender"
                    value={formData.gender} onChange={handleChange}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all cursor-pointer ${
                      isDark
                        ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-white/70 border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm'
                    }`}
                  >
                    <option value="Male" className={isDark ? 'bg-slate-900' : 'bg-white'}>Male</option>
                    <option value="Female" className={isDark ? 'bg-slate-900' : 'bg-white'}>Female</option>
                    <option value="Other" className={isDark ? 'bg-slate-900' : 'bg-white'}>Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`block text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-600'}`} htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password} onChange={handleChange}
                    className={`w-full px-3 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-white/70 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm'
                    }`}
                    placeholder="••••••••" required minLength={6}
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

              <div className="space-y-1.5">
                <label className={`block text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-600'}`} htmlFor="role">Role / Account Type</label>
                <select
                  id="role" name="role"
                  value={formData.role} onChange={handleChange}
                  className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                      : 'bg-white/70 border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm'
                  }`}
                >
                  <option value="patient" className={isDark ? 'bg-slate-900' : 'bg-white'}>Patient</option>
                  <option value="doctor" className={isDark ? 'bg-slate-900' : 'bg-white'}>Doctor</option>
                  <option value="receptionist" className={isDark ? 'bg-slate-900' : 'bg-white'}>Receptionist</option>
                  <option value="admin" className={isDark ? 'bg-slate-900' : 'bg-white'}>Administrator</option>
                </select>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
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
                disabled={isLoading}
                className={`w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] transition-all duration-300 cursor-pointer border-none mt-1 shadow-md flex items-center justify-center gap-2 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="pt-6 text-center border-t border-outline-variant/30 mt-6">
              <p className={`text-xs ${isDark ? 'text-white/25' : 'text-slate-400'}`}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className={`font-bold transition-colors cursor-pointer bg-transparent border-none p-0 ${
                    isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  Sign In Securely
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
