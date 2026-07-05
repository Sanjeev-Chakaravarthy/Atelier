import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email });
      toast.success(data.message || 'Reset link dispatched!');
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to request reset link.');
      setErrors({
        submit: err.response?.data?.message || 'Failed to request reset link'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 border border-black/[0.08] bg-surface-lowest shadow-card">
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-accent-olive/10 border border-accent-olive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-accent-olive" />
              </div>
              <h3 className="text-headline-md font-bold text-primary tracking-tight">Check your email</h3>
              <p className="text-body-md text-on-surface-var mt-2.5 font-light leading-relaxed">
                If that email address is registered, a password reset link has been dispatched to it.
              </p>
              <div className="mt-8">
                <Link to="/login">
                  <Button variant="primary" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8 text-center">
                <h3 className="text-headline-lg font-bold text-primary tracking-tight">Forgot Password?</h3>
                <p className="text-body-md text-on-surface-var mt-1.5 font-light">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {errors.submit && (
                <div className="mb-6 p-3 rounded bg-error/10 border border-error/20 text-body-sm text-error/95 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                  <span>{errors.submit}</span>
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

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-4"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4.5 h-4.5" />}
                >
                  Send Reset Link
                </Button>
              </form>

              {/* Back to Login Link */}
              <p className="text-center text-xs text-on-surface-var/50 mt-8 font-light">
                Remembered your password?{' '}
                <Link to="/login" className="text-accent-olive hover:text-primary transition-colors font-semibold focus:outline-none">
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
