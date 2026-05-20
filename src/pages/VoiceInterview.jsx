import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import Navbar from "../components/common/Navbar";
import { generateAIResponse } from "../services/ai/openrouter";
import { useBodyLanguage } from "../hooks/useBodyLanguage";
import { getBodyLanguageAudit } from "../services/bodyLanguage/audit";
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

function VoiceInterview() {
    const [step, setStep] = useState("setup");
    const [role, setRole] = useState("React Developer");
    const [company, setCompany] = useState("Meta");
    const [level, setLevel] = useState("Mid-level");
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

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [transcript, setTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    
    const [answers, setAnswers] = useState([]);
    const [evaluation, setEvaluation] = useState(null);

    // Body Language States
    const [finalBodyScores, setFinalBodyScores] = useState(null);
    const [bodyLanguageAuditText, setBodyLanguageAuditText] = useState("");
    const [activeTab, setActiveTab] = useState("vocal");

    // Audio Visualizer & Webcam References
    const soundwaveCanvasRef = useRef(null);
    const videoRef = useRef(null);
    const webcamCanvasRef = useRef(null);
    const recognitionRef = useRef(null);
    const animationRef = useRef(null);

    // Holistic Body Language hook
    const { scores: bodyLanguageScores, ready: bodyLanguageReady } = useBodyLanguage(
        videoRef,
        webcamCanvasRef,
        step === "interviewing"
    );

    // Initialize Web Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = "en-US";

            rec.onresult = (event) => {
                let currentTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
            };

            rec.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = rec;
        }
    }, []);

    // Canvas Soundwave Animation
    useEffect(() => {
        if (step !== "interviewing" || !soundwaveCanvasRef.current) return;

        const canvas = soundwaveCanvasRef.current;
        const ctx = canvas.getContext("2d");
        let phase = 0;

        const renderWave = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const numLines = 60;
            const width = canvas.width;
            const height = canvas.height;
            ctx.lineWidth = 3;
            
            for (let i = 0; i < numLines; i++) {
                const x = (width / numLines) * i;
                let amplitude = 0;
                
                if (aiSpeaking) {
                    // Fast high wave for speaking
                    amplitude = Math.sin(i * 0.15 + phase) * 35 * Math.sin(phase * 0.5);
                } else if (isListening) {
                    // Slow responsive wave for listening
                    amplitude = Math.sin(i * 0.3 + phase) * (Math.random() * 15 + 10);
                } else {
                    // Idle flat line with micro-noise
                    amplitude = Math.sin(i * 0.1 + phase) * 3;
                }

                ctx.strokeStyle = aiSpeaking 
                    ? `hsla(${(i * 4) + 260}, 85%, 65%, 0.8)` 
                    : isListening 
                    ? `hsla(${(i * 4) + 320}, 90%, 65%, 0.8)`
                    : "rgba(100, 116, 139, 0.4)";

                ctx.beginPath();
                ctx.moveTo(x, height / 2);
                ctx.lineTo(x, (height / 2) + amplitude);
                ctx.stroke();
            }

            phase += aiSpeaking ? 0.2 : isListening ? 0.08 : 0.02;
            animationRef.current = requestAnimationFrame(renderWave);
        };

        renderWave();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [step, aiSpeaking, isListening]);

    // Text to Speech (TTS) Reader
    const speakText = (text) => {
        if (!window.speechSynthesis) return;

        // Cancel previous speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to select a premium sounding English voice if available
        const voices = window.speechSynthesis.getVoices();
        const premiumVoice = voices.find(voice => 
            voice.lang.startsWith("en") && (voice.name.includes("Google") || voice.name.includes("Natural"))
        );
        if (premiumVoice) {
            utterance.voice = premiumVoice;
        }

        utterance.onstart = () => {
            setAiSpeaking(true);
            if (isListening) stopListening();
        };

        utterance.onend = () => {
            setAiSpeaking(false);
            // Automatically prompt the user to start speaking
            startListening();
        };

        window.speechSynthesis.speak(utterance);
    };

    const startVoiceInterview = async () => {
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

            const question = await generateNextQuestion(engine, firstDomain, role, company, `Candidate Level: ${level}`);
            setQuestions([question]);
            setCurrentIndex(0);
            setStep("interviewing");
            
            // Speak the first question
            setTimeout(() => speakText(question), 500);
        } catch (e) {
            console.error("Failed to initiate voice interview", e);
            alert("Could not initialize voice questions. Please verify your OpenRouter key.");
        } finally {
            setLoading(false);
        }
    };

    const startListening = () => {
        if (recognitionRef.current) {
            setTranscript("");
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            setIsListening(false);
            recognitionRef.current.stop();
        }
    };

    const handleNextQuestion = async () => {
        if (isListening) stopListening();
        setLoading(true);

        const currentAnswerText = transcript || "[No response detected]";

        try {
            // Score candidate response
            const scoreResult = await scoreAnswer(questions[currentIndex], currentAnswerText, currentDomain);

            // Update Engine
            const updateResult = difficultyEngine.update(currentDomain, scoreResult.score);

            if (updateResult.action === 'promoted') {
                const domainLabel = currentDomain === 'behavioural' ? 'Behavioral' : currentDomain === 'react' ? 'React' : currentDomain.toUpperCase();
                showDifficultyToast(`Nice work — stepping up to level ${updateResult.newLevel}/4 in ${domainLabel}`, 'promoted');
            } else if (updateResult.action === 'demoted') {
                const domainLabel = currentDomain === 'behavioural' ? 'Behavioral' : currentDomain === 'react' ? 'React' : currentDomain.toUpperCase();
                showDifficultyToast(`Let's solidify the fundamentals of ${domainLabel} (Level ${updateResult.newLevel}/4)`, 'demoted');
            }

            const currentAnswer = {
                question: questions[currentIndex],
                answer: currentAnswerText,
                domain: currentDomain,
                score: scoreResult.score,
                feedback: scoreResult.feedback,
                missingConcepts: scoreResult.missingConcepts
            };

            const updatedAnswers = [...answers, currentAnswer];
            setAnswers(updatedAnswers);
            setTranscript("");

            const nextIndex = currentIndex + 1;
            if (nextIndex < 3) {
                const nextDomain = domains[nextIndex];
                setCurrentDomain(nextDomain);

                const conversationHistory = updatedAnswers.map(ans => [
                    { role: 'assistant', content: ans.question },
                    { role: 'user', content: ans.answer }
                ]).flat();

                const nextQuestion = await generateNextQuestion(difficultyEngine, nextDomain, role, company, `Candidate Level: ${level}`, conversationHistory);

                setQuestions(prev => [...prev, nextQuestion]);
                setCurrentIndex(nextIndex);
                // Read next question
                setTimeout(() => speakText(nextQuestion), 650);
            } else {
                // End of voice interview, process analytics
                if (bodyLanguageScores) {
                    setFinalBodyScores(bodyLanguageScores);
                }
                await generateVoiceEvaluation(updatedAnswers, bodyLanguageScores);
            }
        } catch (error) {
            console.error("Error processing voice step", error);
            alert("Could not evaluate response. Please click Submit and Next again.");
        } finally {
            setLoading(false);
        }
    };

    const generateVoiceEvaluation = async (allAnswers, finalBodyScores) => {
        try {
            setStep("evaluating");
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

            const evaluationPrompt = `
            Review these spoken audio answers from an interview for a ${level} ${role} at ${company}:
            ${allAnswers.map((qa, i) => `Q${i+1}: ${qa.question}\nA${i+1}: ${qa.answer}`).join('\n')}

            Provide a detailed report analyzing:
            1. Total Score out of 100
            2. Communication quality (Clarity, confidence, filler words like "um", "ah", "like")
            3. Technical Accuracy of the verbal descriptions
            4. Strengths
            5. Actionable guidelines for vocal tone, pacing, and vocabulary

            Return the output in premium clean styled HTML tags with grids and bullet points. Make it feel elite.
            `;

            const voicePromise = generateAIResponse(evaluationPrompt);
            let bodyPromise = Promise.resolve("");
            if (finalBodyScores) {
                bodyPromise = getBodyLanguageAudit(finalBodyScores, import.meta.env.VITE_OPENROUTER_API_KEY);
            }

            const [voiceRes, bodyRes] = await Promise.all([voicePromise, bodyPromise]);

            const finalHtml = `
            <div class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-[#0e091d]/50 border border-purple-500/20 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden">
                        <div class="absolute -top-6 -right-6 w-16 h-16 bg-purple-500/10 rounded-full blur-xl" />
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Overall Verbal Score</span>
                        <span class="text-5xl font-extrabold text-white bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">${averageScore}%</span>
                    </div>
                    <div class="bg-[#0e091d]/50 border border-pink-500/20 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden">
                        <div class="absolute -top-6 -right-6 w-16 h-16 bg-pink-500/10 rounded-full blur-xl" />
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Calibrated Top Domain</span>
                        <span class="text-2xl font-extrabold text-pink-400 capitalize">${(summary.topDomain || '').replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    <div class="bg-[#0e091d]/50 border border-indigo-500/20 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden">
                        <div class="absolute -top-6 -right-6 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl" />
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Calibrated Focus</span>
                        <span class="text-2xl font-extrabold text-indigo-400 capitalize">${(summary.weakDomain || '').replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                </div>

                <div class="bg-purple-950/10 border border-purple-500/20 rounded-3xl p-6">
                    <h4 class="text-purple-300 font-extrabold text-base mb-2">Adaptive Calibration Log</h4>
                    <p class="text-gray-400 text-xs leading-relaxed">
                        The Difficulty Engine evaluated your vocal responses in real-time. Final coordinates have been dynamically blended (60% historical / 40% current session weight) and saved to your profile. Check your Dashboard radar chart to inspect details!
                    </p>
                </div>

                <div class="mt-8">
                    <h3 class="text-lg font-bold text-gray-200 mb-6">Verbal Transcript & Diagnostics</h3>
                    ${qaBlocks}
                </div>

                <div class="border-t border-gray-900 pt-8">
                    <h3 class="text-lg font-bold text-gray-200 mb-6">AI Vocal Report Analysis</h3>
                    <div class="prose prose-invert max-w-none text-gray-300 font-medium">${voiceRes}</div>
                </div>
            </div>
            `;

            setEvaluation(finalHtml);
            setBodyLanguageAuditText(bodyRes);
            setStep("feedback");

            // Save to localStorage for real dashboard tracking
            const newInterview = {
                role: `${role} (${company})`,
                type: "AI Voice & Vision Interview",
                score: `${averageScore}/100`,
                date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" }) + ", " + new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
            };
            const existingInterviews = JSON.parse(localStorage.getItem("prep_ai_interviews") || "[]");
            localStorage.setItem("prep_ai_interviews", JSON.stringify([newInterview, ...existingInterviews]));

        } catch (e) {
            console.error("Error generating voice summary feedback", e);
            setEvaluation("<p class='text-red-400'>Failed to compile final evaluation report.</p>");
        } finally {
            setLoading(false);
        }
    };

    const resetVoiceInterview = () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setStep("setup");
        setCurrentIndex(0);
        setTranscript("");
        setAnswers([]);
        setEvaluation(null);
        setFinalBodyScores(null);
        setBodyLanguageAuditText("");
        setActiveTab("vocal");
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
            <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] bg-pink-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            {/* Navbar */}
            <Navbar activePage="voice" />

            <main className="max-w-4xl mx-auto px-4 md:px-6 py-12">
                {/* Step 1: Setup */}
                {step === "setup" && (
                    <section className="bg-[#090514]/75 border border-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                            Premium <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent">AI Voice Interview</span>
                        </h1>
                        <p className="text-gray-400 mb-8 max-w-xl text-base md:text-lg">
                            Conduct a fully spoken assessment. PrepAI speaks the questions aloud and transcribes your verbal responses, evaluating communication, fillers, and tone.
                        </p>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2.5">Job Role</label>
                                    <input
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-[#03000a] border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-pink-500 transition-all font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2.5">Target Employer</label>
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className="w-full bg-[#03000a] border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-pink-500 transition-all font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2.5">Experience Level</label>
                                    <select
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        className="w-full bg-[#03000a] border border-gray-800 rounded-xl px-5 py-4.5 text-white outline-none focus:border-pink-500 transition-all font-semibold cursor-pointer"
                                    >
                                        <option value="Junior">Junior (0-2 YOE)</option>
                                        <option value="Mid-level">Mid-level (2-5 YOE)</option>
                                        <option value="Senior">Senior (5+ YOE)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={startVoiceInterview}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-90 py-4.5 rounded-2xl font-extrabold text-lg shadow-[0_4px_30px_rgba(236,72,153,0.25)] transition-all flex items-center justify-center gap-3 cursor-pointer"
                            >
                                {loading ? "Initializing Voice Engine..." : "Launch Voice Interview"}
                            </button>
                        </div>
                    </section>
                )}

                {/* Step 2: Active Voice Interviewing Room */}
                {step === "interviewing" && (
                    <section className="flex flex-col items-center gap-8 w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
                            {/* Left Column (webcam, question, transcript) - 2 cols */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Webcam + Landmarks Overlay */}
                                <div className="relative rounded-3xl overflow-hidden border border-gray-900 bg-[#03000a] aspect-video w-full shadow-2xl">
                                    <video
                                        ref={videoRef}
                                        autoPlay muted playsInline
                                        className="w-full h-full object-cover animate-fade-in"
                                        style={{ transform: 'scaleX(-1)' }}
                                    />
                                    <canvas
                                        ref={webcamCanvasRef}
                                        width={640} height={480}
                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                        style={{ transform: 'scaleX(-1)' }}
                                    />
                                    {!bodyLanguageReady && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090514]/90 text-white gap-3 z-20">
                                            <div className="w-10 h-10 border-4 border-t-pink-500 border-pink-500/20 rounded-full animate-spin" />
                                            <div className="text-sm font-semibold tracking-wider text-gray-400">Loading AI Vision (MediaPipe)...</div>
                                        </div>
                                    )}
                                </div>

                                {/* Interactive question panel */}
                                <div className="bg-[#090514]/70 border border-gray-900 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-md relative">
                                    <div className="flex justify-between items-center text-xs font-bold text-pink-400 uppercase tracking-widest">
                                        <span>PrepAI Vocal Agent</span>
                                        <span>Question {currentIndex + 1} of 3</span>
                                    </div>

                                    <h2 className="text-lg md:text-xl font-bold bg-[#03000a] border border-gray-950 p-5 rounded-2xl leading-relaxed text-center text-gray-100">
                                        "{questions[currentIndex]}"
                                    </h2>

                                    {/* Voice Transcription Box */}
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Voice Transcript</label>
                                        <div className="min-h-[100px] w-full bg-[#03000a] border border-gray-800 rounded-2xl px-5 py-4 text-sm leading-relaxed text-gray-300 font-medium overflow-y-auto">
                                            {transcript || <span className="text-gray-600 italic">Start speaking or click record to begin transcribing...</span>}
                                        </div>
                                    </div>

                                    {/* Mic Controls */}
                                    <div className="flex justify-center gap-4 mt-2">
                                        {isListening ? (
                                            <button
                                                onClick={stopListening}
                                                className="bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 px-6 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer"
                                            >
                                                <span className="w-3.5 h-3.5 bg-rose-500 rounded-full animate-ping" />
                                                Mute Microphone
                                            </button>
                                        ) : (
                                            <button
                                                onClick={startListening}
                                                disabled={aiSpeaking}
                                                className="bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 disabled:opacity-50 px-6 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                </svg>
                                                Activate Microphone
                                            </button>
                                        )}
                                        
                                        <button
                                            onClick={() => speakText(questions[currentIndex])}
                                            className="bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 px-6 py-3.5 rounded-xl font-bold transition-all cursor-pointer"
                                        >
                                            Repeat Question
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (Metrics HUD & Soundwave) - 1 col */}
                            <div className="space-y-6">
                                {/* Overall Body Language HUD */}
                                {bodyLanguageScores && (
                                    <div className="bg-[#090514]/80 border border-gray-900 rounded-3xl p-6 shadow-md flex flex-col gap-6">
                                        <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider">Non-Verbal Analytics</h3>
                                        <ScoreHUD scores={bodyLanguageScores} />
                                    </div>
                                )}

                                {/* Audio Visualizer */}
                                <div className="bg-[#090514]/80 border border-gray-900 rounded-3xl p-6 flex flex-col items-center shadow-lg">
                                    <h3 className="text-sm font-bold text-gray-400 self-start mb-4 uppercase tracking-wider">Voice Tone / Wave</h3>
                                    <canvas 
                                        ref={soundwaveCanvasRef} 
                                        width="450" 
                                        height="100" 
                                        className="w-full bg-black/40 rounded-2xl border border-gray-950 mb-4"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${
                                            aiSpeaking ? "bg-purple-500 animate-pulse" : isListening ? "bg-pink-500 animate-ping" : "bg-gray-600"
                                        }`} />
                                        <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
                                            {aiSpeaking ? "AI Speaking" : isListening ? "Listening..." : "Vocal Idle"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation controls */}
                        <button
                            onClick={handleNextQuestion}
                            className="w-full max-w-2xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-90 py-4.5 rounded-2xl font-extrabold text-lg shadow-lg cursor-pointer mt-4"
                        >
                            {currentIndex + 1 < 3 ? "Submit and Next Question" : "Submit Answer & Generate Evaluation"}
                        </button>
                    </section>
                )}

                {/* Step 3: Loader */}
                {step === "evaluating" && (
                    <section className="text-center py-24 bg-[#090514]/70 border border-gray-900 rounded-3xl shadow-xl flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 border-t-4 border-pink-500 rounded-full animate-spin" />
                        <h2 className="text-2xl font-bold">Conducting Voice Auditing & Performance Review...</h2>
                        <p className="text-gray-400 max-w-sm leading-relaxed text-sm">
                            Evaluating vocab relevance, filler word counts ("um", "ah", "like"), logical communication structures, and content accuracy.
                        </p>
                    </section>
                )}

                {/* Step 4: Feedback Report */}
                {step === "feedback" && (
                    <section className="bg-[#090514]/75 border border-gray-900 rounded-3xl p-6 md:p-12 shadow-2xl">
                        <header className="flex justify-between items-center mb-8 border-b border-gray-900 pb-6">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight">AI Voice Evaluation Report</h1>
                                <p className="text-gray-400 mt-1">Spoken Audit: {role} conducted for {company}</p>
                            </div>
                            <button
                                onClick={resetVoiceInterview}
                                className="bg-[#03000a] border border-gray-800 text-gray-300 hover:text-white px-5 py-2.5 rounded-xl font-semibold transition-all hover:bg-pink-950/20 cursor-pointer"
                            >
                                Restart Voice Interview
                            </button>
                        </header>

                        {/* Summary Header Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <div className="bg-[#03000a] border border-gray-950 p-6 rounded-2xl flex flex-col">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Answer & Vocal Score</span>
                                <span className="text-3xl font-extrabold text-pink-400 mt-2">
                                    {evaluation?.match(/Overall Score:\s*(\d+)/i)?.[1] || evaluation?.match(/Score:\s*(\d+)/i)?.[1] || evaluation?.match(/(\d+)\/100/)?.[1] || "75"}/100
                                </span>
                            </div>
                            {finalBodyScores && (
                                <div className="bg-[#03000a] border border-gray-950 p-6 rounded-2xl flex flex-col">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Non-Verbal Presence Score</span>
                                    <span className="text-3xl font-extrabold text-purple-400 mt-2">{finalBodyScores.overallScore}/100</span>
                                </div>
                            )}
                        </div>

                        {/* Tabs Switcher */}
                        {finalBodyScores && (
                            <div className="flex border-b border-gray-900 mb-8 gap-4">
                                <button
                                    onClick={() => setActiveTab("vocal")}
                                    className={`pb-4 px-2 font-bold text-sm tracking-wide transition-all border-b-2 cursor-pointer ${
                                        activeTab === "vocal" 
                                            ? "border-pink-500 text-pink-400" 
                                            : "border-transparent text-gray-400 hover:text-gray-200"
                                    }`}
                                >
                                    Vocal & Content Analysis
                                </button>
                                <button
                                    onClick={() => setActiveTab("body")}
                                    className={`pb-4 px-2 font-bold text-sm tracking-wide transition-all border-b-2 cursor-pointer ${
                                        activeTab === "body" 
                                            ? "border-purple-500 text-purple-400" 
                                            : "border-transparent text-gray-400 hover:text-gray-200"
                                    }`}
                                >
                                    Non-Verbal Presence Coach
                                </button>
                            </div>
                        )}

                        {/* Tab Content */}
                        {activeTab === "vocal" ? (
                            <div 
                                className="text-gray-300 leading-relaxed font-medium prose prose-invert max-w-none prose-pink"
                                dangerouslySetInnerHTML={{ __html: evaluation }}
                            />
                        ) : (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    {/* Visual Scores metrics */}
                                    <div className="bg-[#03000a] border border-gray-950 p-6 rounded-3xl">
                                        <h3 className="text-lg font-bold text-gray-200 mb-6">Non-Verbal Scores Breakdown</h3>
                                        <ScoreHUD scores={finalBodyScores} />
                                    </div>
                                    
                                    {/* Specific Actionable Tips */}
                                    <div className="bg-[#03000a] border border-gray-950 p-6 rounded-3xl space-y-6">
                                        <h3 className="text-lg font-bold text-gray-200">AI Body Language Coaching Tips</h3>
                                        <div className="text-gray-300 space-y-4 text-sm md:text-base leading-relaxed font-medium">
                                            {bodyLanguageAuditText ? (
                                                <div className="prose prose-invert prose-purple max-w-none">
                                                    {bodyLanguageAuditText.split('\n').map((para, i) => {
                                                        if (!para.trim()) return null;
                                                        return <p key={i}>{para}</p>;
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic">No non-verbal feedback compiled.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={resetVoiceInterview}
                                className="bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all cursor-pointer"
                            >
                                Start New Voice Session
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

function ScoreHUD({ scores }) {
    const metrics = [
        { label: 'Eye Contact',    value: scores.eyeContact,    color: 'bg-purple-500' },
        { label: 'Posture Style',  value: scores.posture,       color: 'bg-emerald-500' },
        { label: 'Head Stability', value: scores.headStability, color: 'bg-blue-500' },
        { label: 'Confidence/Smile',value: scores.smileScore,    color: 'bg-amber-500' },
        { label: 'Gestures Rate',  value: scores.gestureRate,   color: 'bg-rose-500' },
    ];

    return (
        <div className="flex flex-col gap-5 w-full">
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-purple-400">{scores.overallScore}</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">/ 100</span>
            </div>

            <div className="space-y-4 w-full">
                {metrics.map(m => (
                    <div key={m.label} className="w-full">
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                            <span className="text-gray-400">{m.label}</span>
                            <span className="text-white font-bold">{m.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-[#03000a] rounded-full overflow-hidden border border-gray-900">
                            <div 
                                className={`h-full rounded-full ${m.color} transition-all duration-500`}
                                style={{ width: `${m.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VoiceInterview;
