import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Mail, BookOpen, Users, Star } from 'lucide-react';

const InstructorProfile = () => {
    const instructor = {
        name: 'Jane Doe',
        title: 'Senior Python & AI Instructor',
        email: 'jane.doe@codemaska.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=32',
        bio: "With over a decade of experience in software engineering and data science, Jane is passionate about making complex topics accessible. She specializes in Python, Machine Learning, and cloud technologies, helping thousands of students achieve their career goals.",
        stats: [
            { label: 'Total Courses', value: '8', icon: BookOpen },
            { label: 'Total Students', value: '1,204', icon: Users },
            { label: 'Average Rating', value: '4.9/5', icon: Star }
        ]
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-w-[82dvw] mx-auto space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text">Instructor Profile</h1>
                    <p className="text-textSecondary mt-1">Manage your public presence and professional details.</p>
                </div>
                <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95">
                    <Edit3 size={16} /> Edit Profile
                </button>
            </div>

            {/* Main Profile Card */}
            <div className="bg-surface rounded-3xl border border-border shadow-sm p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Section: Avatar & Info */}
                <div className="md:col-span-1 flex flex-col items-center text-center">
                    <div className="relative w-32 h-32 mb-4">
                        <img src={instructor.avatarUrl} alt={instructor.name} className="w-full h-full rounded-full object-cover border-4 border-primary/20" />
                        <button className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                            <Edit3 size={14} />
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold text-text">{instructor.name}</h2>
                    <p className="text-primary font-medium">{instructor.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-textSecondary">
                        <Mail size={14} />
                        <span>{instructor.email}</span>
                    </div>
                </div>

                {/* Right Section: Bio & Stats */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-bold text-text border-b border-border pb-2 mb-4">About Me</h3>
                    <p className="text-textSecondary leading-relaxed">{instructor.bio}</p>
                    
                    <h3 className="text-lg font-bold text-text border-b border-border pb-2 mt-8 mb-6">Statistics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {instructor.stats.map(stat => (
                            <div key={stat.label} className="bg-background p-4 rounded-xl border border-border flex items-center gap-4 group hover:border-accent/50 transition-colors">
                                <div className="p-3 bg-accent/10 rounded-lg text-accent">
                                    <stat.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-text">{stat.value}</p>
                                    <p className="text-xs text-textSecondary">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Additional Settings (Placeholder) */}
            <div className="bg-surface rounded-3xl border border-border shadow-sm p-8">
                <h3 className="text-lg font-bold text-text mb-4">Account Settings</h3>
                <p className="text-textSecondary">Manage your linked accounts, notifications, and more.</p>
                {/* ... Future settings components would go here ... */}
            </div>
        </motion.div>
    );
};

export default InstructorProfile;