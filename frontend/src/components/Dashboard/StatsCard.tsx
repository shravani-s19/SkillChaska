// File: src/components/Dashboard/StatsCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string; // e.g. "text-accent"
  trend?: string;
  delay?: number;
}

export const StatsCard = ({ label, value, icon: Icon, color, trend, delay = 0 }: StatsCardProps) => {
  // Extract the color name (e.g., "accent" from "text-accent") for background styling
  const colorName = color.replace('text-', '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="glass-card p-6 rounded-3xl relative overflow-hidden group"
    >
      {/* Background Glow Effect */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${colorName}/10 rounded-full blur-2xl group-hover:bg-${colorName}/20 transition-colors duration-500`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-textSecondary text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-${colorName}/10 ${color}`}>
                {trend}
              </span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-2xl bg-${colorName}/10 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
};