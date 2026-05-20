export async function getBodyLanguageAudit(finalScores, openrouterKey) {
  const prompt = `
You are an expert executive presence & non-verbal communications coach. 
Analyze this candidate's body language data captured via high-precision computer vision during a mock technical interview:

- Eye contact level: ${finalScores.eyeContact}%
- Posture score (upright & centered): ${finalScores.posture}%
- Head stability (vs fidgeting/shaking): ${finalScores.headStability}%
- Smile/engagement level: ${finalScores.smileScore}%
- Natural hand gesture frequency: ${finalScores.gestureRate}%
- Overall Non-verbal Score: ${finalScores.overallScore}/100

Please provide exactly 3 highly specific, professional, and actionable coaching tips to improve their non-verbal presence. Focus on how their posture, eye-contact, or movement affects their perceived confidence and communication clarity. Be direct, constructive, and concise. Format as clean HTML paragraphs or bullet points without a header.
  `.trim();

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ApexPrep AI',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    return "Could not generate body language audit report at this time. Please check your network connection or API keys.";
  } catch (error) {
    console.error("Error generating body language audit:", error);
    return "An error occurred while compiling your non-verbal communication audit.";
  }
}
