import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface BadgeCardProps {
  badge: {
    name: string;
    description: string;
    icon: string;
    color: string;
    earnedAt: string | null;
    isLocked: boolean;
  };
}

export const BadgeCard = ({ badge }: BadgeCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative p-6 rounded-3xl border transition-all duration-300 group ${
        badge.isLocked 
          ? 'bg-surface/40 border-border grayscale opacity-60' 
          : 'bg-surface border-border hover:border-secondary/50 shadow-lg hover:shadow-secondary/10'
      }`}
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-3xl mb-4 shadow-lg shadow-current/20 relative`}>
        {badge.icon}
        {badge.isLocked && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center">
            <Lock className="w-3 h-3 text-textSecondary" />
          </div>
        )}
      </div>
      
      <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
      <p className="text-sm text-textSecondary mb-4 line-clamp-2">{badge.description}</p>
      
      {badge.earnedAt ? (
        <div className="text-[10px] font-bold uppercase tracking-widest text-secondary">
          Earned {badge.earnedAt}
        </div>
      ) : (
        <div className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">
          Locked
        </div>
      )}
    </motion.div>
  );
};
