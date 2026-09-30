/**
 * Plain-language verdicts. The raw enum from the model ("Reject") reads as a
 * judgment on the person; these read as a prediction about one screen.
 */
const VERDICTS = {
  pass: { label: 'Likely to pass screening', short: 'Likely to pass', tone: 'good' },
  borderline: { label: 'Borderline at screening', short: 'Borderline', tone: 'warn' },
  reject: { label: 'Likely filtered at screening', short: 'Likely filtered', tone: 'bad' },
};

/** @returns {{label: string, short: string, tone: 'good'|'warn'|'bad'}|null} */
export const verdictFor = (analysis) =>
  VERDICTS[analysis?.recruiterScreening?.verdict?.toLowerCase()] || null;

const RISK_TONE = { low: 'good', medium: 'warn', high: 'bad' };

/** Badge variant for a hiring-risk level, or null when unknown. */
export const riskTone = (analysis) => RISK_TONE[analysis?.hiringRiskLevel?.toLowerCase()] || null;
