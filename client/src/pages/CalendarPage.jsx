import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  CalendarDays
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { tasksAPI } from '../services/api';

const localizer = momentLocalizer(moment);

// Custom Toolbar Component
const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };
  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };
  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const label = () => {
    const date = moment(toolbar.date);
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-low border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
        <CalendarDays className="w-4 h-4 text-accent-olive" />
        <span className="text-body-sm font-bold text-primary">
          {date.format('MMMM')} <span className="text-on-surface-var/60 font-light font-mono ml-0.5">{date.format('YYYY')}</span>
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-black/[0.06] dark:border-white/[0.06]">
      {/* Navigation Controls */}
      <div className="flex items-center gap-1 bg-surface-low p-1 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
        <button
          onClick={goToBack}
          type="button"
          className="p-1.5 rounded-lg hover:bg-surface-lowest text-on-surface-var hover:text-primary transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goToCurrent}
          type="button"
          className="px-3.5 py-1.5 text-label-xs font-extrabold rounded-lg hover:bg-surface-lowest text-primary transition-all active:scale-95 mx-0.5 uppercase tracking-wider"
        >
          Today
        </button>
        <button
          onClick={goToNext}
          type="button"
          className="p-1.5 rounded-lg hover:bg-surface-lowest text-on-surface-var hover:text-primary transition-all active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Title Label */}
      <div>
        {label()}
      </div>

      {/* View Switcher */}
      <div className="flex bg-surface-low p-1 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
        {['month', 'week', 'day'].map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => toolbar.onView(view)}
            className={`px-4 py-1.5 rounded-lg text-label-xs font-bold transition-all uppercase tracking-wider ${
              toolbar.view === view
                ? 'bg-surface-lowest text-primary shadow-sm font-extrabold'
                : 'text-on-surface-var hover:text-primary'
            }`}
          >
            {view}
          </button>
        ))}
      </div>
    </div>
  );
};

// Custom Event Component
const CustomEvent = ({ event }) => {
  let priorityBg = 'bg-accent-olive/10 border-accent-olive/20 text-accent-olive';
  let priorityDot = 'bg-accent-olive';

  if (event.priority === 'urgent') {
    priorityBg = 'bg-error/10 border-error/20 text-error';
    priorityDot = 'bg-error';
  } else if (event.priority === 'high') {
    priorityBg = 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400';
    priorityDot = 'bg-amber-500';
  } else if (event.priority === 'low') {
    priorityBg = 'bg-surface-low/80 border-black/[0.06] dark:border-white/[0.06] text-on-surface-var';
    priorityDot = 'bg-on-surface-var/40';
  }

  if (event.status === 'done') {
    priorityBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 line-through opacity-65';
    priorityDot = 'bg-emerald-500';
  }

  return (
    <div className={`flex items-start gap-1.5 p-2 rounded-xl border ${priorityBg} shadow-sm transition-all hover:shadow-md hover:scale-[1.01] overflow-hidden w-full h-full text-left cursor-pointer`}>
      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${priorityDot}`} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold truncate leading-snug">
          {event.title}
        </p>
        {event.description && (
          <p className="text-[9px] text-on-surface-var/60 dark:text-on-surface-var/80 truncate mt-0.5 font-light">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data } = await tasksAPI.getAll();
        if (data && data.tasks && data.tasks.length > 0) {
          setTasks(data.tasks);
        } else {
          setTasks([]);
        }
      } catch (err) {
        console.warn("Failed fetching tasks for calendar", err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const events = tasks.map((task) => {
    const eventDate = task.dueDate ? new Date(task.dueDate) : new Date();
    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000);
    
    return {
      id: task._id,
      title: task.title,
      start: eventDate,
      end: endDate,
      allDay: false,
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      description: task.description || ''
    };
  });

  const handleSelectEvent = (event) => {
    navigate(`/tasks/${event.id}`);
  };

  const upcomingTasks = [...tasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <PageLayout title="Operations Calendar">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Title Block */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline-md font-bold text-on-surface flex items-center gap-2.5">
              <CalendarIcon className="w-6 h-6 text-accent-olive animate-pulse" />
              <span>Time Management Grid</span>
            </h1>
            <p className="text-body-sm text-on-surface-var/60 mt-1">
              Visualize milestone deadlines and schedule sprint phases.
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/tasks')} leftIcon={<Plus className="w-4.5 h-4.5" />}>
            Add Mission
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* UPCOMING SIDEBAR PANEL */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="p-5 border-black/[0.08] dark:border-white/[0.08] bg-surface-lowest shadow-sm">
              <span className="text-label-xs font-extrabold uppercase tracking-wider text-on-surface-var/60 flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-accent-olive" /> Upcoming Deadlines
              </span>

              <div className="space-y-3">
                {upcomingTasks.map((t) => {
                  let indicatorColor = 'bg-accent-olive';
                  let borderTheme = 'border-l-4 border-l-accent-olive';

                  if (t.priority === 'urgent') {
                    indicatorColor = 'bg-error';
                    borderTheme = 'border-l-4 border-l-error';
                  } else if (t.priority === 'high') {
                    indicatorColor = 'bg-amber-500';
                    borderTheme = 'border-l-4 border-l-amber-500';
                  } else if (t.priority === 'low') {
                    indicatorColor = 'bg-on-surface-var/40';
                    borderTheme = 'border-l-4 border-l-on-surface-var/40';
                  }

                  return (
                    <div 
                      key={t._id} 
                      onClick={() => navigate(`/tasks/${t._id}`)}
                      className={`p-3.5 bg-surface-low/10 border border-black/[0.06] dark:border-white/[0.06] rounded-xl hover:border-primary/20 hover:bg-surface-low/30 hover:translate-x-0.5 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col gap-2 ${borderTheme}`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-on-surface-var/60 flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${indicatorColor}`} />
                          {t.priority}
                        </span>
                        <span className="text-[10px] text-on-surface-var/50 font-mono font-medium">
                          {moment(t.dueDate).format('MMM DD')}
                        </span>
                      </div>
                      <h4 className="text-body-xs font-bold text-primary line-clamp-2 leading-snug tracking-tight">
                        {t.title}
                      </h4>
                    </div>
                  );
                })}

                {upcomingTasks.length === 0 && (
                  <div className="text-center py-10 px-4 flex flex-col items-center justify-center border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                    <CalendarIcon className="w-8 h-8 text-on-surface-var/20 mb-3" />
                    <p className="text-body-xs font-semibold text-on-surface-var/60">No upcoming deadlines</p>
                    <p className="text-[10px] text-on-surface-var/40 mt-1">All sprint missions are complete or scheduled.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* MAIN CALENDAR PORT */}
          <div className="lg:col-span-3">
            <Card className="p-6 border-black/[0.08] dark:border-white/[0.08] bg-surface-lowest shadow-sm h-[720px] flex flex-col">
              {loading ? (
                <div className="flex-1 bg-surface-low/50 skeleton rounded-2xl" />
              ) : (
                <Calendar
                  localizer={localizer}
                  events={events}
                  date={currentDate}
                  onNavigate={(date) => setCurrentDate(date)}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ flex: 1 }}
                  onSelectEvent={handleSelectEvent}
                  components={{
                    toolbar: CustomToolbar,
                    event: CustomEvent
                  }}
                  views={['month', 'week', 'day']}
                  className="rbc-calendar"
                  popup
                />
              )}
            </Card>
          </div>

        </div>

      </div>
    </PageLayout>
  );
}
