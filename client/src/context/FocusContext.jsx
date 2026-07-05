import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { tasksAPI, authAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { playAlarmSound } from '../utils/audio';
import toast from 'react-hot-toast';

const FocusContext = createContext(null);

const PRESETS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const FocusProvider = ({ children }) => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [mode, setMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(PRESETS.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [focusStats, setFocusStats] = useState({ sessions: 0, time: 0 });
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);

  const timerRef = useRef(null);
  const alarmIntervalRef = useRef(null);
  const alarmTimeoutRef = useRef(null);

  // Sync focus stats with user profile data
  useEffect(() => {
    if (user) {
      setFocusStats({
        sessions: user.focusSessions || 0,
        time: user.focusTime || 0,
      });
    }
  }, [user]);

  // Load active tasks for dropdown selector
  const loadFocusTasks = async () => {
    if (!isAuthenticated) return;
    try {
      const activeRes = await tasksAPI.getAll({ status: 'todo,in-progress,review' });
      if (activeRes.data && activeRes.data.tasks) {
        setTasks(activeRes.data.tasks);
      }
    } catch (err) {
      console.warn("Failed loading active focus tasks: ", err);
    }
  };

  useEffect(() => {
    loadFocusTasks();
  }, [isAuthenticated]);

  // Timer countdown hook
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            // Handle complete callback asynchronously
            setTimeout(() => {
              handleTimerComplete();
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const dismissAlarm = () => {
    setIsAlarmRinging(false);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
  };

  // Play sound loop when isAlarmRinging becomes true
  useEffect(() => {
    if (isAlarmRinging) {
      const soundSetting = localStorage.getItem('pomodoro_sound') || 'chime';
      if (soundSetting !== 'none') {
        // Play once immediately
        playAlarmSound(soundSetting);
        
        // Loop every 1.5 seconds
        alarmIntervalRef.current = setInterval(() => {
          playAlarmSound(soundSetting);
        }, 1500);

        // Auto stop after 30 seconds
        alarmTimeoutRef.current = setTimeout(() => {
          dismissAlarm();
        }, 30000);
      }
    } else {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      if (alarmTimeoutRef.current) {
        clearTimeout(alarmTimeoutRef.current);
        alarmTimeoutRef.current = null;
      }
    }

    return () => {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
      if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
    };
  }, [isAlarmRinging]);

  const handleTimerComplete = async () => {
    toast.success(mode === 'pomodoro' ? 'Focus session completed! Take a break.' : 'Break ended! Time to focus.');
    
    // Play browser desktop notification if enabled in preferences
    if (user?.notifications?.push && Notification.permission === 'granted') {
      try {
        new Notification(mode === 'pomodoro' ? 'Session Complete!' : 'Break Ended!', {
          body: mode === 'pomodoro' ? 'Focus session completed! Take a break.' : 'Break ended! Time to focus.',
          icon: '/favicon.ico'
        });
      } catch (err) {
        console.warn("Push notification failed to fire:", err);
      }
    }

    // Start continuous alarm ringing (up to 30 seconds)
    setIsAlarmRinging(true);
    
    if (mode === 'pomodoro') {
      const duration = Math.floor(PRESETS.pomodoro / 60);
      const newSessions = (user?.focusSessions || 0) + 1;
      const newTime = (user?.focusTime || 0) + duration;
      
      // Update local state immediately
      setFocusStats({
        sessions: newSessions,
        time: newTime,
      });

      // Update backend user profile
      try {
        const { data } = await authAPI.updateProfile({
          focusSessions: newSessions,
          focusTime: newTime,
        });
        if (data && data.user) {
          updateUser(data.user);
        }
      } catch (err) {
        console.error("Failed to save user focus stats: ", err);
      }

      // Log focus duration to the selected task
      if (selectedTask) {
        try {
          const { data } = await tasksAPI.getById(selectedTask);
          if (data && data.task) {
            const currentActual = data.task.actualMinutes || 0;
            const newActual = currentActual + duration;
            await tasksAPI.update(selectedTask, { actualMinutes: newActual });
            toast.success(`Logged ${duration} focus minutes to task: "${data.task.title}"`);
          }
        } catch (err) {
          console.error("Failed to persist focus minutes: ", err);
        }
      }
    }
  };

  const toggleTimer = () => {
    dismissAlarm();
    setIsActive((prev) => !prev);
  };

  const resetTimer = () => {
    dismissAlarm();
    setIsActive(false);
    setTimeLeft(PRESETS[mode]);
  };

  const changeMode = (newMode) => {
    dismissAlarm();
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(PRESETS[newMode]);
  };

  const bindTask = (taskId) => {
    setSelectedTask(taskId);
  };

  return (
    <FocusContext.Provider
      value={{
        mode,
        timeLeft,
        isActive,
        selectedTask,
        tasks,
        focusStats,
        isAlarmRinging,
        presets: PRESETS,
        toggleTimer,
        resetTimer,
        changeMode,
        bindTask,
        dismissAlarm,
        refreshTasks: loadFocusTasks
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error('useFocus must be used within FocusProvider');
  return ctx;
};
