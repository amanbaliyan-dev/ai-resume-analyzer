import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';

export default function ShareCard() {
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load from localStorage (or fallback mock profile for presentation)
    const data = JSON.parse(localStorage.getItem(`profile_${uid}`) || 'null');
    setProfile(data);
  }, [uid]);

  if (!profile) {
    return (
      <div className="bg-[#03000a] text-white min-h-screen flex flex-col items-center justify-center font-sans px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-500/20 rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-gray-300">Searching Profile...</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            If this link was recently shared, we are preparing the candidate's achievements.
          </p>
        </div>
      </div>
    );
  }

  // Build the OG image URL pointing to the Vercel API route
  const ogImageUrl = new URL('/api/og', window.location.origin);
  ogImageUrl.searchParams.set('name', profile.name);
  ogImageUrl.searchParams.set('score', profile.score.toString());
  ogImageUrl.searchParams.set('role', profile.role);
  ogImageUrl.searchParams.set('badge', profile.badge);
  ogImageUrl.searchParams.set('uid', uid);

  const shareUrl = `${window.location.origin}/share/${uid}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <>
      <Helmet>
        <title>{profile.name} — ApexPrep AI Score</title>
        <meta property="og:title" content={`${profile.name} scored ${profile.score}/100 on ApexPrep AI`} />
        <meta property="og:description" content={`Preparing for ${profile.role} | Badge: ${profile.badge}`} />
        <meta property="og:image" content={ogImageUrl.toString()} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="bg-[#03000a] text-white min-h-screen font-sans flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
        {/* Glowing background shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-4000" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-pink-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-xl w-full flex flex-col items-center">
          {/* Logo / Header */}
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent group-hover:opacity-90 transition-all">
              ApexPrep AI
            </span>
            <span className="bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
              Credentials
            </span>
          </Link>

          {/* Interactive Badge Card */}
          <div className="w-full bg-[#090514]/70 border border-gray-900 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500 flex flex-col items-center">
            {/* Top scanning light micro-animation */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer" />
            
            {/* Subtle background card pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

            {/* Score Radial Ring */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-8">
              {/* Outer glowing blur */}
              <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl group-hover:bg-purple-500/20 transition-all duration-500" />
              
              {/* SVG circular progress ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="stroke-[#0e091d]"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="stroke-purple-500 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * profile.score) / 100}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Inner score digits */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{profile.score}</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Vetted Rating</span>
              </div>
            </div>

            {/* Candidate Metadata */}
            <div className="text-center space-y-2.5 z-10">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {profile.name}
              </h2>
              <p className="text-gray-400 font-medium text-sm md:text-base">
                Preparing for <span className="text-purple-300 font-bold">{profile.role}</span>
              </p>
              
              {/* Badge Pill */}
              <div className="inline-block mt-4">
                <span className="bg-[#26215C] border border-[#534AB7] text-[#AFA9EC] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-purple-950/40">
                  {profile.badge}
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="w-full h-[1px] bg-gray-900 my-8" />

            {/* Share / Claim Actions */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 z-10">
              <button
                onClick={copyToClipboard}
                className="bg-[#0e091d] border border-gray-800 hover:border-purple-500/30 text-gray-300 hover:text-white px-5 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-400 stroke-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copy Profile Link</span>
                  </>
                )}
              </button>
              
              <Link
                to="/"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 text-white px-5 py-3.5 rounded-xl text-sm font-bold text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 active:scale-95"
              >
                <span>Vetted by ApexPrep</span>
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Footer Callout */}
          <p className="text-xs text-gray-500 mt-6 text-center">
            Want to analyze your resume and get a verified badge?{" "}
            <Link to="/" className="text-purple-400 hover:underline font-bold">
              Try ApexPrep AI
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
