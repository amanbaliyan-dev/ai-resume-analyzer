import { useUser } from "@clerk/clerk-react";
import { nanoid } from "nanoid";

export default function ShareButton({ score, role, badge }) {
  const { user } = useUser();

  const handleShare = () => {
    const uid = nanoid(8);
    const profile = {
      name: user?.fullName || user?.firstName || 'Aman Baliyan',
      score: score || 0,
      role: role || 'Software Engineer',
      badge: badge || 'Apex Candidate',
    };

    // Persist so the share page can read it
    localStorage.setItem(`profile_${uid}`, JSON.stringify(profile));

    const shareUrl = `${window.location.origin}/share/${uid}`;

    // LinkedIn share URL
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  return (
    <button
      onClick={handleShare}
      id="share-linkedin-button"
      className="relative group bg-gradient-to-r from-[#0077b5]/90 to-[#00a0dc]/90 hover:from-[#0077b5] hover:to-[#00a0dc] text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2.5 cursor-pointer border border-blue-400/20"
    >
      {/* Dynamic glow effect */}
      <span className="absolute inset-0 w-full h-full rounded-xl bg-blue-400/20 blur-md group-hover:blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
      
      {/* LinkedIn SVG Icon */}
      <svg
        className="w-5 h-5 fill-current relative z-10 transition-transform duration-300 group-hover:rotate-6"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
      <span className="relative z-10 font-bold tracking-wide">Share on LinkedIn</span>
    </button>
  );
}
