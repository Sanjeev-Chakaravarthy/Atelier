import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FocusProvider } from './context/FocusContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import FocusPage from './pages/FocusPage';
import AccountPage from './pages/AccountPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false },
  },
});

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AppLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AppLoader />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// App Loading screen
const AppLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-surface">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-20 animate-ping" />
        <div className="relative w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  </div>
);

function AppRoutes() {
  const { user } = useAuth();

  useEffect(() => {
    const activeTheme = user?.theme || 'light';
    if (activeTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [user?.theme]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
      <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

      {/* Protected App */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/focus" element={<ProtectedRoute><FocusPage /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    const savedAccent = localStorage.getItem('atelier_accent') || 'terracotta';
    const presets = {
      olive: { accent: '102, 122, 82', light: '119, 139, 98', bg: '230, 232, 227' },
      graphite: { accent: '51, 51, 51', light: '85, 85, 85', bg: '240, 240, 240' },
      indigo: { accent: '82, 102, 122', light: '98, 119, 139', bg: '227, 230, 232' },
      terracotta: { accent: '163, 102, 82', light: '180, 119, 98', bg: '245, 235, 230' }
    };
    const colors = presets[savedAccent] || presets.terracotta;
    document.documentElement.style.setProperty('--color-accent', colors.accent);
    document.documentElement.style.setProperty('--color-accent-light', colors.light);
    document.documentElement.style.setProperty('--color-accent-bg', colors.bg);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FocusProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#171f33',
                  color: '#dae2fd',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  fontSize: '14px',
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: { primary: '#22C55E', secondary: '#171f33' },
                },
                error: {
                  iconTheme: { primary: '#ffb4ab', secondary: '#171f33' },
                },
              }}
            />
          </BrowserRouter>
        </FocusProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
