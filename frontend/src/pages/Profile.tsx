import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, Calendar, Shield, Zap, Flame, Star, 
  BookOpen, Award, Edit3, ExternalLink 
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const joinedDate = new Date(user.student_joined_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-8 min-w-[82dvw]">
      {/* Header / Hero Section */}
      <header className="relative mb-12">
        <div className="h-48 bg-gradient-to-r from-secondary/20 via-accent/10 to-secondary/20 rounded-[40px] overflow-hidden">
          
        </div>
        
        <div className="px-8 -mt-16 flex flex-col md:flex-row items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[32px] border-4 border-background overflow-hidden shadow-2xl bg-surface">
              <img 
                src={user.student_avatar_url || "https://ui-avatars.com/api/?name=" + user.student_full_name} 
                alt={user.student_full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <Link 
              to="/edit-profile"
              className="absolute bottom-2 right-2 p-2 bg-secondary text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">{user.student_full_name}</h1>
              <span className="px-3 py-1 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-secondary/20">
                {user.student_subscription_tier}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-textSecondary">
              <div className="flex items-center gap-1.5 text-sm">
                <Mail className="w-4 h-4" />
                {user.student_email}
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar className="w-4 h-4" />
                Joined {joinedDate}
              </div>
            </div>
            {user.student_bio && (
              <p className="text-sm text-textSecondary mt-2 max-w-lg line-clamp-2">
                {user.student_bio}
              </p>
            )}
          </div>

          <div className="flex gap-3 pb-2">
            <Link 
              to="/edit-profile"
              className="bg-text text-background px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-opacity"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface border border-border p-5 rounded-3xl text-center">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Flame className="text-accent w-6 h-6 fill-current" />
              </div>
              <p className="text-2xl font-bold">{user.student_stats.stat_days_streak}</p>
              <p className="text-xs text-textSecondary font-medium uppercase tracking-wider">Day Streak</p>
            </div>
            <div className="bg-surface border border-border p-5 rounded-3xl text-center">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="text-secondary w-6 h-6 fill-current" />
              </div>
              <p className="text-2xl font-bold">{user.student_stats.stat_total_xp}</p>
              <p className="text-xs text-textSecondary font-medium uppercase tracking-wider">Total XP</p>
            </div>
            <div className="bg-surface border border-border p-5 rounded-3xl text-center">
              <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="text-success w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">{user.student_stats.stat_modules_completed}</p>
              <p className="text-xs text-textSecondary font-medium uppercase tracking-wider">Modules</p>
            </div>
            <div className="bg-surface border border-border p-5 rounded-3xl text-center">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Award className="text-purple-500 w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">{user.student_stats.stat_certificates_earned?.length || 0}</p>
              <p className="text-xs text-textSecondary font-medium uppercase tracking-wider">Certificates</p>
            </div>
          </section>

          {/* Account Details */}
          <section className="bg-surface border border-border rounded-[32px] overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-lg">Account Details</h2>
              <Shield className="w-5 h-5 text-textSecondary" />
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Role</p>
                  <p className="font-bold capitalize">{user.role}</p>
                </div>
                <div className="px-3 py-1 bg-text/5 rounded-lg text-xs font-bold">Verified</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Subscription Status</p>
                  <p className="font-bold text-secondary capitalize">{user.student_subscription_tier} Member</p>
                </div>
                <Link to="/subscription" className="text-secondary text-sm font-bold hover:underline">Manage Plan</Link>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Email Address</p>
                  <p className="font-bold">{user.student_email}</p>
                </div>
                <Link to="/edit-profile" className="text-textSecondary hover:text-text transition-colors">
                  <Edit3 className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Subscription & Quick Links */}
        <div className="space-y-8">
          {/* Pro Card */}
          <section className="bg-gradient-to-br from-secondary to-secondary/80 p-8 rounded-[32px] text-white relative overflow-hidden shadow-xl shadow-secondary/20">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <Star className="w-10 h-10 mb-6 fill-current" />
            <h3 className="text-2xl font-bold mb-2">Pro Member</h3>
            <p className="text-white/80 text-sm mb-8">You have full access to all premium courses, AI tutoring, and certificates.</p>
            <Link 
              to="/subscription"
              className="w-full bg-white text-secondary py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
            >
              View Benefits <ExternalLink className="w-4 h-4" />
            </Link>
          </section>

          {/* Quick Links */}
          <section className="bg-surface border border-border rounded-[32px] p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3 hover:bg-error/5 rounded-xl transition-colors text-sm font-medium text-error"
              >
                Sign Out
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;