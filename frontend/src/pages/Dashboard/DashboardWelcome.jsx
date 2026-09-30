import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { normalizeAnalysis } from '../../utils/analysisSchema';
import DashboardCreditConfirmationPopup from './dashboardwelcome/DashboardCreditConfirmationPopup';
import DashboardNoCreditPopup from './dashboardwelcome/DashboardNoCreditPopup';
import ResumeAnalysisModal from './ResumeAnalysisModal';
import ResumeDetailModal from './ResumeDetailModal';
import { useResumeHistory } from '../../hooks/useResumeHistory';
import { useCredits } from '../../hooks/useCredits';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';

// Overview sub-components
import LatestReport from './overview/LatestReport';
import FirstRun from './overview/FirstRun';
import OverviewSkeleton from './overview/OverviewSkeleton';
import StatStrip from './overview/StatStrip';
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

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardWelcome() {
  const { currentUser, fetchUserPlans } = useAuth();
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

  // isPending (not isLoading): the query is disabled until the backend session
  // exists, and that wait should show the skeleton too, not the first-run card.
  const { data: history = [], isPending: historyPending } = useResumeHistory();

  // Plans are fetched by React Query in AuthContext; only cross-tab purchases
  // need an explicit refetch here.
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'planPurchased') fetchUserPlans();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserPlans]);

  const { activePlan, hasCredits } = useCredits();

  // Derived analysis data. Normalize once here so every child receives the
  // canonical shape and none of them needs schema-version fallbacks.
  const analyses = useMemo(() => history.map(normalizeAnalysis), [history]);
  const latestAnalysis = analyses[0] || null;

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

  const openLatestReport = () => {
    if (latestAnalysis) setSelectedResume(latestAnalysis);
  };

  // ─── RENDER ──────────────────────────────────────────────
  const firstName = currentUser?.name?.split(' ')[0];
  const issueCount = latestAnalysis?.issues.length || 0;
  const description = historyPending
    ? null
    : !latestAnalysis
      ? 'Upload a resume to get your first report.'
      : issueCount > 0
        ? `Your latest resume has ${issueCount} ${issueCount === 1 ? 'thing' : 'things'} worth fixing before you send it.`
        : 'Your latest resume came back clean. Nothing flagged.';

  const upload = (
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
  );

  return (
    <div>
      <PageHeader
        eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        title={<>{greeting()}{firstName ? <>, <em className="t-em">{firstName}.</em></> : '.'}</>}
        description={description}
      />

      {/* No credits: say so up front, where the upload would otherwise fail */}
      {!historyPending && !hasCredits && (
        <div className="mb-5 flex flex-col gap-3 rounded-lg border border-warn/25 bg-warn/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">You need credits to run an analysis</p>
            <p className="mt-0.5 text-[0.8125rem] text-ink-muted">Each analysis uses one credit. Pick a plan and you can upload right away.</p>
          </div>
          <Button size="sm" onClick={() => navigate('/dashboard/plans')} className="flex-shrink-0 self-start sm:self-auto">
            See plans
          </Button>
        </div>
      )}

      {historyPending ? (
        <OverviewSkeleton />
      ) : !latestAnalysis ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <FirstRun />
          {upload}
        </div>
      ) : (
        <div className="space-y-5">
          {/* 1. The latest report, and the way to make the next one */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <LatestReport analyses={analyses} onOpen={openLatestReport} />
            {upload}
          </div>

          {/* 2. The counts behind it */}
          <StatStrip latestAnalysis={latestAnalysis} historyCount={history.length} />

          {/* 3. What to fix, and what you've uploaded */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <AiInsightsPanel latestAnalysis={latestAnalysis} onViewReport={openLatestReport} />
            <ActivityTimeline history={analyses} onSelectResume={setSelectedResume} />
          </div>

          {/* 4. Checklist and section breakdown */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <AiActionCenter latestAnalysis={latestAnalysis} />
            <ResumeHealthRadar latestAnalysis={latestAnalysis} />
          </div>
        </div>
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
