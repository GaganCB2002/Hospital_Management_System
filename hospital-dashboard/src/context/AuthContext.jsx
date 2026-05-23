/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { checkRateLimit, recordAttempt, resetRateLimit } from '../services/rateLimiter.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'curepulse_user';
const REGISTERED_USERS_KEY = 'curepulse_registered_users';

const mockUsers = {
  admin: { id: 1, name: 'Dr. Sarah Chen', email: 'admin@curepulse.com', role: 'admin', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQJIUIHFHfCJIzDFlJ4Bgk0QSVaakMbcz3b14A7tVRbyOEkK95GBQDpR8teKmDX8MI_J6rGjNOF3LSoc5nymQNcliaP6QBGDX22yJwByA3Na71tOurxskakin7cAjGdv92ZGXgYx3xR4-zty472G5taDtdVJauw5Jzq5hX4NBRq-AUGZqnPVenbO6hPnkpn8cED53W_ful8j6bPin9vYZTpgN-3I88bJkscCwXWQrzSURGm4XB4g0mTS8qALqLhWd_7V8fkhoOcPU' },
  doctor: { id: 2, name: 'Dr. James Wilson', email: 'doctor@curepulse.com', role: 'doctor', department: 'Pediatrics', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZhxmqKRaPrOltNeEc_TSCcK9lJiZ7FPPGlnxWUIMTDBNjl5pM5g96Ofi_lc5aqmJdeNJzs4xlY93p_LJQzwnm5aV3p8XkIdmVRBoWxDlWpHZgX9Glf1-uapxb9FLJIb3w7j99moSLWojCvTOIjbNXPeL3yetX1Nb6Xe_9JjcLeQavFpduj2qr4oDKEXZjkKVz4pGfnfS9uFiRregPlmAxCB8CQL228VB_ABjNKDsxvnSRI1ZCXWSCsofQSPJ-zVVpeMzHbMlD914' },
  receptionist: { id: 3, name: 'Emily Roberts', email: 'receptionist@curepulse.com', role: 'receptionist', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBRgshxSq7tdb7dT7roAupCOe5VbEBdVCdoHdP-VFqTN8VwpgQ-gEz__pjqlmBrTjvuOgLhsodY_zhYSqFDwD8jdqmdnBeSP7HUHteOfq9eNPU1Txr4HqUfdLRYMt4_7I__sUNpXl7xwLxhtzQOxWdRdHsmAqmWvc2DsJzGORFTSok_BXTzyEgr858jI8VFYKhmN2gLiV_NfzYne5wxJqTcuiib3Q_Amzh-Ufn2amSmY2cONIDE-eFOQVp437MyHqeDm14_NF41rU' },
  patient: { id: 4, name: 'John Doe', email: 'patient@curepulse.com', role: 'patient', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgiJA4B2RDF7E-V0ksZm2xGzg6tppELq-p9QHg2L7AAR1fde4UyrYkAvAnFSVobj7Ax3sWPkn-lctpfZgY0sP3aTNHN4qOqKMGvmOuwkTiew8iTpD1buZ9f2QfOBIxROEmHIcEgyT9VLxTBrexVi1V9YP6NEeeR3ObXzmLT806CT9PVtSdwoONSO83Km6Ks0SDC2Jf7dgRVdQe6iw_r_wTkUuFMCkt-6Xb3fEyjgvm7sk9YsFUJhDJLPP3vLNk6ubhsynael4DSzo' }
};

function getRegisteredUsers() {
  try {
    const data = localStorage.getItem(REGISTERED_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUser(userData) {
  const users = getRegisteredUsers();
  const idx = users.findIndex(u => u.email === userData.email);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...userData };
  } else {
    users.push(userData);
  }
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function saveSession(userData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function randomAvatar(seed) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [rateLimitState, setRateLimitState] = useState(null);

  const login = useCallback((email, password, role) => {
    const rateCheck = checkRateLimit('login', email);
    if (!rateCheck.allowed) {
      setRateLimitState(rateCheck);
      return { success: false, error: `Too many attempts. Try again later.`, rateLimit: rateCheck };
    }

    const mockUser = mockUsers[role];
    const registeredUsers = getRegisteredUsers();
    const registeredUser = registeredUsers.find(u => u.email === email);

    if (mockUser && email === mockUser.email && password === 'demo123') {
      recordAttempt('login', email);
      const userData = { ...mockUser };
      setUser(userData);
      saveSession(userData);
      resetRateLimit('login', email);
      setRateLimitState(null);
      return { success: true };
    }

    if (registeredUser && registeredUser.password === password) {
      recordAttempt('login', email);
      const userData = {
        id: registeredUser.id,
        name: registeredUser.name,
        email: registeredUser.email,
        role: registeredUser.role || 'patient',
        phone: registeredUser.phone,
        age: registeredUser.age,
        gender: registeredUser.gender,
        avatar: registeredUser.avatar || randomAvatar(registeredUser.name),
      };
      setUser(userData);
      saveSession(userData);
      resetRateLimit('login', email);
      setRateLimitState(null);
      return { success: true };
    }

    recordAttempt('login', email);
    setRateLimitState(checkRateLimit('login', email));
    return { success: false, error: 'Invalid credentials. Please check your email and password.' };
  }, []);

  const loginWithGoogle = useCallback((googleUser) => {
    const email = googleUser.email;
    const rateCheck = checkRateLimit('oauth', email);
    if (!rateCheck.allowed) {
      setRateLimitState(rateCheck);
      return { success: false, error: 'Too many attempts. Try again later.', rateLimit: rateCheck };
    }

    const registeredUsers = getRegisteredUsers();
    const existingUser = registeredUsers.find(u => u.email === email);

    if (existingUser) {
      const userData = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role || 'patient',
        phone: existingUser.phone || '',
        age: existingUser.age || '',
        gender: existingUser.gender || '',
        avatar: googleUser.picture || existingUser.avatar || randomAvatar(existingUser.name),
        authMethod: 'google',
      };
      setUser(userData);
      saveSession(userData);
      resetRateLimit('oauth', email);
      setRateLimitState(null);
      return { success: true };
    }

    const newUser = {
      id: Date.now(),
      name: googleUser.name,
      email: email,
      role: 'patient',
      phone: '',
      age: '',
      gender: '',
      avatar: googleUser.picture || randomAvatar(googleUser.name),
      authMethod: 'google',
      password: '',
      createdAt: new Date().toISOString(),
    };
    saveRegisteredUser(newUser);
    setUser(newUser);
    saveSession(newUser);
    resetRateLimit('oauth', email);
    setRateLimitState(null);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearSession();
    setRateLimitState(null);
  }, []);

  const switchRole = useCallback((newRole) => {
    if (mockUsers[newRole]) {
      const userData = { ...mockUsers[newRole] };
      setUser(userData);
      saveSession(userData);
    }
  }, []);

  const signup = useCallback((userData) => {
    const rateCheck = checkRateLimit('signup', userData.email);
    if (!rateCheck.allowed) {
      setRateLimitState(rateCheck);
      return { success: false, error: 'Too many signup attempts. Try again later.', rateLimit: rateCheck };
    }

    const registeredUsers = getRegisteredUsers();
    if (registeredUsers.find(u => u.email === userData.email)) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser = {
      id: Date.now(),
      name: `${userData.firstName} ${userData.lastName}`.trim(),
      email: userData.email,
      password: userData.password || '',
      role: userData.role || 'patient',
      phone: userData.phone || '',
      age: userData.age || '',
      gender: userData.gender || '',
      avatar: randomAvatar(userData.firstName || userData.email),
      authMethod: 'email',
      createdAt: new Date().toISOString(),
    };

    if (newUser.role === 'doctor') {
      newUser.department = 'General';
    }

    saveRegisteredUser(newUser);
    const sessionData = { ...newUser };
    delete sessionData.password;
    setUser(sessionData);
    saveSession(sessionData);
    resetRateLimit('signup', userData.email);
    setRateLimitState(null);
    return { success: true };
  }, []);

  const clearRateLimit = useCallback(() => {
    setRateLimitState(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, login, loginWithGoogle, logout, signup, switchRole,
      loading, rateLimitState, clearRateLimit
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
