import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, Loader2, UploadCloud, X } from 'lucide-react';
import { createCourse } from '../../data/mockInstructorData';
import { motion } from 'framer-motion';

const CreateCourse = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    course_title: '',
    course_description: '',
    course_difficulty: 'Beginner',
    course_price_inr: 4999,
    course_thumbnail_url: '' // Will store blob URL
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local URL for the file to preview it immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      setFormData(prev => ({ ...prev, course_thumbnail_url: objectUrl }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newCourse = createCourse({
        ...formData,
        // Fallback image if user didn't upload one
        course_thumbnail_url: formData.course_thumbnail_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800'
      });
      
      setLoading(false);
      navigate(`/instructor/course/${newCourse.course_id}`); 
    }, 1500);
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
    >
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors">
        <ArrowLeft size={18} /> Cancel
      </button>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text">Create New Course</h1>
          <p className="text-textSecondary">Start by setting up the basic details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-2xl border border-border shadow-sm space-y-6">
        
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-text">Course Title</label>
          <input 
            type="text" 
            placeholder="e.g. Advanced Python Patterns" 
            value={formData.course_title}
            onChange={(e) => setFormData({...formData, course_title: e.target.value})}
            className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text transition-all"
            required 
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-text">Description</label>
          <textarea 
            rows={4} 
            placeholder="What will students learn?" 
            value={formData.course_description}
            onChange={(e) => setFormData({...formData, course_description: e.target.value})}
            className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text transition-all resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-text">Difficulty Level</label>
            <select 
                value={formData.course_difficulty}
                onChange={(e) => setFormData({...formData, course_difficulty: e.target.value as any})}
                className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Pro">Pro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text">Price (INR)</label>
            <input 
              type="number" 
              placeholder="4999" 
              value={formData.course_price_inr}
              onChange={(e) => setFormData({...formData, course_price_inr: parseInt(e.target.value)})}
              className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text"
            />
          </div>
        </div>

        {/* Thumbnail Upload Area */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-text">Course Thumbnail</label>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
                relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center 
                transition-all cursor-pointer group overflow-hidden
                ${previewImage ? 'border-primary h-64 p-0' : 'border-border hover:bg-background hover:border-primary'}
            `}
          >
            {previewImage ? (
                <>
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-bold flex items-center gap-2"><ImageIcon /> Change Image</span>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud size={24} className="group-hover:text-primary transition-colors text-textSecondary" />
                    </div>
                    <span className="text-sm font-medium text-text">Click to upload image</span>
                    <span className="text-xs text-textSecondary">JPG, PNG (Max 5MB)</span>
                </>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating...</>
            ) : (
              <><Save size={18} /> Create & Continue</>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateCourse;