/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import { safeGetItem, safeRemoveItem, safeSetItem } from '../lib/safeStorage.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'hwe-auth';

const DASHBOARD_BY_ROLE = {
  applicant: '/applicant/dashboard',
  employer: '/employer/dashboard',
  admin: '/admin/dashboard',
};

function getStoredAuth() {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { isAuthenticated: false, role: null, user: null };
  } catch {
    return { isAuthenticated: false, role: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth);

  const login = ({ role, email, fullName }) => {
    const nextAuth = {
      isAuthenticated: true,
      role,
      user: {
        email,
        fullName: fullName || 'User',
      },
    };

    safeSetItem(STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
  };

  const logout = () => {
    safeRemoveItem(STORAGE_KEY);
    setAuth({ isAuthenticated: false, role: null, user: null });
  };

  const value = useMemo(
    () => ({
      ...auth,
      login,
      logout,
      getDefaultRoute: (role = auth.role) => DASHBOARD_BY_ROLE[role] || '/login',
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
