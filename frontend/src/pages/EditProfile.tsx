import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Save,
  ChevronLeft,
  User,
  Mail,
  Globe,
  Github,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { authService } from "../services/auth.service";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    bio: "",
    website: "",
    github: "",
  });

  // Load User Data into Form
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.student_full_name || "",
        email: user.student_email || "",
        bio: user.student_bio || "",
        website: user.student_website || "",
        github: user.student_social_github || "",
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Call API
      await authService.updateProfile({
        student_full_name: formData.fullName,
        student_email: formData.email,
        student_bio: formData.bio,
        student_website: formData.website,
        student_social_github: formData.github,
      });

      await checkAuth();

      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update profile. API might be missing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true);
      try {
        const file = e.target.files[0];
        await authService.uploadAvatar(file);

        // Refresh profile to get new avatar
        const token = localStorage.getItem("jwt_token");
        if (token) login(token);

        alert("Avatar updated!");
      } catch (error) {
        console.error("Avatar upload failed", error);
        alert("Failed to upload avatar. API might be missing.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-10">
        <Link
          to="/profile"
          className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors mb-4 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </Link>
        <h1 className="text-4xl font-bold">Edit Profile</h1>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar Section */}
        <section className="bg-surface border border-border rounded-[2rem] p-8">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <img
                src={
                  user.student_avatar_url ||
                  "https://ui-avatars.com/api/?name=" + user.student_full_name
                }
                alt="Avatar"
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white/5"
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Profile Picture</h3>
              <p className="text-textSecondary text-sm mb-4">
                PNG, JPG or GIF. Max size of 800K
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-secondary text-white rounded-xl text-sm font-bold"
                >
                  Upload New
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Basic Info */}
        <section className="bg-surface border border-border rounded-[2rem] p-8 space-y-6">
          <h3 className="text-xl font-bold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-textSecondary flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-textSecondary flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-textSecondary">Bio</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors resize-none"
            />
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-surface border border-border rounded-[2rem] p-8 space-y-6">
          <h3 className="text-xl font-bold mb-4">Social Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-textSecondary flex items-center gap-2">
                <Globe className="w-4 h-4" /> Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-textSecondary flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub
              </label>
              <input
                type="text"
                value={formData.github}
                onChange={(e) =>
                  setFormData({ ...formData, github: e.target.value })
                }
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="px-8 py-4 bg-white/5 text-text rounded-2xl font-bold hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-secondary text-white rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-secondary/20 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
