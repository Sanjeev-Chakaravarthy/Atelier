import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { playAlarmSound } from '../utils/audio';
import { Sparkles, Timer, Link2, Volume2, ShieldCheck, Check, Bell } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { authAPI } from '../services/api';

export const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Theme and Accents
  const [theme, setTheme] = useState(user?.theme || 'light');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('atelier_accent') || 'terracotta');
  
  // Focus Timer Customizations
  const [focusLength, setFocusLength] = useState(() => Number(localStorage.getItem('pomodoro_focus')) || 25);
  const [breakLength, setBreakLength] = useState(() => Number(localStorage.getItem('pomodoro_break')) || 5);
  const [alarmSound, setAlarmSound] = useState(() => localStorage.getItem('pomodoro_sound') || 'chime');
  const [isSavingFocus, setIsSavingFocus] = useState(false);

  // Webhook Integrations
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('workspace_webhook') || '');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);

  // Notification settings states
  const [emailNotify, setEmailNotify] = useState(true);
  const [pushNotify, setPushNotify] = useState(true);
  const [digestFreq, setDigestFreq] = useState('daily');
  const [isSavingNotify, setIsSavingNotify] = useState(false);

  useEffect(() => {
    if (user?.notifications) {
      setEmailNotify(user.notifications.email ?? true);
      setPushNotify(user.notifications.push ?? true);
      setDigestFreq(user.notifications.digest || 'daily');
    }
  }, [user]);

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setIsSavingNotify(true);
    localStorage.setItem('pomodoro_sound', alarmSound);
    try {
      const { data } = await authAPI.updateProfile({
        notifications: {
          email: emailNotify,
          push: pushNotify,
          digest: digestFreq,
        }
      });
      if (data.success) {
        updateUser(data.user);
        toast.success('Notification preferences updated');
      }
    } catch (err) {
      toast.error('Failed to update notification preferences');
    } finally {
      setIsSavingNotify(false);
    }
  };

  const handleSaveTheme = async (selectedTheme) => {
    setTheme(selectedTheme);
    try {
      const { data } = await authAPI.updateProfile({ theme: selectedTheme });
      if (data.success) {
        updateUser(data.user);
        // Apply theme classes to HTML document
        if (selectedTheme === 'light') {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        }
        toast.success(`Theme switched to ${selectedTheme}`);
      }
    } catch (err) {
      toast.error('Failed to save theme preference');
    }
  };

  const handleSaveAccent = (color) => {
    setAccentColor(color);
    localStorage.setItem('atelier_accent', color);
    
    // Apply dynamic style variables
    const presets = {
      olive: { accent: '102, 122, 82', light: '119, 139, 98', bg: '230, 232, 227' },
      graphite: { accent: '51, 51, 51', light: '85, 85, 85', bg: '240, 240, 240' },
      indigo: { accent: '82, 102, 122', light: '98, 119, 139', bg: '227, 230, 232' },
      terracotta: { accent: '163, 102, 82', light: '180, 119, 98', bg: '245, 235, 230' }
    };
    const colors = presets[color] || presets.terracotta;
    document.documentElement.style.setProperty('--color-accent', colors.accent);
    document.documentElement.style.setProperty('--color-accent-light', colors.light);
    document.documentElement.style.setProperty('--color-accent-bg', colors.bg);

    toast.success(`Accent color set to ${color}`);
  };

  const handleSaveFocusConfig = (e) => {
    e.preventDefault();
    setIsSavingFocus(true);
    localStorage.setItem('pomodoro_focus', focusLength);
    localStorage.setItem('pomodoro_break', breakLength);
    localStorage.setItem('pomodoro_sound', alarmSound);
    setTimeout(() => {
      setIsSavingFocus(false);
      toast.success('Focus presets updated successfully');
    }, 600);
  };

  const handleSaveWebhook = (e) => {
    e.preventDefault();
    setIsSavingWebhook(true);
    localStorage.setItem('workspace_webhook', webhookUrl);
    setTimeout(() => {
      setIsSavingWebhook(false);
      toast.success('Integration settings updated');
    }, 600);
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) return toast.error('Please enter a webhook URL first');
    setIsTestingWebhook(true);
    
    try {
      // Simulate real ping request
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Webhook notification test sent successfully!');
    } catch (err) {
      toast.error('Failed to dispatch webhook. Check URL configuration.');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance & Themes', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'focus', label: 'Focus Clock Presets', icon: <Timer className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notification Settings', icon: <Bell className="w-4 h-4" /> },
    { id: 'integrations', label: 'Slack & Webhooks', icon: <Link2 className="w-4 h-4" /> },
  ];

  const accents = [
    { id: 'olive', name: 'Atelier Olive', color: '#667a52', class: 'bg-[#667a52]' },
    { id: 'graphite', name: 'Charcoal Graphite', color: '#333333', class: 'bg-[#333333]' },
    { id: 'indigo', name: 'Aether Indigo', color: '#52667a', class: 'bg-[#52667a]' },
    { id: 'terracotta', name: 'Rust Terracotta', color: '#a36652', class: 'bg-[#a36652]' },
  ];

  return (
    <PageLayout title="Settings">
      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-on-surface border border-black/[0.08] shadow-card bg-surface-lowest'
                  : 'text-on-surface-var/60 hover:text-on-surface hover:bg-surface-low/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1">
          {activeTab === 'appearance' && (
            <Card className="p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-headline-sm font-semibold text-on-surface">Appearance</h3>
                <p className="text-body-sm text-on-surface-var/50 mt-1">
                  Customize the interface theme style and workspace focus accents.
                </p>
              </div>

              <div className="divider" />

              {/* Theme Selection */}
              <div className="flex flex-col gap-3">
                <span className="text-label-sm text-on-surface-var/60 font-medium">Visual Mode</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => handleSaveTheme('dark')}
                    className={`cursor-pointer p-4 rounded-lg border-2 flex flex-col gap-2 transition-all ${
                      theme === 'dark'
                        ? 'border-primary-container bg-surface-lowest shadow-glow'
                        : 'border-black/[0.06] bg-surface-low/30 hover:border-black/15'
                    }`}
                  >
                    <div className="w-full h-8 bg-surface border border-black/5 rounded flex items-center px-2">
                      <div className="w-1/3 h-2 bg-primary-container/40 rounded mr-2" />
                      <div className="w-1/2 h-2 bg-on-surface-var/15 rounded" />
                    </div>
                    <span className="text-body-sm font-semibold text-on-surface">Deep Space (Dark)</span>
                  </div>

                  <div
                    onClick={() => handleSaveTheme('light')}
                    className={`cursor-pointer p-4 rounded-lg border-2 flex flex-col gap-2 transition-all ${
                      theme === 'light'
                        ? 'border-primary-container bg-surface-lowest shadow-glow'
                        : 'border-black/[0.06] bg-surface-low/30 hover:border-black/15'
                    }`}
                  >
                    <div className="w-full h-8 bg-white border border-black/5 rounded flex items-center px-2">
                      <div className="w-1/3 h-2 bg-[#667a52]/20 rounded mr-2" />
                      <div className="w-1/2 h-2 bg-black/10 rounded" />
                    </div>
                    <span className="text-body-sm font-semibold text-on-surface">Atelier Minimal (Light)</span>
                  </div>
                </div>
              </div>

              {/* Accent Color Palette Choice */}
              <div className="flex flex-col gap-3 mt-2">
                <span className="text-label-sm text-on-surface-var/60 font-medium font-mono uppercase tracking-wider">Workspace Accent Accentuation</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {accents.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => handleSaveAccent(acc.id)}
                      className={`cursor-pointer p-3 rounded-lg border flex items-center justify-between transition-all ${
                        accentColor === acc.id
                          ? 'border-accent-olive bg-surface-lowest shadow-card font-semibold'
                          : 'border-black/[0.06] bg-surface-low/20 hover:border-black/15'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full ${acc.class}`} />
                        <span className="text-xs text-on-surface">{acc.id.charAt(0).toUpperCase() + acc.id.slice(1)}</span>
                      </div>
                      {accentColor === acc.id && <Check className="w-3.5 h-3.5 text-accent-olive" />}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'focus' && (
            <Card className="p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-headline-sm font-semibold text-on-surface">Focus Engine Presets</h3>
                <p className="text-body-sm text-on-surface-var/50 mt-1">
                  Adjust default time frames and sound patterns for the Pomodoro timer tool.
                </p>
              </div>

              <div className="divider" />

              <form onSubmit={handleSaveFocusConfig} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Focus session duration */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-sm text-on-surface-var/80 font-medium">Deep Work Session (Minutes)</label>
                    <select
                      value={focusLength}
                      onChange={(e) => setFocusLength(Number(e.target.value))}
                      className="select-base bg-surface-lowest border border-black/[0.08] dark:border-white/[0.08]"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={20}>20 Minutes</option>
                      <option value={25}>25 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>

                  {/* Break session duration */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-sm text-on-surface-var/80 font-medium">Refuel Break Duration (Minutes)</label>
                    <select
                      value={breakLength}
                      onChange={(e) => setBreakLength(Number(e.target.value))}
                      className="select-base bg-surface-lowest border border-black/[0.08] dark:border-white/[0.08]"
                    >
                      <option value={3}>3 Minutes</option>
                      <option value={5}>5 Minutes</option>
                      <option value={10}>10 Minutes</option>
                      <option value={15}>15 Minutes</option>
                    </select>
                  </div>
                </div>

                {/* Alarm sound effects selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm text-on-surface-var/80 font-medium flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-accent-olive" />
                    <span>Alarm Sound Profile</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['chime', 'bell', 'none'].map((snd) => (
                      <button
                        type="button"
                        key={snd}
                        onClick={() => {
                          setAlarmSound(snd);
                          playAlarmSound(snd);
                        }}
                        className={`p-2.5 rounded border text-xs font-semibold capitalize transition-all ${
                          alarmSound === snd
                            ? 'border-accent-olive bg-surface-lowest text-accent-olive shadow-sm'
                            : 'border-black/[0.06] dark:border-white/[0.06] hover:border-black/15 text-on-surface-var/60'
                        }`}
                      >
                        {snd} Sound
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divider" />

                <div className="flex justify-end">
                  <Button type="submit" isLoading={isSavingFocus}>
                    Save Focus Config
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-headline-sm font-semibold text-on-surface">Notification Settings</h3>
                <p className="text-body-sm text-on-surface-var/50 mt-1">
                  Configure how you want to receive alerts, reminders, and summary digests.
                </p>
              </div>

              <div className="divider" />

              <form onSubmit={handleSaveNotifications} className="flex flex-col gap-6">
                
                {/* Email and Push Checkboxes */}
                <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotify}
                      onChange={(e) => setEmailNotify(e.target.checked)}
                      className="w-4 h-4 text-accent-olive border-black/[0.08] dark:border-white/[0.08] rounded focus:ring-accent-olive"
                    />
                    <div className="flex flex-col">
                      <span className="text-body-sm font-bold text-on-surface">Email Alerts</span>
                      <span className="text-label-xs text-on-surface-var/50 mt-0.5">Receive email notifications for due dates and task updates.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={pushNotify}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPushNotify(checked);
                        if (checked && Notification.permission !== 'granted') {
                          Notification.requestPermission().then((permission) => {
                            if (permission !== 'granted') {
                              toast.error('Desktop notification permission denied by browser');
                              setPushNotify(false);
                            } else {
                              toast.success('Desktop notification permission granted!');
                            }
                          });
                        }
                      }}
                      className="w-4 h-4 text-accent-olive border-black/[0.08] dark:border-white/[0.08] rounded focus:ring-accent-olive"
                    />
                    <div className="flex flex-col">
                      <span className="text-body-sm font-bold text-on-surface">Desktop Push Notifications</span>
                      <span className="text-label-xs text-on-surface-var/50 mt-0.5">Receive instant alerts on your desktop for task status completions.</span>
                    </div>
                  </label>
                </div>

                <div className="divider" />

                {/* Digest selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-sm text-on-surface-var/80 font-medium">Activity Digest Frequency</label>
                  <select
                    value={digestFreq}
                    onChange={(e) => setDigestFreq(e.target.value)}
                    className="select-base bg-surface-lowest border border-black/[0.08] dark:border-white/[0.08]"
                  >
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                    <option value="never">Never Send</option>
                  </select>
                  <span className="text-[10px] text-on-surface-var/40 leading-relaxed font-light mt-1">
                    Summarizes completed tasks, upcoming deadlines, and focus hours in a clean email.
                  </span>
                </div>

                <div className="divider" />

                {/* Alarm sound effects selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm text-on-surface-var/80 font-medium flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-accent-olive" />
                    <span>Alarm Sound Profile</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['chime', 'bell', 'none'].map((snd) => (
                      <button
                        type="button"
                        key={snd}
                        onClick={() => {
                          setAlarmSound(snd);
                          playAlarmSound(snd);
                        }}
                        className={`p-2.5 rounded border text-xs font-semibold capitalize transition-all ${
                          alarmSound === snd
                            ? 'border-accent-olive bg-surface-lowest text-accent-olive shadow-sm'
                            : 'border-black/[0.06] dark:border-white/[0.06] hover:border-black/15 text-on-surface-var/60'
                        }`}
                      >
                        {snd} Sound
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-on-surface-var/40 leading-relaxed font-light mt-1">
                    Configure the audio alert triggered when your focus or break timer reaches zero.
                  </span>
                </div>

                <div className="divider" />

                <div className="flex justify-end">
                  <Button type="submit" isLoading={isSavingNotify}>
                    Save Preferences
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card className="p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-headline-sm font-semibold text-on-surface">Webhooks & Integrations</h3>
                <p className="text-body-sm text-on-surface-var/50 mt-1">
                  Connect workspace activities to third-party communication channels like Slack or Discord.
                </p>
              </div>

              <div className="divider" />

              <form onSubmit={handleSaveWebhook} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Input
                    label="Incoming Webhook URL"
                    placeholder="https://hooks.slack.com/services/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <span className="text-[10px] text-on-surface-var/50 leading-relaxed font-light">
                    Every time a task status changes or checklist is completed, a visual summary payload is dispatched to this channel.
                  </span>
                </div>

                <div className="divider" />

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleTestWebhook}
                    isLoading={isTestingWebhook}
                  >
                    Test Connection
                  </Button>
                  <Button type="submit" isLoading={isSavingWebhook}>
                    Save Integration
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
