import React, { useEffect, useState } from 'react';
import { getCourses, instructorStats } from '../../data/mockInstructorData';
import { Users, DollarSign, BookOpen, TrendingUp, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  // State to hold dynamic courses
  const [courses, setCourses] = useState(getCourses());

  // Refresh data on mount
  useEffect(() => {
    setCourses(getCourses());
  }, []);

  const getIcon = (label: string) => {
    switch (label) {
      case 'Total Students': return Users;
      case 'Total Revenue': return DollarSign;
      case 'Active Courses': return BookOpen;
      default: return TrendingUp;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-text">Dashboard</h1>
            <p className="text-textSecondary mt-1">Overview of your performance and content.</p>
        </div>
        
        <button 
            onClick={() => navigate('/instructor/create-course')}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
            <Plus size={20} /> Create New Course
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {instructorStats.map((stat, idx) => {
          const Icon = getIcon(stat.label);
          return (
            <motion.div variants={item} key={idx} className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:border-primary/50 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-background rounded-xl text-textSecondary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon size={24} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-success/10 text-success' : 'bg-background text-textSecondary'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-textSecondary text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-text mt-1">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Courses Table */}
      <motion.div variants={item} className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-text">Recent Courses</h2>
          <Link to="/instructor/courses" className="text-sm text-primary font-medium hover:underline">
            View All Courses
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background text-xs uppercase text-textSecondary font-semibold">
              <tr>
                <th className="px-6 py-4 text-left rounded-l-lg">Course Title</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Completion</th>
                <th className="px-6 py-4 text-right rounded-r-lg">Price</th>
              </tr>
            </thead>
            <tbody className="text-sm text-text">
              {courses.map((course) => (
                <tr 
                    key={course.course_id} 
                    className="border-b border-border last:border-0 hover:bg-background/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/instructor/course/${course.course_id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-background overflow-hidden border border-border">
                        <img src={course.course_thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <p className="font-bold text-text">{course.course_title}</p>
                        <p className="text-xs text-textSecondary">{course.course_modules.length} Modules</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.course_is_published ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {course.course_is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${course.course_progress}%` }}></div>
                      </div>
                      <span className="text-xs font-medium text-textSecondary">{course.course_progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-text">₹{course.course_price_inr}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {courses.length === 0 && (
              <div className="text-center py-8 text-textSecondary">No courses created yet.</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InstructorDashboard;