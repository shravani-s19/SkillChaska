// src/layouts/AdminLayout.tsx
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full bg-background text-text">
      <aside className="w-64 bg-surface border-r border-border flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-border h-20">
          <Shield size={24} className="text-primary" />
          <div>
            <h1 className="font-bold text-lg text-text">Admin Panel</h1>
            <p className="text-xs text-textSecondary">SkillChaska</p>
          </div>
        </div>
        <div className="flex-1 p-4">
            {/* Future Nav Links Can Go Here */}
        </div>
        <div className="p-4 border-t border-border">
            <button 
                onClick={() => navigate('/admin')}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-error hover:bg-error/10 transition-colors"
            >
                <LogOut size={20} />
                <span>Logout</span>
            </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;