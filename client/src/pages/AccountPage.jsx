import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Shield, Save, Key } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { authAPI } from '../services/api';

export const AccountPage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings state
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      return toast.error('Image size must be less than 1.5MB');
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  // Security password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    
    setIsSavingProfile(true);
    try {
      const { data } = await authAPI.updateProfile({ name, avatar, timezone });
      if (data.success) {
        updateUser(data.user);
        setAvatar(data.user.avatar || '');
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) return toast.error('Current password is required');
    if (newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    setIsUpdatingPassword(true);
    try {
      const { data } = await authAPI.changePassword({ currentPassword, newPassword });
      if (data.success) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Password', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <PageLayout title="Account">
      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        {/* Account Navigation */}
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

        {/* Account Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card className="p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-headline-sm font-semibold text-on-surface">Profile Information</h3>
                <p className="text-body-sm text-on-surface-var/50 mt-1">
                  Manage your personal information, profile display image, and timezone configurations.
                </p>
              </div>

              <div className="divider" />

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                {/* Avatar Preview & File Upload */}
                <div className="flex items-center gap-6 bg-surface-low/20 p-5 rounded-lg border border-black/[0.06] dark:border-white/[0.06]">
                  <Avatar name={name} src={avatar} size="xl" />
                  <div className="flex flex-col gap-2 flex-1">
                    <span className="text-label-sm font-semibold text-on-surface">Profile Picture</span>
                    <div className="flex items-center gap-3">
                      <label 
                        htmlFor="avatar-upload" 
                        className="btn btn-sm bg-accent-olive hover:bg-accent-olive/90 text-white cursor-pointer px-4 py-2 text-label-xs tracking-wider uppercase font-bold text-center inline-block rounded-lg shadow-sm active:scale-95 transition-all"
                      >
                        Upload Image
                      </label>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                    </div>
                    <span className="text-[10px] text-on-surface-var/50 leading-relaxed font-light">
                      Supports JPG, JPEG, or PNG. Max size 1.5MB.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    value={email}
                    disabled
                    className="opacity-60 cursor-not-allowed bg-surface-high/30"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-sm text-on-surface-var/80 font-medium">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="select-base bg-surface-lowest border border-black/[0.08] dark:border-white/[0.08]"
                    >
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="GMT">GMT</option>
                      <option value="EST">EST (GMT-5)</option>
                      <option value="PST">PST (GMT-8)</option>
                      <option value="IST">IST (GMT+5:30)</option>
                    </select>
                  </div>
                </div>

                <div className="divider" />

                <div className="flex justify-end">
                  <Button type="submit" isLoading={isSavingProfile} leftIcon={<Save className="w-4 h-4" />}>
                    Save Profile
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-headline-sm font-semibold text-on-surface">Security & Password</h3>
                <p className="text-body-sm text-on-surface-var/50 mt-1">
                  Keep your account secure by resetting password credentials.
                </p>
              </div>

              <div className="divider" />

              <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
                <Input
                  type="password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="password"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="divider" />

                <div className="flex justify-end">
                  <Button type="submit" isLoading={isUpdatingPassword} leftIcon={<Key className="w-4 h-4" />}>
                    Update Password
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

export default AccountPage;
