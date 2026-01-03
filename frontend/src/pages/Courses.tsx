import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, Star, Users, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { CourseCard } from '../components/Dashboard/CourseCard';

const ALL_COURSES = [
  {
    id: "python-mastery",
    title: "Advanced Python Patterns",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    difficulty: "Pro",
    progress: 65,
    rating: 4.9,
    students: "12.4k",
    duration: "12h 30m",
    category: "Programming"
  },
  {
    id: "react-ai",
    title: "Building AI with React",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
    difficulty: "Beginner",
    progress: 30,
    rating: 4.8,
    students: "8.2k",
    duration: "8h 45m",
    category: "Web Dev"
  },
  {
    id: "data-science",
    title: "Data Science Foundations",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bbda48658a7d?auto=format&fit=crop&w=800&q=80",
    difficulty: "Pro",
    progress: 10,
    rating: 4.7,
    students: "15.1k",
    duration: "20h 15m",
    category: "Data Science"
  },
  {
    id: "machine-learning",
    title: "Machine Learning A-Z",
    thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
    difficulty: "Intermediate",
    progress: 0,
    rating: 4.9,
    students: "22.8k",
    duration: "45h 00m",
    category: "AI"
  },
  {
    id: "neural-networks",
    title: "Neural Networks Deep Dive",
    thumbnail: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80",
    difficulty: "Pro",
    progress: 0,
    rating: 4.6,
    students: "5.4k",
    duration: "15h 20m",
    category: "AI"
  },
  {
    id: "web-dev-ai",
    title: "AI-Powered Web Development",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    difficulty: "Beginner",
    progress: 0,
    rating: 4.8,
    students: "10.9k",
    duration: "10h 10m",
    category: "Web Dev"
  }
];

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Beginner", "Intermediate", "Pro"];

  const filteredCourses = ALL_COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "All" || course.difficulty === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Featured Hero */}
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
          <p className="text-textSecondary">Explore {ALL_COURSES.length} professional-grade courses</p>
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

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode='popLayout'>
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <CourseCard course={course} />
              <div className="mt-4 flex items-center justify-between px-2">
                <div className="flex items-center gap-4 text-xs text-textSecondary font-medium">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-accent fill-current" />
                    <span className="text-text">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{course.students}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-1 rounded-md">
                  {course.category}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCourses.length === 0 && (
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
