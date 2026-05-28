import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { capturePageView, updateVisitorUser } from '../services/visitorTracker';
import { useAuth } from '../context/AuthContext';

export function useVisitorTracker() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    capturePageView(location.pathname, user);
  }, [location.pathname, user]);

  useEffect(() => {
    if (user) {
      updateVisitorUser(user);
    }
  }, [user]);
}
