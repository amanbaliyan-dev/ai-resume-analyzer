import { useState } from "react";
import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import Navbar from "../components/common/Navbar";

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
            <Navbar activePage="resume" />

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
