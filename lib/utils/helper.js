import { extractJsonBlock } from "./cleanCodeBlock";

export async function deriveStatus(duration, current_duration, callTime) {
  console.log("duration, current_duration, callTime:::", duration, current_duration, callTime);

  const totalDuration = Number(duration);
  const usedDuration = Number(current_duration);
  const liveCallTime = Number(callTime);

  if (isNaN(totalDuration) || isNaN(usedDuration) || isNaN(liveCallTime)) {
    return 'in-progress';
  }

  return Math.floor(usedDuration + liveCallTime) >= Math.floor(totalDuration)
    ? 'completed'
    : 'in-progress';
}

export function parseGeneratedReport(rawData) {
  try {
    let jsonString = extractJsonBlock(rawData);

    // Extra hardening: remove zero-width and non-printable chars that can break JSON.parse
    jsonString = jsonString
      .replace(/[\u200B-\u200D\uFEFF\u2060\u00A0]/g, '') // zero-width + NBSP
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");

    // If parse fails due to trailing non-JSON text, trim to the last closing brace/bracket
    try {
      return JSON.parse(jsonString);
    } catch (_) {
      const lastObj = jsonString.lastIndexOf('}');
      const lastArr = jsonString.lastIndexOf(']');
      const lastEnd = Math.max(lastObj, lastArr);
      if (lastEnd !== -1) {
        const firstObj = jsonString.indexOf('{');
        const firstArr = jsonString.indexOf('[');
        const firstStart = firstObj === -1 ? firstArr : (firstArr === -1 ? firstObj : Math.min(firstObj, firstArr));
        if (firstStart !== -1 && lastEnd > firstStart) {
          const sliced = jsonString.slice(firstStart, lastEnd + 1).trim();
          return JSON.parse(sliced);
        }
      }
      // Re-throw to outer catch if still failing
      throw _;
    }
  } catch (err) {
    console.error("❌ Failed to parse JSON block from report data:", err);
    return null;
  }
}

export function extractScoreAndRecommendation(result) {
  const scoreRaw = result?.final_verdict?.score;
  const recommendationRaw = result?.final_verdict?.recommendation;

  // Primary: use final_verdict.score
  let numericScore = Number(scoreRaw);

  // Fallback A: compute from Skill_Evaluation ratings (avg 1-5 -> 0-100)
  if (!Number.isFinite(numericScore)) {
    try {
      const skills = result?.Skill_Evaluation || result?.skill_evaluation || {};
      const ratings = Object.values(skills)
        .map((s) => (s && typeof s.rating !== 'undefined' ? Number(s.rating) : NaN))
        .filter((n) => Number.isFinite(n));
      if (ratings.length > 0) {
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        numericScore = Math.round((avg / 5) * 100);
      }
    } catch (_) {
      // ignore
    }
  }

  // Fallback B: default to 0
  if (!Number.isFinite(numericScore)) {
    numericScore = 0;
  }

  // Clamp 0-100
  numericScore = Math.max(0, Math.min(100, numericScore));

  // Recommendation: prefer explicit YES/NO; else derive from score
  let recommendationBool = false;
  if (typeof recommendationRaw === 'string') {
    const s = recommendationRaw.toLowerCase();
    recommendationBool = s === 'yes' || s.includes('recommend');
  } else if (typeof recommendationRaw === 'boolean') {
    recommendationBool = recommendationRaw;
  } else {
    recommendationBool = numericScore >= 70;
  }

  return { score: numericScore, recommendation: recommendationBool };
}

export function flattenCommaArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return '';
  }

  return arr
    .flatMap(item => typeof item === 'string' ? item.split(',') : []) // only process strings
    .map(s => s.trim())
    .filter(Boolean) // remove empty strings
    .filter((val, i, self) => self.indexOf(val) === i) // remove duplicates
    .join(', ');
};

export function calculatePerformance(overallScore){
  if(overallScore <= 4){
    return {
      tag: 'Poor',
      status: false,
      color: 'bg-red-400'
    }
  }
  if(overallScore > 4 && overallScore <= 6){
    return {
      tag: 'Average',
      status: false,
      color: 'bg-red-400'
    }
  }
  if(overallScore > 6 && overallScore <= 8){
    return {
      tag: 'Good',
      status: true,
      color: 'bg-teal-400'
    }
  }
  if(overallScore > 8 && overallScore <= 10){
    return {
      tag: 'Excellent',
      status: true,
      color: 'bg-teal-400'
    }
  }
}

export function formatDate(date){
  const startedAt = "2025-05-22T14:42:41.05+00:00";
  const formattedDate = new Date(date).toLocaleString("en-US", {
    dateStyle: "medium", // e.g. "May 22, 2025"
    timeStyle: "short",  // e.g. "2:42 PM"
  });
  return formattedDate
}