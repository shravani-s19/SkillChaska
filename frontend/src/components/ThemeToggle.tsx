import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeToggle = ({ collapsed = false }: { collapsed?: boolean }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-textSecondary hover:bg-text/5 hover:text-text ${
        collapsed ? 'justify-center' : ''
      }`}
    >
      <div className="relative w-5 h-5">
        <motion.div
          initial={false}
          animate={{ 
            rotate: theme === 'dark' ? 0 : 180,
            opacity: theme === 'dark' ? 1 : 0,
            scale: theme === 'dark' ? 1 : 0
          }}
          className="absolute inset-0"
        >
          <Moon className="w-5 h-5" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ 
            rotate: theme === 'light' ? 0 : -180,
            opacity: theme === 'light' ? 1 : 0,
            scale: theme === 'light' ? 1 : 0
          }}
          className="absolute inset-0"
        >
          <Sun className="w-5 h-5" />
        </motion.div>
      </div>
      {!collapsed && <span className="font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>}
    </button>
  );
};
