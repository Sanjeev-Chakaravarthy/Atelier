import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, ShieldAlert } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, { password });
      toast.success('Password updated successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to reset password. Link may be invalid or expired.');
      setErrors({
        submit: err.response?.data?.message || 'Invalid or expired password reset link'
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
          {/* Header */}
          <div className="mb-8 text-center">
            <h3 className="text-headline-lg font-bold text-primary tracking-tight">Set New Password</h3>
            <p className="text-body-md text-on-surface-var mt-1.5 font-light">
              Enter your new credentials below to restore access.
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
            <div className="relative">
              <Input
                label="New Password"
                placeholder="Minimum 8 characters"
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

            <Input
              label="Confirm New Password"
              placeholder="Re-enter password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              leftIcon={<Lock className="w-4 h-4" />}
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
              Reset Password
            </Button>
          </form>

          {/* Back to Login Link */}
          <p className="text-center text-xs text-on-surface-var/50 mt-8 font-light">
            Remembered your password?{' '}
            <Link to="/login" className="text-accent-olive hover:text-primary transition-colors font-semibold focus:outline-none">
              Back to Sign In
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
