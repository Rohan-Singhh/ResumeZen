import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { normalizeAnalysis } from '../../utils/analysisSchema';
import DashboardCreditConfirmationPopup from './dashboardwelcome/DashboardCreditConfirmationPopup';
import DashboardNoCreditPopup from './dashboardwelcome/DashboardNoCreditPopup';
import ResumeAnalysisModal from './ResumeAnalysisModal';
import ResumeDetailModal from './ResumeDetailModal';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useResumeHistory } from '../../hooks/useResumeHistory';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Overview sub-components
import HeroSection from './overview/HeroSection';
import KpiGrid from './overview/KpiGrid';
import AiInsightsPanel from './overview/AiInsightsPanel';
import ResumeHealthRadar from './overview/ResumeHealthRadar';
import AiActionCenter from './overview/AiActionCenter';
import ActivityTimeline from './overview/ActivityTimeline';
import UploadZone from './overview/UploadZone';

// Must match MAX_UPLOAD_BYTES in backend/routes/resumeRoutes.js — the two
// previously disagreed (1MB here, 10MB there).
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// The picker's accept=".pdf" does not apply to drag-and-drop, so check the
// type here too. Returns a user-facing message, or null when the file is OK.
const validateFile = (file) => {
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (!isPdf) return 'Only PDF files are supported. Export your resume as a PDF and try again.';
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `This file is ${mb}MB. The limit is 5MB — try compressing the PDF or removing images.`;
  }
  return null;
};

