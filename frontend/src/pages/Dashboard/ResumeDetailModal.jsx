import React, { useEffect, useState } from 'react';
import {
  DocumentTextIcon, XMarkIcon, ExclamationTriangleIcon, ChatBubbleLeftRightIcon,
  CodeBracketIcon, ChartBarIcon, CheckCircleIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

// Same thresholds as the rest of the dashboard
function scoreTone(score) {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

const RISK_BADGE = { low: 'emerald', medium: 'amber', high: 'red' };

// Plain-language verdicts; the raw enum ("Reject") read as a judgment on the
// person rather than a prediction about one screen.
const VERDICTS = {
  pass: { label: 'Likely to pass screening', tone: 'text-emerald-400' },
  borderline: { label: 'Borderline at screening', tone: 'text-amber-400' },
  reject: { label: 'Likely filtered at screening', tone: 'text-red-400' },
};

const isBlank = (v) => !v || v === 'NA' || v === 'Unknown';

function Section({ icon: Icon, title, right, children }) {
  return (
    <section className="rounded-xl border border-line bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
          {Icon && <Icon className="h-4 w-4 text-ink-muted" />}
          {title}
        </h4>
        {right}
      </div>
      {children}
    </section>
  );
}

function Label({ children }) {
  return <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">{children}</p>;
}

function ScorePill({ score }) {
  return (
    <span className={`font-display text-sm font-semibold tabular-nums ${scoreTone(score)}`}>
      {score}<span className="text-ink-faint">/100</span>
    </span>
  );
}

export default function ResumeDetailModal({ modalItem, onClose }) {
  // Keep the last item so the exit animation still has content to render
  // after the parent clears `modalItem`.
  const [lastItem, setLastItem] = useState(modalItem);
  useEffect(() => {
    if (modalItem) setLastItem(modalItem);
  }, [modalItem]);

  // `modalItem` is already canonical — see utils/analysisSchema.js
  const data = modalItem || lastItem;
  const overallScore = data?.overallScore ?? 0;
  const verdict = VERDICTS[data?.recruiterScreening?.verdict?.toLowerCase()];
  const riskVariant = RISK_BADGE[data?.hiringRiskLevel?.toLowerCase()];
  const feedback = data?.recruiterScreening?.brutalFeedback || [];
  const redFlags = data?.recruiterScreening?.redFlags || [];
  const tech = data?.technicalDepth;
  const impact = data?.impactAndOwnership;

  return (
    <Modal
      open={Boolean(modalItem)}
      onClose={onClose}
      labelledBy="report-title"
      maxWidth="max-w-4xl"
      padded={false}
      zIndex="z-[100]"
      className="flex max-h-[90vh] flex-col overflow-hidden"
    >
      {data && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <DocumentTextIcon className="h-5 w-5 text-primary" />
              </span>
              <div className="min-w-0">
                <h3 id="report-title" className="truncate font-display text-lg font-semibold text-ink">
                  {data.contactInformation.name || 'Unnamed resume'}
                </h3>
                <p className="text-xs text-ink-faint">Resume report</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close report"
              className="rounded-lg border border-line p-2 text-ink-muted transition-colors hover:bg-white/[0.05] hover:text-ink"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="custom-scrollbar space-y-5 overflow-y-auto p-6">
            {/* Score + screening */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white/[0.02] p-6 text-center">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                  <ChartBarIcon className="h-4 w-4" /> Overall score
                </p>
                <p className={`font-display text-5xl font-semibold tabular-nums tracking-tight ${scoreTone(overallScore)}`}>
                  {overallScore}<span className="text-xl text-ink-faint">/100</span>
                </p>
              </div>

              <div className="rounded-xl border border-line bg-white/[0.02] p-6 md:col-span-2">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">Recruiter screen</p>
                  {riskVariant && <Badge variant={riskVariant}>{data.hiringRiskLevel} hiring risk</Badge>}
                </div>
                <p className={`font-display text-2xl font-semibold tracking-tight ${verdict?.tone || 'text-ink-muted'}`}>
                  {verdict?.label || 'No verdict available'}
                </p>
                {redFlags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {redFlags.map((flag) => (
                      <Badge key={flag} variant="red">
                        <ExclamationTriangleIcon className="h-3.5 w-3.5" /> {flag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recruiter feedback */}
            {feedback.length > 0 && (
              <Section icon={ChatBubbleLeftRightIcon} title="What a recruiter would flag">
                <ul className="space-y-2.5">
                  {feedback.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Technical depth */}
              {tech && (
                <Section icon={CodeBracketIcon} title="Technical depth" right={<ScorePill score={tech.score ?? 0} />}>
                  {!isBlank(tech.stackRelevance) && (
                    <div className="mb-4">
                      <Label>Stack relevance</Label>
                      <p className="text-sm leading-relaxed text-ink-muted">{tech.stackRelevance}</p>
                    </div>
                  )}
                  {tech.skillGaps?.length > 0 && (
                    <div className="mb-4">
                      <Label>Skill gaps</Label>
                      <div className="flex flex-wrap gap-2">
                        {tech.skillGaps.map((gap) => <Badge key={gap} variant="amber">{gap}</Badge>)}
                      </div>
                    </div>
                  )}
                  {tech.overusedBuzzwords?.length > 0 && (
                    <div>
                      <Label>Overused buzzwords</Label>
                      <div className="flex flex-wrap gap-2">
                        {tech.overusedBuzzwords.map((bw) => <Badge key={bw}>{bw}</Badge>)}
                      </div>
                    </div>
                  )}
                </Section>
              )}

              {/* Impact & ownership */}
              {impact && (
                <Section icon={CheckCircleIcon} title="Impact & ownership" right={<ScorePill score={impact.score ?? 0} />}>
                  {impact.missingMetrics?.length > 0 && (
                    <div className="mb-4">
                      <Label>Claims without numbers</Label>
                      <ul className="space-y-2">
                        {impact.missingMetrics.map((missing) => (
                          <li key={missing} className="rounded-lg border border-line bg-white/[0.02] p-2.5 text-sm text-ink-muted">
                            {missing}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {impact.recommendedMetricInjections?.length > 0 && (
                    <div>
                      <Label>Ways to add metrics</Label>
                      <ul className="space-y-2">
                        {impact.recommendedMetricInjections.map((rec) => (
                          <li key={rec} className="rounded-lg border border-primary/20 bg-primary/[0.06] p-3 text-sm leading-relaxed text-ink">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Section>
              )}
            </div>

            {/* Missing keywords */}
            {data.missingKeywords.length > 0 && (
              <Section icon={MagnifyingGlassIcon} title="Missing keywords">
                <div className="flex flex-wrap gap-2">
                  {data.missingKeywords.map((kw) => <Badge key={kw} variant="accent">+ {kw}</Badge>)}
                </div>
              </Section>
            )}

            {/* Extracted skills */}
            {(data.skills.technical.length > 0 || data.skills.soft.length > 0) && (
              <Section title="Skills found">
                <div className="flex flex-wrap gap-2">
                  {data.skills.technical.map((s) => <Badge key={`t-${s}`} variant="accent">{s}</Badge>)}
                  {data.skills.soft.map((s) => <Badge key={`s-${s}`}>{s}</Badge>)}
                </div>
              </Section>
            )}

            {/* Strengths */}
            {data.strengths.length > 0 && (
              <Section icon={CheckCircleIcon} title="Strengths">
                <ul className="space-y-2.5">
                  {data.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
