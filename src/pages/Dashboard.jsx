import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import Navbar from "../components/common/Navbar";
import ShareButton from "../components/ShareButton";

function Dashboard() {
    const { user } = useUser();

    // Dynamic states loaded from localStorage
    const [resumes, setResumes] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [codingScores, setCodingScores] = useState([]);

    useEffect(() => {
        const loadedResumes = JSON.parse(localStorage.getItem("prep_ai_resumes") || "[]");
        const loadedInterviews = JSON.parse(localStorage.getItem("prep_ai_interviews") || "[]");
        const loadedCoding = JSON.parse(localStorage.getItem("prep_ai_coding") || "[]");

        setResumes(loadedResumes);
        setInterviews(loadedInterviews);
        setCodingScores(loadedCoding);
    }, []);

    // Helper calculations for dynamic metrics
    const resumesCount = resumes.length;
    const avgAtsScore = resumesCount > 0 
        ? Math.round(resumes.reduce((acc, r) => acc + r.score, 0) / resumesCount) 
        : 0;

    const interviewsCount = interviews.length;
    const avgCodingScore = codingScores.length > 0
        ? Math.round(codingScores.reduce((acc, s) => acc + s, 0) / codingScores.length)
        : 0;

    // Dynamic stats array
    const stats = [
        { name: "Resumes Scanned", value: resumesCount.toString(), change: resumesCount > 0 ? "Real-time sync" : "Awaiting scan", color: "from-purple-500 to-indigo-500" },
        { name: "Overall ATS Rating", value: avgAtsScore > 0 ? `${avgAtsScore}%` : "0%", change: avgAtsScore > 0 ? "Latest calculation" : "No score yet", color: "from-pink-500 to-rose-500" },
        { name: "Mock Interviews Done", value: interviewsCount.toString(), change: interviewsCount > 0 ? "Standard & Voice" : "Awaiting launch", color: "from-blue-500 to-teal-500" },
        { name: "Average Code Score", value: avgCodingScore > 0 ? `${avgCodingScore}/100` : "N/A", change: avgCodingScore > 0 ? "Optimal complexities" : "Awaiting coding round", color: "from-emerald-500 to-green-500" }
    ];

    // Weak topics identified dynamically based on what the user completed
    const baseSuggestions = [
        { topic: "React Memoization", category: "Frontend Dev", level: "Medium Priority", tip: "Practice using useMemo and useCallback with custom dependency arrays." },
        { topic: "Event Loop & Call Stack", category: "JavaScript Concepts", level: "High Priority", tip: "Understand microtask queues vs macrotask execution orders." },
        { topic: "MongoDB Indexing", category: "Database/System Design", level: "Low Priority", tip: "Learn compound index constraints and query optimization techniques." }
    ];

    // Calculate dynamic coordinates for Radar pentagon (Scale 0-100 mapped to center at 110,110)
    // pentagon corners mapping:
    // 1. React (Top): (110, 110 - radius)
    // 2. DSA (Right-Top): (110 + radius*cos(18), 110 - radius*sin(18))
    // 3. System Design (Right-Bottom): (110 + radius*cos(54), 110 + radius*sin(54))
    // 4. Communication (Left-Bottom): (110 - radius*cos(54), 110 + radius*sin(54))
    // 5. API & Databases (Left-Top): (110 - radius*cos(18), 110 - radius*sin(18))
    const getRadarPoints = () => {
        // Fallbacks if no data exists yet
        const rReact = (avgAtsScore > 0 ? avgAtsScore : 40) / 100 * 100;
        const rDsa = (avgCodingScore > 0 ? avgCodingScore : 40) / 100 * 100;
        const rSystem = (interviewsCount > 0 ? 75 : 35) / 100 * 100;
        const rComms = (interviewsCount > 0 ? 80 : 30) / 100 * 100;
        const rApi = (avgAtsScore > 0 ? Math.min(avgAtsScore + 5, 100) : 40) / 100 * 100;

        // Calculate coordinates based on angle radiuses
        const p1 = `${110},${110 - rReact}`;
        const p2 = `${Math.round(110 + rDsa * Math.cos(18 * Math.PI / 180))},${Math.round(110 - rDsa * Math.sin(18 * Math.PI / 180))}`;
        const p3 = `${Math.round(110 + rSystem * Math.cos(54 * Math.PI / 180))},${Math.round(110 + rSystem * Math.sin(54 * Math.PI / 180))}`;
        const p4 = `${Math.round(110 - rComms * Math.cos(54 * Math.PI / 180))},${Math.round(110 + rComms * Math.sin(54 * Math.PI / 180))}`;
        const p5 = `${Math.round(110 - rApi * Math.cos(18 * Math.PI / 180))},${Math.round(110 - rApi * Math.sin(18 * Math.PI / 180))}`;

        return `${p1} ${p2} ${p3} ${p4} ${p5}`;
    };

    return (
        <div className="bg-[#03000a] text-white min-h-screen font-sans overflow-x-hidden">
            {/* Glow overlays */}
            <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Navbar */}
            <Navbar activePage="dashboard" />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-10">
                {/* Header Section */}
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                            Candidate <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">Analytics Center</span>
                        </h1>
                        <p className="text-gray-400 mt-2 text-base md:text-lg">
                            Track ATS compatibility, conceptual weaknesses, and practice live behavioral or coding simulated interviews.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {(avgAtsScore > 0 || avgCodingScore > 0) && (
                            <ShareButton 
                                score={avgAtsScore > 0 ? avgAtsScore : avgCodingScore} 
                                role={interviews.length > 0 ? interviews[0].role : "Software Engineer"} 
                                badge={
                                    avgAtsScore >= 85 ? "ATS Champion" :
                                    avgCodingScore >= 80 ? "DSA Beast" :
                                    interviews.length >= 3 ? "Interview Master" : "Apex Candidate"
                                }
                            />
                        )}
                        <Link to="/resume" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white px-5 py-3 rounded-xl font-bold shadow-md transition-all cursor-pointer">
                            Scan with ResuAI
                        </Link>
                        <Link to="/interview" className="bg-[#0e091d] border border-purple-500/20 text-purple-300 px-5 py-3 rounded-xl font-bold hover:bg-purple-500/10 transition-all cursor-pointer">
                            Standard Mock
                        </Link>
                        <Link to="/voice" className="bg-[#0e091d] border border-pink-500/20 text-pink-300 px-5 py-3 rounded-xl font-bold hover:bg-pink-500/10 transition-all cursor-pointer">
                            Voice Interview
                        </Link>
                        <Link to="/coding" className="bg-[#0e091d] border border-indigo-500/20 text-indigo-300 px-5 py-3 rounded-xl font-bold hover:bg-indigo-500/10 transition-all cursor-pointer">
                            Coding Round
                        </Link>
                    </div>
                </header>

                {/* Metrics Matrix */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-[#090514]/70 border border-gray-900 rounded-3xl p-6 shadow-md hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
                            <span className="text-gray-400 text-sm font-bold">{stat.name}</span>
                            <div className="flex items-baseline gap-3 mt-4">
                                <span className={`text-4xl md:text-5xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </span>
                            </div>
                            <div className="text-xs text-purple-400/80 mt-2 font-medium">
                                {stat.change}
                            </div>
                        </div>
                    ))}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left & Middle Column (2 cols) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Interactive Recent Assessment Log */}
                        <div className="bg-[#090514]/70 border border-gray-900 rounded-3xl p-6 md:p-8 shadow-md">
                            <h2 className="text-xl md:text-2xl font-bold mb-6">Recent Assessments & Mock Sessions</h2>
                            
                            {interviews.length === 0 ? (
                                <div className="bg-[#03000a] border border-gray-950 p-10 rounded-3xl text-center flex flex-col items-center justify-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-200 text-lg">Awaiting Your First Mock</h4>
                                        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                            Practice fully adaptive technical, algorithmic, or speech assessments to populate dashboard trends.
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <Link to="/interview" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:opacity-90">
                                            Launch Standard Mock
                                        </Link>
                                        <Link to="/voice" className="bg-[#0e091d] border border-pink-500/25 text-pink-300 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-pink-500/10">
                                            Try Voice Interview
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {interviews.map((session, i) => (
                                        <div key={i} className="bg-[#03000a] border border-gray-950 p-5 rounded-2xl flex justify-between items-center hover:border-purple-500/20 transition-all">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="font-bold text-gray-200 text-base">{session.role}</span>
                                                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{session.type}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <span className="text-sm font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-xl">
                                                    {session.score}
                                                </span>
                                                <span className="text-xs text-gray-500">{session.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Resume Scans table */}
                        <div className="bg-[#090514]/70 border border-gray-900 rounded-3xl p-6 md:p-8 shadow-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl md:text-2xl font-bold">ResuAI ATS Verification</h2>
                                <Link to="/resume" className="text-purple-400 text-sm hover:underline font-semibold">Scan with ResuAI</Link>
                            </div>
                            
                            {resumes.length === 0 ? (
                                <div className="bg-[#03000a] border border-gray-950 p-10 rounded-3xl text-center flex flex-col items-center justify-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-200 text-lg">No Resume Scans Recorded</h4>
                                        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                            Scan your PDF resume to receive dynamic score ratings, action verbs review, and formatting advice.
                                        </p>
                                    </div>
                                    <Link to="/resume" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:opacity-90">
                                        Scan with ResuAI
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-950 text-gray-500 text-xs uppercase tracking-wider">
                                                <th className="pb-3 font-bold">File Name</th>
                                                <th className="pb-3 font-bold">Scan Date</th>
                                                <th className="pb-3 font-bold text-center">Score</th>
                                                <th className="pb-3 font-bold text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-950/40 text-sm">
                                            {resumes.map((resume, i) => (
                                                <tr key={i} className="hover:bg-[#0c071d]/30 transition-colors">
                                                    <td className="py-4 font-semibold text-gray-300">{resume.name}</td>
                                                    <td className="py-4 text-gray-400">{resume.date}</td>
                                                    <td className="py-4 text-center">
                                                        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${
                                                            resume.score >= 85 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" :
                                                            resume.score >= 70 ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" : "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                                                        }`}>
                                                            {resume.score}%
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <span className="text-gray-400 font-medium">{resume.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (1 col): Charts & Suggestions Engine */}
                    <div className="space-y-8">
                        {/* Premium SVG Radar/Skill Performance Chart */}
                        <div className="bg-[#090514]/70 border border-gray-900 rounded-3xl p-6 shadow-md flex flex-col items-center">
                            <h3 className="text-lg font-bold text-gray-200 self-start mb-6">Preparation Radar Map</h3>
                            
                            {/* High Fidelity custom SVG Radar Graph */}
                            <svg width="220" height="220" viewBox="0 0 220 220" className="w-full max-w-[200px]">
                                {/* Outer pentagon */}
                                <polygon points="110,10 205,79 169,190 51,190 15,79" fill="none" stroke="rgba(147, 51, 234, 0.15)" strokeWidth="2" />
                                {/* Mid pentagon */}
                                <polygon points="110,50 167,91 145,158 75,158 53,91" fill="none" stroke="rgba(147, 51, 234, 0.25)" strokeWidth="1.5" />
                                {/* Inner pentagon */}
                                <polygon points="110,80 138,100 127,134 93,134 82,100" fill="none" stroke="rgba(147, 51, 234, 0.35)" strokeWidth="1" />
                                
                                {/* Axis Lines */}
                                <line x1="110" y1="110" x2="110" y2="10" stroke="rgba(147, 51, 234, 0.15)" />
                                <line x1="110" y1="110" x2="205" y2="79" stroke="rgba(147, 51, 234, 0.15)" />
                                <line x1="110" y1="110" x2="169" y2="190" stroke="rgba(147, 51, 234, 0.15)" />
                                <line x1="110" y1="110" x2="51" y2="190" stroke="rgba(147, 51, 234, 0.15)" />
                                <line x1="110" y1="110" x2="15" y2="79" stroke="rgba(147, 51, 234, 0.15)" />

                                {/* Skill Coverage Polygon (Filled Area) */}
                                <polygon 
                                    points={getRadarPoints()} 
                                    fill="rgba(168, 85, 247, 0.25)" 
                                    stroke="rgb(168, 85, 247)" 
                                    strokeWidth="2.5" 
                                    className="transition-all duration-700 ease-out"
                                />

                                {/* Category Labels */}
                                <text x="110" y="8" fill="#a1a1aa" fontSize="9" fontWeight="bold" textAnchor="middle">React ({avgAtsScore > 0 ? avgAtsScore : 40}%)</text>
                                <text x="210" y="82" fill="#a1a1aa" fontSize="9" fontWeight="bold" textAnchor="start">DSA ({avgCodingScore > 0 ? avgCodingScore : 40}%)</text>
                                <text x="175" y="202" fill="#a1a1aa" fontSize="9" fontWeight="bold" textAnchor="start">System Design ({interviewsCount > 0 ? 75 : 35}%)</text>
                                <text x="45" y="202" fill="#a1a1aa" fontSize="9" fontWeight="bold" textAnchor="end">Comms ({interviewsCount > 0 ? 80 : 30}%)</text>
                                <text x="10" y="82" fill="#a1a1aa" fontSize="9" fontWeight="bold" textAnchor="end">API/DB ({avgAtsScore > 0 ? Math.min(avgAtsScore + 5, 100) : 40}%)</text>
                            </svg>
                        </div>

                        {/* AI Suggestions / Weak Topics Engine */}
                        <div className="bg-[#090514]/70 border border-gray-900 rounded-3xl p-6 shadow-md flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-200 mb-6">AI Suggestion Engine (Recommended Study)</h3>
                                
                                {interviewsCount === 0 && resumesCount === 0 ? (
                                    <div className="bg-[#03000a] border border-gray-950 p-6 rounded-2xl text-center">
                                        <span className="text-xs text-gray-500 font-semibold block mb-2">Awaiting Session Logs</span>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            Scan a resume or take a mock interview session to unlock custom recommendation modules here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {baseSuggestions.map((topic, i) => (
                                            <div key={i} className="bg-[#03000a] border border-gray-950 p-4.5 rounded-2xl flex flex-col gap-2 hover:border-pink-500/20 transition-all">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-200 text-sm">{topic.topic}</span>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                        topic.level === "High Priority" ? "bg-rose-500/10 text-rose-400" :
                                                        topic.level === "Medium Priority" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                                                    }`}>{topic.level}</span>
                                                </div>
                                                <div className="text-xs text-purple-400/90 font-semibold">{topic.category}</div>
                                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{topic.tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
