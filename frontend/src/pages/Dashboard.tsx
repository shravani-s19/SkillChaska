import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { courseService } from '../services/course.service';
import apiClient from '../lib/axios'; // Direct axios for the new route
import { motion } from 'framer-motion';
import { 
  Zap, Clock, Trophy, BookOpen, Play,
  Calendar, TrendingUp, Plus, X
} from 'lucide-react';
import { CourseCard } from '../components/Dashboard/CourseCard';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { CourseEntity } from '../types';
import { Link } from 'react-router-dom';

// --- Booking Modal Component ---
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface border border-border p-6 rounded-3xl w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Book 1:1 Mentorship</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-textSecondary">Topic</label>
            <select 
              value={topic} onChange={e => setTopic(e.target.value)}
              className="w-full bg-white/5 border border-border rounded-xl p-3 mt-1"
            >
              <option>Python Basics</option>
              <option>Career Guidance</option>
              <option>Code Review</option>
              <option>Project Help</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-textSecondary">Date & Time</label>
            <input 
              type="datetime-local" 
              required
              value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-white/5 border border-border rounded-xl p-3 mt-1"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:opacity-90"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<CourseEntity[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      // 1. Fetch Courses
      const courseData = await courseService.getAll();
      setCourses(courseData as CourseEntity[]);
      
      // 2. Fetch Sessions (New Endpoint)
      const { data: sessionData } = await apiClient.get('/instructor/sessions');
      setSessions(sessionData);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookSession = async (topic: string, date: string) => {
    try {
      await apiClient.post('/instructor/book-session', {
        topic,
        date: new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
      });
      // Refresh list
      const { data } = await apiClient.get('/instructor/sessions');
      setSessions(data);
    } catch (error) {
      alert("Failed to book session");
    }
  };

  if (!user || loading) return <div className="p-8">Loading Dashboard...</div>;

  const continueCourse = courses.find(c => c.course_progress > 0 && c.course_progress < 100) || courses[0];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user.student_full_name.split(' ')[0]}! 👋
          </h1>
          <p className="text-textSecondary">You are making great progress.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard icon={Zap} label="Current Streak" value={`${user.student_stats.stat_days_streak} Days`} color="text-accent" />
        <StatsCard icon={Clock} label="Hours Learned" value={`${user.student_stats.stat_total_watch_time_hours.toFixed(1)}h`} color="text-secondary" />
        <StatsCard icon={Trophy} label="Certificates" value={user.student_stats.stat_certificates_earned.length.toString()} color="text-success" />
        <StatsCard icon={TrendingUp} label="Total XP" value={user.student_stats.stat_total_xp.toLocaleString()} color="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Continue Learning */}
          {continueCourse && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Play className="w-6 h-6 text-secondary fill-current" />
                  Continue Learning
                </h2>
              </div>
              <Link to={`/classroom/${continueCourse.course_id}`} className="block group">
                <div className="relative rounded-[2rem] overflow-hidden bg-surface border border-white/5 p-8 flex flex-col md:flex-row items-center gap-8 transition-all hover:border-secondary/50 hover:shadow-2xl hover:shadow-secondary/10">
                  <div className="w-full md:w-48 aspect-video rounded-2xl overflow-hidden relative">
                    <img src={continueCourse.course_thumbnail_url} alt="Course" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-10 h-10 text-white fill-current" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-secondary transition-colors">{continueCourse.course_title}</h3>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${continueCourse.course_progress}%` }} className="h-full bg-secondary" />
                    </div>
                    <p className="text-xs text-textSecondary mt-2">{continueCourse.course_progress}% Complete</p>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Enrolled Courses */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-secondary" /> Your Courses</h2>
              <Link to="/courses" className="text-secondary font-bold text-sm hover:underline">View Library</Link>
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
          {/* Live Sessions */}
          <section className="bg-surface border border-border rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Live Sessions</h3>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="p-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {sessions.length > 0 ? sessions.map((event, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-secondary/30 transition-colors">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{event.type}</span>
                  <h4 className="font-bold text-sm mt-1">{event.title}</h4>
                  <p className="text-xs text-textSecondary mt-1 flex items-center gap-1">
                     <Calendar className="w-3 h-3" /> {event.time}
                  </p>
                </div>
              )) : (
                <p className="text-sm text-textSecondary text-center py-4">No upcoming sessions.</p>
              )}
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-4 py-3 border border-dashed border-border rounded-xl text-sm font-bold text-textSecondary hover:text-text hover:border-text transition-all"
            >
              Book a Mentor
            </button>
          </section>

          {/* Achievements Link */}
          <section className="bg-surface border border-border rounded-[2rem] p-6 text-center">
            <h3 className="font-bold text-lg mb-4">Achievements</h3>
            <div className="flex justify-center gap-2 mb-6">
              <div className="text-4xl">🏆</div>
              <div className="text-4xl">🚀</div>
              <div className="text-4xl">⭐</div>
            </div>
            <Link to="/achievements" className="text-secondary font-bold text-sm hover:underline">
              View All Badges
            </Link>
          </section>
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