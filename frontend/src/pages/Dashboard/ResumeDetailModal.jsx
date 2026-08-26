import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentTextIcon, XMarkIcon, ChartBarIcon, 
  ExclamationTriangleIcon, FireIcon, CodeBracketIcon,
  CheckCircleIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function ResumeDetailModal({ modalItem, onClose }) {
  if (typeof document === 'undefined') return null;
  
  // Early return if no modal item
  if (!modalItem) return null;
  
  // `modalItem` is already canonical — see utils/analysisSchema.js
  const analysisData = modalItem;

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };
  
  const overallScore = analysisData.overallScore ?? 0;

  return createPortal(
    <AnimatePresence>
      {modalItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={onClose} 
          />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0a0a0c] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 flex flex-col" 
          onClick={e => e.stopPropagation()}
        >
          {/* Top Gradient Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />
          
          {/* Modal header */}
          <div className="bg-white/[0.02] border-b border-white/5 px-6 py-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <DocumentTextIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display tracking-tight">{analysisData.contactInformation.name || 'Unnamed Resume'}</h3>
                <p className="text-xs text-zinc-500 font-medium">ATS Auditor Report</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors bg-white/5 border border-white/5">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar relative z-10">
            {/* Header Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* ATS Score Card */}
              <div className="md:col-span-1 bg-[#131318] border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                <div className="relative z-10 text-center">
                  <p className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <ChartBarIcon className="h-4 w-4" /> Overall Score
                  </p>
                  <p className={`text-6xl font-extrabold tabular-nums font-display tracking-tighter ${
                    overallScore >= 90 ? 'text-emerald-400' : 
                    overallScore >= 75 ? 'text-teal-400' : 
                    overallScore >= 60 ? 'text-amber-400' : 
                    'text-red-500'
                  }`}>
                    {overallScore}<span className="text-2xl text-zinc-600">/100</span>
                  </p>
                </div>
              </div>

              {/* Recruiter Verdict Card */}
              <div className="md:col-span-2 bg-[#131318] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none" />
                <div className="relative z-10 h-full flex flex-col justify-between min-h-[120px]">
                  <div>
                     <div className="flex items-center justify-between mb-4">
                       <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Recruiter Verdict</p>
                       {analysisData.hiringRiskLevel !== 'Unknown' && (
                         <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${getRiskColor(analysisData.hiringRiskLevel)}`}>
                           {analysisData.hiringRiskLevel} Risk
                         </span>
                       )}
                     </div>
                     <p className={`text-3xl font-black font-display uppercase tracking-tight mb-2 ${
                       analysisData.recruiterScreening?.verdict?.toLowerCase() === 'pass' ? 'text-emerald-400' :
                       analysisData.recruiterScreening?.verdict?.toLowerCase() === 'reject' ? 'text-red-500' :
                       'text-amber-400'
                     }`}>
                       {analysisData.recruiterScreening?.verdict || 'Unknown'}
                     </p>
                  </div>
                  
                  {analysisData.recruiterScreening?.redFlags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {analysisData.recruiterScreening.redFlags.map((flag) => (
                        <span key={flag} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                          <ExclamationTriangleIcon className="w-3.5 h-3.5" /> {flag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Brutal Feedback */}
            {analysisData.recruiterScreening?.brutalFeedback?.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                <h4 className="text-sm font-black text-red-400 mb-4 flex items-center gap-2 font-display uppercase tracking-wider">
                  <FireIcon className="h-5 w-5" /> Brutal Feedback
                </h4>
                <ul className="space-y-3">
                  {analysisData.recruiterScreening.brutalFeedback.map((feedback) => (
                    <li key={feedback} className="text-zinc-300 text-sm font-medium flex items-start gap-3 leading-relaxed">
                      <span className="text-red-500 font-bold mt-0.5">•</span> {feedback}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Two Column Layout for Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Technical Depth */}
              {analysisData.technicalDepth && (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-display uppercase tracking-wider">
                      <CodeBracketIcon className="h-4 w-4 text-indigo-400" /> Technical Depth
                    </h4>
                    <span className="text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-sm shadow-inner">{analysisData.technicalDepth.score}/100</span>
                  </div>
                  
                  <div className="mb-5 bg-black/20 p-4 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Stack Assessment</p>
                    <p className="text-sm text-zinc-300 font-medium leading-relaxed">{analysisData.technicalDepth.stackRelevance}</p>
                  </div>
                  
                  {analysisData.technicalDepth.skillGaps?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Critical Gaps</p>
                      <div className="flex flex-wrap gap-2">
                        {analysisData.technicalDepth.skillGaps.map((gap) => (
                          <span key={gap} className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-md shadow-inner">
                            {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisData.technicalDepth.overusedBuzzwords?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Buzzwords Dumped</p>
                      <div className="flex flex-wrap gap-2">
                        {analysisData.technicalDepth.overusedBuzzwords.map((bw) => (
                          <span key={bw} className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-semibold rounded-md line-through opacity-70">
                            {bw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Impact & Ownership */}
              {analysisData.impactAndOwnership && (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-display uppercase tracking-wider">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-400" /> Impact & Ownership
                    </h4>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-sm shadow-inner">{analysisData.impactAndOwnership.score}/100</span>
                  </div>
                  
                  {analysisData.impactAndOwnership.missingMetrics?.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Unquantified Claims</p>
                      <ul className="space-y-2">
                        {analysisData.impactAndOwnership.missingMetrics.map((missing) => (
                          <li key={missing} className="text-xs text-zinc-300 flex items-start gap-2 bg-black/20 p-2.5 rounded-lg border border-white/5">
                            <span className="text-amber-500 mt-0.5 opacity-70">?</span> {missing}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisData.impactAndOwnership.recommendedMetricInjections?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Metric Injections Required</p>
                      <ul className="space-y-3">
                        {analysisData.impactAndOwnership.recommendedMetricInjections.map((rec) => (
                          <li key={rec} className="text-xs font-mono bg-emerald-900/10 p-3 rounded-lg border border-emerald-500/20 text-emerald-300 leading-relaxed shadow-inner">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Keyword Injection Box */}
            {analysisData.missingKeywords.length > 0 && (
              <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50" />
                <h4 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2 font-display uppercase tracking-wider">
                  <MagnifyingGlassIcon className="h-4 w-4" /> Keyword Injection Strategy
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {analysisData.missingKeywords.map((kw) => (
                    <span key={kw} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold rounded-lg shadow-inner">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Extracted Skills */}
            {(analysisData.skills.technical.length > 0 || analysisData.skills.soft.length > 0) && (
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h4 className="text-sm font-bold text-zinc-100 mb-4 font-display uppercase tracking-wider">Extracted Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisData.skills.technical.map((s) => (
                    <span key={`t-${s}`} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded">{s}</span>
                  ))}
                  {analysisData.skills.soft.map((s) => (
                    <span key={`s-${s}`} className="px-2.5 py-1 bg-white/5 border border-white/10 text-zinc-300 text-xs rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {analysisData.strengths.length > 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                <h4 className="text-sm font-black text-emerald-400 mb-4 flex items-center gap-2 font-display uppercase tracking-wider">
                  <CheckCircleIcon className="h-5 w-5" /> Strengths
                </h4>
                <ul className="space-y-3">
                  {analysisData.strengths.map((s) => (
                    <li key={s} className="text-zinc-300 text-sm font-medium flex items-start gap-3 leading-relaxed">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
