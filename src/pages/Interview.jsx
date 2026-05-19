import { useState } from "react";
import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import Navbar from "../components/common/Navbar";
import { generateAIResponse } from "../services/ai/openrouter";

function Interview() {
    // Interview states: "setup", "interviewing", "feedback"
    const [step, setStep] = useState("setup");
    const [role, setRole] = useState("Frontend Engineer");
    const [company, setCompany] = useState("Google");
    const [jd, setJd] = useState("");
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [answers, setAnswers] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);

    // Camera feed simulation toggle
    const [cameraActive, setCameraActive] = useState(true);

    const startInterview = async () => {
        if (!jd.trim()) {
            alert("Please paste the job description to personalize the mock interview.");
            return;
        }

        try {
            setLoading(true);
            const prompt = `
            Act as a technical and behavioral interviewer at ${company} interviewing a candidate for the role of ${role}.
            Given this Job Description:
            "${jd}"
            
            Generate 3 distinct, highly realistic, and challenging interview questions (mix of technical, architectural, and behavioral).
            Return them ONLY as a JSON list, formatted exactly like:
            ["Question 1", "Question 2", "Question 3"]
            `;

            const res = await generateAIResponse(prompt);
            // Parse JSON response safely
            let parsedQuestions = [];
            try {
                // Remove potential markdown formatting
                const cleanedRes = res.replace(/```json/g, "").replace(/```/g, "").trim();
                parsedQuestions = JSON.parse(cleanedRes);
            } catch (err) {
                // Fallback questions if parse fails
                parsedQuestions = [
                    `Explain a challenging frontend problem you solved recently and how you optimized its rendering performance.`,
                    `How would you design a scalable state-management architecture for a collaborative dashboard application at ${company}?`,
                    `Tell me about a time you had a strong technical disagreement with a team member. How did you resolve it?`
                ];
            }

            setQuestions(parsedQuestions);
            setStep("interviewing");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleNextQuestion = () => {
        if (!userAnswer.trim()) {
            alert("Please write your answer before submitting.");
            return;
        }

        const newAnswers = [...answers, {
            question: questions[currentQuestionIndex],
            answer: userAnswer
        }];
        setAnswers(newAnswers);
        setUserAnswer("");

        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            generateFeedback(newAnswers);
        }
    };

    const generateFeedback = async (allAnswers) => {
        try {
            setLoading(true);
            setStep("loading_feedback");
            const formattedQA = allAnswers.map((qa, index) => (
                `Q${index + 1}: ${qa.question}\nA${index + 1}: ${qa.answer}\n`
            )).join("\n");

            const prompt = `
            Review the following QA mock interview responses for a ${role} position at ${company}:
            ${formattedQA}

            Provide:
            1. Overall score out of 100
            2. Detailed constructive feedback for each answer
            3. Tips to make answers stronger

            Return the response in structured HTML format using modern tailwind styles if possible, but standard tags work. Make it beautifully readable.
            `;

            const res = await generateAIResponse(prompt);
            setFeedback(res);
            setStep("feedback");

            // Save to localStorage for real dashboard tracking
            const scoreMatch = res.match(/Overall Score:\s*(\d+)/i) || res.match(/Score:\s*(\d+)/i) || res.match(/(\d+)\/100/);
            const scoreVal = scoreMatch ? `${scoreMatch[1]}/100` : "8.5/10";
            
            const newInterview = {
                role: `${role} (${company})`,
                type: "Standard AI Mock",
                score: scoreVal,
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
            };
            
            const existingInterviews = JSON.parse(localStorage.getItem("prep_ai_interviews") || "[]");
            localStorage.setItem("prep_ai_interviews", JSON.stringify([newInterview, ...existingInterviews]));

        } catch (error) {
            console.error(error);
            setFeedback("Failed to generate interview feedback. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetInterview = () => {
        setStep("setup");
        setRole("Frontend Engineer");
        setCompany("Google");
        setJd("");
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setUserAnswer("");
        setAnswers([]);
        setFeedback(null);
    };

    return (
        <div className="bg-[#03000a] text-white min-h-screen font-sans relative overflow-x-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Navbar */}
            <Navbar activePage="interview" />

            <main className="max-w-5xl mx-auto px-4 md:px-6 py-10">
                {/* 1. Setup Wizard */}
                {step === "setup" && (
                    <section className="bg-[#090514]/70 border border-gray-900 rounded-3xl p-6 md:p-12 shadow-xl">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                            Configure Your <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">AI Mock Interview</span>
                        </h1>
                        <p className="text-gray-400 mb-8 max-w-2xl text-base md:text-lg">
                            PrepAI will instantly generate fully-personalized, industry-specific technical and behavioral questions aligned to your role and target employer.
                        </p>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2.5">Target Job Title</label>
                                    <input
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-[#03000a] border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-pink-500 transition-all font-medium"
                                        placeholder="e.g., Senior React Engineer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2.5">Target Company</label>
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className="w-full bg-[#03000a] border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-pink-500 transition-all font-medium"
                                        placeholder="e.g., Netflix, Stripe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2.5">Paste Job Description / Requirements</label>
                                <textarea
                                    value={jd}
                                    onChange={(e) => setJd(e.target.value)}
                                    rows="5"
                                    className="w-full bg-[#03000a] border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-pink-500 transition-all font-medium"
                                    placeholder="Paste full job post requirements, tech stacks, or behavioral values to align questions..."
                                />
                            </div>

                            <button
                                onClick={startInterview}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 py-4.5 rounded-xl font-bold transition-all shadow-[0_4px_30px_rgba(236,72,153,0.3)] flex items-center justify-center text-lg gap-3 cursor-pointer"
                            >
                                {loading ? "Generating Dynamic Questions..." : "Generate AI Interview"}
                            </button>
                        </div>
                    </section>
                )}

                {/* 2. Live Interview Room */}
                {step === "interviewing" && (
                    <section className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {/* Left Column: Webcam & Interaction (2 cols) */}
                        <div className="md:col-span-2 flex flex-col gap-6">
                            <div className="bg-[#0b0b0c] border border-gray-900 rounded-3xl overflow-hidden aspect-video md:aspect-[4/5] flex flex-col items-center justify-center relative shadow-lg">
                                {cameraActive ? (
                                    <div className="w-full h-full bg-[#08080a] flex items-center justify-center relative">
                                        {/* Faux web camera representation */}
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-purple-500/40 animate-pulse flex items-center justify-center font-bold text-purple-400">
                                            Live
                                        </div>
                                        <div className="absolute bottom-5 left-5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                                            <span>Webcam Active</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-sm">Webcam has been turned off</div>
                                )}
                                
                                {/* Micro audio animation inside camera block */}
                                <div className="absolute bottom-5 right-5 flex items-center gap-1">
                                    <span className="w-1 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                    <span className="w-1 h-5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                                    <span className="w-1 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }} />
                                    <span className="w-1 h-4 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setCameraActive(!cameraActive)}
                                className="bg-[#090514] border border-gray-800 text-gray-400 hover:text-white py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-purple-950/20"
                            >
                                {cameraActive ? "Toggle Camera Off" : "Toggle Camera On"}
                            </button>
                        </div>

                        {/* Right Column: Q&A (3 cols) */}
                        <div className="md:col-span-3 flex flex-col gap-6 justify-between">
                            <div className="bg-[#090514]/70 border border-gray-900 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-md">
                                <div className="flex justify-between items-center text-xs font-bold text-pink-400 uppercase tracking-wider">
                                    <span>AI Interviewer</span>
                                    <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                                </div>

                                <div className="bg-[#03000a] border border-gray-950 p-6 rounded-2xl text-lg md:text-xl font-bold leading-relaxed text-gray-100">
                                    {questions[currentQuestionIndex]}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2.5">Your Response</label>
                                    <textarea
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        rows="6"
                                        className="w-full bg-[#03000a] border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-pink-500 transition-all font-medium text-base"
                                        placeholder="Formulate your professional answer here (STAR method recommended)..."
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleNextQuestion}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 py-4 rounded-xl font-bold text-lg shadow-lg cursor-pointer"
                            >
                                {currentQuestionIndex + 1 < questions.length ? "Submit and Next Question" : "Submit and Generate Feedback"}
                            </button>
                        </div>
                    </section>
                )}

                {/* 3. Loading Feedback Loader */}
                {step === "loading_feedback" && (
                    <section className="text-center py-20 bg-[#090514]/70 border border-gray-900 rounded-3xl shadow-xl flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 border-t-4 border-pink-500 rounded-full animate-spin" />
                        <h2 className="text-2xl font-bold">Analyzing Your Performance...</h2>
                        <p className="text-gray-400 max-w-sm">
                            We are compiling your scores, checking key architectural frameworks, and building structured improvement guidelines.
                        </p>
                    </section>
                )}

                {/* 4. Complete Performance Evaluation */}
                {step === "feedback" && (
                    <section className="bg-[#090514]/70 border border-gray-900 rounded-3xl p-6 md:p-12 shadow-xl">
                        <header className="flex justify-between items-center mb-8 border-b border-gray-900 pb-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold">Interview Evaluation Report</h1>
                                <p className="text-gray-400 mt-1">Role: {role} at {company}</p>
                            </div>
                            <button
                                onClick={resetInterview}
                                className="bg-[#03000a] border border-gray-800 text-gray-300 hover:text-white px-5 py-2.5 rounded-xl font-semibold transition-all hover:bg-pink-950/20"
                            >
                                Reset Assessment
                            </button>
                        </header>

                        {/* Evaluation Body */}
                        <div 
                            className="text-gray-300 leading-relaxed font-medium prose prose-invert max-w-none prose-purple"
                            dangerouslySetInnerHTML={{ __html: feedback }}
                        />

                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={resetInterview}
                                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all"
                            >
                                Start Another Mock Session
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default Interview;
