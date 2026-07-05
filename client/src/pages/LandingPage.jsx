import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, CheckSquare, BarChart3, Calendar, Sparkles, Timer, Layers, ArrowUpRight } from 'lucide-react';
import Button from '../components/ui/Button';

export default function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' });

  const features = [
    {
      icon: <CheckSquare className="w-5 h-5" />,
      title: "Task Management",
      description: "Structured workflows designed to handle complex projects without visual clutter.",
      stat: "4 views",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Analytics",
      description: "High-density data views tailored for immediate comprehension and deep insight.",
      stat: "Live data",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Calendar",
      description: "Architect your time with precision scheduling and seamless integration.",
      stat: "Synced",
    },
    {
      icon: <Timer className="w-5 h-5" />,
      title: "Focus Mode",
      description: "Eliminate noise. A dedicated Pomodoro environment for deep work sessions.",
      stat: "25 min",
      bright: true,
    },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '<50ms', label: 'Latency' },
    { value: '256-bit', label: 'Encryption' },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans antialiased selection:bg-accent-olive/20 selection:text-accent-olive">

      {/* ──── NAVIGATION ──── */}
      <header className="bg-surface/70 backdrop-blur-xl sticky top-0 w-full z-50 border-b border-black/[0.06]">
        <nav className="flex justify-between items-center max-w-5xl mx-auto px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-headline-sm font-bold tracking-tight text-primary">Atelier</span>
          </div>

          <div className="hidden md:flex gap-8 text-body-sm text-on-surface-var font-medium">
            <a className="hover:text-primary transition-colors cursor-pointer" href="#manifesto">Manifesto</a>
            <a className="hover:text-primary transition-colors cursor-pointer" href="#features">Tools</a>
            <a className="hover:text-primary transition-colors cursor-pointer" href="#cta">Pricing</a>
          </div>

          <div className="flex gap-3 items-center">
            <Link
              to="/login"
              className="text-label-sm text-on-surface-var hover:text-primary transition-colors font-medium px-3 py-1.5"
            >
              Sign In
            </Link>
            <button
              onClick={() => navigate('/signup')}
              className="bg-primary-container text-white px-4 py-2 rounded-lg text-label-sm font-semibold hover:opacity-90 transition-all active:scale-[0.97] shadow-sm"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* ──── MAIN ──── */}
      <main className="flex-grow">

        {/* ─── HERO ─── */}
        <section id="manifesto" className="relative overflow-hidden">
          {/* Ambient accent glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-olive/[0.04] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-olive/[0.03] rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-accent-olive/[0.08] border border-accent-olive/[0.12] rounded-full px-4 py-1.5 mb-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent-olive animate-pulse" />
              <span className="text-label-xs uppercase tracking-widest text-accent-olive font-bold">Premium Productivity</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[2.75rem] md:text-[4rem] leading-[1.05] text-primary font-bold tracking-tight max-w-3xl"
            >
              Organize your work.
              <br />
              <span className="text-accent-olive">Achieve more.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-body-lg text-on-surface-var max-w-lg mx-auto font-light leading-relaxed mt-6"
            >
              A digital atelier designed for high-output professionals. Blend utility with editorial sophistication in a workspace built for permanence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mt-10"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/signup')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Free Trial
              </Button>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 border border-black/[0.1] dark:border-white/[0.1] px-6 py-3 rounded-lg text-label-sm font-semibold text-on-surface-var hover:text-primary hover:border-black/[0.2] dark:hover:border-white/[0.2] transition-all active:scale-[0.97]"
              >
                Explore Tools
              </a>
            </motion.div>

            {/* ─── HERO VISUAL: App Preview ─── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-16 w-full max-w-3xl relative group"
            >
              {/* Glowing Border Wrap */}
              <div className="absolute -inset-[1px] bg-gradient-to-b from-accent-olive/20 via-transparent to-transparent rounded-2xl pointer-events-none" />

              <div className="rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] shadow-2xl bg-surface-lowest relative">
                {/* Window Chrome */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.06] bg-surface-low/40">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-surface-container/60 rounded-md px-12 py-1">
                      <span className="text-[10px] font-mono text-on-surface-var/40">atelier.app/dashboard</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Preview */}
                <div className="p-6 md:p-8">
                  <div className="flex gap-6 md:gap-8">
                    {/* Fake Sidebar */}
                    <div className="hidden md:flex flex-col gap-3 w-36">
                      <div className="h-5 w-20 bg-primary/80 rounded" />
                      <div className="h-[1px] bg-black/[0.06] dark:bg-white/[0.06] my-1" />
                      {['Dashboard', 'Tasks', 'Calendar', 'Analytics', 'Focus'].map((item, i) => (
                        <div
                          key={item}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium ${
                            i === 0 ? 'bg-accent-olive/[0.08] text-accent-olive' : 'text-on-surface-var/50'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-sm ${i === 0 ? 'bg-accent-olive/30' : 'bg-black/[0.08] dark:bg-white/[0.08]'}`} />
                          {item}
                        </div>
                      ))}
                    </div>

                    {/* Fake Content */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="h-4 w-28 bg-primary/70 rounded mb-1.5" />
                          <div className="h-2.5 w-40 bg-on-surface-var/20 rounded" />
                        </div>
                        <div className="h-7 w-20 rounded-md bg-accent-olive/15 border border-accent-olive/20" />
                      </div>

                      {/* Stat Cards Row */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Completed', val: '24', color: 'bg-emerald-500/10 text-emerald-600' },
                          { label: 'In Progress', val: '8', color: 'bg-accent-olive/10 text-accent-olive' },
                          { label: 'Focus Time', val: '4.5h', color: 'bg-amber-500/10 text-amber-600' },
                        ].map((s) => (
                          <div key={s.label} className="rounded-lg border border-black/[0.06] dark:border-white/[0.06] p-3 bg-surface-low/20">
                            <div className="text-[10px] text-on-surface-var/50 font-medium mb-1">{s.label}</div>
                            <div className={`text-lg font-bold ${s.color.split(' ')[1]}`}>{s.val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Fake Task List */}
                      <div className="flex flex-col gap-2">
                        {[
                          { title: 'Design system tokens', badge: 'Done', badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
                          { title: 'API integration layer', badge: 'Active', badgeColor: 'bg-accent-olive/10 text-accent-olive border-accent-olive/20' },
                          { title: 'Analytics dashboard', badge: 'Review', badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
                        ].map((t) => (
                          <div key={t.title} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-black/[0.05] dark:border-white/[0.05] bg-surface-lowest/50 hover:border-black/[0.1] transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-3.5 h-3.5 rounded border border-black/[0.12] dark:border-white/[0.12]" />
                              <span className="text-[12px] font-medium text-primary/80">{t.title}</span>
                            </div>
                            <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${t.badgeColor}`}>
                              {t.badge}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── SOCIAL PROOF STRIP ─── */}
        <section className="border-y border-black/[0.06] dark:border-white/[0.06] bg-surface-low/20">
          <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-label-xs uppercase tracking-widest text-on-surface-var/50 font-bold">Engineered for performance</span>
            <div className="flex gap-10 md:gap-16">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center">
                  <span className="text-headline-sm font-bold text-primary tracking-tight">{s.value}</span>
                  <span className="text-label-xs text-on-surface-var/50 uppercase tracking-wider font-medium mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURES BENTO ─── */}
        <section id="features" className="py-20" ref={featuresRef}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="text-label-xs uppercase tracking-widest text-accent-olive font-bold">Core Tools</span>
              <h2 className="text-headline-lg md:text-display-sm text-primary font-bold tracking-tight mt-3">
                Everything you need,<br />nothing you don't.
              </h2>
              <p className="text-body-md text-on-surface-var max-w-md mx-auto font-light leading-relaxed mt-4">
                Each module is purpose-built for clarity and speed, designed to remove friction from your daily workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {features.map((feat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 24 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`group relative rounded-xl p-6 border transition-all duration-300 hover:shadow-card-hover cursor-default overflow-hidden ${
                    feat.bright
                      ? 'bg-accent-olive/[0.04] border-accent-olive/[0.12] hover:border-accent-olive/30'
                      : 'bg-surface-lowest border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.15] dark:hover:border-white/[0.15]'
                  }`}
                >
                  {/* Hover glow */}
                  {feat.bright && (
                    <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-accent-olive/[0.06] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        feat.bright
                          ? 'bg-accent-olive/[0.12] text-accent-olive'
                          : 'bg-surface-container/60 text-on-surface-var'
                      }`}>
                        {feat.icon}
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${
                        feat.bright
                          ? 'border-accent-olive/20 text-accent-olive bg-accent-olive/[0.06]'
                          : 'border-black/[0.06] dark:border-white/[0.06] text-on-surface-var/40 bg-surface-low/30'
                      }`}>
                        {feat.stat}
                      </span>
                    </div>
                    <h3 className="text-headline-md text-primary font-bold mb-2">{feat.title}</h3>
                    <p className="text-body-sm text-on-surface-var leading-relaxed">{feat.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section id="cta" className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-olive/[0.02] to-accent-olive/[0.04] pointer-events-none" />
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-surface-lowest p-10 md:p-16 text-center relative overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-accent-olive/15 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-accent-olive/15 rounded-br-2xl" />

              <span className="text-label-xs uppercase tracking-widest text-accent-olive font-bold">Get Started</span>
              <h3 className="text-headline-lg md:text-display-sm text-primary font-bold tracking-tight mt-4 max-w-lg mx-auto">
                Ready to streamline your execution?
              </h3>
              <p className="text-body-md text-on-surface-var max-w-sm mx-auto mt-4 font-light leading-relaxed">
                Register your digital atelier today and plan your tasks with editorial quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/signup')}
                  rightIcon={<ArrowUpRight className="w-4 h-4" />}
                >
                  Claim Your Workspace
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ──── FOOTER ──── */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.06] bg-surface-low/20">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-container flex items-center justify-center">
              <Layers className="w-3 h-3 text-white" />
            </div>
            <span className="text-body-md font-bold text-on-surface-var">Atelier</span>
          </div>
          <div className="text-label-xs uppercase tracking-widest text-on-surface-var/40 font-medium">
            © 2026 Atelier. Built for professionals.
          </div>
          <div className="flex gap-6 text-label-xs uppercase tracking-widest text-on-surface-var/60 font-medium">
            <a className="hover:text-primary transition-colors cursor-pointer">Privacy</a>
            <a className="hover:text-primary transition-colors cursor-pointer">Terms</a>
            <a className="hover:text-primary transition-colors cursor-pointer">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
