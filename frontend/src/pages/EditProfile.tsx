import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, ChevronLeft, User, Mail, Globe, Github, Twitter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { USER_DATA } from '../data/mockData';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: USER_DATA.student_full_name,
    email: USER_DATA.student_email,
    bio: "Passionate developer learning AI and Python patterns.",
    website: "https://rahul.dev",
    github: "rahulsharma",
    twitter: "rahul_dev"
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    alert("Profile updated successfully!");
    navigate('/profile');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-10">
        <Link to="/profile" className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors mb-4 group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </Link>
        <h1 className="text-4xl font-bold">Edit Profile</h1>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar Section */}
        <section className="bg-surface border border-border rounded-[2rem] p-8">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <img 
                src={USER_DATA.student_avatar_url} 
                alt="Avatar" 
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white/5"
              />
              <button type="button" className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Profile Picture</h3>
              <p className="text-textSecondary text-sm mb-4">PNG, JPG or GIF. Max size of 800K</p>
              <div className="flex gap-3">
                <button type="button" className="px-4 py-2 bg-secondary text-white rounded-xl text-sm font-bold">Upload New</button>
                <button type="button" className="px-4 py-2 bg-white/5 text-text rounded-xl text-sm font-bold hover:bg-white/10">Remove</button>
              </div>
            </div>
          </div>
        </section>

        {/* Basic Info */}
        <section className="bg-surface border border-border rounded-[2rem] p-8 space-y-6">
          <h3 className="text-xl font-bold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-textSecondary flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-textSecondary flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-textSecondary">Bio</label>
            <textarea 
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors resize-none"
            />
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-surface border border-border rounded-[2rem] p-8 space-y-6">
          <h3 className="text-xl font-bold mb-4">Social Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-textSecondary flex items-center gap-2">
                <Globe className="w-4 h-4" /> Website
              </label>
              <input 
                type="url" 
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-textSecondary flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub
              </label>
              <input 
                type="text" 
                value={formData.github}
                onChange={(e) => setFormData({...formData, github: e.target.value})}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button 
            type="button"
            onClick={() => navigate('/profile')}
            className="px-8 py-4 bg-white/5 text-text rounded-2xl font-bold hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-8 py-4 bg-secondary text-white rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-secondary/20"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
