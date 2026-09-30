import React, { useState, useEffect, useRef } from 'react';
import { analyzeUploadResume } from '../../services/resumeService';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Modal, { ModalHeader } from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Enso from '../../components/graphics/Enso';
import Seal from '../../components/graphics/Seal';
import { normalizeAnalysis } from '../../utils/analysisSchema';
import { verdictFor } from '../../components/report/verdict';
import { ease } from '../../utils/motion';

// Rough stage timings. The request is a single call, so these are estimates
// that keep the wait legible, not live server progress.
const STEPS = [
  { label: 'Uploading resume', at: 0 },
  { label: 'Reading text from PDF', at: 1500 },
  { label: 'Analyzing with AI', at: 3500 },
  { label: 'Scoring ATS match', at: 6000 },
  { label: 'Writing your report', at: 8000 },
];

/** Turn an analyze-upload failure into something a user can act on. */
function describeError(err) {
  if (!err?.response) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  const { status, data } = err.response;
  if (status === 403) return "You don't have any credits left. Choose a plan to keep analyzing.";
  if (status === 429) return 'Too many requests right now. Please wait a minute and try again.';
  if (status === 400) return data?.message || "This file couldn't be processed. Try a different PDF.";
  if (status === 422 && /read text/i.test(data?.message || '')) {
    return "We couldn't read any text from this PDF. If it's a scanned image, export a text-based PDF and try again. No credit was used.";
  }
  if (status === 422) return "The analysis couldn't be completed. No credit was used — please try again.";
  return 'Something went wrong on our side. No credit was used — please try again in a minute.';
}

export default function ResumeAnalysisModal({ fileDetails, open, onClose, onViewReport }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Each run gets an id. Closing the modal mid-analysis lets the request finish
  // in the background; a late response must not leak into the next run's UI.
  const runIdRef = useRef(0);

  // One request per file. StrictMode (dev) runs effects twice, which used to
  // send two uploads and spend two credits; re-runs now await the same promise.
  const requestRef = useRef({ file: null, promise: null });

  useEffect(() => {
    if (!open || !fileDetails) {
      runIdRef.current += 1;
      setLoading(false);
      setError(null);
      setResult(null);
      setProgress(0);
      setCurrentStep(0);
      return undefined;
    }

    const runId = ++runIdRef.current;
    const isCurrent = () => runId === runIdRef.current;

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setCurrentStep(0);

    // Ease toward 95%: bigger steps early, smaller as it fills
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 95 ? 95 : prev + Math.max(1, (95 - prev) * 0.08)));
    }, 350);
    const stepTimers = STEPS.slice(1).map((step, i) =>
      setTimeout(() => setCurrentStep(i + 1), step.at)
    );
    const stopTimers = () => {
      clearInterval(progressInterval);
      stepTimers.forEach(clearTimeout);
    };

    (async () => {
      try {
        // No model override — the backend's DEFAULT_MODEL (aiAnalysisService.js)
        // is the single source of truth for which model to use.
        if (requestRef.current.file !== fileDetails) {
          requestRef.current = { file: fileDetails, promise: analyzeUploadResume(fileDetails.rawFile) };
        }
        const res = await requestRef.current.promise;

        // Refresh history and credits whether or not the modal is still open,
        // so a run left in the background still shows up on the dashboard.
        queryClient.invalidateQueries({ queryKey: ['resumeHistory'] });
        queryClient.invalidateQueries({ queryKey: ['userPlans'] });

        if (!isCurrent()) return;
        if (res?.success && res?.data?.analysis?.structured) {
          setProgress(100);
          setCurrentStep(STEPS.length - 1);
          setResult(res);
        } else {
          setError(res?.message || 'The analysis could not be completed. Please try again.');
        }
      } catch (err) {
        queryClient.invalidateQueries({ queryKey: ['userPlans'] });
        if (isCurrent()) setError(describeError(err));
      } finally {
        stopTimers();
        if (isCurrent()) setLoading(false);
      }
    })();

    return stopTimers;
  }, [open, fileDetails, queryClient]);

  // The finished report, read the same way the rest of the dashboard reads it
  const analysis = result ? normalizeAnalysis(result.data.analysis.structured) : null;
  const verdict = verdictFor(analysis);

  return (
    <Modal open={open} onClose={onClose} labelledBy="analysis-modal-title" zIndex="z-[60]">
      {loading ? (
        <div className="pt-2 sm:pt-0">
          <div className="flex items-center gap-5">
            {/* The circle fills as the read progresses */}
            <Enso value={progress} size={76} tone="paper" weight={7} animated={false}>
              <span className="t-meta text-ink">{Math.round(progress)}%</span>
            </Enso>
            <div className="min-w-0">
              <h3 id="analysis-modal-title" className="t-h3">Reading your resume</h3>
              <p className="mt-1 truncate text-sm text-ink-muted">{fileDetails?.name}</p>
            </div>
          </div>

          <ol className="my-6 space-y-0.5 border-y border-line py-4" aria-live="polite">
            {STEPS.map((step, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;
              return (
                <li key={step.label} className="flex items-center gap-3 py-1.5">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    {isDone ? (
                      <motion.span
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.25, ease: ease.out }}
                        className="flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-full bg-good text-surface"
                      >
                        <CheckIcon className="h-3 w-3" />
                      </motion.span>
                    ) : isActive ? (
                      <Spinner size={16} className="text-ink" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-ink/20" />
                    )}
                  </span>
                  <span className={`text-sm ${isActive ? 'font-medium text-ink' : isDone ? 'text-ink-muted' : 'text-ink-faint'}`}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.8125rem] leading-relaxed text-ink-faint">
              Usually under a minute. You can close this; the report will appear on your overview.
            </p>
            <Button variant="secondary" size="sm" onClick={onClose} className="flex-shrink-0">
              Run in background
            </Button>
          </div>
        </div>
      ) : error ? (
        <div>
          <ModalHeader id="analysis-modal-title" icon={ExclamationCircleIcon} tone="bad" onClose={onClose}>
            The analysis didn&apos;t finish
          </ModalHeader>
          <p className="t-body mb-6">{error}</p>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">Close</Button>
          </div>
        </div>
      ) : analysis ? (
        <div className="pt-2 text-center sm:pt-0">
          <p className="t-label">Report ready</p>
          <Enso value={analysis.overallScore} size={132} className="mx-auto mt-5" />
          {verdict && (
            <div className="mt-5">
              <Seal tone={verdict.tone} animated delay={1.1} tilt={-4}>{verdict.short}</Seal>
            </div>
          )}
          <h3 id="analysis-modal-title" className="t-h3 mt-5">
            {analysis.issues.length > 0
              ? `${analysis.issues.length} ${analysis.issues.length === 1 ? 'thing' : 'things'} worth fixing`
              : 'Nothing flagged'}
          </h3>
          <p className="t-body mx-auto mt-1.5 max-w-xs">
            Your score, the recruiter&apos;s notes and the keywords you&apos;re missing are ready to read.
          </p>
          <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row">
            <Button variant="ghost" onClick={onClose} className="flex-1">Later</Button>
            <Button onClick={() => onViewReport?.(result)} className="flex-1">Read the report</Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
