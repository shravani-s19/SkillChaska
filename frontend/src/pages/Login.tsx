import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
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
        // --- REGISTER FLOW ---
        // 1. Call Register
        await authService.register(formData.email, formData.password, formData.fullName);
        
        // 2. Auto-Login after registration to get the token
        const loginData = await authService.login(formData.email, formData.password);
        
        // 3. Update Store
        loginSuccess(loginData.token, loginData.user);
        
      } else {
        // --- LOGIN FLOW ---
        const loginData = await authService.login(formData.email, formData.password);
        
        // Update Store
        loginSuccess(loginData.token, loginData.user);
      }

      // Redirect
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });

    } catch (err: any) {
      console.error("Auth Error:", err);
      // Handle axios error response structure
      const msg = err.response?.data?.message || err.message || "Authentication failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface border border-border p-8 rounded-[32px] shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-secondary/20">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-textSecondary text-sm">
            {isRegistering 
              ? "Start your journey to mastery today." 
              : "Enter your details to access your courses."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
                <input 
                  type="text" 
                  required={isRegistering}
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-white/5 border border-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-secondary transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-textSecondary uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white/5 border border-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-secondary transition-colors"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-textSecondary uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white/5 border border-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-secondary transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-secondary text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isRegistering ? "Sign Up" : "Sign In"}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-textSecondary">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-secondary font-bold hover:underline"
            >
              {isRegistering ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;