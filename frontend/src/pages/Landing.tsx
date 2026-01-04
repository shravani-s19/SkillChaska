import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Zap, BookOpen, Code, ChevronRight } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse move effect logic
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

  const handleStartLearning = () => {
    navigate('/get-started');
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] overflow-hidden text-white font-sans selection:bg-[#00BCD4] selection:text-black">
      
      {/* --- Dynamic Background --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dynamic Gradient based on mouse */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, #22d3ee 0%, transparent 25%)`,
            transition: 'opacity 0.5s ease',
          }}
        />
        {/* Fixed Blobs matches the image (Top Left Teal, Bottom Right Brown/Orange) */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-teal-900/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-orange-900/20 rounded-full blur-[100px]" />
      </div>

      {/* --- Navbar --- */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-gradient-to-br from-[#00BCD4] to-[#B2EBF2] p-2 rounded-lg">
            <Code className="text-black w-5 h-5" strokeWidth={3} />
          </div>
          <span className="text-xl font-bold tracking-tight">CodeMaska</span>
        </div>

        {/* Links (Hidden on mobile) */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">How it Works</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-6">
          <Link to="/login" className="text-sm font-medium hover:text-[#00BCD4] transition-colors">
            Sign In
          </Link>
          <button 
            onClick={handleStartLearning}
            className="bg-gradient-to-r from-[#00BCD4] to-[#B2EBF2] text-black text-sm font-bold px-5 py-2.5 rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-12 text-center">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#1f1f1f] border border-[#333] rounded-full px-4 py-2 mb-10 animate-fade-in-up">
            <Zap className="w-4 h-4 text-[#FFA932] fill-[#FFA932]" />
            <span className="text-gray-300 text-sm font-medium">AI-Powered Interactive Learning</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-[1.15] tracking-tight">
            Transform{' '}
            <span className="bg-gradient-to-r from-[#22d3ee] to-[#00BCD4] bg-clip-text text-transparent">
              Passive
            </span>
            <br />
            Learning Into{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#FFA932] to-[#ff7849] bg-clip-text text-transparent relative z-10">
                Active
              </span>
              {/* Decorative Circle behind 'Active' matching image style */}
              <div className="absolute -right-4 top-1 w-12 h-12 bg-teal-500/10 rounded-full -z-0 blur-xl"></div>
            </span>{' '}
            Mastery
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            CodeMaska uses AI to turn videos into interactive, step-by-step problem-solving experiences. 
            No skipping, no passive watching—just pure learning mastery.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center mb-16 w-full">
            <button 
              onClick={handleStartLearning}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#00BCD4] to-[#67e8f9] text-black font-bold rounded-xl hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(34,211,238,0.3)]"
            >
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 fill-black" />
                <span>Start Learning</span>
              </div>
            </button>
            
            <button className="group px-8 py-4 bg-[#1a1a1a] border border-[#333] text-white font-medium rounded-xl hover:bg-[#262626] hover:border-gray-500 transition-all duration-300">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>Watch Demo</span>
              </div>
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24 text-center border-t border-gray-800 pt-12 w-full max-w-4xl">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#00BCD4] mb-2">95%</span>
              <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Concept Retention</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#FFA932] mb-2">10x</span>
              <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Faster Learning</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#10b981] mb-2">100%</span>
              <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Engagement</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;