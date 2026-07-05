import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Zap, 
  Sparkles,
  CheckSquare,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function LoginPage() {
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUser = params.get('user');
    const error = params.get('error');
    
    if (error) {
      toast.error(error === 'no_credential' ? 'No credential received from Google' : 'Google authentication failed');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlToken && urlUser) {
      try {
        loginWithToken(urlToken, JSON.parse(urlUser));
        toast.success('Successfully authenticated with Google!');
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/dashboard');
      } catch (e) {
        toast.error('Authentication parsing failed');
      }
    }
  }, [loginWithToken, navigate]);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Successfully signed in!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to authenticate. Please check your credentials.');
      setErrors({
        submit: err.response?.data?.message || 'Invalid email or password'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast.success(`Redirecting to ${provider} authentication...`);
    setTimeout(() => {
      navigate('/dashboard');
    }, 800);
  };


  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row relative font-sans overflow-hidden">
      
      {/* LEFT SIDE: METRICS & BRANDING GRAPHIC */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-surface-low relative p-12 flex-col justify-between overflow-hidden border-r border-black/[0.08]">
        
        {/* Branding header */}
        <div className="flex items-center gap-2.5 z-10 cursor-pointer" onClick={() => navigate('/')}>
          <span className="font-bold text-headline-md tracking-tight text-primary">
            Atelier
          </span>
        </div>

        {/* Decorative Glowing Task Checklist Illustration */}
        <div className="my-auto space-y-8 z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full  border border-black/[0.06] text-accent-olive text-label-sm font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-accent-olive animate-pulse" />
              <span>APEX PRODUCTIVITY TELEMETRY</span>
            </div>
            
            <h2 className="text-headline-lg lg:text-[2.25rem] lg:leading-[2.75rem] font-bold text-primary tracking-tight">
              Organize your work. <br />
              Achieve more.
            </h2>
            <p className="text-body-md text-on-surface-var max-w-md font-light leading-relaxed">
              Login to access your digital workspace, collaborate on tasks, track cycle velocity, and focus on deep creation.
            </p>
          </motion.div>

          {/* Animated Checklist Widgets */}
          <div className="space-y-3.5 max-w-sm">
            
            {/* Widget Task 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-4 rounded-lg bg-surface-lowest border border-black/[0.08] flex items-center justify-between shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-accent-olive/10 border border-accent-olive/20 flex items-center justify-center">
                  <CheckSquare className="w-3.5 h-3.5 text-accent-olive" />
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-primary">Core database schema design</p>
                  <p className="text-[10px] text-on-surface-var/60">Updated 10m ago</p>
                </div>
              </div>
              <span className="text-label-xs bg-accent-olive/10 border border-accent-olive/25 text-accent-olive px-2 py-0.5 rounded-full uppercase tracking-wider">Completed</span>
            </motion.div>

            {/* Widget Task 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="p-4 rounded-lg bg-surface-lowest border border-black/[0.08] flex items-center justify-between shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-accent-olive/10 border border-accent-olive/20 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-accent-olive" />
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-primary">Weekly sprint telemetry audit</p>
                  <p className="text-[10px] text-on-surface-var/60">Velocity: 82%</p>
                </div>
              </div>
              <span className="text-label-xs  border border-black/[0.06] text-on-surface-var px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">In Review</span>
            </motion.div>
          </div>
        </div>

        {/* Small branding footer */}
        <p className="text-[11px] text-on-surface-var/40 font-mono z-10">
          © 2026 Atelier Corp. Architectural permanence.
        </p>
      </div>

      {/* RIGHT SIDE: LOGIN FORM CARD */}
      <div className="flex-grow flex items-center justify-center p-6 md:p-12 z-10 bg-surface">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 border border-black/[0.08] bg-surface-lowest shadow-card relative overflow-hidden">
            {isGoogleLoading && (
              <div className="absolute inset-0 bg-surface-lowest/80 backdrop-blur-sm z-50 rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-accent-olive border-t-transparent animate-spin" />
                <span className="text-body-sm font-semibold text-primary">Authenticating with Google...</span>
                <span className="text-[10px] text-on-surface-var/60">Verifying security token</span>
              </div>
            )}
            
            {/* Header */}
            <div className="mb-8">
              <h3 className="text-headline-lg font-bold text-primary tracking-tight">Sign In</h3>
              <p className="text-body-md text-on-surface-var mt-1.5 font-light">
                Enter your credentials to access your workspace.
              </p>
            </div>

            {errors.submit && (
              <div className="mb-6 p-3 rounded bg-error/10 border border-error/20 text-body-sm text-error/95">
                {errors.submit}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Workspace Email"
                placeholder="name@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[38px] text-on-surface-var/50 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Action grid (Remember me / Forgot password) */}
              <div className="flex items-center justify-between text-body-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-black/10 text-primary-container focus:ring-0 w-4 h-4"
                  />
                  <span className="text-on-surface-var/80 font-light">Remember this device</span>
                </label>
                
                <Link
                  to="/forgot-password"
                  className="text-accent-olive hover:text-primary transition-colors font-medium focus:outline-none"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-4"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4.5 h-4.5" />}
              >
                Sign In to Workspace
              </Button>
            </form>

            {/* Social Separator */}
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-black/[0.06]" />
              <span className="flex-shrink mx-4 text-[10px] text-on-surface-var/40 uppercase tracking-widest font-mono">
                or authenticate with
              </span>
              <div className="flex-grow border-t border-black/[0.06]" />
            </div>

            {/* Social logins */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-surface-low hover:bg-surface-high/60 text-on-surface font-semibold text-body-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Link to Signup */}
            <p className="text-center text-xs text-on-surface-var/50 mt-8 font-light">
              Don't have a workspace?{' '}
              <Link to="/signup" className="text-accent-olive hover:text-primary transition-colors font-semibold focus:outline-none">
                Register Workspace
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
