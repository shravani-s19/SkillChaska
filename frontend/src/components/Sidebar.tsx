import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: BookOpen, label: 'Courses', path: '/courses' },
  { icon: Trophy, label: 'Achievements', path: '/achievements' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      className="h-screen bg-surface border-r border-border flex flex-col sticky top-0 z-50"
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight">CodeMaska</span>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center mx-auto">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-secondary/10 text-secondary" 
                : "text-textSecondary hover:bg-text/5 hover:text-text"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", isCollapsed && "mx-auto")} />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 mb-2">
        <ThemeToggle collapsed={isCollapsed} />
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 border-t border-border text-textSecondary hover:text-text flex items-center justify-center"
      >
        {isCollapsed ? <ChevronRight /> : <div className="flex items-center gap-2"><ChevronLeft /> <span>Collapse</span></div>}
      </button>
    </motion.aside>
  );
};
