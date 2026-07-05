import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  Plus,
  Timer,
  User,
} from 'lucide-react';
import Avatar from '../ui/Avatar';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Tasks', path: '/tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { label: 'Calendar', path: '/calendar', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Focus', path: '/focus', icon: <Timer className="w-5 h-5" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleQuickAdd = () => {
    navigate('/tasks', { state: { openAddModal: true, timestamp: Date.now() } });
  };

  return (
    <aside className="w-sidebar h-screen bg-surface border-r border-outline-variant/60 flex flex-col justify-between fixed left-0 top-0 z-30 py-6 px-3">
      <div className="flex flex-col gap-6">
        {/* Logo Section matching Stitch */}
        <div className="mb-2 px-4">
          <h1 className="text-headline-md font-bold text-primary tracking-tight">Atelier</h1>
          <p className="text-label-xs text-on-surface-var/50 tracking-wider uppercase">Premium Productivity</p>
        </div>

        {/* Quick Add Action Button */}
        <button
          onClick={handleQuickAdd}
          className="mx-3 bg-primary-container text-white py-2.5 rounded-lg text-label-sm font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Add</span>
        </button>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Profile, Account & Logout */}
      <div className="flex flex-col gap-2 p-2 border-t border-outline-variant/40 bg-surface-low/30 rounded-lg">
        {/* Account Nav Link matching mockup */}
        <NavLink
          to="/account"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? 'active' : ''}`
          }
        >
          <User className="w-5 h-5" />
          <span>Account</span>
        </NavLink>

        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar name={user?.name} src={user?.avatar} size="sm" />
          <div className="flex flex-col min-w-0">
            <span className="text-label-sm text-on-surface truncate font-semibold">
              {user?.name}
            </span>
            <span className="text-label-xs text-on-surface-var/50 truncate">
              {user?.email}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-label-sm 
                   text-error hover:bg-error/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
