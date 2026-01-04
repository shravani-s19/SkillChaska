// File: src/components/Dashboard/CourseCard.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Star, Users } from "lucide-react";
import { CourseEntity } from "../../types";
import { useAuthStore } from "../../store/useAuthStore";

interface CourseCardProps {
  course: CourseEntity;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const { user } = useAuthStore();
  
  const isEnrolled = user?.student_enrolled_courses.some((enrollment) => {
    if (typeof enrollment === 'string') return enrollment === course.course_id;
    return enrollment.course_id === course.course_id;
  });

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="glass-card rounded-[2rem] overflow-hidden group flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={course.course_thumbnail_url}
          alt={course.course_title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Floating Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 shadow-lg ${
             course.course_difficulty === "Pro" ? "bg-accent/80 text-white" :
             course.course_difficulty === "Intermediate" ? "bg-secondary/80 text-white" :
             "bg-success/80 text-white"
          }`}>
            {course.course_difficulty}
          </span>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
          <Link
            to={isEnrolled ? `/classroom/${course.course_id}` : `/enroll/${course.course_id}`}
            className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-secondary hover:border-secondary transition-colors shadow-2xl"
          >
            <Play className="w-6 h-6 text-white fill-current ml-1" />
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-xs text-textSecondary mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-accent fill-current" />
            <span className="text-text font-bold">4.9</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>2.5k Students</span>
          </div>
        </div>

        <h3 className="font-bold text-lg mb-2 leading-snug group-hover:text-secondary transition-colors line-clamp-2">
          {course.course_title}
        </h3>
        
        <div className="mt-auto pt-4">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-textSecondary">Progress</span>
            <span className="text-secondary">{course.course_progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.course_progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-secondary to-blue-500 rounded-full shadow-[0_0_10px_rgba(var(--secondary),0.5)]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};