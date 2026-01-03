import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    thumbnail: string;
    difficulty: string;
    progress: number;
  };
}

export const CourseCard = ({ course }: CourseCardProps) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-surface border border-border rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300"
  >
    <div className="relative aspect-video overflow-hidden">
      <img 
        src={course.thumbnail} 
        alt={course.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Link 
          to={`/classroom/${course.id}`}
          className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg"
        >
          <Play className="fill-current ml-1" />
        </Link>
      </div>
      <div className="absolute top-3 left-3">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
          course.difficulty === 'Pro' 
            ? 'bg-accent text-white' 
            : course.difficulty === 'Intermediate'
            ? 'bg-secondary text-white'
            : 'bg-success text-white'
        }`}>
          {course.difficulty}
        </span>
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-bold text-lg mb-4 line-clamp-1 group-hover:text-secondary transition-colors">{course.title}</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-textSecondary">Progress</span>
          <span className="text-secondary font-bold">{course.progress}%</span>
        </div>
        <div className="h-1.5 bg-text/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${course.progress}%` }}
            className="h-full bg-secondary"
          />
        </div>
      </div>
    </div>
  </motion.div>
);
