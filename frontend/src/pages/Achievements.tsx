import { useEffect, useState } from 'react';
import { Trophy, Award, Medal, Star } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { BadgeCard } from '../components/Achievements/BadgeCard';
import { CertificateCard } from '../components/Achievements/CertificateCard';
import { achievementsService } from '../services/achievements.service';
import { Badge, Certificate } from '../types';

const Achievements = () => {
  const { user } = useAuthStore();
  
  const [badges, setBadges] = useState<Badge[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Badges
        const badgesData = await achievementsService.getBadges();
        setBadges(badgesData);

        // 2. Fetch Certificates (using IDs from user profile)
        if (user && user.student_stats.stat_certificates_earned) {
          const certsData = await achievementsService.getCertificates(
            user.student_stats.stat_certificates_earned
          );
          setCertificates(certsData);
        }
      } catch (error) {
        console.error("Failed to load achievements", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Loading Skeleton
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Derived Stats
  const unlockedBadgesCount = badges.filter(b => !b.isLocked).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
            <Trophy className="text-accent w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold">Achievements</h1>
        </div>
        <p className="text-textSecondary max-w-2xl">
          Your journey of excellence. Track your earned badges, certifications, and milestones as you master new technologies.
        </p>
      </header>

      {/* Stats Overview - Using Real User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface border border-border p-6 rounded-3xl flex items-center gap-5">
          <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
            <Award className="text-secondary w-8 h-8" />
          </div>
          <div>
            <p className="text-3xl font-bold">{unlockedBadgesCount}</p>
            <p className="text-sm text-textSecondary">Badges Earned</p>
          </div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-3xl flex items-center gap-5">
          <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center">
            <Medal className="text-success w-8 h-8" />
          </div>
          <div>
            <p className="text-3xl font-bold">{user.student_stats.stat_certificates_earned?.length || 0}</p>
            <p className="text-sm text-textSecondary">Certificates</p>
          </div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-3xl flex items-center gap-5">
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
            <Star className="text-accent w-8 h-8" />
          </div>
          <div>
            <p className="text-3xl font-bold">Top 5%</p>
            <p className="text-sm text-textSecondary">Learning Velocity</p>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Skill Badges</h2>
          <span className="text-sm text-textSecondary font-medium">
            {unlockedBadgesCount} / {badges.length} Unlocked
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      {/* Certificates Section */}
      <section>
        <h2 className="text-2xl font-bold mb-8">Professional Certificates</h2>
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-border rounded-3xl text-center text-textSecondary">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>You haven't earned any certificates yet. Complete a course to earn one!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Achievements;