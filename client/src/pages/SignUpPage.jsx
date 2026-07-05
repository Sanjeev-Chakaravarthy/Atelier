import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  User,
  Eye, 
  EyeOff, 
  ArrowRight, 
  Zap, 
  Sparkles,
  CheckCircle,
  Database,
  Building,
  Key,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function SignUpPage() {
  const { register, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  // Password strength parameters
  const [strength, setStrength] = useState({
    score: 0,
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
  });

  useEffect(() => {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    let score = 0;
    if (hasLength) score += 1;
    if (hasUpper) score += 1;
    if (hasLower) score += 1;
    if (hasNumber) score += 1;
    
    setStrength({ score, hasLength, hasUpper, hasLower, hasNumber });
  }, [password]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (strength.score < 3) {
      toast.error('Please increase your password complexity before proceeding.');
      return;
    }

    setIsLoading(true);
    try {
      await register({ name, email, password });
      toast.success('Workspace created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Registration failed. Please check inputs.');
      setErrors({
        submit: err.response?.data?.message || 'Workspace register failed.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    toast.success(`Redirecting to ${provider} OAuth workflow...`);
    setTimeout(() => {
      navigate('/dashboard');
    }, 800);
  };

  const getStrengthLabel = (score) => {
    if (score <= 1) return { text: 'Weak password', color: 'text-error' };
    if (score <= 3) return { text: 'Medium complexity', color: 'text-tertiary' };
    return { text: 'Strong credential', color: 'text-accent-olive' };
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
              <span>APEX PRODUCTIVITY PROVISIONING</span>
            </div>
            
            <h2 className="text-headline-lg lg:text-[2.25rem] lg:leading-[2.75rem] font-bold text-primary tracking-tight">
              Create your workspace. <br />
              Launch your digital atelier.
            </h2>
            <p className="text-body-md text-on-surface-var max-w-md font-light leading-relaxed">
              Provision a structured environment built for high-output engineering. Access dashboard telemetry, tasks, and calendar.
            </p>
          </motion.div>

          {/* Checklist Widget Illustrations */}
          <div className="space-y-3.5 max-w-sm">
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-4 rounded-lg bg-surface-lowest border border-black/[0.08] flex items-center justify-between shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-accent-olive/10 border border-accent-olive/20 flex items-center justify-center">
                  <Database className="w-3.5 h-3.5 text-accent-olive" />
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-primary">Workspace Database Instance</p>
                  <p className="text-[10px] text-on-surface-var/60">Fully isolated container</p>
                </div>
              </div>
              <span className="text-label-xs bg-accent-olive/10 border border-accent-olive/25 text-accent-olive px-2 py-0.5 rounded-full uppercase tracking-wider">Ready</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="p-4 rounded-lg bg-surface-lowest border border-black/[0.08] flex items-center justify-between shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-accent-olive/10 border border-accent-olive/20 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-olive" />
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-primary">Encryption Layer Keys</p>
                  <p className="text-[10px] text-on-surface-var/60">RSA 4096 telemetry sync</p>
                </div>
              </div>
              <span className="text-label-xs  border border-black/[0.06] text-on-surface-var px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Secured</span>
            </motion.div>
          </div>
        </div>

        {/* Small branding footer */}
        <p className="text-[11px] text-on-surface-var/40 font-mono z-10">
          © 2026 Atelier Corp. Architectural permanence.
        </p>
      </div>

      {/* RIGHT SIDE: SIGNUP FORM CARD */}
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
                <span className="text-[10px] text-on-surface-var/60">Creating user workspace</span>
              </div>
            )}
            
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-headline-lg font-bold text-primary tracking-tight">Get Started</h3>
              <p className="text-body-md text-on-surface-var mt-1.5 font-light">
                Initialize your professional workspace today.
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
                label="Full Name"
                placeholder="Sanjeev MS"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

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

              {/* Password complexity details */}
              {password.length > 0 && (
                <div className="p-3 bg-surface-low/50 rounded border border-black/[0.04] space-y-2">
                  <div className="flex justify-between items-center text-label-xs">
                    <span className="font-semibold text-on-surface-var">Strength Score</span>
                    <span className={`${getStrengthLabel(strength.score).color} font-bold`}>
                      {getStrengthLabel(strength.score).text}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          strength.score >= step 
                            ? strength.score >= 3 ? 'bg-accent-olive' : 'bg-tertiary' 
                            : 'bg-black/10'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Criteria checkoff list */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-on-surface-var/70">
                      {strength.hasLength ? <Check className="w-3 h-3 text-accent-olive" /> : <X className="w-3 h-3 text-error" />}
                      <span>8+ Characters</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-on-surface-var/70">
                      {strength.hasUpper ? <Check className="w-3 h-3 text-accent-olive" /> : <X className="w-3 h-3 text-error" />}
                      <span>Uppercase character</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-on-surface-var/70">
                      {strength.hasLower ? <Check className="w-3 h-3 text-accent-olive" /> : <X className="w-3 h-3 text-error" />}
                      <span>Lowercase character</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-on-surface-var/70">
                      {strength.hasNumber ? <Check className="w-3 h-3 text-accent-olive" /> : <X className="w-3 h-3 text-error" />}
                      <span>Numeric character</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-4"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4.5 h-4.5" />}
              >
                Provision Workspace
              </Button>
            </form>

            {/* Social Separator */}
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-black/[0.06]" />
              <span className="flex-shrink mx-4 text-[10px] text-on-surface-var/40 uppercase tracking-widest font-mono">
                or provision with
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

            {/* Link to Login */}
            <p className="text-center text-xs text-on-surface-var/50 mt-8 font-light">
              Already have a workspace?{' '}
              <Link to="/login" className="text-accent-olive hover:text-primary transition-colors font-semibold focus:outline-none">
                Sign In
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
