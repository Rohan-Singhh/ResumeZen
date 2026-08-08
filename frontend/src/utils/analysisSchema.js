/**
 * Canonical shape for a resume analysis.
 *
 * Records reach the dashboard from three places, and they do not agree:
 *   1. GET /api/resume/history        — current schema
 *   2. GET /api/resume/history        — records written before the schema
 *                                       migration, which nest everything under
 *                                       `analysis` (atsScore, strengths, ...)
 *   3. POST /api/resume/analyze-upload — the raw `structured` object, straight
 *                                       off the model, never persisted
 *
 * Every component reads through `normalizeAnalysis` so none of them has to know
 * which of the three it was handed.
 */

const asList = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);

const asScore = (v) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : null;

/** Treat the backend's "unknown" placeholders as empty. */
const isBlank = (v) =>
  v == null || v === '' || v === 'NA' || v === 'null' || v === 'Unknown';

const asText = (v, fallback = '') => (isBlank(v) ? fallback : String(v).trim());

/**
 * @param {Object|null} record - A history record or a raw structured response
 * @returns {Object|null} - Canonical analysis, or null when there is nothing
 */
export function normalizeAnalysis(record) {
  if (!record) return null;

  // A history record wraps the payload; a raw structured response is the payload.
  const src = record.analysis?.structured || record;
  const legacy = (src.analysis && typeof src.analysis === 'object') ? src.analysis : {};

  const atsScore = asScore(src.atsOptimization?.score) ?? asScore(legacy.atsScore);
  const overallScore = asScore(src.overallScore) ?? atsScore;

  // The old schema had a single `areasForImprovement` list. The new one splits
  // the same idea across three fields, so recombine for the insights panel.
  const issues = [
    ...asList(src.recruiterScreening?.brutalFeedback),
    ...asList(src.recruiterScreening?.redFlags),
    ...asList(src.atsOptimization?.formattingIssues)
  ];

  return {
    id: record._id || null,
    createdAt: record.createdAt || null,
    resumeUrl: record.resumeUrl || null,

    contactInformation: {
      name: asText(src.contactInformation?.name),
      email: asText(src.contactInformation?.email),
      phone: asText(src.contactInformation?.phone),
      location: asText(src.contactInformation?.location),
      linkedin: asText(src.contactInformation?.linkedin)
    },
    summary: asText(src.summary),
    skills: {
      technical: asList(src.skills?.technical),
      soft: asList(src.skills?.soft)
    },
    workExperience: asList(src.workExperience),
    education: asList(src.education),
    certifications: asList(src.certifications),

    overallScore,
    atsScore,
    hiringRiskLevel: asText(src.hiringRiskLevel, 'Unknown'),
    strengths: asList(src.strengths).length
      ? asList(src.strengths)
      : asList(legacy.strengths),
    issues: issues.length ? issues : asList(legacy.areasForImprovement),
    missingKeywords: asList(src.atsOptimization?.missingKeywords).length
      ? asList(src.atsOptimization?.missingKeywords)
      : asList(legacy.missingKeywords || legacy.keywords),

    recruiterScreening: src.recruiterScreening || null,
    atsOptimization: src.atsOptimization || null,
    technicalDepth: src.technicalDepth || null,
    impactAndOwnership: src.impactAndOwnership || null
  };
}

/** Total skills across both buckets. */
export const skillCount = (a) =>
  (a?.skills.technical.length || 0) + (a?.skills.soft.length || 0);
