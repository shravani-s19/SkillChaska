import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: string; // Added optional trend prop
}

export const StatsCard = ({ label, value, icon: Icon, color, trend }: StatsCardProps) => (
  <div className="bg-surface border border-border p-6 rounded-2xl flex items-center gap-4 hover:border-border/80 transition-colors">
    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-textSecondary text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-0.5">{value}</p>
      
      {/* Trend Logic */}
      {trend && (
        <p className={`text-xs font-bold mt-1 ${
          trend.startsWith('+') ? 'text-success' : 'text-textSecondary'
        }`}>
          {trend}
        </p>
      )}
    </div>
  </div>
);