import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Presentation, ArrowLeft } from 'lucide-react';

const RoleSelection = () => {
  return (
    <div className="min-h-screen min-w-[100dvw] bg-background flex flex-col items-center justify-center p-4 text-text relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-textSecondary hover:text-text transition-colors">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <div className="bg-surface border border-border rounded-2xl shadow-2xl p-8 max-w-4xl w-full text-center relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-text">Choose Your Path</h1>
        <p className="text-textSecondary mb-10">Select your portal to continue to SkillChaska</p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Student Card */}
          <Link to="/login" className="group p-8 border border-border bg-background rounded-xl hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors duration-300">
              <GraduationCap className="text-primary group-hover:text-white" size={36} />
            </div>
            <h3 className="text-xl font-bold mb-2">Student</h3>
            <p className="text-sm text-textSecondary group-hover:text-text">Access interactive courses, solve challenges, and master skills.</p>
          </Link>

          {/* Instructor Card -- UPDATED LINK */}
          <Link to="/instructor/login" className="group p-8 border border-border bg-background rounded-xl hover:border-accent/50 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="bg-accent/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent transition-colors duration-300">
              <Presentation className="text-accent group-hover:text-white" size={36} />
            </div>
            <h3 className="text-xl font-bold mb-2">Instructor</h3>
            <p className="text-sm text-textSecondary group-hover:text-text">Create interactive video modules and track student progress.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;