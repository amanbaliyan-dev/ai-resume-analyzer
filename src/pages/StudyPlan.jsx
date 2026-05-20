import { useState, useEffect } from 'react';
import {
  loadStudyPlan, saveStudyPlan,
  markTaskComplete, getCompletionStats
} from '../services/studyPlan/generator';
import PlanGenerator from '../components/studyPlan/PlanGenerator';
import Navbar from '../components/common/Navbar';

const TYPE_COLORS = {
  dsa:           { bg: 'rgba(127, 119, 221, 0.1)', border: 'rgba(127, 119, 221, 0.3)', text: '#a5a1f6' },
  systemDesign:  { bg: 'rgba(29, 158, 117, 0.1)', border: 'rgba(29, 158, 117, 0.3)', text: '#53d7a8' },
  behavioural:   { bg: 'rgba(239, 159, 39, 0.1)', border: 'rgba(239, 159, 39, 0.3)', text: '#f4c379' },
  react:         { bg: 'rgba(55, 138, 221, 0.1)', border: 'rgba(55, 138, 221, 0.3)', text: '#7cb5f2' },
  mockInterview: { bg: 'rgba(216, 90, 48, 0.1)', border: 'rgba(216, 90, 48, 0.3)', text: '#f28d6b' },
  rest:          { bg: 'rgba(180, 178, 169, 0.1)', border: 'rgba(180, 178, 169, 0.3)', text: '#d2d1cb' },
};

function ProgressRing({ percent, size = 76 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255, 255, 255, 0.05)" strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#a855f7" strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 14, fontWeight: 700, fill: '#fff',
          transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}>
        {percent}%
      </text>
    </svg>
  );
}

function DayCard({ day, weekIndex, dayIndex, completedTasks, onToggle }) {
  const colors = TYPE_COLORS[day.type] || TYPE_COLORS.rest;
  return (
    <div className="bg-[#090514]/70 border border-gray-900 rounded-3xl p-6 flex flex-col justify-between hover:border-purple-500/20 transition-all duration-300 relative group">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{day.day}</span>
            <span 
              className="text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider"
              style={{ background: colors.bg, borderColor: colors.border, color: colors.text }}
            >
              {day.type === 'behavioural' ? 'behavioral' : day.type}
            </span>
          </div>
          <span className="text-xs text-gray-500 font-bold">{day.duration}</span>
        </div>

        <h4 className="text-sm font-bold text-gray-200 mb-4 leading-snug">{day.topic}</h4>

        <div className="flex flex-col gap-2.5 mb-5">
          {day.tasks.map((task, ti) => {
            const key = `${weekIndex}-${dayIndex}-${ti}`;
            const done = !!completedTasks[key];
            return (
              <label key={ti} className="flex items-start gap-2.5 cursor-pointer text-xs group/item">
                <input 
                  type="checkbox" 
                  checked={done}
                  onChange={e => onToggle(weekIndex, dayIndex, ti, e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-md border-gray-800 bg-[#03000a] text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span className={`leading-relaxed transition-colors duration-200 select-none ${
                  done ? 'text-gray-600 line-through' : 'text-gray-300 group-hover/item:text-white'
                }`}>
                  {task}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {day.apexPrepAction && (
        <div className="bg-purple-950/15 border border-purple-500/15 rounded-xl px-3 py-2 text-[11px] font-semibold text-purple-300 flex items-center gap-1.5 mt-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>ApexAction: {day.apexPrepAction}</span>
        </div>
      )}
    </div>
  );
}

export default function StudyPlan() {
  const [entry, setEntry]         = useState(null);
  const [activeWeek, setActiveWeek] = useState(0);
  const [loaded, setLoaded]       = useState(false);

  // Load user actual radar scores from localStorage or default
  const [radarScores, setRadarScores] = useState({
    dsa: 40, systemDesign: 35, behavioural: 30, react: 40, apiDatabases: 40
  });

  useEffect(() => {
    const saved = loadStudyPlan();
    if (saved) setEntry(saved);

    const storedRadar = localStorage.getItem("apexprep_radar_scores");
    if (storedRadar) {
      try {
        setRadarScores(JSON.parse(storedRadar));
      } catch (e) {
        console.error("Error reading radar scores", e);
      }
    }
    setLoaded(true);
  }, []);

  const handleToggle = (wi, di, ti, checked) => {
    const updated = markTaskComplete(wi, di, ti, checked);
    setEntry({ ...updated });
  };

  const handleReset = () => {
    localStorage.removeItem('apexprep_studyplan');
    setEntry(null);
  };

  if (!loaded) return null;

  return (
    <div className="bg-[#03000a] text-white min-h-screen font-sans overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <Navbar activePage="study-plan" />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        {!entry ? (
          <PlanGenerator
            radarScores={radarScores}
            onPlanReady={newEntry => { setEntry(newEntry); setActiveWeek(0); }}
          />
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-900">
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                  {entry.plan.title}
                </h1>
                <p className="text-gray-400 mt-2 text-sm md:text-base">
                  Generated {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {entry.plan.dailyTimeCommitment}/day · {entry.plan.weeks.length} Weeks
                </p>
              </div>
              <div className="flex items-center gap-6">
                <ProgressRing percent={getCompletionStats(entry.plan, entry.completedTasks).percent} />
                <button 
                  onClick={handleReset}
                  className="bg-[#0e091d] border border-gray-800 text-gray-300 hover:text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-purple-950/20 cursor-pointer"
                >
                  Regenerate Plan
                </button>
              </div>
            </div>

            {/* Coach Summary & Focus */}
            <div className="bg-[#090514]/70 border border-gray-900 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl" />
              <p className="text-base text-gray-300 leading-relaxed mb-6">
                {entry.plan.summary}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {entry.plan.focusAreas.map(area => (
                  <span 
                    key={area} 
                    className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1.5 rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Milestones */}
            {entry.plan.milestones?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Milestones & Metric Goals</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {entry.plan.milestones.map((m, i) => (
                    <div key={i} className="bg-[#090514]/40 border border-gray-950 rounded-2xl p-5 hover:border-purple-500/10 transition-colors">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Week {m.week}</span>
                      <p className="text-sm font-bold text-gray-200 mt-2 mb-1">{m.title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{m.metric}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Week tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-900/40">
              {entry.plan.weeks.map((w, i) => (
                <button
                  key={i}
                  onClick={() => setActiveWeek(i)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer whitespace-nowrap ${
                    activeWeek === i
                      ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                      : 'bg-transparent border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Week {w.week}
                </button>
              ))}
            </div>

            {/* Active Week Headline */}
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-100">{entry.plan.weeks[activeWeek].theme}</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                Goal: <span className="text-gray-400 normal-case font-medium">{entry.plan.weeks[activeWeek].goal}</span>
              </p>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entry.plan.weeks[activeWeek].days.map((day, di) => (
                <DayCard
                  key={di}
                  day={day}
                  weekIndex={activeWeek}
                  dayIndex={di}
                  completedTasks={entry.completedTasks}
                  onToggle={handleToggle}
                />
              ))}
            </div>

            {/* Coach tips */}
            {entry.plan.tips?.length > 0 && (
              <div className="pt-8 border-t border-gray-900">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Coach Tips & Advice</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entry.plan.tips.map((tip, i) => (
                    <div key={i} className="flex gap-3 bg-[#090514]/30 border border-gray-950 p-4.5 rounded-2xl">
                      <span className="text-purple-400 text-base font-bold select-none">💡</span>
                      <p className="text-xs text-gray-400 leading-relaxed font-medium">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
