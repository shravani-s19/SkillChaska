import { Download, Share2, ExternalLink } from "lucide-react";
import { Certificate } from "../../types";

interface CertificateCardProps {
  certificate: Certificate;
}

export const CertificateCard = ({ certificate }: CertificateCardProps) => {
  const handleDownload = async () => {
    try {
      // Fetch the file as a blob to force download
      const response = await fetch(certificate.certificateUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      // You can customize the filename here
      link.setAttribute(
        "download",
        `Certificate-${certificate.credentialId}.pdf`
      );
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed, opening in new tab instead", error);
      window.open(certificate.certificateUrl, "_blank");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "My Professional Certificate",
      text: `I just earned my certificate: ${certificate.credentialId}!`,
      url: certificate.certificateUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(certificate.certificateUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="bg-surface border border-border p-6 rounded-3xl flex flex-col md:flex-row items-center gap-8 hover:shadow-lg transition-shadow">
      {/* Certificate Preview with Scaling */}
      <div className="w-full md:w-64 aspect-video bg-black/5 rounded-xl overflow-hidden border border-border relative group">
        <div
          className="absolute top-0 left-0 origin-top-left pointer-events-none"
          style={{
            // Calculated scale: Container Width (approx 256px) / Iframe Width (1123px)
            transform: "scale(0.228)",
            width: "1123px",
            height: "794px",
          }}
        >
          <iframe
            src={certificate.certificateUrl}
            className="w-full h-full border-none"
            title="Certificate Preview"
          />
        </div>
        {/* Overlay to allow clicking/opening */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ExternalLink className="text-white opacity-0 group-hover:opacity-100 w-6 h-6" />
        </div>
      </div>

      {/* Info & Actions */}
      <div className="flex-1 w-full text-center md:text-left">
        <h3 className="text-lg font-bold mb-1">Professional Certificate</h3>
        <p className="text-sm text-textSecondary mb-4">
          Credential ID:{" "}
          <span className="font-mono">{certificate.credentialId}</span>
        </p>

        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-sm font-bold text-secondary hover:text-secondary/80 transition-colors"
          >
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            Download PDF
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-bold text-textSecondary hover:text-textMain transition-colors"
          >
            <div className="w-8 h-8 bg-border/50 rounded-lg flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            Share Credential
          </button>
        </div>
      </div>
    </div>
  );
};
