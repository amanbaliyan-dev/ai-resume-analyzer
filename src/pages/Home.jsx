import { useState } from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import UploadBox from "../components/UploadBox";
import ATSCard from "../components/ATSCard";
import Suggestions from "../components/Suggestions";

function App() {

    const [resumeFile, setResumeFile] = useState(null);

    const [atsScore, setAtsScore] = useState(null);

    return (
        <div className="bg-gradient-to-b from-[#05010a] via-black to-[#020617] text-white min-h-screen overflow-x-hidden">

            <Navbar />

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

export default App;