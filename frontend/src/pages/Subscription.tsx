import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  Zap, 
  Star, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';

const Subscription = () => {
  const navigate = useNavigate();
    const { user } = useAuthStore();

    const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    description: 'Perfect for getting started with coding.',
    features: {
      lessons: true,
      cert: true,
      slides: false,
      mindmaps: false,
      revision: false,
      support: false
    },
    color: 'border-border',
    buttonText: 'Current Plan',
    isCurrent: user?.student_subscription_tier === 'basic'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: '/mo',
    description: 'Supercharge your learning with AI tools.',
    features: {
      lessons: true,
      cert: true,
      slides: true,
      mindmaps: true,
      revision: true,
      support: false
    },
    color: 'border-secondary',
    highlight: true,
    buttonText: 'Current Plan',
    isCurrent: user?.student_subscription_tier === 'pro'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$49',
    period: '/mo',
    description: 'The ultimate experience with human mentorship.',
    features: {
      lessons: true,
      cert: true,
      slides: true,
      mindmaps: true,
      revision: true,
      support: true
    },
    color: 'border-accent',
    buttonText: 'Upgrade to Premium',
    isCurrent: user?.student_subscription_tier === 'premium'
  }
];

const FEATURE_LIST = [
  { key: 'lessons', label: 'Interactive Video Lessons', icon: Zap },
  { key: 'cert', label: 'Final Certification', icon: ShieldCheck },
  { key: 'slides', label: 'AI Generated Slide Decks', icon: Sparkles },
  { key: 'mindmaps', label: 'AI Mind Maps & Flashcards', icon: Star },
  { key: 'revision', label: 'AI Revision Sheets', icon: Sparkles },
  { key: 'support', label: 'Live Human Doubt Support', icon: MessageSquare },
];
  

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-textSecondary hover:text-text mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Profile
      </button>

      <header className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-4"
        >
          Choose Your Path to Mastery
        </motion.h1>
        <p className="text-xl text-textSecondary max-w-2xl mx-auto">
          Unlock advanced AI tools and expert mentorship to accelerate your career in tech.
        </p>
      </header>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {TIERS.map((tier, idx) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "relative bg-surface border-2 rounded-[40px] p-8 flex flex-col",
              tier.color,
              tier.highlight && "shadow-2xl shadow-secondary/10 scale-105 z-10"
            )}
          >
            {tier.highlight && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-secondary text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && <span className="text-textSecondary">{tier.period}</span>}
              </div>
              <p className="text-textSecondary text-sm leading-relaxed">
                {tier.description}
              </p>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {FEATURE_LIST.map((feature) => {
                const isIncluded = tier.features[feature.key as keyof typeof tier.features];
                return (
                  <div key={feature.key} className={cn(
                    "flex items-center gap-3 text-sm",
                    isIncluded ? "text-text" : "text-textSecondary/40"
                  )}>
                    {isIncluded ? (
                      <Check className="w-5 h-5 text-success shrink-0" />
                    ) : (
                      <X className="w-5 h-5 shrink-0" />
                    )}
                    {feature.label}
                  </div>
                );
              })}
            </div>

            <button 
              className={cn(
                "w-full py-4 rounded-2xl font-bold transition-all",
                tier.isCurrent 
                  ? "bg-text/5 text-textSecondary cursor-default" 
                  : tier.highlight
                    ? "bg-secondary text-white hover:opacity-90 shadow-lg shadow-secondary/20"
                    : "bg-text text-background hover:opacity-90"
              )}
            >
              {tier.isCurrent ? "Current Plan" : tier.buttonText}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table (Desktop) */}
      <section className="hidden lg:block bg-surface border border-border rounded-[40px] overflow-hidden">
        <div className="p-10 border-b border-border">
          <h2 className="text-2xl font-bold">Feature Comparison</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-text/5">
              <th className="p-6 font-bold text-textSecondary uppercase text-xs tracking-widest">Feature</th>
              <th className="p-6 font-bold text-textSecondary uppercase text-xs tracking-widest text-center">Basic</th>
              <th className="p-6 font-bold text-textSecondary uppercase text-xs tracking-widest text-center">Pro</th>
              <th className="p-6 font-bold text-textSecondary uppercase text-xs tracking-widest text-center">Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {FEATURE_LIST.map((feature) => (
              <tr key={feature.key} className="hover:bg-text/5 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-secondary" />
                    <span className="font-medium">{feature.label}</span>
                  </div>
                </td>
                {TIERS.map(tier => (
                  <td key={tier.id} className="p-6 text-center">
                    {tier.features[feature.key as keyof typeof tier.features] ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-success/10 rounded-full">
                        <Check className="w-5 h-5 text-success" />
                      </div>
                    ) : (
                      <X className="w-5 h-5 text-textSecondary/20 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Subscription;
