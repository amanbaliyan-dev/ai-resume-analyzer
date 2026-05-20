export async function generateNextQuestion(engine, domain, role, company, jd, conversationHistory = []) {
  const ctx = engine.getNextQuestionContext(domain);

  const systemPrompt = `
You are a senior ${domain === 'behavioural' ? 'behavioral' : domain === 'apiDatabases' ? 'API/Database' : domain} interviewer at ${company} conducting an interview for a ${role} position.
Job Description: "${jd}"

${ctx.instruction}
${ctx.avgRecentScore !== null
  ? `The candidate's recent average score in this domain is ${ctx.avgRecentScore}/100 — calibrate the difficulty accordingly.`
  : ''}

Ask exactly ONE single, targeted interview question. Do NOT include any preamble, conversational filler, or introductions. Output only the question text.
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
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter returned status ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export async function scoreAnswer(question, answer, domain) {
  const scoringPrompt = `
Score this candidate's response to the interview question from 0–100.

Question: ${question}
Answer: ${answer}
Domain: ${domain}

You must return ONLY a raw JSON object (do not wrap in markdown blocks or fences) with this exact structure:
{
  "score": <number between 0 and 100>,
  "feedback": "<one sentence concise summary of performance>",
  "missingConcepts": ["<key concept 1>", "<key concept 2>"]
}
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
      messages: [{ role: 'user', content: scoringPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter returned status ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  
  try {
    return JSON.parse(content);
  } catch {
    // Attempt cleaning markdown formatting
    try {
      const cleaned = content.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { score: 50, feedback: 'Could not parse JSON evaluation score.', missingConcepts: [] };
    }
  }
}
