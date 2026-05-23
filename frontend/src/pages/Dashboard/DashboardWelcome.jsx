import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as pdfUtils from '../../utils/pdfUtils';
import { getResumeHistory } from '../../services/resumeService';
import PlanModal from '../../components/PlanModal';
import DashboardCreditConfirmationPopup from './dashboardwelcome/DashboardCreditConfirmationPopup';
import DashboardNoCreditPopup from './dashboardwelcome/DashboardNoCreditPopup';
import ResumeAnalysisModal from './ResumeAnalysisModal';
import ResumeDetailModal from './ResumeDetailModal';
import sadRobotError from '../../assets/sad_robot_error.png';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  ChartBarIcon,
  SparklesIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  ServerIcon,
  BriefcaseIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

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
  const [uploadVibeIdx, setUploadVibeIdx] = useState(0);

  // Modal state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [showNoCreditPopup, setShowNoCreditPopup] = useState(false);
  const [showCreditConfirmation, setShowCreditConfirmation] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisFileDetails, setAnalysisFileDetails] = useState(null);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);

  // Data state
  const [activePlan, setActivePlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Fetch plans and history
  useEffect(() => { fetchUserPlans(true); }, [currentUser]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getResumeHistory();
        setHistory(data);
      } catch { /* silent */ } finally { setHistoryLoading(false); }
    };
    fetchHistory();
  }, [currentUser]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'planPurchased') fetchUserPlans(true);
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
  const avgScore = (() => {
    const scores = history.map(h => h.analysis?.atsScore).filter(s => typeof s === 'number');
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })();

  const creditsText = activePlan
    ? activePlan.planId.isUnlimited ? '∞' : String(activePlan.creditsLeft)
    : '0';

  const hasCredits = activePlan && (activePlan.planId.isUnlimited || activePlan.creditsLeft > 0);

  // File handlers
  const validateFile = (file) => {
    if (file.size > 1024 * 1024) { setFileSizeError(true); return false; }
    return true;
  };

  const handleFileSelect = (file) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
    setUploadSuccess(false);
    setErrorMessage('');
    if (!activePlan || !hasCredits) { setShowNoCreditPopup(true); return; }
    setShowCreditConfirmation(true);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') { setErrorMessage('Only PDF files are allowed'); return; }
    if (selectedFile.size > 1024 * 1024) { setErrorMessage('File size exceeds 1MB limit'); return; }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStep(0);
    setErrorMessage('');

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 3;
      if (progress >= 85) progress = 85;
      setUploadProgress(progress);
    }, 200);

    // Advance upload steps
    const stepTimers = [
      setTimeout(() => setUploadStep(1), 600),
      setTimeout(() => setUploadStep(2), 1500),
    ];

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      const response = await axios.post('/api/upload/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      clearInterval(interval);
      stepTimers.forEach(clearTimeout);
      setUploadProgress(100);
      setUploadStep(3);

      if (response.data?.success) {
        const fileData = response.data.data;
        const uploaded = { name: selectedFile.name, originalName: selectedFile.name, size: selectedFile.size, type: selectedFile.type, url: fileData.url, cloudinaryUrl: fileData.cloudinaryUrl, viewUrl: fileData.viewUrl, downloadUrl: fileData.downloadUrl, publicId: fileData.publicId, assetId: fileData.assetId, format: fileData.format || 'pdf', resourceType: fileData.resourceType || 'image', createdAt: new Date().toISOString() };
        setUploadedFile(uploaded);
        pdfUtils.storePdfDetails(fileData, selectedFile);
        setUploadSuccess(true);
      } else {
        setErrorMessage(response.data.message || 'Upload failed');
      }
    } catch (err) {
      clearInterval(interval);
      stepTimers.forEach(clearTimeout);
      setErrorMessage('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const confirmCreditUsage = () => { setShowCreditConfirmation(false); };

  const handleProceed = () => {
    if (!uploadedFile) { if (fileInputRef.current) fileInputRef.current.click(); return; }
    setAnalysisFileDetails(uploadedFile);
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
    fetchUserPlans(true);
    // Refresh history to include the new analysis
    (async () => {
      try {
        const data = await getResumeHistory();
        setHistory(data);
      } catch { /* silent */ }
    })();
  };

  // Called when user clicks "View Report" in the analysis modal
  const handleViewReport = (analysisResponse) => {
    // Close the analysis modal
    setShowAnalysisModal(false);
    setAnalysisFileDetails(null);
    setSelectedFile(null);
    setUploadedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchUserPlans(true);

    // Build a ResumeDetailModal-compatible object from the API response
    const structured = analysisResponse?.data?.analysis?.structured || {};
    const resumeDetail = {
      _id: analysisResponse?.resumeAnalysisId || 'temp',
      createdAt: new Date().toISOString(),
      contactInformation: structured.contactInformation || {},
      skills: structured.skills || {},
      workExperience: structured.workExperience || [],
      education: structured.education || [],
      certifications: structured.certifications || [],
      summary: structured.summary || '',
      analysis: structured.analysis || {},
    };
    setSelectedResume(resumeDetail);

    // Refresh history in background
    (async () => {
      try {
        const data = await getResumeHistory();
        setHistory(data);
      } catch { /* silent */ }
    })();
  };

  const firstName = currentUser?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8 relative z-10">
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-[#131318]/60 backdrop-blur-xl border border-white/10 p-8 sm:p-10 overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-violet-600/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-cyan-600/20 rounded-full blur-[60px] pointer-events-none mix-blend-screen" />

        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <SparklesIcon className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-semibold tracking-wide text-zinc-300 uppercase">Dashboard</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display mb-3 text-white">
            Welcome back, <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 animate-shimmer bg-[length:200%_auto]">
              {firstName}
            </span>
          </h1>

          {/* Profile Ribbon */}
          {(currentUser?.occupation || currentUser?.graduationYear || currentUser?.linkedin || currentUser?.github || currentUser?.website) && (
            <div className="flex flex-wrap items-center gap-3 mb-5 mt-1">
              {(currentUser?.occupation || currentUser?.graduationYear) && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm font-medium text-violet-300">
                  <BriefcaseIcon className="h-4 w-4" />
                  <span>
                    {currentUser.occupation}
                    {currentUser.occupation && currentUser.graduationYear && <span className="mx-2 opacity-50">•</span>}
                    {currentUser.graduationYear}
                  </span>
                </div>
              )}
              
              {(currentUser?.linkedin || currentUser?.github || currentUser?.website) && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-300">
                  <LinkIcon className="h-4 w-4 text-zinc-400" />
                  <div className="flex items-center gap-4">
                    {currentUser.linkedin && (
                      <a href={currentUser.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors group">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#0A66C2] group-hover:scale-110 transition-transform" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {currentUser.github && (
                      <a href={currentUser.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors group">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-zinc-100 group-hover:scale-110 transition-transform" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                        </svg>
                        GitHub
                      </a>
                    )}
                    {currentUser.website && (
                      <a href={currentUser.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <LinkIcon className="h-4 w-4 text-emerald-400" />
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-lg text-zinc-400 font-light max-w-xl">
            {currentUser?.bio ? (
              <span className="italic">"{currentUser.bio}"</span>
            ) : (
              "Upload your latest resume to see how it performs against standard ATS metrics, and discover the exact keywords you're missing."
            )}
          </p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          icon={DocumentTextIcon}
          label="Resumes Analyzed"
          value={String(history.length)}
          gradient="from-violet-500 to-fuchsia-500"
          delay={0.1}
        />
        <StatCard
          icon={ChartBarIcon}
          label="Avg. ATS Score"
          value={`${avgScore}%`}
          gradient="from-cyan-500 to-blue-500"
          delay={0.2}
        />
        <StatCard
          icon={CreditCardIcon}
          label="Credits Left"
          value={creditsText}
          gradient="from-emerald-500 to-teal-500"
          delay={0.3}
        />
      </div>

      {/* Two Column Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Upload & Plan (takes 2/3 width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Premium Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden"
          >
            {/* Subtle glow behind the title */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-violet-500/5 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-lg font-bold text-zinc-100 font-display flex items-center gap-2">
                <ArrowUpTrayIcon className="h-5 w-5 text-violet-400" />
                Upload Resume
              </h2>
            </div>

            {errorMessage && (
              <div className="mb-6 px-5 py-4 bg-red-950/40 border border-red-500/20 rounded-xl text-red-400 backdrop-blur-sm relative z-10 flex items-start gap-4 shadow-xl">
                <img src={sadRobotError} alt="Sad Robot Error" className="w-16 h-16 rounded-lg object-cover shadow-[0_0_15px_rgba(239,68,68,0.2)] border border-red-500/30 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-base font-bold text-red-300 mb-1 font-display tracking-wide">Yikes! Something broke 💔</h4>
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              </div>
            )}

            {!uploadSuccess && !isUploading && !selectedFile && (
              <div
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 relative z-10 group ${isDragging
                    ? 'border-violet-500 bg-violet-500/10 scale-[1.02] shadow-glow-primary'
                    : 'border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-white/10'
                  }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${isDragging ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-zinc-400 group-hover:bg-violet-500/10 group-hover:text-violet-400'}`}>
                  <ArrowUpTrayIcon className="h-8 w-8" />
                </div>
                <p className="text-base font-semibold text-zinc-200 mb-2 font-display">Click to upload or drag & drop</p>
                <p className="text-sm text-zinc-500 font-medium">PDF only (Max 1MB)</p>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              </div>
            )}

            {selectedFile && !isUploading && !uploadSuccess && (
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4 px-5 py-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 border border-violet-500/30">
                    <DocumentTextIcon className="h-6 w-6 text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-zinc-400">{Math.round(selectedFile.size / 1024)} KB</p>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 bg-white/5 rounded-md hover:bg-red-500/10">
                    Remove
                  </button>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!hasCredits}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <SparklesIcon className="h-5 w-5" />
                  Analyze this resume
                </button>
              </div>
            )}

            {isUploading && (
              <div className="py-6 relative z-10 overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-40 h-40 bg-violet-500/15 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  {/* Progress Ring */}
                  <div className="relative h-20 w-20 mb-5 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full border-[3px] border-white/5" />
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                      <circle
                        cx="40" cy="40" r="36"
                        fill="none"
                        stroke="url(#uploadGradient)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeDasharray={`${uploadProgress * 2.26} ${226 - uploadProgress * 2.26}`}
                        className="transition-all duration-300 ease-out"
                      />
                      <defs>
                        <linearGradient id="uploadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-extrabold text-white font-display tabular-nums leading-none mb-0.5">{Math.round(uploadProgress)}%</span>
                      <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Upload</span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-1.5 w-full max-w-[280px]">
                    {[
                      { label: 'Preparing file', icon: DocumentTextIcon },
                      { label: 'Encrypting data', icon: ShieldCheckIcon },
                      { label: 'Uploading to cloud', icon: CloudArrowUpIcon },
                      { label: 'Stored securely', icon: ServerIcon },
                    ].map((step, i) => {
                      const isDone = i < uploadStep;
                      const isActive = i === uploadStep;
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-500 ${isActive ? 'bg-white/5 border border-white/10' : isDone ? 'opacity-50' : 'opacity-25'
                            }`}
                        >
                          <div className={`h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isDone ? 'bg-emerald-500/20 border border-emerald-500/30' : isActive ? 'bg-white/10 border border-white/15' : 'bg-white/5 border border-white/5'
                            }`}>
                            {isDone ? (
                              <CheckCircleIcon className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <step.icon className={`h-3 w-3 ${isActive ? 'text-violet-400' : 'text-zinc-600'}`} />
                            )}
                          </div>
                          <span className={`text-xs font-semibold truncate transition-colors duration-500 ${isActive ? 'text-zinc-200' : isDone ? 'text-zinc-400 line-through' : 'text-zinc-600'
                            }`}>{step.label}</span>
                          {isDone && <span className="ml-auto text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex-shrink-0">Done</span>}
                          {isActive && (
                            <motion.div className="ml-auto h-1 w-4 rounded-full bg-violet-500 opacity-60 flex-shrink-0" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom bar */}
                  <div className="mt-4 h-1 w-full max-w-[280px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" style={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </div>
              </div>
            )}

            {uploadSuccess && (
              <div className="space-y-6 py-4 relative z-10 text-center">
                <div className="h-20 w-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-20"></div>
                  <CheckCircleIcon className="h-10 w-10 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 mb-1">Upload Successful!</h3>
                  <p className="text-sm text-zinc-400">"{uploadedFile?.originalName || 'Resume'}" is ready for analysis.</p>
                </div>
                <button
                  onClick={handleProceed}
                  disabled={isProcessing || !hasCredits}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  Generate ATS Report
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Active Plan Banner - Moved Below Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {activePlan ? (
              <div className="bg-[#131318]/80 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 p-0.5">
                    <div className="w-full h-full bg-[#131318] rounded-[10px] flex items-center justify-center">
                      <SparklesIcon className="h-6 w-6 text-violet-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-bold text-zinc-100 font-display">{activePlan.planId.name}</p>
                    <p className="text-sm text-zinc-400">
                      {activePlan.planId.isUnlimited ? 'Unlimited checks available' : `${activePlan.creditsLeft} of ${activePlan.planId.credits} checks remaining`}
                    </p>
                  </div>
                </div>
                <button onClick={() => navigate('/dashboard/plans')} className="text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap relative z-10">
                  Manage Plan
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 backdrop-blur-md border border-violet-500/30 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-base font-bold text-white font-display">No Active Plan</p>
                  <p className="text-sm text-violet-200">Select a plan to start analyzing your resumes instantly.</p>
                </div>
                <button onClick={() => navigate('/dashboard/plans')} className="bg-white text-violet-900 hover:bg-zinc-100 font-bold px-6 py-2.5 rounded-xl transition-colors shadow-glow-primary">
                  View Pricing
                </button>
              </div>
            )}
          </motion.div>

        </div>

        {/* Right Column: Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full min-h-[400px]"
        >
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-zinc-100 font-display">Recent Activity</h2>
            {history.length > 5 && (
              <button onClick={() => navigate('/dashboard/recent-uploads')} className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider bg-violet-500/10 px-2 py-1 rounded-md">
                View All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar -mr-2">
            {historyLoading ? (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center px-4">
                <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                  <DocumentTextIcon className="h-8 w-8 text-zinc-600" />
                </div>
                <p className="text-base font-semibold text-zinc-300 mb-1">No history found</p>
                <p className="text-sm text-zinc-500">Your recent analyses will appear here once you upload a resume.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 7).map((item) => {
                  const score = typeof item.analysis?.atsScore === 'number' ? item.analysis.atsScore : null;
                  return (
                    <div
                      key={item._id}
                      onClick={() => setSelectedResume(item)}
                      className="group flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-zinc-800/50 flex items-center justify-center border border-white/5 group-hover:bg-violet-500/20 group-hover:border-violet-500/30 transition-colors flex-shrink-0">
                          <DocumentTextIcon className="h-5 w-5 text-zinc-400 group-hover:text-violet-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-200 truncate">{item.contactInformation?.name || 'Unnamed Resume'}</p>
                          <p className="text-xs text-zinc-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {score !== null && (
                        <div className="flex-shrink-0">
                          <div className={`px-2.5 py-1 rounded-md text-xs font-bold tabular-nums border ${score >= 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              score >= 40 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                            {score}%
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Modals */}
      <PlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
      <DashboardCreditConfirmationPopup show={showCreditConfirmation} onClose={() => setShowCreditConfirmation(false)} onConfirm={confirmCreditUsage} activePlan={activePlan} />
      <DashboardNoCreditPopup show={showNoCreditPopup} onClose={() => setShowNoCreditPopup(false)} onViewPlans={() => { setIsPlanModalOpen(true); setShowNoCreditPopup(false); }} activePlan={activePlan} />
      <ResumeAnalysisModal fileDetails={analysisFileDetails} open={showAnalysisModal} onClose={handleAnalysisClose} onViewReport={handleViewReport} />
      <ResumeDetailModal modalItem={selectedResume} onClose={() => setSelectedResume(null)} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative bg-[#131318]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 overflow-hidden group hover:border-white/20 transition-all duration-300"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 blur-2xl rounded-full -mt-10 -mr-10 group-hover:opacity-15 transition-opacity duration-500`} />

      <div className="flex items-start gap-4 relative z-10">
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} p-[1px] shadow-lg flex-shrink-0`}>
          <div className="w-full h-full bg-[#131318] rounded-[11px] flex items-center justify-center">
            <Icon className="h-6 w-6 text-white/80" />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-extrabold text-white font-display tabular-nums tracking-tight">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}