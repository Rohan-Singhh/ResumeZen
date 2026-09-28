import React, { useState, useEffect, useRef } from 'react';
import { analyzeUploadResume } from '../../services/resumeService';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircleIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

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

  const title = loading ? 'Analyzing your resume' : error ? "Analysis didn't finish" : 'Your report is ready';

  return (
    <Modal open={open} onClose={onClose} labelledBy="analysis-modal-title" zIndex="z-[60]">
      {loading ? (
        <div>
          <div className="mb-6 flex items-center gap-4">
            <div className="relative h-14 w-14 flex-shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
                <circle cx="28" cy="28" r="24" fill="none" strokeWidth="4" className="stroke-white/[0.06]" />
                <circle
                  cx="28" cy="28" r="24" fill="none" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${progress * 1.508} 151`}
                  className="stroke-primary transition-[stroke-dasharray] duration-300 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-xs font-semibold tabular-nums text-ink">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="min-w-0">
              <h3 id="analysis-modal-title" className="font-display text-lg font-semibold text-ink">{title}</h3>
              <p className="truncate text-sm text-ink-muted" aria-live="polite">{STEPS[currentStep].label}…</p>
            </div>
          </div>

          <ol className="mb-6 space-y-1">
            {STEPS.map((step, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;
              return (
                <li key={step.label} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
                  <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                    isDone ? 'border-primary/30 bg-primary/15' : isActive ? 'border-primary' : 'border-line'
                  }`}>
                    {isDone && <CheckIcon className="h-3 w-3 text-primary" />}
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </span>
                  <span className={`text-sm ${isActive ? 'font-medium text-ink' : isDone ? 'text-ink-muted' : 'text-ink-faint'}`}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
            <p className="text-xs leading-relaxed text-ink-faint">
              Usually under a minute. You can close this — the report will appear in your activity when it's ready.
            </p>
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
              Run in background
            </Button>
          </div>
        </div>
      ) : error ? (
        <div className="text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
            <ExclamationCircleIcon className="h-6 w-6 text-red-400" />
          </span>
          <h3 id="analysis-modal-title" className="mb-2 font-display text-lg font-semibold text-ink">{title}</h3>
          <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-ink-muted">{error}</p>
          <Button variant="secondary" onClick={onClose} className="w-full">Close</Button>
        </div>
      ) : result ? (
        <div className="text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
            <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
          </span>
          <h3 id="analysis-modal-title" className="mb-2 font-display text-lg font-semibold text-ink">{title}</h3>
          <p className="mb-6 text-sm text-ink-muted">
            Your score, recruiter feedback and keyword gaps are ready to review.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">Close</Button>
            <Button onClick={() => onViewReport?.(result)} className="flex-1">View report</Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
