import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, Brain, Target } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useFocus } from '../context/FocusContext';
import { useAuth } from '../context/AuthContext';

export const FocusPage = () => {
  const { user } = useAuth();
  const {
    mode,
    timeLeft,
    isActive,
    selectedTask,
    tasks,
    focusStats,
    presets,
    toggleTimer,
    resetTimer,
    changeMode,
    isAlarmRinging,
    dismissAlarm,
    bindTask,
    refreshTasks,
  } = useFocus();

  useEffect(() => {
    refreshTasks();
    if (user?.notifications?.push && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageLayout title="Focus Space">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Title */}
        <div>
          <h1 className="text-headline-md font-bold text-on-surface">Focus Space</h1>
          <p className="text-body-sm text-on-surface-var/60 mt-1">
            Eliminate distractions. A dedicated digital workspace designed for deep work.
          </p>
        </div>

        {/* Active alarm dismiss box */}
        {isAlarmRinging && (
          <div className="w-full bg-error/10 border border-error/20 p-4 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-error animate-ping" />
              <p className="text-body-sm font-bold text-error">
                Focus session complete! Alarm is ringing...
              </p>
            </div>
            <button
              onClick={dismissAlarm}
              className="bg-error hover:bg-error/90 text-white text-[11px] uppercase tracking-wider font-extrabold py-1.5 px-4 rounded-lg shadow-sm active:scale-95 transition-all focus:outline-none"
            >
              Stop Alarm
            </button>
          </div>
        )}

        {/* Pomodoro Timer Bento Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Main Timer (col-span-7) */}
          <Card className="md:col-span-7 p-8 flex flex-col items-center justify-center text-center bg-surface-lowest shadow-sm border border-black/[0.08] dark:border-white/[0.08]">
            
            {/* Presets Selectors */}
            <div className="flex gap-2 mb-8 bg-surface-low p-1 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
              {Object.keys(presets).map((p) => (
                <button
                  key={p}
                  onClick={() => changeMode(p)}
                  className={`px-4 py-1.5 rounded-lg text-label-xs font-bold uppercase tracking-wider transition-all ${
                    mode === p
                      ? 'bg-surface-lowest text-primary shadow-sm font-extrabold'
                      : 'text-on-surface-var/60 hover:text-on-surface'
                  }`}
                >
                  {p.replace(/([A-Z])/g, ' $1')}
                </button>
              ))}
            </div>

            {/* Circular Timer Visual Representation */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(var(--color-black), 0.05)" strokeWidth="1.5" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  stroke="rgb(var(--color-accent))" 
                  strokeWidth="1.5" 
                  strokeDasharray="100" 
                  strokeDashoffset={100 - (timeLeft / presets[mode]) * 100}
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[4rem] font-bold text-primary tracking-tight leading-none">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-label-xs text-on-surface-var/60 uppercase tracking-widest mt-2">
                  {mode === 'pomodoro' ? 'Deep Work' : 'Refuel Break'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <Button
                variant={isActive ? 'secondary' : 'primary'}
                onClick={toggleTimer}
                leftIcon={isActive ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5" />}
                className="px-8"
              >
                {isActive ? 'Pause' : 'Start Session'}
              </Button>
              <Button
                variant="secondary"
                onClick={resetTimer}
                leftIcon={<RotateCcw className="w-4.5 h-4.5" />}
              />
            </div>

          </Card>

          {/* Configuration and Stats (col-span-5) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* Target task selection */}
            <Card className="p-6 bg-surface-lowest shadow-sm border border-black/[0.08] dark:border-white/[0.08]">
              <h3 className="text-body-lg font-bold text-primary mb-2 flex items-center gap-2">
                <Target className="w-4.5 h-4.5 text-accent-olive" />
                <span>Target Focus Objective</span>
              </h3>
              <p className="text-body-sm text-on-surface-var/60 mb-4 font-light leading-relaxed">
                Bind this focus timer block to a specific active task to log productivity rhythms.
              </p>

              <select
                value={selectedTask}
                onChange={(e) => bindTask(e.target.value)}
                className="select-base bg-surface-low/30 border border-black/[0.08] dark:border-white/[0.08] text-primary focus:ring-accent-olive"
              >
                <option value="" className="bg-surface-lowest text-on-surface-var/60">
                  General Focus (No task selected)
                </option>
                {tasks.map((t) => (
                  <option key={t._id} value={t._id} className="bg-surface-lowest text-primary">
                    {t.title}
                  </option>
                ))}
              </select>
            </Card>

            {/* Focus metrics */}
            <Card className="p-6 flex flex-col gap-4 bg-surface-lowest shadow-sm border border-black/[0.08] dark:border-white/[0.08]">
              <h3 className="text-body-lg font-bold text-primary flex items-center gap-2">
                <Brain className="w-4.5 h-4.5 text-accent-olive" />
                <span>Focus Logs</span>
              </h3>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-4 rounded-xl bg-surface-low/30 border border-black/[0.04] dark:border-white/[0.04] text-center">
                  <span className="text-label-xs text-on-surface-var/50 uppercase tracking-wider block font-mono">Sessions Finished</span>
                  <span className="text-[2rem] font-bold text-primary mt-1 block">{focusStats.sessions}</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-low/30 border border-black/[0.04] dark:border-white/[0.04] text-center">
                  <span className="text-label-xs text-on-surface-var/50 uppercase tracking-wider block font-mono">Time Focused</span>
                  <span className="text-[2rem] font-bold text-accent-olive mt-1 block">{focusStats.time}m</span>
                </div>
              </div>
            </Card>

          </div>

        </div>

      </div>
    </PageLayout>
  );
};

export default FocusPage;
