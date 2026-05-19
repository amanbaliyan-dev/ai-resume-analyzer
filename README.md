# 🚀 ApexPrep AI: Elite Recruitment & Tech Interview Suite

**ApexPrep AI** is a state-of-the-art, high-fidelity SaaS platform designed to supercharge technical recruitment and interview preparation. The platform leverages modern artificial intelligence to evaluate candidate resumes, conduct dynamic mock technical or behavioral assessments, simulate full-fidelity voice rooms, compile code inside custom developer sandboxes, and map technical progress on interactive radar dashboards.

---

## ✨ Features Matrix

### 1. 📄 ResuAI (AI Resume Analyzer)
* **ATS Compatibility Scoring**: Instantly score PDF resumes against standard recruiting parsers.
* **Structural Audits**: Analyze action verbs, section layout, stack-specific keywords, and format density.
* **Optimization Recommendations**: Get actionable bullet-by-bullet guidelines to improve resume scores.

### 2. 🎭 Standard AI Mock Interview
* **Custom Persona Customization**: Configure mock sessions by specifying your target job title, employer, and pasting the exact Job Description requirements.
* **Adaptive AI Agent**: Generates highly challenging, mixed algorithmic, architectural, and behavioral questions.
* **Structural Performance Audits**: Evaluates candidate answers line-by-line and compiles detailed HTML reports outlining concrete tips.

### 3. 🎙️ Conversational AI Voice Room
* **Vocal Agent System**: Experience realistic conversational interviews using high-fidelity Text-to-Speech (TTS) reading questions.
* **Voice-to-Text Transcription**: Active Speech-to-Text (STT) capture system to record and transcribe verbal responses in real time.
* **Interactive Soundwave Visualizer**: Custom HTML5 canvas animation visualizing voice activity (idle, listening, speaking).
* **Vocal Auditing Analytics**: Checks vocabulary, pacing, clarity, confidence levels, and counts filler words like *"um"*, *"ah"*, or *"like"*.

### 4. 💻 Live Coding Sandbox Workspace
* **Integrated Developer Sandbox**: Write, edit, and prototype code in an ultra-sleek custom code playground with active line numbering.
* **Multi-Language Support**: Complete compilation setups for **JavaScript**, **Python**, and **C++**.
* **Simulated Test-Case Runner**: Test your solutions against custom parameters with a built-in sandbox output log.
* **Complexity & Optimizations Audit**: AI reviews your solution's correctness and calculates optimal Time/Space complexities (e.g. $O(N \log N)$).

### 5. 📊 Interactive Candidate Analytics Dashboard
* **Dynamic Metric Matrix**: Tracks completed scans, average ATS scores, mock history, and coding round percentages.
* **SVG Preparation Radar Map**: Renders a dynamic radar skill chart showing alignment across Core React, DSA, System Design, Communication, and API/Databases.
* **AI Suggestion Engine**: Highlights weak topic priorities based on candidate performance logs.

---

## 🛠️ Technology Stack

* **Core Framework**: React 19 (Vite)
* **Design & Styling**: Tailwind CSS v4 & custom glassmorphic CSS layers
* **Routing**: React Router DOM v6
* **Authentication**: Clerk Authentication Suite
* **AI Engine & Models**: Gemini 3 Flash / Gemini 3.1 Pro (via OpenRouter services)
* **State & Tracking**: LocalStorage persistent sync layers

---

## 📂 Project Structure

```bash
ai-interview-prep/
├── public/
│   ├── favicon.svg             # Premium brand vector icon
│   └── icons.svg
├── src/
│   ├── assets/                 # Brand illustrations and default logos
│   ├── components/
│   │   ├── common/
│   │   │   └── Logo.jsx        # Glowing reusable interactive SVG logo
│   │   ├── dashboard/
│   │   ├── interview/
│   │   └── resume/
│   ├── services/
│   │   └── ai/
│   │       └── openrouter.js   # OpenRouter AI LLM integration endpoint
│   ├── pages/
│   │   ├── Home.jsx            # Landing page with interactive grids
│   │   ├── Dashboard.jsx       # Analytics center with SVG radar mapping
│   │   ├── Interview.jsx       # Standard mock interview setup
│   │   ├── VoiceInterview.jsx  # Conversational TTS/STT soundwave room
│   │   ├── CodingRound.jsx     # Live multi-language code compiler
│   │   ├── ResumeAnalyzer.jsx  # PDF/ATS verification parser
│   │   ├── SignIn.jsx
│   │   └── SignUp.jsx
│   ├── App.jsx                 # Routing configuration
│   ├── main.jsx
│   └── index.css               # Premium styles & IDE table custom themes
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚙️ Quick Start Installation

### 1. Clone the repository
```bash
git clone https://github.com/amanbaliyan-dev/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and configure your credentials:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4. Run local dev server
```bash
npm run dev
```

The application will be compiled and launched locally at `http://localhost:5173`.

---

## 🚀 Deployment & Builds

To build the production-ready build artifacts:
```bash
npm run build
```
This prepares the compiled build bundles within the `/dist` directory, optimized for immediate deployment on platforms like Vercel or Netlify.

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more details.
