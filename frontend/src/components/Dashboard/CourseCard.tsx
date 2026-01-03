import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CourseEntity } from "../../types";
import { useAuthStore } from "../../store/useAuthStore";

interface CourseCardProps {
  course: CourseEntity;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const { user } = useAuthStore();
  
  // FIX: Robust check for both Object-based and String-based enrollment
  const isEnrolled = user?.student_enrolled_courses.some((enrollment) => {
    if (typeof enrollment === 'string') {
      return enrollment === course.course_id;
    }
    return enrollment.course_id === course.course_id;
  });

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-surface border border-border rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.course_thumbnail_url}
          alt={course.course_title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-thin">
          <Link
            to={
              isEnrolled
                ? `/classroom/${course.course_id}`
                : `/enroll/${course.course_id}`
            }
            className="btn-primary" // Ensure you have this class or use Tailwind classes directly: "bg-secondary text-white px-4 py-2 rounded-lg font-bold"
          >
            {isEnrolled ? "Continue Learning" : "Enroll Now"}
          </Link>
        </div>
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
              course.course_difficulty === "Pro"
                ? "bg-accent text-white"
                : course.course_difficulty === "Intermediate"
                ? "bg-secondary text-white"
                : "bg-success text-white"
            }`}
          >
            {course.course_difficulty}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-4 line-clamp-1 group-hover:text-secondary transition-colors">
          {course.course_title}
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-textSecondary">Progress</span>
            <span className="text-secondary font-bold">
              {course.course_progress}%
            </span>
          </div>
          <div className="h-1.5 bg-text/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.course_progress}%` }}
              className="h-full bg-secondary"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};