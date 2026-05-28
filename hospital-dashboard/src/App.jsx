import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { HospitalProvider } from './context/HospitalContext';
import AppRoutes from './routes/AppRoutes';
import AIHelpBot from './components/common/AIHelpBot';
import { Toaster } from 'react-hot-toast';
import { useVisitorTracker } from './hooks/useVisitorTracker';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo';

function VisitorTrackerInit() {
  useVisitorTracker();
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={googleClientId}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <HospitalProvider>
                <VisitorTrackerInit />
                <AppRoutes />
                <Toaster position="top-right" />
                <AIHelpBot />
              </HospitalProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;
