import React from 'react';
import { Menu, Bell, User, Search, Command } from 'lucide-react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const Header = ({ onMenuClick }) => {
  const { profile } = useSupabaseAuth();

  return (
    <header className="bg-background border-bottom border-muted h-20 sticky top-0 z-40">
      <div className="px-8 sm:px-10 h-full flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-4 h-4" />
          </Button>

          <div className="hidden md:flex items-center gap-3 bg-secondary rounded-md px-4 py-0 h-10 w-64 lg:w-96 border border-transparent focus-within:border-primary transition-all">
            <Command className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="SEARCH ENGINE..."
              className="bg-transparent border-none outline-none text-[10px] w-full text-foreground placeholder:text-muted-foreground font-black uppercase tracking-widest"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="relative h-10 w-10">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary border-2 border-background"></span>
          </Button>

          <div className="flex items-center gap-5 pl-6 border-l border-muted h-10">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{profile?.full_name || 'IDENTIFIED_USER'}</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{profile?.role || 'CLIENT'}_PORTAL</span>
            </div>

            <div className="w-9 h-9 bg-primary text-primary-foreground rounded-sm flex items-center justify-center text-xs font-black ring-2 ring-primary ring-offset-2">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;