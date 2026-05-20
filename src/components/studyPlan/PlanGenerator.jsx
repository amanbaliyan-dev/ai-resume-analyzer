import { useState } from 'react';
import { generateStudyPlan, saveStudyPlan } from '../../services/studyPlan/generator';

const ROLES = [
  'Frontend Engineer',
  'Full Stack Engineer',
  'Backend Engineer',
  'Software Engineer',
  'Senior SWE',
  'Staff Engineer'
];
const WEEK_OPTIONS = [2, 4, 6, 8, 12];

export default function PlanGenerator({ radarScores, onPlanReady }) {
  const [role, setRole]       = useState('Software Engineer');
  const [company, setCompany] = useState('');
  const [weeks, setWeeks]     = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const plan  = await generateStudyPlan(radarScores, role, company, weeks);
      const entry = saveStudyPlan(plan);
      onPlanReady(entry);
    } catch (e) {
      console.error(e);
      setError('Failed to generate study plan. Please verify your OpenRouter API key and internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="bg-[#090514]/70 border border-gray-900 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
        {/* Neon Glow decoration */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/15 transition-all duration-700" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-500/10 transition-all duration-700" />

        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-white">
            Generate your <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">AI Study Plan</span>
          </h2>
          <p className="text-gray-400 text-sm">
            Curated weekly milestones built directly from your dynamic radar proficiency.
          </p>
        </div>

        <div className="space-y-6">
          {/* Target Role Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Target Role
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-[#03000a] border border-gray-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 text-white font-medium transition-all"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Target Company Input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Target Company <span className="text-gray-600 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Google, Atlassian, Stripe..."
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full bg-[#03000a] border border-gray-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 text-white placeholder-gray-600 font-medium transition-all"
            />
          </div>

          {/* Weeks Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Preparation Timeline
            </label>
            <div className="grid grid-cols-5 gap-2">
              {WEEK_OPTIONS.map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeeks(w)}
                  className={`py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 border cursor-pointer ${
                    weeks === w
                      ? 'bg-purple-500/10 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'bg-[#03000a] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  {w}w
                </button>
              ))}
            </div>
          </div>

          {/* Radar Preview */}
          <div className="bg-[#03000a]/85 border border-gray-950 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Analyzing Radar Skill Coordinates
            </p>
            <div className="space-y-3.5">
              {Object.entries(radarScores).map(([domain, score]) => (
                <div key={domain} className="flex items-center gap-4">
                  <span className="text-xs font-semibold w-28 text-gray-400 capitalize whitespace-nowrap">
                    {domain.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${score}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        score < 40 ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                        score < 65 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-300 w-8 text-right">
                    {score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 py-4.5 rounded-2xl font-extrabold text-lg transition-all shadow-[0_4px_30px_rgba(236,72,153,0.25)] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin" />
                <span>Assembling Study Milestones...</span>
              </>
            ) : (
              <span>Create Custom Plan  ↗</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
