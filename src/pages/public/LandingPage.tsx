import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Zap, BookOpen, X, GraduationCap, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Mouse Tracking for Gradient Background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 2. Navigation Handler
  const handleRoleSelect = (role: 'student' | 'instructor') => {
    setIsModalOpen(false);
    // Pass the selected role to the Login page via State
    navigate('/login', { state: { role } });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#171717] selection:bg-[#00BCD4] selection:text-[#171717]">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, #B2EBF2 0%, #00BCD4 35%, transparent 70%)`,
          transition: 'background 0.1s ease-out',
        }}
      />
      
      {/* Floating Blobs (Decoration) */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-[#B2EBF2] to-[#00BCD4] rounded-full opacity-10 animate-pulse blur-2xl" />
      <div className="absolute bottom-32 right-16 w-40 h-40 bg-gradient-to-br from-[#FFA932] to-[#FF6B35] rounded-full opacity-10 animate-bounce blur-3xl" style={{ animationDuration: '4s' }} />
      <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-br from-[#10b981] to-[#00BCD4] rounded-full opacity-15 animate-pulse blur-xl" style={{ animationDelay: '1s' }} />

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#262626]/80 backdrop-blur-sm border border-[#2F2F2F] rounded-full px-6 py-3 mb-8 group hover:border-[#00BCD4] transition-all duration-300 shadow-lg shadow-black/50">
            <Zap className="w-4 h-4 text-[#FFA932] group-hover:animate-pulse" />
            <span className="text-[#A3A3A3] text-sm font-medium tracking-wide">AI-Powered Interactive Learning</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Transform{' '}
            <span className="bg-gradient-to-r from-[#B2EBF2] to-[#00BCD4] bg-clip-text text-transparent animate-pulse">
              Passive
            </span>
            <br />
            Learning Into{' '}
            <span className="bg-gradient-to-r from-[#FFA932] to-[#FF6B35] bg-clip-text text-transparent">
              Active
            </span>{' '}
            Mastery
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-[#A3A3A3] mb-8 leading-relaxed max-w-3xl mx-auto font-light">
            CodeMaska uses AI to turn videos into interactive, step-by-step problem-solving experiences. 
            No skipping, no passive watching.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#00BCD4] to-[#B2EBF2] text-[#171717] font-bold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#00BCD4]/40"
            >
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 fill-current" />
                <span>Start Learning</span>
              </div>
            </button>
            <button className="group px-8 py-4 border border-[#2F2F2F] text-white font-medium rounded-xl hover:border-[#00BCD4] hover:bg-[#262626] transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Watch Demo</span>
              </div>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-[#2F2F2F] pt-8 bg-[#171717]/50 backdrop-blur-sm rounded-2xl mx-auto max-w-3xl">
            <div className="group cursor-default">
              <div className="text-3xl font-bold text-[#00BCD4] group-hover:scale-110 transition-transform duration-300">95%</div>
              <div className="text-[#A3A3A3] mt-2 text-sm uppercase tracking-wider">Retention Rate</div>
            </div>
            <div className="group cursor-default">
              <div className="text-3xl font-bold text-[#FFA932] group-hover:scale-110 transition-transform duration-300">10x</div>
              <div className="text-[#A3A3A3] mt-2 text-sm uppercase tracking-wider">Faster Mastery</div>
            </div>
            <div className="group cursor-default">
              <div className="text-3xl font-bold text-[#10b981] group-hover:scale-110 transition-transform duration-300">100%</div>
              <div className="text-[#A3A3A3] mt-2 text-sm uppercase tracking-wider">Engagement</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- ROLE SELECTION MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#262626] border border-[#2F2F2F] rounded-2xl p-8 shadow-2xl shadow-black overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00BCD4] rounded-full opacity-10 blur-3xl translate-x-10 -translate-y-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFA932] rounded-full opacity-10 blur-3xl -translate-x-10 translate-y-10" />

              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-[#A3A3A3] hover:text-white transition-colors">
                <X size={24} />
              </button>

              <div className="text-center mb-8 relative z-10">
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Path</h2>
                <p className="text-[#A3A3A3]">Select how you want to join CodeMaska</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                {/* Student Option */}
                <button onClick={() => handleRoleSelect('student')} className="group flex flex-col items-center justify-center p-6 rounded-xl border border-[#2F2F2F] bg-[#171717] hover:bg-[#1f1f1f] hover:border-[#00BCD4] transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#00BCD4]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-[#00BCD4]" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Student</h3>
                  <p className="text-[#A3A3A3] text-sm mt-1">Start Learning</p>
                </button>

                {/* Instructor Option */}
                <button onClick={() => handleRoleSelect('instructor')} className="group flex flex-col items-center justify-center p-6 rounded-xl border border-[#2F2F2F] bg-[#171717] hover:bg-[#1f1f1f] hover:border-[#FFA932] transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#FFA932]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6 text-[#FFA932]" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Instructor</h3>
                  <p className="text-[#A3A3A3] text-sm mt-1">Portal Access</p>
                </button>
              </div>
              <div className="mt-6 text-center text-xs text-[#A3A3A3] relative z-10">* Instructors require an invitation to register.</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LandingPage;