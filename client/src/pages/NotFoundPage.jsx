import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Rocket, Orbit, AlertCircle, Compass, Zap } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Animation configuration
  const orbitTransition = {
    loop: Infinity,
    ease: "linear",
    duration: 10
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* BACKGROUND DECORATIVE ORBITS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-black/[0.08] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-black/[0.08] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-black/[0.08] pointer-events-none" />

      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] rounded-full bg-cyan/10 blur-[130px] pointer-events-none" />

      {/* Floating stars */}
      <div className="absolute top-[15%] right-[25%] w-1.5 h-1.5 bg-cyan rounded-full animate-pulse" />
      <div className="absolute bottom-[30%] left-[15%] w-1 h-1 bg-primary rounded-full animate-ping" />
      <div className="absolute top-[60%] left-[30%] w-2 h-2 bg-white/20 rounded-full animate-pulse-soft" />

      {/* MAIN CONTAINER */}
      <div className="max-w-xl text-center z-10 flex flex-col items-center">
        
        {/* Animated Planet Orbit Illustration */}
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          
          {/* Outer Orbit Line & Particle */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={orbitTransition}
            className="absolute w-44 h-44 rounded-full border border-dashed border-black/10"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-cyan shadow-glow-cyan" />
          </motion.div>

          {/* Inner Orbit Line & Particle */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ ...orbitTransition, duration: 16 }}
            className="absolute w-28 h-28 rounded-full border border-dashed border-black/5"
          >
            <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary-container shadow-glow" />
          </motion.div>

          {/* Core Planet (The Task OS node) */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow border border-white/15"
          >
            <Zap className="w-10 h-10 text-white animate-pulse" />
          </motion.div>

          {/* Ring representing standard telemetry error */}
          <div className="absolute w-36 h-6 rounded-full border border-black/15 skew-y-12 rotate-12 bg-white/[0.01] pointer-events-none" />
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error/10 border border-error/20 text-error text-label-sm font-semibold mb-6">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>ERROR 404: COORDINATES UNRESOLVED</span>
        </div>

        {/* Header */}
        <h1 className="text-display-lg font-bold text-white tracking-tight mb-4">
          Lost in orbit.
        </h1>
        
        {/* Description */}
        <p className="text-body-md text-on-surface-var/70 font-light leading-relaxed mb-10 max-w-md">
          The task telemetry coordinates you requested do not exist or have been decommissioned from the active Workspace cluster.
        </p>

        {/* Action Button */}
        <div className="flex gap-4">
          <Button 
            variant="secondary"
            size="lg"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back Track
          </Button>
          
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
            rightIcon={<Compass className="w-4 h-4 text-white" />}
          >
            {isAuthenticated ? 'Return to Dashboard' : 'Back to Command Center'}
          </Button>
        </div>

      </div>

    </div>
  );
}
