// File: src/pages/CourseEnrollment.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronLeft, 
  AlertCircle 
} from 'lucide-react';
import { courseService } from '../services/course.service';
import { CourseEntity } from '../types';
import { useAuthStore } from '../store/useAuthStore';

const CourseEnrollment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [course, setCourse] = useState<CourseEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Mock Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  useEffect(() => {
    if (id) {
      const fetchCourse = async () => {
        try {
          const data = await courseService.getById(id);
          setCourse(data);
        } catch (err) {
          setError('Failed to load course details.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !course) return;

    // Basic Mock Validation
    if (!cardNumber || !expiry || !cvc || !cardName) {
      setError('Please fill in all payment details.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // 1. Simulate Payment Gateway Latency
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Generate a Mock Payment Reference (Simulating Stripe/PayPal ID)
      const mockPaymentRef = `PAY_${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

      // 3. Call Backend API
      await courseService.enroll(id, mockPaymentRef);

      // 4. Redirect on Success
      // We pass state to show a "Welcome" toast on the dashboard or classroom if needed
      navigate(`/classroom/${id}`, { replace: true });
      
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Enrollment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Helper for formatting card number spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(value.substring(0, 19)); // Max length for standard card
  };

  if (isLoading) {
    return (
      <div className="min-h-screen min-w-[100dvw] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return <div className="p-8 min-w-[100dvw] text-center">Course not found.</div>;
  }

  return (
    <div className="min-h-screen min-w-[100dvw] bg-background p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        
        {/* Left Column: Course Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Cancel
          </button>

          <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xl">
            <div className="aspect-video relative">
              <img 
                src={course.course_thumbnail_url} 
                alt={course.course_title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="bg-background/90 backdrop-blur px-4 py-2 rounded-xl border border-white/10">
                  <span className="font-bold text-xl">
                    {course.course_price_inr === 0 ? 'Free' : `₹${course.course_price_inr}`}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-4">{course.course_title}</h1>
              <p className="text-textSecondary mb-6 line-clamp-3">{course.course_description}</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>Access on mobile and desktop</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>Certificate of completion</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Payment Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-border rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16" />

          <div className="relative">
            <h2 className="text-2xl font-bold mb-2">Secure Checkout</h2>
            <p className="text-textSecondary text-sm mb-8 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success" />
              SSL Encrypted Payment
            </p>

            <form onSubmit={handleEnroll} className="space-y-6">
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3 text-error text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Name on Card</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={user?.student_full_name || "John Doe"}
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-secondary transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Expiration</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                      setExpiry(val);
                    }}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">CVC</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                    <input
                      type="text"
                      placeholder="123"
                      maxLength={3}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-secondary text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ₹{course.course_price_inr} & Enroll Now
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-textSecondary mt-4">
                  This is a secure 256-bit SSL encrypted payment.
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseEnrollment;