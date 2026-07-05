import React from 'react';
import { Bell, Search, Command } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Dropdown, { DropdownItem } from '../ui/Dropdown';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-surface/80 backdrop-blur-md sticky top-0 w-full h-16 px-6 border-b border-outline-variant/60 shadow-sm flex items-center justify-between z-40">
      <h2 className="text-headline-md font-bold text-primary tracking-tight md:block hidden">
        {title}
      </h2>
      
      {/* Mobile brand text */}
      <div className="md:hidden">
        <h1 className="text-headline-md font-bold text-primary">Atelier</h1>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Search mockup matching Stitch */}
        <div className="hidden md:flex items-center bg-surface-lowest border border-outline-variant/60 rounded-lg px-3 py-1.5 focus-within:border-accent-olive transition-all w-64 shadow-sm">
          <Search className="w-4 h-4 text-on-surface-var/50 mr-2" />
          <input
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-body-sm w-full placeholder-on-surface-var/40"
            placeholder="Search..."
            type="text"
          />
          <span className="text-label-xs text-on-surface-var/40 bg-surface-low px-1.5 py-0.5 rounded border border-black/[0.04] flex items-center font-mono">
            ⌘K
          </span>
        </div>

        {/* Notifications Button */}
        <button className="text-on-surface-var hover:text-primary hover:bg-surface-low rounded-lg p-2 flex items-center justify-center transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* User profile dropdown */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar name={user?.name} src={user?.avatar} size="sm" />
            </button>
          }
        >
          <div className="px-4 py-3 border-b border-outline-variant/40">
            <p className="text-label-sm font-semibold text-on-surface truncate">{user?.name}</p>
            <p className="text-label-xs text-on-surface-var/50 truncate">{user?.email}</p>
          </div>
          
          <DropdownItem onClick={() => navigate('/settings')}>
            Preferences
          </DropdownItem>

          <div className="border-t border-outline-variant/40 my-1" />
          
          <DropdownItem onClick={logout} variant="danger">
            Sign Out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
};

export default Navbar;
