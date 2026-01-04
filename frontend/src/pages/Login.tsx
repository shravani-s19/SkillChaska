// File: src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/auth.service';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSuccess } = useAuthStore();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        await authService.register(formData.email, formData.password, formData.fullName);
        const loginData = await authService.login(formData.email, formData.password);
        loginSuccess(loginData.token, loginData.user);
      } else {
        const loginData = await authService.login(formData.email, formData.password);
        loginSuccess(loginData.token, loginData.user);
      }

      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });

    } catch (err: any) {
      console.error("Auth Error:", err);
      const msg = err.response?.data?.message || err.message || "Authentication failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-[100dvw] relative flex items-center justify-center p-6 overflow-hidden">
      {/* --- Mesmerizing Animated Background --- */}
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 bg-[#0a0a0c]">
        {/* Top Right Orb */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full bg-secondary/20 blur-[120px]"
        />
        
        {/* Bottom Left Orb */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-accent/10 blur-[100px]"
        />
        
        {/* Grid Overlay for Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      {/* --- Glass Card --- */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-xl bg-surface/40 border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          
          {/* Subtle sheen effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-br from-secondary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-secondary/30 relative"
            >
              <Zap className="text-white w-8 h-8 fill-current relative z-10" />
              {/* Icon Glow */}
              <div className="absolute inset-0 bg-secondary blur-xl opacity-50" />
            </motion.div>
            
            <motion.div layout>
              <h1 className="text-3xl font-bold mb-3 tracking-tight">
                {isRegistering ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-textSecondary text-sm font-medium">
                {isRegistering 
                  ? "Start your journey to mastery today." 
                  : "Enter your details to access your courses."}
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode='popLayout'>
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Full Name</label>
                    <div className="group relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary group-focus-within:text-secondary transition-colors" />
                      <input 
                        type="text" 
                        required={isRegistering}
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="input-field pl-12 bg-surface/50 focus:bg-surface/80"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Email</label>
              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary group-focus-within:text-secondary transition-colors" />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="input-field pl-12 bg-surface/50 focus:bg-surface/80"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Password</label>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary group-focus-within:text-secondary transition-colors" />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="input-field pl-12 bg-surface/50 focus:bg-surface/80"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-bold text-center flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 mt-6 group shadow-xl shadow-secondary/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isRegistering ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-textSecondary">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
                className="text-secondary font-bold hover:text-primary transition-colors hover:underline decoration-2 underline-offset-4"
              >
                {isRegistering ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
        
        {/* Footer Credit */}
        <p className="text-center text-xs text-textSecondary/40 mt-8 font-medium tracking-widest uppercase">
          Protected by SkillChaska Security
        </p>
      </motion.div>
    </div>
  );
};

export default Login;