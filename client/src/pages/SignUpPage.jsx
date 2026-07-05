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

  useEffect(() => {
    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    let isMounted = true;
    let intervalId = null;

    console.log('SignUpPage: Starting Google OAuth script loader effect.');

    const handleGoogleCredentialResponse = async (response) => {
      if (!isMounted) return;
      console.log('SignUpPage: Received Google Credential token response.');
      setIsGoogleLoading(true);
      try {
        console.log('SignUpPage: Forwarding credential to backend Google login route.');
        const res = await authAPI.googleLogin({ token: response.credential });
        console.log('SignUpPage: Backend Google login response received. Success:', res?.data?.success);
        if (isMounted && res.data && res.data.success) {
          loginWithToken(res.data.token, res.data.user);
          toast.success('Successfully authenticated with Google!');
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('SignUpPage: Backend Google login request failed.', err);
        if (isMounted) {
          toast.error(err.response?.data?.message || 'Google authentication failed');
          setIsGoogleLoading(false);
        }
      }
    };

    const renderGoogleButton = () => {
      const btnElement = document.getElementById('google-signup-btn');
      console.log('SignUpPage: renderGoogleButton check. btnElement found:', !!btnElement, 'window.google found:', !!window.google);
      if (window.google && btnElement) {
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '634188935234-vk4f32hhuonhjomn9bll58tqbi2qucck.apps.googleusercontent.com';
        console.log('SignUpPage: Initializing Google Identity with Client ID:', googleClientId);
        
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            ux_mode: 'popup', // explicitly enforce popup mode
            cancel_on_tap_outside: true
          });
          
          console.log('SignUpPage: Rendering Google Identity Button on DOM element.');
          window.google.accounts.id.renderButton(
            btnElement,
            { theme: 'outline', size: 'large', width: '380' }
          );
          console.log('SignUpPage: Google Identity Button rendered successfully.');
          return true;
        } catch (err) {
          console.error('SignUpPage: Error rendering Google button:', err);
        }
      }
      return false;
    };

    const handleScriptLoad = () => {
      if (!isMounted) return;
      console.log('SignUpPage: Google GSI Script loaded.');
      const rendered = renderGoogleButton();
      if (!rendered) {
        console.log('SignUpPage: DOM element not ready on script load, setting poll interval.');
        intervalId = setInterval(() => {
          if (renderGoogleButton()) {
            console.log('SignUpPage: Google button rendered during script load poll. Clearing interval.');
            clearInterval(intervalId);
          }
        }, 100);
      }
    };

    if (!script) {
      console.log('SignUpPage: Creating Google GSI script element.');
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else {
      console.log('SignUpPage: Google GSI script already present in document.');
    }

    script.addEventListener('load', handleScriptLoad);

    // If script is already loaded
    if (window.google) {
      console.log('SignUpPage: window.google already defined on mount.');
      const rendered = renderGoogleButton();
      if (!rendered) {
        console.log('SignUpPage: DOM element not ready on mount, setting poll interval.');
        intervalId = setInterval(() => {
          if (renderGoogleButton()) {
            console.log('SignUpPage: Google button rendered during mount poll. Clearing interval.');
            clearInterval(intervalId);
          }
        }, 100);
      }
    }

    return () => {
      console.log('SignUpPage: Cleaning up Google OAuth script loader effect.');
      isMounted = false;
      if (script) {
        script.removeEventListener('load', handleScriptLoad);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loginWithToken, navigate]);

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
              <div 
                id="google-signup-btn" 
                className="w-full flex justify-center min-h-[40px] [&>div]:w-full"
              />
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
