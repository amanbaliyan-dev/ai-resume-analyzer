const THRESHOLDS = {
  promoteAfter: 75,   // score above this → move up a level
  demoteAfter:  40,   // score below this → move down a level
  holdZone:     [40, 75], // stay at current level
};

export class DifficultyEngine {
  constructor(initialLevels) {
    // initialLevels comes from the user's radar chart scores
    // e.g. { dsa: 2, systemDesign: 1, behavioural: 3, react: 2 }
    this.levels = { ...initialLevels };
    this.sessionHistory = []; // { domain, score, level }
    this.consecutiveHighScores = {};
    this.consecutiveLowScores  = {};
  }

  // Call this after each answer is evaluated
  update(domain, answerScore) {
    const current = this.levels[domain] ?? 1;

    // Track streaks — don't promote/demote on a single fluke
    if (answerScore >= THRESHOLDS.promoteAfter) {
      this.consecutiveHighScores[domain] =
        (this.consecutiveHighScores[domain] || 0) + 1;
      this.consecutiveLowScores[domain] = 0;
    } else if (answerScore <= THRESHOLDS.demoteAfter) {
      this.consecutiveLowScores[domain] =
        (this.consecutiveLowScores[domain] || 0) + 1;
      this.consecutiveHighScores[domain] = 0;
    } else {
      this.consecutiveHighScores[domain] = 0;
      this.consecutiveLowScores[domain]  = 0;
    }

    // Record history
    this.sessionHistory.push({ domain, score: answerScore, level: current });

    // Require 2 consecutive good/bad answers before shifting level
    if (this.consecutiveHighScores[domain] >= 2 && current < 4) {
      this.levels[domain] = current + 1;
      this.consecutiveHighScores[domain] = 0;
      return { action: 'promoted', newLevel: current + 1, domain };
    }

    if (this.consecutiveLowScores[domain] >= 2 && current > 1) {
      this.levels[domain] = current - 1;
      this.consecutiveLowScores[domain] = 0;
      return { action: 'demoted', newLevel: current - 1, domain };
    }

    return { action: 'hold', newLevel: current, domain };
  }

  // Build the prompt context for the next question
  getNextQuestionContext(domain) {
    const level = this.levels[domain] ?? 1;
    const recentScores = this.sessionHistory
      .filter(h => h.domain === domain)
      .slice(-3)
      .map(h => h.score);

    return {
      domain,
      level,          // 1–4
      avgRecentScore: recentScores.length
        ? Math.round(recentScores.reduce((a, b) => a + b) / recentScores.length)
        : null,
      instruction: this._buildInstruction(domain, level),
    };
  }

  _buildInstruction(domain, level) {
    const descriptors = {
      1: 'foundational — test basic understanding and definitions only',
      2: 'intermediate — test application of core patterns, expect some working code',
      3: 'advanced — require deep technical reasoning and edge case handling',
      4: 'expert-level — probe for nuanced trade-offs, real-world failure modes, and optimization',
    };
    const domainLabel = domain === 'behavioural' ? 'behavioral' : domain;
    return `Ask a ${domainLabel} question at difficulty level ${level}/4: ${descriptors[level]}.`;
  }

  // Persist level state back to radar chart after session ends
  getSessionSummary() {
    return {
      finalLevels: { ...this.levels },
      history: this.sessionHistory,
      topDomain: Object.entries(this.levels)
        .sort(([, a], [, b]) => b - a)[0]?.[0],
      weakDomain: Object.entries(this.levels)
        .sort(([, a], [, b]) => a - b)[0]?.[0],
    };
  }
}

// Map radar scores (0–100) → difficulty levels (1–4)
export function radarToLevels(radarScores) {
  const toLevel = score => {
    if (score < 30) return 1;
    if (score < 55) return 2;
    if (score < 78) return 3;
    return 4;
  };
  return {
    dsa:          toLevel(radarScores.dsa          ?? 0),
    systemDesign: toLevel(radarScores.systemDesign ?? 0),
    behavioural:  toLevel(radarScores.behavioural  ?? 0),
    react:        toLevel(radarScores.react        ?? 0),
    apiDatabases: toLevel(radarScores.apiDatabases ?? 0),
  };
}

// After session — blend new performance into radar (don't replace, smooth it)
export function updateRadar(existingScores, sessionSummary) {
  const levelToScore = level => [0, 25, 50, 75, 100][level];
  const blend = (old, newVal) => Math.round(old * 0.6 + newVal * 0.4);

  const updated = { ...existingScores };
  Object.keys(updated).forEach(domain => {
    const newLevel = sessionSummary.finalLevels[domain];
    if (newLevel !== undefined) {
      updated[domain] = blend(updated[domain] ?? 40, levelToScore(newLevel));
    }
  });
  return updated;
}
