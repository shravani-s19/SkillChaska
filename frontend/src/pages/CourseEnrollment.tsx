// File: src/pages/CourseEnrollment.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Lock,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Server,
  Wifi,
} from "lucide-react";
import { courseService } from "../services/course.service";
import { CourseEntity } from "../types";
import { useAuthStore } from "../store/useAuthStore";
import { cn } from "../lib/utils";

// Types for the simulation steps
type PaymentStatus = "idle" | "connecting" | "verifying" | "approving" | "success" | "error";

const CourseEnrollment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [course, setCourse] = useState<CourseEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Payment Logic State
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState("");

  // Form State
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    if (id) {
      const fetchCourse = async () => {
        try {
          const data = await courseService.getById(id);
          setCourse(data);
        } catch (err) {
          setError("Failed to load course details.");
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

    // Basic Validation
    if (!cardNumber || !expiry || !cvc || !cardName) {
      setError("Please fill in all payment details.");
      return;
    }

    setError("");
    setStatus("connecting");

    try {
      // Step 1: Simulate Connecting to Gateway (1.5s)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("verifying");

      // Step 2: Simulate Bank Verification (1.5s)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("approving");

      // Step 3: Simulate Approval & API Call (1s)
      const mockPaymentRef = `PAY_${Math.random()
        .toString(36)
        .substring(2, 15)
        .toUpperCase()}`;
        
      await courseService.enroll(id, mockPaymentRef);
      
      setStatus("success");

      // Step 4: Success Animation Delay before Redirect (1.5s)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate(`/dashboard/course/${id}`, { replace: true });

    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setError(
        err.response?.data?.message || "Transaction declined by bank. Please try again."
      );
    }
  };

  // Helper for formatting card number spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(value.substring(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length >= 2) {
      val = val.substring(0, 2) + "/" + val.substring(2, 4);
    }
    setExpiry(val);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen min-w-[100dvw] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          <p className="text-textSecondary font-medium">Loading Checkout...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen min-w-[100dvw] flex items-center justify-center bg-background text-textSecondary">
        Course not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        
        {/* Left Column: Course Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Cancel & Return
          </button>

          <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xl sticky top-8">
            <div className="aspect-video relative overflow-hidden">
              <img
                src={course.course_thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"}
                alt={course.course_title}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                 <div className="bg-secondary/90 backdrop-blur px-4 py-1.5 rounded-full w-fit mb-2">
                  <span className="font-bold text-white text-sm">
                    {course.course_price_inr === 0 ? "Free" : `₹${course.course_price_inr}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{course.course_title}</h1>
              <p className="text-textSecondary mb-8 text-sm leading-relaxed">
                {course.course_description || "Unlock your potential with this comprehensive course designed for modern learners."}
              </p>

              <div className="space-y-4 pt-6 border-t border-white/5">
                {[
                  "Full lifetime access",
                  "Access on mobile and desktop",
                  "Certificate of completion"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-text/80">
                    <div className="bg-success/10 p-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Payment Form & Gateway Simulation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden relative min-h-[600px] flex flex-col">
            
            {/* Overlay for Processing States */}
            <AnimatePresence>
              {status !== "idle" && status !== "error" && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-surface/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                >
                   {status === "success" ? (
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                         <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center mb-6 shadow-lg shadow-success/30">
                            <CheckCircle2 className="w-12 h-12 text-white" />
                         </div>
                         <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
                         <p className="text-textSecondary">Redirecting to your course...</p>
                      </motion.div>
                   ) : (
                      <div className="flex flex-col items-center max-w-sm w-full">
                        {/* Status Icons Animation */}
                        <div className="relative w-24 h-24 mb-8">
                           <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                           <div className="absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                           <div className="absolute inset-0 flex items-center justify-center">
                              {status === "connecting" && <Wifi className="w-8 h-8 text-secondary animate-pulse" />}
                              {status === "verifying" && <Server className="w-8 h-8 text-secondary animate-pulse" />}
                              {status === "approving" && <Lock className="w-8 h-8 text-secondary animate-pulse" />}
                           </div>
                        </div>

                        {/* Status Text */}
                        <h3 className="text-xl font-bold mb-2 animate-pulse">
                          {status === "connecting" && "Contacting Bank..."}
                          {status === "verifying" && "Verifying Credentials..."}
                          {status === "approving" && "Processing Payment..."}
                        </h3>
                        <p className="text-sm text-textSecondary">Please do not close this window</p>

                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-white/10 rounded-full mt-8 overflow-hidden">
                          <motion.div 
                            className="h-full bg-secondary"
                            initial={{ width: "0%" }}
                            animate={{ 
                              width: status === "connecting" ? "30%" : 
                                     status === "verifying" ? "60%" : "90%" 
                            }}
                            transition={{ duration: 1.5 }}
                          />
                        </div>
                      </div>
                   )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Standard Form Header */}
            <div className="p-8 lg:p-10 pb-0">
               <h2 className="text-2xl font-bold mb-2">Secure Checkout</h2>
                <div className="flex items-center gap-2 text-textSecondary text-sm mb-6">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <span className="opacity-80">256-bit SSL Encrypted Payment</span>
                </div>
            </div>

            {/* Scrollable Form Area */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-10 pt-4 custom-scrollbar">
              <form onSubmit={handleEnroll} className="space-y-6">
                
                {/* Error Banner */}
                <AnimatePresence>
                  {status === "error" && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3 text-error text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Payment Failed</p>
                          <p>{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Card Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Name on Card</label>
                  <input
                    type="text"
                    placeholder={user?.student_full_name || "John Doe"}
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    disabled={status !== "idle" && status !== "error"}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Card Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Card Number</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary group-focus-within:text-secondary transition-colors" />
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      disabled={status !== "idle" && status !== "error"}
                      className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-secondary transition-colors font-mono tracking-wide disabled:opacity-50"
                    />
                    {/* Card Brand Icon Mockup */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                       <div className="w-8 h-5 bg-white/10 rounded-sm" />
                       <div className="w-8 h-5 bg-white/10 rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* Expiry & CVC */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Expiration</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiry}
                      onChange={handleExpiryChange}
                      disabled={status !== "idle" && status !== "error"}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-center disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">CVC / CWW</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary group-focus-within:text-secondary transition-colors" />
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={3}
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                        disabled={status !== "idle" && status !== "error"}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-secondary transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-auto">
                  <button
                    type="submit"
                    disabled={status !== "idle" && status !== "error"}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2",
                      status !== "idle" && status !== "error"
                        ? "bg-surface border border-white/10 text-textSecondary cursor-not-allowed" 
                        : "bg-secondary text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-secondary/20"
                    )}
                  >
                     <span>Pay ₹{course.course_price_inr} & Enroll</span>
                     <ChevronLeft className="w-4 h-4 rotate-180" />
                  </button>
                  
                  <div className="mt-6 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Mock Payment Logs */}
                    <div className="h-6 w-10 bg-white/20 rounded" />
                    <div className="h-6 w-10 bg-white/20 rounded" />
                    <div className="h-6 w-10 bg-white/20 rounded" />
                    <div className="h-6 w-10 bg-white/20 rounded" />
                  </div>
                </div>
              </form>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseEnrollment;