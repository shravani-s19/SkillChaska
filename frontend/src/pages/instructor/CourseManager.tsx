import React, { useState, useEffect } from 'react';
import { instructorService } from '../../services/instructor.service'; // Import Service
import { Plus, Search, Filter, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CourseEntity } from '../../types';

const CourseManager = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<CourseEntity[]>([]);

  useEffect(() => {
    // Fetch real courses
    instructorService.getMyCourses().then(setCourses).catch(console.error);
  }, []);

  const filteredCourses = courses.filter(course => 
    course.course_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex min-w-[100dvw] flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">My Courses</h1>
          <p className="text-textSecondary text-sm">Manage your curriculum and content</p>
        </div>
        <Link to="/instructor/create-course" className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-colors shadow-lg shadow-primary/20">
          <Plus size={18} />
          Create New Course
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border focus:border-primary rounded-lg outline-none transition-all text-text"
          />
        </div>
        <button className="flex items-center gap-2 text-textSecondary hover:text-text px-4 py-2 rounded-lg hover:bg-background transition-colors">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <motion.div 
            layout
            key={course.course_id} 
            className="group bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Image Area */}
            <div className="h-48 overflow-hidden relative">
              <img src={course.course_thumbnail_url} alt={course.course_title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm text-text">
                {course.course_difficulty}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${course.course_is_published ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {course.course_is_published ? 'Published' : 'Draft'}
                </span>
                <button className="text-textSecondary hover:text-text">
                  <MoreVertical size={18} />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-text mb-2 line-clamp-1">{course.course_title}</h3>
              <p className="text-textSecondary text-sm line-clamp-2 mb-4">{course.course_description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-textSecondary">
                  <span className="font-bold text-text">{course.course_modules.length}</span> Modules
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-textSecondary hover:text-error hover:bg-error/10 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={() => navigate(`/instructor/course/${course.course_id}`)}
                    className="p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredCourses.length === 0 && (
            <div className="col-span-full text-center py-12 text-textSecondary">
                No courses found.
            </div>
        )}
      </div>
    </motion.div>
  );
};

export default CourseManager;