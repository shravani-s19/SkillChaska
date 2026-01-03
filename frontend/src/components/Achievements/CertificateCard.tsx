import React from 'react';
import { Download, Share2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface CertificateCardProps {
  certificate: {
    courseTitle: string;
    issueDate: string;
    credentialId: string;
    thumbnail: string;
  };
}

export const CertificateCard = ({ certificate }: CertificateCardProps) => {
  const handleDownload = () => {
    alert(`Downloading certificate for: ${certificate.courseTitle}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out my certificate for ${certificate.courseTitle}! ID: ${certificate.credentialId}`);
    alert('Credential link copied to clipboard!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="bg-surface border border-border rounded-3xl overflow-hidden flex flex-col md:flex-row group"
    >
      <div className="md:w-64 aspect-video md:aspect-auto relative overflow-hidden">
        <img 
          src={certificate.thumbnail} 
          alt={certificate.courseTitle}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="text-white w-8 h-8" />
        </div>
      </div>
      
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-1 rounded-md">
              Verified Certificate
            </span>
            <span className="text-xs text-textSecondary">ID: {certificate.credentialId}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">{certificate.courseTitle}</h3>
          <p className="text-sm text-textSecondary">Issued on {certificate.issueDate}</p>
        </div>
        
        <div className="flex items-center gap-3 mt-6">
          <button 
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-secondary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button 
            onClick={handleShare}
            className="p-3 border border-border rounded-xl hover:bg-text/5 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
