import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import CodingRound from "./pages/CodingRound";
import VoiceInterview from "./pages/VoiceInterview";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ShareCard from "./pages/ShareCard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/coding" element={<CodingRound />} />
        <Route path="/voice" element={<VoiceInterview />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/share/:uid" element={<ShareCard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;