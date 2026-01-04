import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Code, Loader2, KeyRound, AtSign } from 'lucide-react';

const InstructorLogin = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('instructor@codemaska.com');
    const [password, setPassword] = useState('password123');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            // Dummy validation
            if (email === 'instructor@codemaska.com' && password === 'password123') {
                // On success, navigate to the dashboard
                navigate('/instructor/dashboard');
            } else {
                setError('Invalid credentials. Please try again.');
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background text-text flex items-center justify-center p-4 relative">
            {/* Background decorative blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            
            <Link to="/get-started" className="absolute top-8 left-8 flex items-center gap-2 text-textSecondary hover:text-text transition-colors">
                <ArrowLeft size={18} /> Back to Role Selection
            </Link>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl shadow-primary/5 p-8 z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-primary/10 rounded-xl mb-4">
                        <Code size={24} className="text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-text">Instructor Portal</h1>
                    <p className="text-textSecondary">Sign in to manage your courses and students.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-textSecondary">Email Address</label>
                        <div className="relative">
                            <AtSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-textSecondary">Password</label>
                        <div className="relative">
                             <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <a href="#" className="text-xs text-primary hover:underline text-right block">Forgot password?</a>
                    </div>
                    
                    {error && <p className="text-sm text-error bg-error/10 p-3 rounded-lg text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default InstructorLogin;