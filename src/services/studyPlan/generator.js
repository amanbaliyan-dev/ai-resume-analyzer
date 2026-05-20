export async function generateStudyPlan(radarScores, targetRole, targetCompany, weeksAvailable) {
  const weakDomains = Object.entries(radarScores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([domain, score]) => ({ domain, score }));

  const strongDomains = Object.entries(radarScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([domain, score]) => ({ domain, score }));

  const prompt = `
You are a senior engineering interview coach. Generate a personalized ${weeksAvailable}-week study plan.

Candidate profile:
- Target role: ${targetRole}
- Target company: ${targetCompany || 'a top tech company'}
- Radar scores (0-100): ${JSON.stringify(radarScores)}
- Weakest areas: ${weakDomains.map(d => `${d.domain} (${d.score}/100)`).join(', ')}
- Strongest areas: ${strongDomains.map(d => `${d.domain} (${d.score}/100)`).join(', ')}

Generate a study plan as a JSON object with this exact structure:
{
  "title": "<plan title>",
  "summary": "<2 sentence personalized overview>",
  "focusAreas": ["<area1>", "<area2>", "<area3>"],
  "weeks": [
    {
      "week": 1,
      "theme": "<week theme>",
      "goal": "<specific measurable goal>",
      "days": [
        {
          "day": "Mon",
          "topic": "<topic>",
          "type": "dsa|systemDesign|behavioural|react|mockInterview|rest",
          "tasks": ["<task1>", "<task2>", "<task3>"],
          "duration": "<e.g. 1.5 hrs>",
          "apexPrepAction": "<specific action in ApexPrep e.g. 'Run DSA mock on Trees'>"
        }
      ]
    }
  ],
  "milestones": [
    { "week": 1, "title": "<milestone>", "metric": "<how to measure>" }
  ],
  "dailyTimeCommitment": "<e.g. 1-2 hours>",
  "tips": ["<tip1>", "<tip2>", "<tip3>"]
}

Rules:
- Heavily weight weak domains in early weeks
- Include 1 full mock interview day per week from week 2 onwards
- Add rest days on Sundays
- Make ApexPrep actions specific to the platform features
- Return ONLY the JSON, no markdown fences, no preamble. Ensure all JSON tags are closed.
  `.trim();

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'AI Resume Analyzer',
    },
    body: JSON.stringify({
      model: 'google/gemini-flash-1.5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter returned status ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();

  try {
    return JSON.parse(raw);
  } catch {
    // Strip any accidental markdown fences if model misbehaves
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  }
}

// Persist to localStorage
export function saveStudyPlan(plan) {
  const entry = { plan, createdAt: Date.now(), completedTasks: {} };
  localStorage.setItem('apexprep_studyplan', JSON.stringify(entry));
  return entry;
}

export function loadStudyPlan() {
  const raw = localStorage.getItem('apexprep_studyplan');
  return raw ? JSON.parse(raw) : null;
}

export function markTaskComplete(weekIndex, dayIndex, taskIndex, completed) {
  const raw = localStorage.getItem('apexprep_studyplan');
  if (!raw) return;
  const entry = JSON.parse(raw);
  const key = `${weekIndex}-${dayIndex}-${taskIndex}`;
  entry.completedTasks[key] = completed;
  localStorage.setItem('apexprep_studyplan', JSON.stringify(entry));
  return entry;
}

export function getCompletionStats(plan, completedTasks) {
  let total = 0, done = 0;
  plan.weeks.forEach((week, wi) => {
    week.days.forEach((day, di) => {
      day.tasks.forEach((_, ti) => {
        total++;
        if (completedTasks[`${wi}-${di}-${ti}`]) done++;
      });
    });
  });
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}
