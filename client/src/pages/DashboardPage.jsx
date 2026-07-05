import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Clock, AlertTriangle, Plus, Sparkles, 
  CheckSquare, Activity, MoreHorizontal, User, Play,
  StickyNote, CheckCircle2, ChevronRight, Check
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';
import Tooltip from '../components/ui/Tooltip';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [todayTasks, setTodayTasks] = useState([]);
  const [recentlyCompleted, setRecentlyCompleted] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState(() => localStorage.getItem('nexus_quick_notes') || '');
  const [rhythmMode, setRhythmMode] = useState('week'); // week, month
  
  // Weekly overview stats
  const [weeklyOverview, setWeeklyOverview] = useState({ completed: 0, total: 0, percent: 0 });
  const [focusTime, setFocusTime] = useState('0h 0m');
  const [rhythmData, setRhythmData] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, overviewRes, activityRes, velocityRes] = await Promise.allSettled([
        tasksAPI.getAll({ limit: 100 }),
        analyticsAPI.getOverview(),
        analyticsAPI.getActivity(),
        analyticsAPI.getVelocity(30)
      ]);

      let allTasks = [];
      if (tasksRes.status === 'fulfilled' && tasksRes.value.data?.tasks) {
        allTasks = tasksRes.value.data.tasks;
        
        // 1. Today's active tasks (todo / in-progress)
        const activeTasks = allTasks.filter(t => t.status === 'todo' || t.status === 'in-progress');
        const mappedToday = activeTasks.slice(0, 3).map((t, idx) => {
          let timeStr = '12:00 PM';
          if (t.dueDate) {
            const dateObj = new Date(t.dueDate);
            timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else {
            const times = ['10:00 AM', '1:30 PM', '3:00 PM'];
            timeStr = times[idx] || '4:00 PM';
          }
          return {
            _id: t._id,
            title: t.title,
            time: timeStr,
            completed: false
          };
        });
        setTodayTasks(mappedToday);

        // 2. Recently Completed (done)
        const completedTasks = allTasks.filter(t => t.status === 'done');
        const mappedCompleted = completedTasks.slice(0, 2).map(t => ({
          _id: t._id,
          title: t.title,
          completed: true
        }));
        setRecentlyCompleted(mappedCompleted);

        // 3. Upcoming Deadlines (not done, sorted by priority and date)
        const notDone = allTasks.filter(t => t.status !== 'done');
        const sortedDeadlines = [...notDone].sort((a, b) => {
          if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
          if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
          if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
          return 0;
        });
        
        const mappedDeadlines = sortedDeadlines.slice(0, 2).map(t => {
          let dueLabel = 'Friday';
          if (t.dueDate) {
            const diffTime = new Date(t.dueDate) - new Date();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0) dueLabel = 'Today';
            else if (diffDays === 1) dueLabel = 'Tomorrow';
            else dueLabel = new Date(t.dueDate).toLocaleDateString([], { weekday: 'long' });
          } else {
            dueLabel = t.priority === 'urgent' ? 'ASAP' : 'Soon';
          }
          return {
            _id: t._id,
            title: t.title,
            due: dueLabel,
            urgent: t.priority === 'urgent' || t.priority === 'high'
          };
        });
        setDeadlines(mappedDeadlines);

        // 4. Focus Time
        const totalFocusMinutes = allTasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);
        const hrs = Math.floor(totalFocusMinutes / 60);
        const mins = totalFocusMinutes % 60;
        setFocusTime(`${hrs}h ${mins}m`);
      }

      // 5. Weekly Overview Stats
      if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.overview) {
        const { done = 0, total = 0, completionRate = 0 } = overviewRes.value.data.overview;
        setWeeklyOverview({
          completed: done,
          total,
          percent: total > 0 ? completionRate : 0
        });
      }

      // 6. Recent Activity Stream
      if (activityRes.status === 'fulfilled' && activityRes.value.data?.activity) {
        const rawActivity = activityRes.value.data.activity;
        const mappedActivity = rawActivity.slice(0, 3).map((act, idx) => {
          let detailStr = '';
          if (act.action === 'created') detailStr = `Created task "${act.taskTitle}"`;
          else if (act.action === 'status_changed') detailStr = `Changed status of "${act.taskTitle}" to "${act.status}"`;
          else if (act.action === 'comment_added') detailStr = `Added comment to "${act.taskTitle}"`;
          else detailStr = `${act.action.replace('_', ' ')} on "${act.taskTitle}"`;

          let relTime = 'Just now';
          if (act.createdAt) {
            const diffMs = new Date() - new Date(act.createdAt);
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHrs = Math.floor(diffMins / 60);
            if (diffMins < 60) relTime = `${Math.max(1, diffMins)} mins ago`;
            else if (diffHrs < 24) relTime = `${diffHrs} hours ago`;
            else relTime = new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
          }

          return {
            id: idx,
            text: detailStr,
            time: relTime,
            active: idx === 0
          };
        });
        
        setActivities(mappedActivity);
      }

      // 7. Productivity Rhythms
      if (velocityRes.status === 'fulfilled' && velocityRes.value.data?.velocity) {
        setRhythmData(velocityRes.value.data.velocity);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleTask = async (taskId) => {
    setTodayTasks(prev => prev.map(t => t._id === taskId ? { ...t, completed: !t.completed } : t));
    
    try {
      const task = todayTasks.find(t => t._id === taskId);
      if (task) {
        await tasksAPI.update(taskId, { status: 'done' });
        toast.success(`"${task.title}" completed!`);
        fetchDashboardData(); // Refresh all panels with fresh DB metrics
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem('nexus_quick_notes', val);
  };

  // Generate dynamic mockup rhythm data mapped directly from velocity endpoint
  const getRhythmBars = () => {
    const size = rhythmMode === 'week' ? 12 : 30;
    const sliced = rhythmData.slice(-size);
    
    while (sliced.length < size) {
      // Fill placeholders with relative mockup heights if data points are empty
      const placeholderHeight = 15 + (sliced.length % 3) * 12;
      sliced.unshift({ date: '', completed: 0, created: 0, height: placeholderHeight });
    }

    const maxCompleted = Math.max(...sliced.map(d => d.completed), 1);

    return sliced.map((d, idx) => {
      let height = d.height;
      if (height === undefined) {
        const score = d.completed * 35 + d.created * 15;
        height = Math.min(95, Math.max(15, score === 0 ? (16 + (idx % 4) * 8) : score));
      }

      let type = 'grey';
      if (d.completed > 0) {
        type = d.completed === maxCompleted ? 'olive-dark' : 'olive-light';
      } else if (d.created > 0) {
        type = 'olive-light';
      }

      return { 
        height, 
        type, 
        date: d.date, 
        completed: d.completed, 
        created: d.created 
      };
    });
  };

  const rhythmBars = getRhythmBars();

  return (
    <PageLayout title="Dashboard">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        
        {/* Good Morning Header Section */}
        <section className="flex flex-col gap-1.5">
          <h2 className="text-[40px] leading-tight text-primary font-bold tracking-tight">
            Good Morning, {user?.name || 'Sanjeev'}
          </h2>
          <p className="text-body-lg text-on-surface-var/80 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-olive shadow-glow" />
            You completed <span className="font-semibold">{weeklyOverview.completed}</span> of <span className="font-semibold">{weeklyOverview.total}</span> planned tasks this week.
          </p>
        </section>

        {/* TOP ROW: Weekly Progress, Today's Tasks, Focus Time & Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* WEEKLY PROGRESS Bento */}
          <div className="lg:col-span-5 card p-6 bg-surface-lowest flex flex-col justify-between overflow-hidden group hover:shadow-card-hover transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-label-xs text-on-surface-var/60 uppercase tracking-widest font-mono">Weekly Progress</h3>
                <p className="text-[36px] font-bold text-primary mt-1">{weeklyOverview.percent}%</p>
              </div>
              <span className="p-2 bg-accent-olive/10 rounded-full text-accent-olive">
                <TrendingUp className="w-5 h-5" />
              </span>
            </div>
            
            {/* Custom Abstract Bars */}
            <div className="flex items-end gap-2 h-20 mt-auto">
              <div className="w-full bg-surface-low rounded-t-[2px] h-[30%] hover:bg-surface-high transition-all" />
              <div className="w-full bg-surface-low rounded-t-[2px] h-[45%] hover:bg-surface-high transition-all" />
              <div className="w-full bg-surface-low rounded-t-[2px] h-[20%] hover:bg-surface-high transition-all" />
              <div className="w-full bg-accent-olive rounded-t-[2px] h-[72%] relative shadow-glow">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Today</div>
              </div>
              <div className="w-full bg-surface-low rounded-t-[2px] h-[10%] hover:bg-surface-high transition-all" />
            </div>
          </div>

          {/* TODAY'S TASKS Bento */}
          <div className="lg:col-span-4 card p-6 bg-surface-lowest flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-label-xs text-on-surface-var/60 uppercase tracking-widest font-mono">Today's Tasks</h3>
              <button className="text-on-surface-var/60 hover:text-primary transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col gap-4">
              {todayTasks.map((t) => (
                <div key={t._id} className="flex items-center justify-between py-1 group">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleTask(t._id)}
                      className="w-5 h-5 rounded-full border border-outline/50 flex items-center justify-center hover:border-accent-olive hover:bg-accent-olive/5 transition-all"
                    >
                      {t.completed && <Check className="w-3 h-3 text-accent-olive" />}
                    </button>
                    <span className="text-body-sm font-medium text-primary line-clamp-1">{t.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-on-surface-var/50 bg-surface-low border border-black/[0.04] px-2 py-0.5 rounded-sm">
                    {t.time}
                  </span>
                </div>
              ))}
              {todayTasks.length === 0 && (
                <div className="flex-grow flex items-center justify-center py-6 text-on-surface-var/40 text-body-sm">
                  All done for today!
                </div>
              )}
            </div>
          </div>

          {/* FOCUS TIME & DEADLINES Bento */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* FOCUS TIME */}
            <div className="card p-5 bg-surface-lowest flex justify-between items-center hover:shadow-card-hover transition-all duration-200 cursor-pointer" onClick={() => navigate('/focus')}>
              <div>
                <h3 className="text-label-xs text-on-surface-var/60 uppercase tracking-widest font-mono">Focus Time</h3>
                <p className="text-[28px] font-bold text-primary mt-1">{focusTime}</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-black/[0.08] flex items-center justify-center text-on-surface-var/60 hover:text-accent-olive hover:border-accent-olive/40 hover:bg-accent-olive/5 transition-all">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* UPCOMING DEADLINES */}
            <div className="card p-5 bg-surface-lowest flex-grow flex flex-col justify-between">
              <h3 className="text-label-xs text-on-surface-var/60 uppercase tracking-widest font-mono mb-3">Upcoming Deadlines</h3>
              <div className="space-y-3 flex-1">
                {deadlines.map((d) => (
                  <div key={d._id} className="flex justify-between items-start">
                    <div>
                      <h4 className="text-body-sm font-semibold text-primary line-clamp-1">{d.title}</h4>
                      <p className={`text-[10px] mt-0.5 font-bold uppercase tracking-wider ${d.urgent ? 'text-error' : 'text-on-surface-var/50'}`}>{d.due}</p>
                    </div>
                    {d.urgent && <AlertTriangle className="w-4 h-4 text-on-surface-var/60 mt-0.5" />}
                  </div>
                ))}
                {deadlines.length === 0 && (
                  <p className="text-on-surface-var/40 text-body-sm py-4">No upcoming deadlines.</p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* MIDDLE ROW: Recent Activity & Recently Completed + Quick Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* RECENT ACTIVITY Timeline */}
          <div className="lg:col-span-7 card p-6 bg-surface-lowest flex flex-col justify-between">
            <div>
              <h3 className="text-label-xs text-on-surface-var/60 uppercase tracking-widest font-mono mb-4">Recent Activity</h3>
              <div className="relative pl-5 space-y-6 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-black/[0.06]">
                {activities.map((act) => (
                  <div key={act.id} className="relative flex flex-col">
                    <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border border-surface ${act.active ? 'bg-accent-olive shadow-glow' : 'bg-outline-variant/60'}`} />
                    <p className="text-body-sm text-primary leading-tight font-medium">{act.text}</p>
                    <span className="text-[10px] text-on-surface-var/40 font-mono mt-1">{act.time}</span>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-on-surface-var/40 text-body-sm py-4 pl-1">No recent workspace activity.</p>
                )}
              </div>
            </div>
            
            <div className="border-t border-black/[0.04] pt-4 mt-6 flex justify-between items-center text-label-xs text-on-surface-var/50">
              <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-accent-olive" /> Activity stream active</span>
              <button onClick={() => navigate('/analytics')} className="hover:text-primary transition-colors flex items-center">View stream details <ChevronRight className="w-3 h-3" /></button>
            </div>
          </div>

          {/* RECENTLY COMPLETED & QUICK NOTES */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Recently Completed */}
            <div className="card p-5 bg-surface-lowest flex-1 flex flex-col justify-between">
              <h3 className="text-label-xs text-on-surface-var/60 uppercase tracking-widest font-mono mb-4">Recently Completed</h3>
              <div className="space-y-3.5 flex-1">
                {recentlyCompleted.map((c) => (
                  <div key={c._id} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4.5 h-4.5 text-outline-variant" />
                    <span className="text-body-sm line-through text-on-surface-var/40 font-light">{c.title}</span>
                  </div>
                ))}
                {recentlyCompleted.length === 0 && (
                  <p className="text-on-surface-var/40 text-body-sm py-4">No completed tasks yet this sprint.</p>
                )}
              </div>
            </div>

            {/* Quick Notes */}
            <div className="card p-5 bg-surface-lowest">
              <h3 className="text-label-xs text-on-surface-var/60 uppercase tracking-widest font-mono mb-2">Quick Notes</h3>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Jot down quick thoughts..."
                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-body-sm text-on-surface-var placeholder:text-on-surface-var/30 resize-none h-16 min-h-[64px]"
              />
            </div>

          </div>

        </div>

        {/* BOTTOM ROW: PRODUCTIVITY RHYTHMS */}
        <section className="card p-6 bg-surface-lowest flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-label-xs text-on-surface-var/60 uppercase tracking-widest font-mono">Productivity Rhythms</h3>
            
            <div className="flex bg-surface-low border border-black/[0.04] p-0.5 rounded text-[10px] font-semibold uppercase tracking-wider font-mono">
              <button
                onClick={() => setRhythmMode('week')}
                className={`px-3 py-1 rounded transition-all ${
                  rhythmMode === 'week' 
                    ? 'bg-white text-primary border border-black/[0.04] shadow-sm'
                    : 'text-on-surface-var/50 hover:text-primary'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setRhythmMode('month')}
                className={`px-3 py-1 rounded transition-all ${
                  rhythmMode === 'month' 
                    ? 'bg-white text-primary border border-black/[0.04] shadow-sm'
                    : 'text-on-surface-var/50 hover:text-primary'
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Rhythms Bar Chart layout matching mockup */}
          <div className="flex items-end justify-between px-8 md:px-16 h-36 pt-4 border-b border-black/[0.03] dark:border-white/[0.03] relative">
            <div className="absolute left-0 right-0 top-1/2 border-t border-black/[0.03] dark:border-white/[0.03] pointer-events-none" />
            
            {rhythmBars.map((bar, idx) => {
              let barColor = 'bg-[#e5e4de] dark:bg-white/[0.08]'; 
              if (bar.type === 'olive-light') barColor = 'bg-accent-olive-light/60';
              if (bar.type === 'olive-dark') barColor = 'bg-accent-olive shadow-glow';

              const tooltipContent = bar.date ? (
                <div className="text-left font-mono">
                  <p className="text-[10px] text-on-surface-var/50">{moment(bar.date).format('MMM DD, YYYY')}</p>
                  <p className="text-xs font-bold text-emerald mt-0.5">✓ {bar.completed} completed</p>
                  <p className="text-xs font-bold text-accent-olive">+ {bar.created} created</p>
                </div>
              ) : (
                <span className="font-mono text-[10px] text-on-surface-var/40">No activity logged</span>
              );

              return (
                <Tooltip key={idx} content={tooltipContent} position="top" containerClassName="h-full flex items-end">
                  <div 
                    className={`w-[4px] md:w-[6px] rounded-t-full transition-all duration-300 hover:scale-x-125 z-10 cursor-pointer ${barColor}`}
                    style={{ height: `${bar.height}%` }}
                  />
                </Tooltip>
              );
            })}
          </div>
        </section>

      </div>
    </PageLayout>
  );
}
