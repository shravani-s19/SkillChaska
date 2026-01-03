import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App'; // Importing context from App

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get role passed from Landing Page, default to 'student'
  const [role, setRole] = useState<'student' | 'instructor' | 'superadmin'>('student');

  useEffect(() => {
    if (location.state?.role) {
      setRole(location.state.role);
    }
  }, [location]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate Login Logic
    // In real app: Firebase Auth here
    login(role); 
    
    // Redirect based on role
    if (role === 'superadmin') navigate('/superadmin');
    else if (role === 'instructor') navigate('/instructor/dashboard');
    else navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#171717] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#262626] border border-[#2F2F2F] p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-[#A3A3A3] mb-6">
          Login as <span className="text-[#00BCD4] capitalize font-bold">{role}</span>
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-1">Email</label>
            <input 
              type="email" 
              defaultValue={role === 'instructor' ? 'instructor@codemaska.com' : 'student@test.com'}
              className="w-full bg-[#171717] border border-[#2F2F2F] rounded-lg p-3 text-white focus:border-[#00BCD4] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-1">Password</label>
            <input 
              type="password" 
              defaultValue="password"
              className="w-full bg-[#171717] border border-[#2F2F2F] rounded-lg p-3 text-white focus:border-[#00BCD4] focus:outline-none transition-colors"
            />
          </div>
          
          <button className="w-full bg-gradient-to-r from-[#00BCD4] to-[#B2EBF2] text-[#171717] font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
            Sign In
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <button 
            onClick={() => setRole('student')} 
            className={`hover:text-white ${role === 'student' ? 'text-[#00BCD4]' : 'text-[#A3A3A3]'}`}
          >
            Student Login
          </button>
          <button 
            onClick={() => setRole('instructor')} 
            className={`hover:text-white ${role === 'instructor' ? 'text-[#FFA932]' : 'text-[#A3A3A3]'}`}
          >
            Instructor Login
          </button>
           <button 
            onClick={() => setRole('superadmin')} 
            className={`hover:text-white ${role === 'superadmin' ? 'text-red-400' : 'text-[#A3A3A3]'}`}
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}