import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { courseService } from '../services/course.service';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Clock, 
  Trophy, 
  BookOpen, 
  ArrowRight, 
  Play,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { CourseCard } from '../components/Dashboard/CourseCard';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { CourseEntity } from '../types';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<CourseEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch real courses from API
        const data = await courseService.getAll();
        setCourses(data as CourseEntity[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (!user || loading) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold mb-2"
          >
            Welcome back, {user.student_full_name.split(' ')[0]}! 👋
          </motion.h1>
          <p className="text-textSecondary">You've completed 14 modules this month. Keep it up!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface border border-border px-4 py-2 rounded-2xl flex items-center gap-3">
            <Calendar className="w-5 h-5 text-secondary" />
            <span className="text-sm font-bold">March 20, 2024</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard 
          icon={Zap} 
          label="Current Streak" 
          value={`${user.student_stats.stat_days_streak} Days`} 
          trend="+2 from last week"
          color="text-accent"
        />
        <StatsCard 
          icon={Clock} 
          label="Hours Learned" 
          value={`${user.student_stats.stat_total_watch_time_hours}h`} 
          trend="Top 5% of students"
          color="text-secondary"
        />
        <StatsCard 
          icon={Trophy} 
          label="Certificates" 
          value={user.student_stats.stat_certificates_earned.length.toString()} 
          trend="1 pending review"
          color="text-success"
        />
        <StatsCard 
          icon={TrendingUp} 
          label="Total XP" 
          value={user.student_stats.stat_total_xp.toLocaleString()} 
          trend="Level 12 Architect"
          color="text-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Continue Learning Hero */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Play className="w-6 h-6 text-secondary fill-current" />
                Continue Learning
              </h2>
            </div>
            <Link to="/classroom/course_b86c399e" className="block group">
              <div className="relative rounded-[2rem] overflow-hidden bg-surface border border-white/5 p-8 flex flex-col md:flex-row items-center gap-8 transition-all hover:border-secondary/50 hover:shadow-2xl hover:shadow-secondary/10">
                <div className="w-full md:w-48 aspect-video rounded-2xl overflow-hidden relative">
                  <img 
                    src={courses?.[0]?.course_thumbnail_url} 
                    alt="Course" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-10 h-10 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Module 4 of 12</span>
                    <div className="w-1 h-1 bg-textSecondary rounded-full" />
                    <span className="text-xs text-textSecondary">22 mins remaining</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-secondary transition-colors">{courses?.[0]?.course_title}</h3>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${courses?.[0]?.course_progress}%` }}
                      className="h-full bg-secondary"
                    />
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-textSecondary group-hover:text-secondary group-hover:translate-x-2 transition-all" />
              </div>
            </Link>
          </section>

          {/* Enrolled Courses */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-secondary" />
                Your Courses
              </h2>
              <Link to="/courses" className="text-secondary font-bold text-sm hover:underline flex items-center gap-1">
                View Library <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses?.map((course) => (
                <CourseCard key={course.course_id} course={course} />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-8">
          {/* Upcoming Events */}
          <section className="bg-surface border border-border rounded-[2rem] p-6">
            <h3 className="font-bold text-lg mb-6">Upcoming Live Sessions</h3>
            <div className="space-y-4">
              {[
                { title: "AI Ethics Workshop", time: "Today, 4:00 PM", type: "Workshop" },
                { title: "Python Q&A", time: "Tomorrow, 10:00 AM", type: "Live" }
              ].map((event, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-secondary/30 transition-colors cursor-pointer">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{event.type}</span>
                  <h4 className="font-bold text-sm mt-1">{event.title}</h4>
                  <p className="text-xs text-textSecondary mt-1">{event.time}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Achievements */}
          <section className="bg-surface border border-border rounded-[2rem] p-6">
            <h3 className="font-bold text-lg mb-6">Recent Badges</h3>
            <div className="flex flex-wrap gap-3">
              {['🐍', '🧠', '🚀', '🔥'].map((emoji, i) => (
                <div key={i} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl hover:scale-110 transition-transform cursor-help">
                  {emoji}
                </div>
              ))}
            </div>
            <Link to="/achievements" className="block text-center mt-6 text-sm font-bold text-textSecondary hover:text-secondary transition-colors">
              View All Achievements
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
