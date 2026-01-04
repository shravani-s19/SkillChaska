// src/pages/admin/AdminLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, AtSign, KeyRound } from 'lucide-react';
import { adminService } from '../../services/auth.service'; // <-- Use the updated service file

const AdminLogin = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('admin@codemaska.com');
    const [password, setPassword] = useState('adminpassword');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Call the API service
            await adminService.loginAdmin(email, password);
            navigate('/admin/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-background text-text flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm bg-surface border border-border rounded-2xl shadow-xl p-8"
            >
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-primary/10 rounded-xl mb-4">
                        <ShieldCheck size={24} className="text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-text">Admin Access</h1>
                    <p className="text-textSecondary">Please sign in to continue.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <AtSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none" />
                    </div>
                    <div className="relative">
                        <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                        <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none" />
                    </div>
                    
                    {error && <p className="text-sm text-error text-center">{error}</p>}

                    <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;