export default function DashboardWelcome() {
  const { currentUser, userPlans, fetchUserPlans } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modal state
  const [showCreditConfirmation, setShowCreditConfirmation] = useState(false);
  const [showNoCreditPopup, setShowNoCreditPopup] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisFileDetails, setAnalysisFileDetails] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);

  const { data: history = [] } = useResumeHistory();

  // Plans are fetched by React Query in AuthContext; only cross-tab purchases
  // need an explicit refetch here.
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'planPurchased') fetchUserPlans();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserPlans]);

  // Newest plan that is active, unexpired, and still has credits
  const activePlan = useMemo(() => {
    const now = new Date();
    return (userPlans || [])
      .filter(p => p.isActive && p.planId && (!p.expiresAt || new Date(p.expiresAt) > now) && (p.planId.isUnlimited || p.creditsLeft > 0))
      .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt))[0] || null;
  }, [userPlans]);

  const creditsText = activePlan
    ? activePlan.planId.isUnlimited ? '∞' : String(activePlan.creditsLeft)
    : '0';

  const hasCredits = Boolean(activePlan && (activePlan.planId.isUnlimited || activePlan.creditsLeft > 0));

  // Derived analysis data. Normalize once here so every child receives the
  // canonical shape and none of them needs schema-version fallbacks.
  const analyses = useMemo(() => history.map(normalizeAnalysis), [history]);
  const latestAnalysis = analyses[0] || null;
  const previousAnalysis = analyses[1] || null;

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── File handlers ───────────────────────────────────────

  const handleFileSelect = (file) => {
    const problem = validateFile(file);
    if (problem) {
      setErrorMessage(problem);
      resetFileInput();
      return;
    }
    setErrorMessage('');
    // Explain the missing plan instead of silently jumping to /plans
    if (!hasCredits) {
      setShowNoCreditPopup(true);
      resetFileInput();
      return;
    }
    setSelectedFile(file);
    setShowCreditConfirmation(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  // "Analyze this resume" on an already-selected file (e.g. after cancelling the
  // confirmation). It used to open the analysis modal directly, which skipped
  // the credit confirmation entirely.
  const handleAnalyzeSelected = () => {
    if (!hasCredits) { setShowNoCreditPopup(true); return; }
    setShowCreditConfirmation(true);
  };

  const confirmCreditUsage = () => {
    setShowCreditConfirmation(false);
    if (!selectedFile) return;
    setAnalysisFileDetails({ rawFile: selectedFile, name: selectedFile.name });
    setShowAnalysisModal(true);
    setSelectedFile(null);
    resetFileInput();
  };

  const closeAnalysis = () => {
    setShowAnalysisModal(false);
    setAnalysisFileDetails(null);
    resetFileInput();
    // A credit was either spent or refunded — keep the counter honest either way.
    // ResumeAnalysisModal invalidates the history query itself on success.
    fetchUserPlans();
  };

  const handleViewReport = (analysisResponse) => {
    closeAnalysis();

    // The freshly analyzed result is not in the history cache yet, so normalize
    // the raw structured payload and show it directly.
    const structured = analysisResponse?.data?.analysis?.structured;
    if (structured) {
      setSelectedResume({
        ...normalizeAnalysis(structured),
        id: analysisResponse?.resumeAnalysisId || 'temp',
        createdAt: new Date().toISOString()
      });
    }
  };

  const handleViewReportFromInsights = () => {
    if (latestAnalysis) setSelectedResume(latestAnalysis);
  };

  // ─── RENDER ──────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* 1. Top Section: Hero + Upload Zone */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <HeroSection
            currentUser={currentUser}
            latestAnalysis={latestAnalysis}
            previousAnalysis={previousAnalysis}
          />
        </div>
        <div className="flex flex-col">
          <UploadZone
            selectedFile={selectedFile}
            onClearFile={() => { setSelectedFile(null); resetFileInput(); }}
            errorMessage={errorMessage}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            onFileSelect={handleFileSelect}
            onAnalyze={handleAnalyzeSelected}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
          />
        </div>
      </div>

      {/* 2. KPI Grid */}
      <KpiGrid
        latestAnalysis={latestAnalysis}
        previousAnalysis={previousAnalysis}
        historyCount={history.length}
        creditsText={creditsText}
      />

      {/* 3. Two-column: AI Insights + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AiInsightsPanel
            latestAnalysis={latestAnalysis}
            onViewReport={handleViewReportFromInsights}
          />
        </div>
        <div>
          <ActivityTimeline
            history={analyses}
            onSelectResume={setSelectedResume}
          />
        </div>
      </div>

      {/* 4. Resume Health */}
      <ResumeHealthRadar latestAnalysis={latestAnalysis} />

      {/* 5. Action Center */}
      <AiActionCenter latestAnalysis={latestAnalysis} />

      {/* 6. Plan Banner */}
      {activePlan ? (
        <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <SparklesIcon className="h-5 w-5 text-primary" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-ink">{activePlan.planId.name}</p>
              <p className="text-xs text-ink-muted">
                {activePlan.planId.isUnlimited ? 'Unlimited checks available' : `${activePlan.creditsLeft} of ${activePlan.planId.credits} checks remaining`}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard/plans')} className="whitespace-nowrap">
            Manage plan
          </Button>
        </Card>
      ) : (
        <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-primary/25">
          <div>
            <p className="font-display text-sm font-semibold text-ink">No active plan</p>
            <p className="text-xs text-ink-muted">Select a plan to start analyzing your resumes.</p>
          </div>
          <Button size="sm" onClick={() => navigate('/dashboard/plans')} className="whitespace-nowrap">
            View plans
          </Button>
        </Card>
      )}

      {/* Modals */}
      <DashboardNoCreditPopup
        show={showNoCreditPopup}
        onClose={() => setShowNoCreditPopup(false)}
        onViewPlans={() => { setShowNoCreditPopup(false); navigate('/dashboard/plans'); }}
        activePlan={activePlan}
      />
      <DashboardCreditConfirmationPopup
        show={showCreditConfirmation}
        onClose={() => setShowCreditConfirmation(false)}
        onConfirm={confirmCreditUsage}
        activePlan={activePlan}
      />
      <ResumeAnalysisModal
        fileDetails={analysisFileDetails}
        open={showAnalysisModal}
        onClose={closeAnalysis}
        onViewReport={handleViewReport}
      />
      <ResumeDetailModal modalItem={selectedResume} onClose={() => setSelectedResume(null)} />
    </div>
  );
}
