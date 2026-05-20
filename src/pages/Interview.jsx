import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import Navbar from "../components/common/Navbar";
import { generateAIResponse } from "../services/ai/openrouter";
import { DifficultyEngine, radarToLevels, updateRadar } from "../services/adaptiveDifficulty";
import { generateNextQuestion, scoreAnswer } from "../services/ai/interviewAgent";

const getDomainsForRole = (roleName) => {
    const name = roleName.toLowerCase();
    if (name.includes("react") || name.includes("frontend")) {
        return ["react", "systemDesign", "behavioural"];
    } else if (name.includes("backend") || name.includes("api") || name.includes("database")) {
        return ["apiDatabases", "systemDesign", "behavioural"];
    } else {
        return ["dsa", "systemDesign", "behavioural"];
    }
};

function Interview() {
    // Interview states: "setup", "interviewing", "feedback", "loading_feedback"
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

    // Adaptive Engine states
    const [difficultyEngine, setDifficultyEngine] = useState(null);
    const [toast, setToast] = useState(null);
    const [currentDomain, setCurrentDomain] = useState("");
    const [domains, setDomains] = useState([]);

    const showDifficultyToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 5000);
    };

    // Camera feed active toggle
    const [cameraActive, setCameraActive] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        let activeStream = null;
        if (step === "interviewing" && cameraActive) {
            navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
                .then(s => {
                    activeStream = s;
                    if (videoRef.current) {
                        videoRef.current.srcObject = s;
                    }
                })
                .catch(err => {
                    console.error("Error accessing webcam:", err);
                });
        }

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [step, cameraActive]);

    const startInterview = async () => {
        if (!jd.trim()) {
            alert("Please paste the job description to personalize the mock interview.");
            return;
        }

        try {
            setLoading(true);
            const detectedDomains = getDomainsForRole(role);
            setDomains(detectedDomains);

            // Load initial radar scores
            const storedRadar = localStorage.getItem("apexprep_radar_scores");
            let radarScores = { dsa: 40, systemDesign: 35, behavioural: 30, react: 40, apiDatabases: 40 };
            if (storedRadar) {
                try {
                    radarScores = JSON.parse(storedRadar);
                } catch (e) {
                    console.error("Failed to parse radar scores", e);
                }
            }
            const initialLevels = radarToLevels(radarScores);
            const engine = new DifficultyEngine(initialLevels);
            setDifficultyEngine(engine);

            const firstDomain = detectedDomains[0];
            setCurrentDomain(firstDomain);

            const question = await generateNextQuestion(engine, firstDomain, role, company, jd, []);
            setQuestions([question]);
            setCurrentQuestionIndex(0);
            setStep("interviewing");
        } catch (error) {
            console.error("Error initiating interview", error);
            alert("Could not generate the interview questions. Please verify your OpenRouter key.");
        } finally {
            setLoading(false);
        }
    };

    const handleNextQuestion = async () => {
        if (!userAnswer.trim()) {
            alert("Please write your answer before submitting.");
            return;
        }

        try {
            setLoading(true);

            // Score candidate response
            const scoreResult = await scoreAnswer(questions[currentQuestionIndex], userAnswer, currentDomain);

            // Update Engine
            const updateResult = difficultyEngine.update(currentDomain, scoreResult.score);

            if (updateResult.action === 'promoted') {
                const domainLabel = currentDomain === 'behavioural' ? 'Behavioral' : currentDomain === 'react' ? 'React' : currentDomain.toUpperCase();
                showDifficultyToast(`Nice work — stepping up to level ${updateResult.newLevel}/4 in ${domainLabel}`, 'promoted');
            } else if (updateResult.action === 'demoted') {
                const domainLabel = currentDomain === 'behavioural' ? 'Behavioral' : currentDomain === 'react' ? 'React' : currentDomain.toUpperCase();
                showDifficultyToast(`Let's solidify the fundamentals of ${domainLabel} (Level ${updateResult.newLevel}/4)`, 'demoted');
            }

            const newAnswers = [...answers, {
                question: questions[currentQuestionIndex],
                answer: userAnswer,
                domain: currentDomain,
                score: scoreResult.score,
                feedback: scoreResult.feedback,
                missingConcepts: scoreResult.missingConcepts
            }];
            setAnswers(newAnswers);
            setUserAnswer("");

            const nextIndex = currentQuestionIndex + 1;
            if (nextIndex < 3) {
                const nextDomain = domains[nextIndex];
                setCurrentDomain(nextDomain);

                const conversationHistory = newAnswers.map(ans => [
                    { role: 'assistant', content: ans.question },
                    { role: 'user', content: ans.answer }
                ]).flat();

                const nextQuestion = await generateNextQuestion(difficultyEngine, nextDomain, role, company, jd, conversationHistory);

                setQuestions(prev => [...prev, nextQuestion]);
                setCurrentQuestionIndex(nextIndex);
            } else {
                await generateFeedback(newAnswers);
            }
        } catch (error) {
            console.error("Error submitting answer", error);
            alert("Could not evaluate response. Please retry.");
        } finally {
            setLoading(false);
        }
    };

    const generateFeedback = async (allAnswers) => {
        try {
            setStep("loading_feedback");
            setLoading(true);

            const averageScore = Math.round(allAnswers.reduce((acc, a) => acc + a.score, 0) / allAnswers.length);

            // Save dynamic radar scores
            const storedRadar = JSON.parse(localStorage.getItem("apexprep_radar_scores") || "{}");
            const summary = difficultyEngine.getSessionSummary();
            const updatedRadar = updateRadar(storedRadar, summary);
            localStorage.setItem("apexprep_radar_scores", JSON.stringify(updatedRadar));

            const qaBlocks = allAnswers.map((qa, index) => {
                const domLabel = qa.domain === 'behavioural' ? 'Behavioral' : qa.domain === 'react' ? 'React' : qa.domain.toUpperCase();
                return `
                <div class="bg-[#03000a] border border-gray-950 rounded-2xl p-6 mb-6">
                    <div class="flex justify-between items-center mb-4 border-b border-gray-900 pb-3">
                        <span class="text-xs font-bold text-purple-400 uppercase tracking-widest">${domLabel} Domain</span>
                        <span class="text-sm font-bold text-gray-200 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">${qa.score}/100</span>
                    </div>
                    <p class="text-gray-100 font-bold mb-3 text-base">Q: ${qa.question}</p>
                    <p class="text-gray-400 text-sm mb-4 bg-gray-950/40 p-4 rounded-xl border border-gray-900/40 italic">A: "${qa.answer}"</p>
                    <div class="bg-[#090514] border border-purple-500/10 rounded-xl p-4 text-sm space-y-2.5">
                        <p class="text-gray-300"><strong class="text-purple-300 font-extrabold block mb-1">AI Evaluator Feedback:</strong> ${qa.feedback}</p>
                        ${qa.missingConcepts && qa.missingConcepts.length > 0 
                            ? `<p class="text-gray-400"><strong class="text-pink-400 font-extrabold block mb-1">Key Conceptual Gaps:</strong> ${qa.missingConcepts.join(', ')}</p>` 
                            : ''
                        }
                    </div>
                </div>
                `;
            }).join('');

            const finalHtml = `
            <div class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-[#0e091d]/50 border border-purple-500/20 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden group">
                        <div class="absolute -top-6 -right-6 w-16 h-16 bg-purple-500/10 rounded-full blur-xl" />
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Overall Score</span>
                        <span class="text-5xl font-extrabold text-white bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">${averageScore}%</span>
                    </div>
                    <div class="bg-[#0e091d]/50 border border-pink-500/20 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden group">
                        <div class="absolute -top-6 -right-6 w-16 h-16 bg-pink-500/10 rounded-full blur-xl" />
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Top Domain</span>
                        <span class="text-2xl font-extrabold text-pink-400 capitalize">${(summary.topDomain || '').replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    <div class="bg-[#0e091d]/50 border border-indigo-500/20 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden group">
                        <div class="absolute -top-6 -right-6 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl" />
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Needs Focus</span>
                        <span class="text-2xl font-extrabold text-indigo-400 capitalize">${(summary.weakDomain || '').replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                </div>

                <div class="mt-8">
                    <h3 class="text-lg font-bold text-gray-200 mb-6">Question-by-Question Diagnostics</h3>
                    ${qaBlocks}
                </div>

                <div class="bg-purple-950/10 border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden">
                    <div class="absolute -right-12 -bottom-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
                    <h4 class="text-purple-300 font-extrabold text-base mb-2">Adaptive Calibration Log</h4>
                    <p class="text-gray-400 text-xs leading-relaxed">
                        The Difficulty Engine evaluated your performance in real-time. Final proficiency coordinates have been dynamically smoothed (60% historical / 40% current session weight) and saved to your profile. Check your Dashboard radar chart to inspect details!
                    </p>
                </div>
            </div>
            `;

            setFeedback(finalHtml);
            setStep("feedback");

            // Save interview entry
            const newInterview = {
                role: `${role} (${company})`,
                type: "Adaptive Mock",
                score: `${averageScore}/100`,
                date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" }) + ", " + new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
            };
            const existingInterviews = JSON.parse(localStorage.getItem("prep_ai_interviews") || "[]");
            localStorage.setItem("prep_ai_interviews", JSON.stringify([newInterview, ...existingInterviews]));

        } catch (error) {
            console.error("Error generating feedback", error);
            setFeedback("<p class='text-red-400'>Failed to compile final evaluation report.</p>");
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
        setDifficultyEngine(null);
        setToast(null);
    };

    return (
        <div className="bg-[#03000a] text-white min-h-screen font-sans relative overflow-x-hidden">
            {/* Real-time Adaptive Toast */}
            {toast && (
                <div className={`fixed bottom-8 right-8 z-50 px-6 py-4.5 rounded-2xl border backdrop-blur-xl shadow-[0_4px_30px_rgba(168,85,247,0.15)] flex items-center gap-3.5 transition-all duration-300 animate-pulse ${
                    toast.type === 'promoted' 
                        ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
                        : 'bg-amber-950/90 border-amber-500/30 text-amber-300'
                }`}>
                    <span className="text-xl">{toast.type === 'promoted' ? '🚀' : '⚠️'}</span>
                    <span className="font-bold text-sm tracking-wide">{toast.message}</span>
                </div>
            )}

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
                            <div className="bg-[#0b0b0c] border border-gray-900 rounded-3xl overflow-hidden aspect-video md:aspect-[4/5] flex flex-col items-center justify-center relative shadow-lg animate-fade-in">
                                {cameraActive ? (
                                    <div className="w-full h-full bg-[#08080a] relative">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                            style={{ transform: "scaleX(-1)" }}
                                        />
                                        <div className="absolute bottom-5 left-5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 z-10">
                                            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                                            <span>Webcam Active</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-sm">Webcam has been turned off</div>
                                )}
                                
                                {/* Micro audio animation inside camera block */}
                                <div className="absolute bottom-5 right-5 flex items-center gap-1 z-10">
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
                                    <span>Question {currentQuestionIndex + 1} of 3</span>
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
                                {currentQuestionIndex + 1 < 3 ? "Submit and Next Question" : "Submit and Generate Feedback"}
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
