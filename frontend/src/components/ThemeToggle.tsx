// File: src/components/ThemeToggle.tsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeToggle = ({ collapsed = false }: { collapsed?: boolean }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-textSecondary hover:bg-white/5 hover:text-text group overflow-hidden ${
        collapsed ? 'justify-center' : ''
      }`}
    >
      {/* Background fill animation on hover */}
      <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

      <div className="relative w-5 h-5 z-10">
        <motion.div
          initial={false}
          animate={{ 
            rotate: theme === 'dark' ? 0 : 90,
            scale: theme === 'dark' ? 1 : 0
          }}
          className="absolute inset-0"
        >
          <Moon className="w-5 h-5 fill-current" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ 
            rotate: theme === 'light' ? 0 : -90,
            scale: theme === 'light' ? 1 : 0
          }}
          className="absolute inset-0"
        >
          <Sun className="w-5 h-5 fill-current" />
        </motion.div>
      </div>
      
      {!collapsed && (
        <span className="font-medium relative z-10">
          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};