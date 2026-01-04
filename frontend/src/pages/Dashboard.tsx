// File: src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { courseService } from '../services/course.service';
import apiClient from '../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Clock, Trophy, TrendingUp, Plus, X,
  Calendar, ArrowRight, PlayCircle
} from 'lucide-react';
import { CourseCard } from '../components/Dashboard/CourseCard';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { CourseEntity } from '../types';
import { Link } from 'react-router-dom';

// --- Glass Booking Modal ---
const BookingModal = ({ isOpen, onClose, onBook }: any) => {
  const [topic, setTopic] = useState("Python Doubt");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onBook(topic, date);
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-surface/90 border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl backdrop-blur-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Book Mentorship</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest">Select Topic</label>
                <select 
                  value={topic} onChange={e => setTopic(e.target.value)}
                  className="input-field"
                >
                  <option>Python Basics</option>
                  <option>Career Guidance</option>
                  <option>Code Review</option>
                  <option>Project Architecture</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest">Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={date} onChange={e => setDate(e.target.value)}
                  className="input-field" // Uses our global class
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-4 shadow-lg shadow-secondary/20"
              >
                {loading ? "Confirming..." : "Confirm Booking"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<CourseEntity[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await courseService.getAll();
        setCourses(courseData as CourseEntity[]);
        // Mock session data for visual if API fails, or use real API
        try {
            const { data } = await apiClient.get('/instructor/sessions');
            setSessions(data);
        } catch (e) {
            // Fallback for UI demo
            setSessions([
                { type: 'Masterclass', title: 'Advanced React Patterns', time: 'Tomorrow, 10:00 AM' },
                { type: 'Q&A', title: 'Weekly Doubt Clearing', time: 'Fri, 4:00 PM' }
            ]); 
        }
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleBookSession = async (topic: string, date: string) => {
    try {
      await apiClient.post('/instructor/book-session', {
        topic,
        date: new Date(date).toLocaleString()
      });
      // In real app, refresh sessions here
    } catch (error) { console.error("Booking error"); }
  };

  if (!user || loading) return (
    <div className="h-full min-w-[82dvw] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const continueCourse = courses.find(c => c.course_progress > 0 && c.course_progress < 100) || courses[0];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-12">
      {/* Header with Gradient Text */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Welcome back, <br/>
            <span className="bg-gradient-to-r from-secondary via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {user.student_full_name.split(' ')[0]}
            </span>
            <span className="text-4xl ml-2">👋</span>
          </h1>
          <p className="text-textSecondary text-lg">Let's continue your journey to mastery.</p>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard delay={0.1} icon={Zap} label="Streak" value={`${user.student_stats.stat_days_streak} Days`} color="text-accent" trend="+1 today" />
        <StatsCard delay={0.2} icon={Clock} label="Learning Time" value={`${user.student_stats.stat_total_watch_time_hours.toFixed(1)}h`} color="text-secondary" />
        <StatsCard delay={0.3} icon={Trophy} label="Certificates" value={user.student_stats.stat_certificates_earned?.length.toString()} color="text-success" />
        <StatsCard delay={0.4} icon={TrendingUp} label="Total XP" value={user.student_stats.stat_total_xp.toLocaleString()} color="text-purple-500" trend="+450 this week" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-10">
          
          {/* Hero: Continue Learning */}
          {continueCourse && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Pick up where you left off</h2>
              </div>
              
              <Link to={`/classroom/${continueCourse.course_id}`} className="block group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-purple-600 rounded-[2.2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                
                <div className="relative glass-card p-0 rounded-[2rem] overflow-hidden flex flex-col md:flex-row">
                  {/* Image Side */}
                  <div className="w-full md:w-2/5 relative h-48 md:h-auto">
                    <img src={continueCourse.course_thumbnail_url} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-white/90 drop-shadow-xl group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  
                  {/* Content Side */}
                  <div className="flex-1 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-xs font-bold uppercase tracking-widest">
                            In Progress
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-secondary transition-colors">
                        {continueCourse.course_title}
                    </h3>
                    
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-textSecondary">Course Progress</span>
                            <span className="text-text">{continueCourse.course_progress}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${continueCourse.course_progress}%` }}
                                className="h-full bg-gradient-to-r from-secondary to-purple-500" 
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm font-bold text-textSecondary group-hover:text-text transition-colors">
                        Continue Lesson <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Enrolled Courses Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Library</h2>
                <Link to="/courses" className="text-sm font-bold text-textSecondary hover:text-secondary transition-colors">View All</Link>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses?.map(course => <CourseCard key={course.course_id} course={course} />)}
             </div>
          </motion.div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Live Sessions Widget */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6 rounded-[2rem]"
          >
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Live Sessions</h3>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-8 h-8 rounded-full border border-dashed border-textSecondary/50 flex items-center justify-center hover:bg-secondary hover:border-secondary hover:text-white transition-all"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            
            <div className="space-y-3">
                {sessions.map((s, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded uppercase">{s.type}</span>
                            <ArrowRight className="w-3 h-3 text-textSecondary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </div>
                        <h4 className="font-bold text-sm mb-1">{s.title}</h4>
                        <p className="text-xs text-textSecondary flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {s.time}
                        </p>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-4 py-3 border border-dashed border-white/20 rounded-xl text-sm font-bold text-textSecondary hover:text-text hover:bg-white/5 transition-all"
            >
                Book 1:1 Mentorship
            </button>
          </motion.div>

          {/* Gamification / Banner */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.7 }}
             className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-purple-600 to-blue-600 p-8 text-white shadow-2xl"
          >
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/20 blur-3xl rounded-full pointer-events-none" />
             
             <Trophy className="w-10 h-10 mb-4 text-yellow-300 fill-current" />
             <h3 className="text-2xl font-bold mb-2">Unlock Pro</h3>
             <p className="text-white/80 text-sm mb-6">Get access to AI grading and verified certificates.</p>
             
             <Link to="/subscription" className="inline-block bg-white text-purple-600 px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg">
                Upgrade Now
             </Link>
          </motion.div>
        </div>
      </div>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onBook={handleBookSession}
      />
    </div>
  );
};

export default Dashboard;