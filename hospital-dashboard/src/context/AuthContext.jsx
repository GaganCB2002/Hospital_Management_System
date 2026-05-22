/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const mockUsers = {
  admin: { id: 1, name: 'Dr. Sarah Chen', email: 'admin@curepulse.com', role: 'admin', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQJIUIHFHfCJIzDFlJ4Bgk0QSVaakMbcz3b14A7tVRbyOEkK95GBQDpR8teKmDX8MI_J6rGjNOF3LSoc5nymQNcliaP6QBGDX22yJwByA3Na71tOurxskakin7cAjGdv92ZGXgYx3xR4-zty472G5taDtdVJauw5Jzq5hX4NBRq-AUGZqnPVenbO6hPnkpn8cED53W_ful8j6bPin9vYZTpgN-3I88bJkscCwXWQrzSURGm4XB4g0mTS8qALqLhWd_7V8fkhoOcPU' },
  doctor: { id: 2, name: 'Dr. James Wilson', email: 'doctor@curepulse.com', role: 'doctor', department: 'Pediatrics', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZhxmqKRaPrOltNeEc_TSCcK9lJiZ7FPPGlnxWUIMTDBNjl5pM5g96Ofi_lc5aqmJdeNJzs4xlY93p_LJQzwnm5aV3p8XkIdmVRBoWxDlWpHZgX9Glf1-uapxb9FLJIb3w7j99moSLWojCvTOIjbNXPeL3yetX1Nb6Xe_9JjcLeQavFpduj2qr4oDKEXZjkKVz4pGfnfS9uFiRregPlmAxCB8CQL228VB_ABjNKDsxvnSRI1ZCXWSCsofQSPJ-zVVpeMzHbMlD914' },
  receptionist: { id: 3, name: 'Emily Roberts', email: 'receptionist@curepulse.com', role: 'receptionist', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBRgshxSq7tdb7dT7roAupCOe5VbEBdVCdoHdP-VFqTN8VwpgQ-gEz__pjqlmBrTjvuOgLhsodY_zhYSqFDwD8jdqmdnBeSP7HUHteOfq9eNPU1Txr4HqUfdLRYMt4_7I__sUNpXl7xwLxhtzQOxWdRdHsmAqmWvc2DsJzGORFTSok_BXTzyEgr858jI8VFYKhmN2gLiV_NfzYne5wxJqTcuiib3Q_Amzh-Ufn2amSmY2cONIDE-eFOQVp437MyHqeDm14_NF41rU' },
  patient: { id: 4, name: 'John Doe', email: 'patient@curepulse.com', role: 'patient', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgiJA4B2RDF7E-V0ksZm2xGzg6tppELq-p9QHg2L7AAR1fde4UyrYkAvAnFSVobj7Ax3sWPkn-lctpfZgY0sP3aTNHN4qOqKMGvmOuwkTiew8iTpD1buZ9f2QfOBIxROEmHIcEgyT9VLxTBrexVi1V9YP6NEeeR3ObXzmLT806CT9PVtSdwoONSO83Km6Ks0SDC2Jf7dgRVdQe6iw_r_wTkUuFMCkt-6Xb3fEyjgvm7sk9YsFUJhDJLPP3vLNk6ubhsynael4DSzo' }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('curepulse_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading] = useState(false);

  const login = (email, password, role) => {
    const mockUser = mockUsers[role];
    if (mockUser && password === 'demo123') {
      const userData = { ...mockUser };
      setUser(userData);
      localStorage.setItem('curepulse_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('curepulse_user');
  };

  const switchRole = (newRole) => {
    if (mockUsers[newRole]) {
      const userData = { ...mockUsers[newRole] };
      setUser(userData);
      localStorage.setItem('curepulse_user', JSON.stringify(userData));
    }
  };

  const signup = (userData) => {
    const newUser = {
      id: Date.now(),
      name: `${userData.firstName} ${userData.lastName}`.trim(),
      email: userData.email,
      role: userData.role || 'patient',
      phone: userData.phone,
      age: userData.age,
      gender: userData.gender,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.firstName}`
    };
    if (newUser.role === 'doctor') newUser.department = 'General';
    setUser(newUser);
    localStorage.setItem('curepulse_user', JSON.stringify(newUser));
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, switchRole, loading }}>
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
