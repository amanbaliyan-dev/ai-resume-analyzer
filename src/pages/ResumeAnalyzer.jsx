import { useState } from "react";
import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import Logo from "../components/common/Logo";

import Hero from "../components/resume/Hero";
import UploadBox from "../components/resume/UploadBox";
import ATSCard from "../components/resume/ATSCard";
import Suggestions from "../components/resume/Suggestions";

function ResumeAnalyzer() {
    const [resumeFile, setResumeFile] = useState(null);
    const [atsScore, setAtsScore] = useState(null);

    return (
        <div className="bg-gradient-to-b from-[#05010a] via-black to-[#020617] text-white min-h-screen overflow-x-hidden">
            {/* Unified PrepAI & ResuAI Navbar */}
            <nav className="border-b border-gray-950 backdrop-blur-md sticky top-0 z-50 bg-[#03000a]/70">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <Logo />
                    </Link>

                    <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-300">
                        <Link to="/resume" className="text-purple-400">ResuAI</Link>
                        <Link to="/interview" className="hover:text-purple-400 transition-colors">AI Mock Interview</Link>
                        <Link to="/voice" className="hover:text-purple-400 transition-colors">Voice Interview</Link>
                        <Link to="/coding" className="hover:text-purple-400 transition-colors">Coding Round</Link>
                        <Link to="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white mr-2 transition-colors">
                            Exit Suite
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 md:px-6">
                <Hero />
                <UploadBox onFileUpload={setResumeFile} />
                <ATSCard atsScore={atsScore} />
                <Suggestions
                    resumeFile={resumeFile}
                    setAtsScore={setAtsScore}
                />
            </main>
        </div>
    );
}

export default ResumeAnalyzer;
