import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Star, Users, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { CourseCard } from '../components/Dashboard/CourseCard';
import { courseService } from '../services/course.service';
import { CourseEntity } from '../types';

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  
  // State for Real Data
  const [allCourses, setAllCourses] = useState<CourseEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters = ["All", "Beginner", "Intermediate", "Pro"];

  // Fetch Courses on Mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAll();
        // Since getAll returns Partial<CourseEntity>[], cast or ensure types match
        setAllCourses(data as CourseEntity[]);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.course_title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Map backend difficulty to frontend filter if needed, assuming backend matches 'Beginner' etc.
    const matchesFilter = activeFilter === "All" || course.course_difficulty === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Featured Hero (Static for now, could be dynamic later) */}
      <section className="mb-16 relative rounded-[2.5rem] overflow-hidden bg-surface border border-white/5 group">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent opacity-50" />
        <div className="relative z-10 p-12 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                NEW RELEASE
              </div>
            </div>
            <h2 className="text-5xl font-bold mb-6 leading-tight">Master Generative AI <br/> with Python</h2>
            <p className="text-textSecondary text-lg mb-8 max-w-lg">
              Go beyond the basics. Learn to build, fine-tune, and deploy LLMs using industry-standard Python patterns.
            </p>
            <button className="bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-secondary/20">
              Start Learning Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 relative">
            <div className="absolute -inset-4 bg-secondary/20 blur-3xl rounded-full" />
            <img 
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80" 
              alt="AI Course"
              className="relative rounded-3xl shadow-2xl border border-white/10 transform group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
              <BookOpen className="text-secondary w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold">Course Library</h1>
          </div>
          <p className="text-textSecondary">Explore {allCourses.length} professional-grade courses</p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-surface border border-border rounded-2xl">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeFilter === filter 
                  ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                  : 'text-textSecondary hover:text-text'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative mb-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-textSecondary w-5 h-5" />
        <input 
          type="text"
          placeholder="Search by topic, technology, or difficulty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-16 pr-6 py-5 bg-surface border border-border rounded-[2rem] focus:outline-none focus:border-secondary transition-all text-lg shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        /* Course Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredCourses.map((course) => (
              <motion.div
                key={course.course_id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {/* 
                  Mapping CourseEntity to CourseCardProps.
                  Note: Backend might not have 'rating' or 'students' yet, so we use defaults.
                */}
                <CourseCard course={course} />
                
                <div className="mt-4 flex items-center justify-between px-2">
                  <div className="flex items-center gap-4 text-xs text-textSecondary font-medium">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-accent fill-current" />
                      <span className="text-text">4.8</span> {/* Static placeholder */}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>1.2k</span> {/* Static placeholder */}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>12h</span> {/* Static placeholder */}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-1 rounded-md">
                    {/* Assuming category can be inferred or added later */}
                    Tech
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && filteredCourses.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32"
        >
          <div className="w-24 h-24 bg-surface border border-border rounded-full flex items-center justify-center mx-auto mb-8">
            <Search className="w-10 h-10 text-textSecondary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No courses found</h3>
          <p className="text-textSecondary max-w-md mx-auto">We couldn't find any courses matching "{searchQuery}". Try a different keyword or filter.</p>
        </motion.div>
      )}
    </div>
  );
};

export default Courses;