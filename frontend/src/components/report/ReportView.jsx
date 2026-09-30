import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import Enso, { TONE_TEXT, scoreTone } from '../graphics/Enso';
import Seal from '../graphics/Seal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';
import Meter from './Meter';
import { verdictFor, riskTone } from './verdict';

const isBlank = (v) => !v || v === 'NA' || v === 'Unknown';

function Section({ title, right, children }) {
  return (
    <section className="border-t border-line pt-6">
      <div className="mb-4 flex min-h-[1.75rem] items-center justify-between gap-3">
        <h4 className="t-label">{title}</h4>
        {right}
      </div>
      {children}
    </section>
  );
}

function SubLabel({ children }) {
  return <p className="mb-2 text-[0.8125rem] font-medium text-ink">{children}</p>;
}

// A red-pen line: something to change
function MarkList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
          <span aria-hidden="true" className="mt-[0.68em] h-[2px] w-3 flex-shrink-0 rounded-full bg-primary" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ScoreTag({ score }) {
  if (score == null) return null;
  return (
    <span className={`t-meta ${TONE_TEXT[scoreTone(score)]}`}>
      {score}<span className="text-ink-faint"> / 100</span>
    </span>
  );
}

/** Copies text and flips to a confirmed state for a moment. */
function CopyButton({ text, label = 'Copy', doneMessage = 'Copied' }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast(doneMessage);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("Couldn't copy. Select the text and copy it manually.", { tone: 'bad' });
    }
  };

  const Icon = copied ? ClipboardDocumentCheckIcon : ClipboardDocumentIcon;
  return (
    <Button variant="ghost" size="sm" onClick={copy} className="-mr-2">
      <Icon className={`h-4 w-4 ${copied ? 'text-good' : ''}`} />
      {copied ? 'Copied' : label}
    </Button>
  );
}

/**
 * ReportView — a full resume report. One component for the report dialog and
 * Studio, so the two can never drift apart.
 *
 * Props:
 *   data     — a canonical analysis (see utils/analysisSchema.js)
 *   animated — sweep the score and stamp the verdict on mount (default true)
 */
export default function ReportView({ data, animated = true }) {
  const verdict = verdictFor(data);
  const risk = riskTone(data);
  const feedback = data.recruiterScreening?.brutalFeedback || [];
  const redFlags = data.recruiterScreening?.redFlags || [];
  const tech = data.technicalDepth;
  const impact = data.impactAndOwnership;
  // Records from before the current schema only carry a flat issues list
  const legacyIssues = feedback.length === 0 ? data.issues : [];

  return (
    <div className="space-y-7">
      {/* Headline: the score, the verdict, the three parts of the score */}
      <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:gap-9">
        <Enso value={data.overallScore} size={148} animated={animated} className="mx-auto sm:mx-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            {verdict && (
              <Seal tone={verdict.tone} animated={animated} delay={0.75} tilt={-4}>
                {verdict.short}
              </Seal>
            )}
            {risk && <Badge variant={risk}>{data.hiringRiskLevel} hiring risk</Badge>}
          </div>
          <p className="t-h2 mt-4">
            {verdict?.label || (data.overallScore != null ? 'Your overall score' : 'No score available')}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Meter label="ATS match" value={data.atsScore} delay={0.2} />
            <Meter label="Technical depth" value={tech?.score ?? null} delay={0.28} />
            <Meter label="Impact & ownership" value={impact?.score ?? null} delay={0.36} />
          </div>
        </div>
      </div>

      {(feedback.length > 0 || redFlags.length > 0) && (
        <Section title="What a recruiter would flag">
          {feedback.length > 0 && <MarkList items={feedback} />}
          {redFlags.length > 0 && (
            <div className={`flex flex-wrap gap-2 ${feedback.length > 0 ? 'mt-5' : ''}`}>
              {redFlags.map((flag) => <Badge key={flag} variant="bad">{flag}</Badge>)}
            </div>
          )}
        </Section>
      )}

      {legacyIssues.length > 0 && (
        <Section title="Areas to improve">
          <MarkList items={legacyIssues} />
        </Section>
      )}

      {(tech || impact) && (
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-10">
          {tech && (
            <Section title="Technical depth" right={<ScoreTag score={tech.score ?? null} />}>
              <div className="space-y-5">
                {!isBlank(tech.stackRelevance) && (
                  <p className="text-sm leading-relaxed text-ink-muted">{tech.stackRelevance}</p>
                )}
                {tech.skillGaps?.length > 0 && (
                  <div>
                    <SubLabel>Skill gaps</SubLabel>
                    <div className="flex flex-wrap gap-2">
                      {tech.skillGaps.map((gap) => <Badge key={gap} variant="warn">{gap}</Badge>)}
                    </div>
                  </div>
                )}
                {tech.overusedBuzzwords?.length > 0 && (
                  <div>
                    <SubLabel>Overused words</SubLabel>
                    <div className="flex flex-wrap gap-2">
                      {tech.overusedBuzzwords.map((bw) => (
                        <Badge key={bw}><span className="line-through decoration-ink-faint">{bw}</span></Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {impact && (
            <Section title="Impact & ownership" right={<ScoreTag score={impact.score ?? null} />}>
              <div className="space-y-5">
                {impact.missingMetrics?.length > 0 && (
                  <div>
                    <SubLabel>Claims without numbers</SubLabel>
                    <MarkList items={impact.missingMetrics} />
                  </div>
                )}
                {impact.recommendedMetricInjections?.length > 0 && (
                  <div>
                    <SubLabel>Ways to add them</SubLabel>
                    <ul className="space-y-2">
                      {impact.recommendedMetricInjections.map((rec) => (
                        <li key={rec} className="rounded-md border border-line bg-surface-sunken px-3.5 py-3 text-sm leading-relaxed text-ink">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>
          )}
        </div>
      )}

      {data.missingKeywords.length > 0 && (
        <Section
          title="Missing keywords"
          right={<CopyButton text={data.missingKeywords.join(', ')} doneMessage="Keywords copied" />}
        >
          <div className="flex flex-wrap gap-2">
            {data.missingKeywords.map((kw) => <Badge key={kw} variant="accent">+ {kw}</Badge>)}
          </div>
        </Section>
      )}

      {(data.skills.technical.length > 0 || data.skills.soft.length > 0) && (
        <Section title="Skills found">
          <div className="flex flex-wrap gap-2">
            {data.skills.technical.map((s) => <Badge key={`t-${s}`} className="!text-ink">{s}</Badge>)}
            {data.skills.soft.map((s) => <Badge key={`s-${s}`}>{s}</Badge>)}
          </div>
        </Section>
      )}

      {data.strengths.length > 0 && (
        <Section title="Keep these">
          <ul className="space-y-3">
            {data.strengths.map((s) => (
              <li key={s} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-good" aria-hidden="true" />
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
