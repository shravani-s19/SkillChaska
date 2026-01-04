import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Share2, ArrowRight, Home } from "lucide-react";
import confetti from "canvas-confetti";
import { courseService } from "../services/course.service";

const CourseCompletion = () => {
  const { id } = useParams();

  const [courseTitle, setCourseTitle] = useState("Course");
  const [certificate, setCertificate] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Course Info
  useEffect(() => {
    if (id) {
      courseService
        .getById(id)
        .then((data) => {
          setCourseTitle(data.course_title);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch course title", err);
          setIsLoading(false);
        });

      courseService
        .getCertificateById(id)
        .then((data) => {
          console.log("Certificate Data:", data);
          setCertificate(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch certificate URL", err);
          setIsLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: number = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen min-w-[100dvw] bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-[100dvw] bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full bg-surface border border-border rounded-[40px] overflow-hidden shadow-2xl relative"
      >
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-secondary/20 to-transparent" />

        <div className="relative p-10 md:p-16 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle2 className="w-12 h-12 text-success" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Course Completed!
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-textSecondary mb-12"
          >
            Congratulations! You've successfully mastered{" "}
            <span className="text-text font-bold">{courseTitle}</span>.
          </motion.p>

          {/* Certificate Preview Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-background/50 border border-border rounded-3xl p-8 mb-12 text-left relative group"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Container: Defines the 16:9 aspect ratio and clips the scaled content */}
              <div className="w-full md:w-48 aspect-video bg-surface rounded-xl overflow-hidden border border-border relative">
                <div
                  className="absolute top-0 left-0 origin-top-left 
      /* Dynamic scaling logic */
      scale-[0.35] sm:scale-[0.5] md:scale-[0.171] lg:scale-[0.171]"
                >
                  <iframe
                    src={certificate.certificateUrl}
                    className="w-[1123px] h-[794px] border-none pointer-events-none"
                    title="Certificate Preview"
                  />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">
                  Professional Certificate
                </h3>
                <p className="text-sm text-textSecondary mb-4">
                  Credential ID: {certificate.credentialId}
                </p>
                <div className="flex gap-3">
                  {/* Download Button */}
                  <a
                    href={certificate.certificateUrl} // Make sure the URL points to the certificate file
                    download={certificate.credentialId} // Use the credential ID as the download file name
                    target="_blank"
                    className="flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                  <button className="flex items-center gap-2 text-sm font-bold text-secondary hover:underline">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-white px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-secondary/20"
            >
              <Home className="w-5 h-5" /> Back to Dashboard
            </Link>
            <Link
              to="/courses"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface border border-border text-text px-8 py-4 rounded-2xl font-bold hover:bg-text/5 transition-all"
            >
              Explore More Courses <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseCompletion;
