import { Link } from "react-router-dom";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from "@clerk/clerk-react";
import Logo from "../components/common/Logo";

function Home() {
    return (
        <div className="bg-[#03000a] text-white min-h-screen font-sans selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

            {/* Navbar */}
            <nav className="border-b border-gray-900/60 backdrop-blur-md sticky top-0 z-50 bg-[#03000a]/70">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <Logo />
                    </Link>

                    <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-300">
                        <Link to="/resume" className="hover:text-purple-400 transition-colors">ResuAI</Link>
                        <Link to="/interview" className="hover:text-purple-400 transition-colors">AI Mock Interview</Link>
                        <Link to="/voice" className="hover:text-purple-400 transition-colors">Voice Interview</Link>
                        <Link to="/coding" className="hover:text-purple-400 transition-colors">Coding Round</Link>
                        <Link to="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="bg-white text-black px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-100 shadow-[0_4px_20px_rgba(255,255,255,0.15)] transition-all cursor-pointer">
                                    Get Started
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Link to="/dashboard" className="hidden sm:inline-block bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-300 border border-purple-500/30 px-4 py-2 rounded-xl font-medium transition-all mr-2">
                                Go to Dashboard
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-20 text-center relative">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-8 animate-pulse">
                    🚀 Fully Configured AI Recruitment Suite
                </div>
                
                <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight leading-[1.05] max-w-5xl mx-auto">
                    Aces Your Next <br />
                    <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.2)] animate-gradient">
                        Elite Tech Interview
                    </span>
                </h1>

                <p className="text-gray-400 text-lg md:text-xl mt-8 max-w-3xl mx-auto leading-relaxed">
                    Build a stellar resume, master real-time conversational voice challenges, resolve complex algorithmic puzzles in our live sandbox, and track progress with detailed AI skill maps.
                </p>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/resume" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-bold shadow-[0_10px_30px_rgba(168,85,247,0.3)] transition-all transform hover:-translate-y-0.5 text-center cursor-pointer">
                        Scan with ResuAI
                    </Link>
                    <Link to="/interview" className="w-full sm:w-auto bg-[#0d091a] hover:bg-[#130d26] border border-gray-800 text-gray-200 hover:text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 text-center cursor-pointer">
                        Practice AI Interview
                    </Link>
                </div>
            </header>

            {/* Core Feature Grid */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Supercharge Your Technical Preparation
                    </h2>
                    <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                        A robust, cohesive set of specialized tools acting as an expert coach at every step of your recruiting cycle.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Card 1: Resume Analyzer */}
                    <div className="group bg-[#090514]/65 border border-gray-900 hover:border-purple-500/50 rounded-3xl p-8 hover:bg-[#0c071d]/80 transition-all duration-500 flex flex-col justify-between shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">ResuAI (AI Resume Analyzer)</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Upload your PDF resume to check keywords, formatting, stack relevance, action verbs, project score, and receive complete ATS metrics instantly.
                            </p>
                        </div>
                        <Link to="/resume" className="inline-flex items-center gap-2 text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
                            Launch ResuAI
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* Card 2: AI Mock Interview */}
                    <div className="group bg-[#090514]/65 border border-gray-900 hover:border-pink-500/50 rounded-3xl p-8 hover:bg-[#0c071d]/80 transition-all duration-500 flex flex-col justify-between shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-colors" />
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/20 mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">AI Mock Interview</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Choose job title, stack (e.g. MERN), and difficulty. Face live AI questions with comprehensive structural and design checks.
                            </p>
                        </div>
                        <Link to="/interview" className="inline-flex items-center gap-2 text-pink-400 font-semibold group-hover:text-pink-300 transition-colors">
                            Start Mocking
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* Card 3: AI Voice Interview */}
                    <div className="group bg-[#090514]/65 border border-gray-900 hover:border-blue-500/50 rounded-3xl p-8 hover:bg-[#0c071d]/80 transition-all duration-500 flex flex-col justify-between shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Conversational Voice</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Practice realistic conversational challenges. Speaks questions using high-fidelity TTS and listens live via vocal transcript Speech Recognition (STT).
                            </p>
                        </div>
                        <Link to="/voice" className="inline-flex items-center gap-2 text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
                            Enter Voice Room
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* Card 4: Coding Round Module */}
                    <div className="group bg-[#090514]/65 border border-gray-900 hover:border-indigo-500/50 rounded-3xl p-8 hover:bg-[#0c071d]/80 transition-all duration-500 flex flex-col justify-between shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Coding Round</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Write code in JS, C++, or Python. Run test cases in our simulated live sandbox workspace and get instant AI complexity optimizations.
                            </p>
                        </div>
                        <Link to="/coding" className="inline-flex items-center gap-2 text-indigo-400 font-semibold group-hover:text-indigo-300 transition-colors">
                            Start Code Test
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* Card 5: Smart Dashboard */}
                    <div className="group bg-[#090514]/65 border border-gray-900 hover:border-emerald-500/50 rounded-3xl p-8 hover:bg-[#0c071d]/80 transition-all duration-500 flex flex-col justify-between shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Smart Analytics</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                View full radar graphs of technical vs. soft skills, map consistent performance grids, and identify improvement suggestions.
                            </p>
                        </div>
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">
                            Open Analytics
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-900/60 py-12 bg-black/40">
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
                    <div>© 2026 ApexPrep AI Suite. All rights reserved.</div>
                    <div className="flex gap-8">
                        <Link to="/" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
                        <Link to="/" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;