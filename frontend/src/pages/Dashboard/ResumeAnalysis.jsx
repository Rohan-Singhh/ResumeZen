import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  SparklesIcon,
  LightBulbIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import * as pdfUtils from '../../utils/pdfUtils';
import { processResume } from '../../services/resumeService';

export default function ResumeAnalysis() {
  const { currentUser, userPlans, refundPlanCredit, usePlanCredit, fetchUserPlans } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [resumeFileInfo, setResumeFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [pdfUrlState, setPdfUrlState] = useState(null);
  const [friendlyError, setFriendlyError] = useState(null);
  
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  const [processingResults, setProcessingResults] = useState(null);
  const [creditRefunded, setCreditRefunded] = useState(false);
  const [creditDeducted, setCreditDeducted] = useState(false);

  useEffect(() => {
    const details = pdfUtils.getPdfDetails();
    if (!details) {
      if (location.state?.fileDetails) {
        pdfUtils.storePdfDetails(location.state.fileDetails, null);
        setResumeFileInfo(location.state.fileDetails);
      } else {
        setError('No resume data found. Please upload a resume first.');
        setLoading(false);
      }
    } else {
      setResumeFileInfo(details.info);
    }
  }, [location]);

  useEffect(() => {
    if (resumeFileInfo) {
      const loadPdf = async () => {
        try {
          const url = await pdfUtils.resolvePdfUrl(resumeFileInfo);
          setPdfUrlState(url);
          setLoading(false);
        } catch (err) {
          console.error("Failed to resolve PDF URL:", err);
          setPdfError(true);
          setLoading(false);
        }
      };
      loadPdf();
      if (!processingResults && !processing && !processingError) {
        processResumeAutomatically();
      }
    }
  }, [resumeFileInfo]);

  const processResumeAutomatically = useCallback(async () => {
    if (!resumeFileInfo || processing) return;
    setProcessing(true);
    setProcessingError(null);
    setCreditRefunded(false);
    try {
      if (!creditDeducted) {
        const creditResult = await usePlanCredit();
        if (!creditResult.success) {
          throw new Error(`Credit error: ${creditResult.error}`);
        }
        setCreditDeducted(true);
        await fetchUserPlans(true);
      }
      const data = await processResume(resumeFileInfo);
      setProcessingResults(data);
    } catch (err) {
      console.error('Processing error:', err);
      let errorMsg = err.response?.data?.message || err.message || 'Analysis failed';
      setProcessingError(errorMsg);
      if (creditDeducted && !errorMsg.includes("doesn't appear to be a resume")) {
        try {
          const refundResult = await refundPlanCredit();
          if (refundResult.success) {
            setCreditRefunded(true);
            setCreditDeducted(false);
            await fetchUserPlans(true);
          }
        } catch (refundErr) {
          console.error('Refund failed:', refundErr);
        }
      }
    } finally {
      setProcessing(false);
    }
  }, [resumeFileInfo, processing, creditDeducted, usePlanCredit, fetchUserPlans, refundPlanCredit]);

  const handlePdfError = () => {
    console.error("PDF iframe failed to load");
    setPdfError(true);
  };

  const handleDownload = () => {
    if (resumeFileInfo?.downloadUrl) {
      window.open(resumeFileInfo.downloadUrl, '_blank');
    } else if (resumeFileInfo?.url) {
      window.open(resumeFileInfo.url, '_blank');
    } else {
      alert('Download URL not available');
    }
  };
  
  const handleRetry = () => {
    setProcessingError(null);
    setProcessingResults(null);
    processResumeAutomatically();
  };

  const analysis = processingResults?.analysis;
  const atsScore = typeof analysis?.atsScore === 'number' ? analysis.atsScore : null;

  return (
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131318]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500"></div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all shadow-sm">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 font-display flex items-center gap-2">
              {resumeFileInfo?.fileName || 'Resume Analysis'}
              {atsScore !== null && (
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${
                  atsScore >= 70 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                  atsScore >= 40 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  Score: {atsScore}%
                </span>
              )}
            </h1>
            <p className="text-sm text-zinc-400 font-medium">Comprehensive AI & ATS Review</p>
          </div>
        </div>
        {resumeFileInfo && (
          <button onClick={handleDownload} className="flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white px-4 py-2 border border-white/10 rounded-xl hover:bg-white/10 transition-all shadow-sm group">
            <ArrowDownTrayIcon className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        )}
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-[#131318]/80 backdrop-blur-md border border-white/10 rounded-2xl">
          <div className="h-10 w-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto backdrop-blur-md shadow-2xl">
          <ExclamationCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white font-display mb-2">Error Loading Resume</h3>
          <p className="text-sm text-zinc-300 mb-8">{error}</p>
          <Link to="/dashboard" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors border border-white/10">
            Return to Dashboard
          </Link>
        </div>
      ) : resumeFileInfo ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[800px]">
          
          {/* Left Column: PDF Viewer */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative"
          >
            <div className="px-5 py-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-violet-400" />
                <span className="text-sm font-bold text-zinc-200 font-display tracking-wide">Original Document</span>
              </div>
            </div>
            <div className="flex-1 bg-black/50 relative">
              {pdfError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <ExclamationCircleIcon className="h-12 w-12 text-zinc-600 mb-4" />
                  <p className="text-base font-medium text-zinc-300 mb-6">Could not load PDF preview securely.</p>
                  <button onClick={handleDownload} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors border border-white/10 shadow-sm">
                    Download to view
                  </button>
                </div>
              ) : pdfUrlState ? (
                <iframe 
                  src={`${pdfUrlState}#view=FitH&toolbar=0`} 
                  className="w-full h-full border-0" 
                  title="Resume PDF"
                  onError={handlePdfError}
                />
              ) : (
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Analysis Report */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex flex-col relative"
          >
            {processing ? (
              <div className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex-1 flex flex-col items-center justify-center p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent"></div>
                <div className="relative h-24 w-24 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SparklesIcon className="h-8 w-8 text-violet-400 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-2 relative z-10">Analyzing Resume</h3>
                <p className="text-sm text-zinc-400 relative z-10 max-w-xs">Our AI is extracting skills, analyzing formatting, and scoring your profile against industry standards...</p>
              </div>
            ) : processingError ? (
              <div className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex-1 flex flex-col items-center justify-center p-10 text-center shadow-2xl">
                <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                  <ExclamationCircleIcon className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-2">Analysis Failed</h3>
                <p className="text-sm text-zinc-400 mb-6 max-w-sm whitespace-pre-line leading-relaxed">{processingError}</p>
                {creditRefunded && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-lg mb-6">1 Credit Refunded Automatically</div>}
                <div className="flex gap-4 w-full max-w-xs">
                  {!processingError.includes("doesn't appear to be a resume") && (
                    <button onClick={handleRetry} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-glow-primary">Retry</button>
                  )}
                  <Link to="/dashboard" className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-bold py-3 rounded-xl transition-colors text-center shadow-sm">
                    Back
                  </Link>
                </div>
              </div>
            ) : analysis ? (
              <div className="flex-1 overflow-y-auto space-y-6 pr-3 custom-scrollbar">
                
                {/* Score Card - Massive Glassmorphic Centerpiece */}
                <div className="bg-[#131318]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
                  {/* Score Glow Background */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20 ${
                    (atsScore ?? 0) >= 70 ? 'bg-emerald-500' : (atsScore ?? 0) >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  
                  <div className="relative z-10 flex flex-col items-center justify-center h-full">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                      <ChartBarIcon className="h-4 w-4" /> Overall ATS Match
                    </p>
                    <p className={`text-[80px] leading-none font-extrabold tabular-nums tracking-tighter font-display mb-6 ${
                      (atsScore ?? 0) >= 70 ? 'text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-teal-600' : 
                      (atsScore ?? 0) >= 40 ? 'text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-orange-600' : 
                      'text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-rose-600'
                    }`}>
                      {atsScore !== null ? `${atsScore}%` : '—'}
                    </p>
                    <div className="w-full max-w-[240px] h-3 bg-black/40 rounded-full mx-auto overflow-hidden border border-white/5 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${atsScore || 0}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        className={`h-full rounded-full ${
                          (atsScore ?? 0) >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 
                          (atsScore ?? 0) >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 
                          'bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                        }`} 
                      />
                    </div>
                  </div>
                </div>

                {/* Extracted Details Bento */}
                <div className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-sm font-bold text-zinc-200 font-display uppercase tracking-wide flex items-center gap-2 mb-5">
                    <DocumentTextIcon className="h-4 w-4 text-violet-400" /> Extracted Info
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoRow label="Name" value={processingResults.contactInformation?.name} />
                    <InfoRow label="Email" value={processingResults.contactInformation?.email} />
                    <InfoRow label="Phone" value={processingResults.contactInformation?.phone} />
                    <InfoRow label="Location" value={processingResults.contactInformation?.location} />
                  </div>
                </div>

                {/* AI Summary */}
                {processingResults.summary && (
                  <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><SparklesIcon className="h-24 w-24" /></div>
                    <h4 className="text-sm font-bold text-violet-300 font-display uppercase tracking-wide flex items-center gap-2 mb-3 relative z-10">
                      <SparklesIcon className="h-4 w-4" /> AI Profile Summary
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed relative z-10 font-medium">
                      {processingResults.summary}
                    </p>
                  </div>
                )}

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 gap-6">
                  {analysis.strengths?.length > 0 && (
                    <div className="bg-[#131318]/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                      <h4 className="text-sm font-bold text-emerald-400 font-display uppercase tracking-wide flex items-center gap-2 mb-4">
                        <CheckCircleIcon className="h-4 w-4" /> Strengths
                      </h4>
                      <ul className="space-y-3">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                            <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                            <span className="leading-relaxed font-medium">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.areasForImprovement?.length > 0 && (
                    <div className="bg-[#131318]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                      <h4 className="text-sm font-bold text-amber-400 font-display uppercase tracking-wide flex items-center gap-2 mb-4">
                        <LightBulbIcon className="h-4 w-4" /> Areas to Improve
                      </h4>
                      <ul className="space-y-3">
                        {analysis.areasForImprovement.map((s, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/30">
                              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                            </div>
                            <span className="leading-relaxed font-medium">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Skills & Keywords */}
                <div className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-sm font-bold text-zinc-200 font-display uppercase tracking-wide flex items-center gap-2 mb-6">
                    <BriefcaseIcon className="h-4 w-4 text-violet-400" /> Extracted Skills
                  </h4>
                  
                  {processingResults.skills?.technical?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Technical Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {processingResults.skills.technical.map((s, i) => <Tag key={i} variant="primary">{s}</Tag>)}
                      </div>
                    </div>
                  )}
                  {processingResults.skills?.soft?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Soft Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {processingResults.skills.soft.map((s, i) => <Tag key={i} variant="secondary">{s}</Tag>)}
                      </div>
                    </div>
                  )}
                  
                  {analysis.keywords?.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <LightBulbIcon className="h-3 w-3" /> Missing ATS Keywords
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywords.map((k, i) => <Tag key={i} variant="warning">Add: {k}</Tag>)}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-center">
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</span>
      <span className="text-sm font-semibold text-zinc-200 truncate">{value || <span className="text-zinc-600 italic">Not found</span>}</span>
    </div>
  );
}

function Tag({ children, variant = 'primary' }) {
  const styles = {
    primary: "bg-violet-500/10 text-violet-300 border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]",
    secondary: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${styles[variant]}`}>
      {children}
    </span>
  );
}