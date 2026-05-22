import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiEye, FiEyeOff, FiActivity, FiAlertCircle } from 'react-icons/fi';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    age: '',
    gender: 'Male',
    role: 'patient',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone || !formData.age) {
      setError('Please fill in all fields.');
      return;
    }

    const result = signup(formData);
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
    <div className="min-h-screen bg-white dark:bg-background flex relative overflow-hidden transition-colors duration-300">
      {/* Floating Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-surface-container-lowest/80 backdrop-blur-md hover:bg-surface-container text-on-surface border border-outline-variant/50 transition-all shadow-lg active:scale-95 flex items-center justify-center cursor-pointer"
        title="Toggle Theme"
      >
        <span className="material-symbols-outlined text-xl text-primary select-none">
          {isDark ? 'light_mode' : 'dark_mode'}
        </span>
      </button>

      {/* Modern Left Panel */}
      <div className="hidden lg:flex lg:flex-col lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1000)' }}></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#006b5f] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/90 to-transparent"></div>

        <div className="relative z-10 text-white w-full max-w-lg space-y-8">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="p-3 bg-white/10 rounded-2xl backdrop-blur-md"
            >
              <FiActivity className="text-5xl text-primary-fixed-dim" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">CurePulse</h1>
              <p className="text-xs text-primary-fixed-dim font-semibold uppercase tracking-widest mt-1">Smart Health Systems</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold leading-tight">Join the CurePulse Network.</h2>
            <p className="text-white/80 text-body-lg">
              Create your account to access your personal health records, book doctor appointments, track prescriptions, and view billing statements securely.
            </p>
          </div>

          <div className="pt-8 border-t border-white/20 grid grid-cols-2 gap-6 w-full">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary-fixed-dim">100%</div>
              <div className="text-xs text-white/60 uppercase tracking-wider">Encrypted Data</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary-fixed-dim">24/7</div>
              <div className="text-xs text-white/60 uppercase tracking-wider">Patient Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphic Right Panel (Auth Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[500px] bg-surface-container-lowest/70 backdrop-blur-xl border border-outline-variant/40 rounded-3xl p-8 shadow-2xl space-y-6"
        >
          {/* Logo visible on small screens */}
          <div className="flex lg:hidden items-center gap-3 mb-4 text-primary">
            <FiActivity className="text-4xl" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">CurePulse</h1>
              <p className="text-[10px] text-primary/70 uppercase tracking-wider font-bold">Smart Health Systems</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Create an Account</h2>
            <p className="text-sm text-on-surface-variant">Please fill out your details to establish your institutional record.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface" htmlFor="firstName">First Name</label>
                <input
                  id="firstName" name="firstName" type="text"
                  value={formData.firstName} onChange={handleChange}
                  className="block w-full px-3 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all shadow-sm"
                  placeholder="John" required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface" htmlFor="lastName">Last Name</label>
                <input
                  id="lastName" name="lastName" type="text"
                  value={formData.lastName} onChange={handleChange}
                  className="block w-full px-3 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all shadow-sm"
                  placeholder="Doe" required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface" htmlFor="email">Email ID</label>
                <input
                  id="email" name="email" type="email"
                  value={formData.email} onChange={handleChange}
                  className="block w-full px-3 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all shadow-sm"
                  placeholder="john@example.com" required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface" htmlFor="phone">Phone Number</label>
                <input
                  id="phone" name="phone" type="tel"
                  value={formData.phone} onChange={handleChange}
                  className="block w-full px-3 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all shadow-sm"
                  placeholder="+1 234 567 890" required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface" htmlFor="age">Age</label>
                <input
                  id="age" name="age" type="number"
                  value={formData.age} onChange={handleChange}
                  className="block w-full px-3 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all shadow-sm"
                  placeholder="Years old" required min="1" max="120"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface" htmlFor="gender">Gender</label>
                <select
                  id="gender" name="gender"
                  value={formData.gender} onChange={handleChange}
                  className="block w-full px-3 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all shadow-sm cursor-pointer"
                >
                  <option value="Male" className="bg-surface-container-lowest">Male</option>
                  <option value="Female" className="bg-surface-container-lowest">Female</option>
                  <option value="Other" className="bg-surface-container-lowest">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password} onChange={handleChange}
                  className="block w-full px-3 pr-10 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all shadow-sm"
                  placeholder="••••••••" required minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                >
                  {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface" htmlFor="role">Role / Account Type</label>
              <select
                id="role" name="role"
                value={formData.role} onChange={handleChange}
                className="block w-full px-3 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all shadow-sm cursor-pointer"
              >
                <option value="patient" className="bg-surface-container-lowest">Patient</option>
                <option value="doctor" className="bg-surface-container-lowest">Doctor</option>
                <option value="receptionist" className="bg-surface-container-lowest">Receptionist</option>
                <option value="admin" className="bg-surface-container-lowest">Administrator</option>
              </select>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3.5 bg-error-container text-error rounded-xl text-sm border border-error/20"
              >
                <FiAlertCircle className="text-lg flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="pt-4 text-center border-t border-outline-variant/30">
            <p className="text-sm text-on-surface-variant">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-primary hover:text-primary-container hover:underline font-bold cursor-pointer"
              >
                Sign In Securely
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
