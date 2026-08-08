import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { normalizeAnalysis } from '../../utils/analysisSchema';
import PlanModal from '../../components/PlanModal';
import DashboardCreditConfirmationPopup from './dashboardwelcome/DashboardCreditConfirmationPopup';
import ResumeAnalysisModal from './ResumeAnalysisModal';
import ResumeDetailModal from './ResumeDetailModal';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useResumeHistory } from '../../hooks/useResumeHistory';

// Overview sub-components
import HeroSection from './overview/HeroSection';
import KpiGrid from './overview/KpiGrid';
import AiInsightsPanel from './overview/AiInsightsPanel';
import ResumeHealthRadar from './overview/ResumeHealthRadar';
import AiActionCenter from './overview/AiActionCenter';
import ActivityTimeline from './overview/ActivityTimeline';
import UploadZone from './overview/UploadZone';

export default function DashboardWelcome() {
  const { currentUser, userPlans, fetchUserPlans, usePlanCredit } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);

  // Modal state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [showCreditConfirmation, setShowCreditConfirmation] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisFileDetails, setAnalysisFileDetails] = useState(null);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);

  // Data state
  const [activePlan, setActivePlan] = useState(null);
  const { data: history = [], isLoading: historyLoading } = useResumeHistory();

  // Plans are fetched by React Query in AuthContext; only cross-tab purchases
  // need an explicit refetch here.
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'planPurchased') fetchUserPlans();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserPlans]);

  useEffect(() => {
    if (userPlans?.length > 0) {
      const now = new Date();
      const valid = userPlans
        .filter(p => p.isActive && p.planId && (!p.expiresAt || new Date(p.expiresAt) > now) && (p.planId.isUnlimited || p.creditsLeft > 0))
        .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));
      setActivePlan(valid[0] || null);
    } else {
      setActivePlan(null);
    }
  }, [userPlans]);

  // Computed values
  const creditsText = activePlan
    ? activePlan.planId.isUnlimited ? '∞' : String(activePlan.creditsLeft)
    : '0';

  const hasCredits = activePlan && (activePlan.planId.isUnlimited || activePlan.creditsLeft > 0);

  // Derived analysis data. Normalize once here so every child receives the
  // canonical shape and none of them needs schema-version fallbacks.
  const analyses = useMemo(() => history.map(normalizeAnalysis), [history]);
  const latestAnalysis = analyses[0] || null;
  const previousAnalysis = analyses[1] || null;

  // File handlers
  // Must match MAX_UPLOAD_BYTES in backend/routes/resumeRoutes.js — the two
  // previously disagreed (1MB here, 10MB there).
  const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

  const validateFile = (file) => {
    if (file.size > MAX_UPLOAD_BYTES) { setFileSizeError(true); return false; }
    return true;
  };

  const handleFileSelect = (file) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
    setUploadSuccess(false);
    setErrorMessage('');
    if (!activePlan || !hasCredits) { 
      navigate('/dashboard/plans');
      return; 
    }
    setShowCreditConfirmation(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleUpload = async () => {
    // Deprecated: We now use the unified analyze-upload in the modal
    handleProceed();
  };

  const confirmCreditUsage = () => { 
    setShowCreditConfirmation(false); 
    // Start the unified process immediately after confirmation
    if (selectedFile) {
      setAnalysisFileDetails({ rawFile: selectedFile, name: selectedFile.name });
      setShowAnalysisModal(true);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProceed = () => {
    if (!selectedFile) { if (fileInputRef.current) fileInputRef.current.click(); return; }
    setAnalysisFileDetails({ rawFile: selectedFile, name: selectedFile.name });
    setShowAnalysisModal(true);
    setSelectedFile(null);
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalysisClose = () => {
    setShowAnalysisModal(false);
    setAnalysisFileDetails(null);
    setSelectedFile(null);
    setUploadedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // ResumeAnalysisModal invalidates the resumeHistory query on success, so
    // there is no need to refetch history here.
  };

  const handleViewReport = (analysisResponse) => {
    setShowAnalysisModal(false);
    setAnalysisFileDetails(null);
    setSelectedFile(null);
    setUploadedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchUserPlans();

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
    // React Query automatically handles refetching the history
  };

  const handleViewReportFromInsights = () => {
    if (latestAnalysis) setSelectedResume(latestAnalysis);
  };

  // ─── RENDER ──────────────────────────────────────────────
  return (
    <div className="space-y-5 relative z-10">

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
            setSelectedFile={setSelectedFile}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            uploadStep={uploadStep}
            uploadSuccess={uploadSuccess}
            uploadedFile={uploadedFile}
            errorMessage={errorMessage}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            hasCredits={hasCredits}
            isProcessing={isProcessing}
            fileSizeError={fileSizeError}
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
            onProceed={handleProceed}
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
      <div className="grid grid-cols-1 gap-5">
        <AiActionCenter latestAnalysis={latestAnalysis} />
      </div>

      {/* 6. Plan Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {activePlan ? (
          <div className="bg-[#0d0d12]/80 backdrop-blur-md border border-white/[0.06] rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group">
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-violet-500/[0.06] rounded-full blur-2xl group-hover:bg-violet-500/[0.1] transition-colors" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 p-[1px] flex-shrink-0">
                <div className="w-full h-full bg-[#0d0d12] rounded-[10px] flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-violet-400" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-100 font-display">{activePlan.planId.name}</p>
                <p className="text-xs text-zinc-500">
                  {activePlan.planId.isUnlimited ? 'Unlimited checks available' : `${activePlan.creditsLeft} of ${activePlan.planId.credits} checks remaining`}
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/dashboard/plans')} className="text-xs font-semibold text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] px-4 py-2 rounded-lg transition-colors whitespace-nowrap relative z-10">
              Manage Plan
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-violet-600/15 to-fuchsia-600/15 backdrop-blur-md border border-violet-500/25 rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white font-display">No Active Plan</p>
              <p className="text-xs text-violet-200/70">Select a plan to start analyzing your resumes.</p>
            </div>
            <button onClick={() => navigate('/dashboard/plans')} className="bg-white text-violet-900 hover:bg-zinc-100 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors">
              View Pricing
            </button>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <PlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
      <DashboardCreditConfirmationPopup show={showCreditConfirmation} onClose={() => setShowCreditConfirmation(false)} onConfirm={confirmCreditUsage} activePlan={activePlan} />
      <ResumeAnalysisModal fileDetails={analysisFileDetails} open={showAnalysisModal} onClose={handleAnalysisClose} onViewReport={handleViewReport} />
      <ResumeDetailModal modalItem={selectedResume} onClose={() => setSelectedResume(null)} />
    </div>
  );
}