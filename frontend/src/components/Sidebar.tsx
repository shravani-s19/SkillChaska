// File: src/components/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  User, 
  ChevronLeft, 
  Zap,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '../store/useAuthStore';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Courses', path: '/courses' },
  { icon: Trophy, label: 'Achievements', path: '/achievements' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuthStore();
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen sticky top-0 z-50 flex flex-col border-r border-white/5 bg-surface/60 backdrop-blur-2xl shadow-2xl"
    >
      {/* --- Logo Section --- */}
      <div className="h-20 flex items-center justify-center border-b border-white/5 relative overflow-hidden">
        {/* Glowing effect behind logo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-secondary/20 blur-[50px]" />
        
        <div className="flex items-center gap-3 z-10">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 bg-gradient-to-br from-secondary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20"
          >
            <Zap className="text-white w-5 h-5 fill-current" />
          </motion.div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text"
              >
                SkillChaska
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- Navigation --- */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative group block"
            >
              {/* Sliding Active Pill Background */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-secondary/10 border border-secondary/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div className={cn(
                "relative z-10 flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300 group-hover:bg-white/5",
                isActive ? "text-secondary font-bold" : "text-textSecondary hover:text-text"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                  isActive && "fill-current drop-shadow-[0_0_8px_rgba(var(--secondary),0.5)]",
                  isCollapsed && "mx-auto"
                )} />
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* --- Footer / Tools --- */}
      <div className="p-4 border-t border-slate/5 space-y-2">
        <ThemeToggle collapsed={isCollapsed} />
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-textSecondary hover:bg-white/5 hover:text-text",
            isCollapsed && "justify-center"
          )}
        >
          <div className={cn(
            "w-5 h-5 flex items-center justify-center transition-transform duration-300",
            isCollapsed && "rotate-180"
          )}>
            <ChevronLeft className="w-5 h-5" />
          </div>
          
          {!isCollapsed && (
             <span className="font-medium text-sm">Collapse Sidebar</span>
          )}
        </button>

        {!isCollapsed && (
          <div className="pt-2 text-[10px] text-center text-textSecondary/40 font-mono">
            v2.0.1 PRO
          </div>
        )}
      </div>
    </motion.aside>
  );
};