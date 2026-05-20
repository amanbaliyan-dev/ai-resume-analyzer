# 🚀 ApexPrep AI: Elite Technical Interview & Candidate Analytics Suite

**ApexPrep AI** is a state-of-the-art, high-fidelity SaaS platform designed to supercharge technical recruitment and interview preparation. The platform leverages modern artificial intelligence to evaluate candidate resumes, conduct dynamic mock technical or behavioral assessments, simulate full-fidelity voice rooms, compile code inside custom developer sandboxes, and map technical progress on interactive radar dashboards.

---

## 🌐 Live Demo
You can check out the deployed version of the suite here:
👉 **[ApexPrep AI Suite Live Link](https://ai-resume-analyzer-six-brown.vercel.app/)**

---

## ✨ Features Matrix

### 1. 📄 ResuAI (AI Resume Analyzer)
* **ATS Compatibility Scoring**: Instantly score PDF resumes against standard recruiting parsers.
* **Structural Audits**: Analyze action verbs, section layout, stack-specific keywords, and format density using `pdfjs-dist`.
* **Optimization Recommendations**: Get actionable bullet-by-bullet guidelines to improve resume scores.

### 2. 🤖 Real-Time Adaptive Difficulty Engine
* **Dynamic Interview Calibrator**: Standard mock and vocal interviews no longer run on static banks. The system scores each response in real time and automatically calibrates question complexity (Levels 1–4) across 5 core domains (`DSA`, `System Design`, `Behavioral`, `React`, `APIs & Databases`).
* **Streaks & Progress Calibration**: Promotes candidate level after 2 consecutive high scores (>= 75) and demotes level when fundamentals need reinforcing (score < 55).
* **Vocal & Text Toast Feedback**: Visual notifications alert candidates in real time as the difficulty levels shift.
* **Smoothed Coordinate Analytics**: Adjusts dashboard radar scores using a 60% historical / 40% current session weighted blend to prevent volatile metric swings.

### 3. 🎙️ Conversational AI Voice Room & MediaPipe Vision
* **Holistic Body Language Analyzer**: Captures candidate webcam feeds and runs real-time **MediaPipe Holistic** tracking to map facial mesh landmarks and skeletal vectors.
* **Non-Verbal Auditing**: Monitors eye contact (iris offset tracking), posture alignment (shoulder tilt & lean tracking), head stability (nose displacement), smile rates, and hand gestures.
* **Vocal Auditing Analytics**: Checks vocabulary, pacing, clarity, confidence levels, and counts filler words like *"um"*, *"ah"*, or *"like"*.
* **Interactive Soundwave Visualizer**: Custom HTML5 canvas animation visualizing voice activity (idle, listening, speaking).
* **Vocal & Non-Verbal Coach**: Compiles concrete, action-oriented executive presence improvement suggestions.

### 4. 📅 AI-Powered Study Curriculum Planner
* **Tailored Daily Curriculum**: Automatically reads the candidate's radar score coordinates to target their weakest topics.
* **4-Week Interactive Study Plan**: Generates weekly curriculum guides complete with topic overviews, key concepts to study, and interactive checklists.
* **Progress Tracking**: Persistent tracking lets users mark daily tasks completed, saving progress locally to coordinate their learning curve.

### 5. 💻 Live Coding Sandbox Workspace
* **Integrated Developer Sandbox**: Write, edit, and prototype code in an ultra-sleek custom code playground with active line numbering.
* **Multi-Language Support**: Complete compilation setups for **JavaScript**, **Python**, and **C++**.
* **Simulated Test-Case Runner**: Test your solutions against custom parameters with a built-in sandbox output log.
* **Complexity & Optimizations Audit**: AI reviews your solution's correctness and calculates optimal Time/Space complexities (e.g. $O(N \log N)$).

### 6. 📊 Interactive Candidate Analytics & Sharing
* **SVG Preparation Radar Map**: Renders a dynamic radar skill chart showing alignment across Core React, DSA, System Design, Communication, and API/Databases.
* **Dynamic Metric Matrix**: Tracks completed scans, average ATS scores, mock history, and coding round percentages.
* **Vercel OG Image Profile Sharing**: Generates custom LinkedIn-compatible scorecard PNG images dynamically via `/api/og.jsx` Edge functions. Let candidates share their customized scorecards directly with networks.

---

## 🛠️ Technology Stack

* **Core Framework**: React 19 (Vite)
* **Computer Vision**: `@mediapipe/holistic`, `@mediapipe/camera_utils` & `@mediapipe/drawing_utils`
* **Design & Styling**: Tailwind CSS v4 & custom glassmorphic CSS layers
* **Routing**: React Router DOM v6
* **Authentication**: Clerk Authentication Suite
* **AI Engine & Models**: Gemini 2.5 Flash / Gemini 2.5 Pro (via OpenRouter services)
* **PDF Processing**: `pdfjs-dist`
* **Image Generation**: `@vercel/og` Edge API
* **State & Tracking**: LocalStorage persistent sync layers
* **Deployment**: Vercel

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
│   │   ├── studyPlan/          # Custom daily curriculum components
│   │   └── resume/
│   ├── hooks/
│   │   └── useBodyLanguage.js  # MediaPipe webcam skeletal overlay hook
│   ├── services/
│   │   ├── ai/
│   │   │   ├── openrouter.js   # OpenRouter AI LLM integration endpoint
│   │   │   └── interviewAgent.js # Prompt engine for scoring & generation
│   │   ├── bodyLanguage/
│   │   │   ├── analyzer.js     # Body pose coordinates math analyzer
│   │   │   └── audit.js        # Gemini-driven non-verbal report generator
│   │   ├── studyPlan/
│   │   │   └── generator.js    # AI study planner engine
│   │   ├── adaptiveDifficulty.js # Adaptive Level Streak Engine logic
│   │   └── api/
│   │       └── extractText.js  # PDF text extraction handler
│   ├── pages/
│   │   ├── Home.jsx            # Landing page with interactive grids
│   │   ├── Dashboard.jsx       # Analytics center with SVG radar mapping
│   │   ├── StudyPlan.jsx       # Custom curriculum calendar view
│   │   ├── Interview.jsx       # Adaptive mock interview page
│   │   ├── VoiceInterview.jsx  # MediaPipe webcam overlay voice mock room
│   │   ├── CodingRound.jsx     # Live multi-language code compiler
│   │   ├── ResumeAnalyzer.jsx  # PDF/ATS verification parser
│   │   ├── ShareCard.jsx       # Profile sharing with LinkedIn meta tags
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
This prepares the compiled build bundles within the `/dist` directory, optimized for immediate deployment on Vercel.

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more details.

---

## 👨‍💻 Author
**Aman Baliyan**
* GitHub: [@amanbaliyan-dev](https://github.com/amanbaliyan-dev)
* LinkedIn: [Aman Baliyan](https://linkedin.com/in/aman-baliyan-7804a2205)
