import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentTextIcon, XMarkIcon, ChartBarIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function ResumeDetailModal({ modalItem, onClose }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {modalItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={onClose} 
          />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#131318] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl relative z-10 flex flex-col" 
          onClick={e => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="bg-black/20 border-b border-white/5 px-6 py-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                <DocumentTextIcon className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100 font-display">{modalItem.contactInformation?.name || 'Unnamed Resume'}</h3>
                <p className="text-xs text-zinc-500 font-medium">Analyzed on {new Date(modalItem.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors bg-white/5">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar relative z-10">
            {/* Ambient glow inside modal */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

            {/* ATS Score Showcase */}
            <div className="text-center py-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
              
              <div className="relative z-10">
                <p className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest flex items-center justify-center gap-2">
                  <ChartBarIcon className="h-4 w-4" /> Overall ATS Score
                </p>
                
                <p className={`text-6xl font-extrabold tabular-nums font-display tracking-tighter ${
                  (modalItem.analysis?.atsScore ?? 0) >= 70 ? 'text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-600' : 
                  (modalItem.analysis?.atsScore ?? 0) >= 40 ? 'text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-orange-600' : 
                  'text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-rose-600'
                }`}>
                  {typeof modalItem.analysis?.atsScore === 'number' ? `${modalItem.analysis.atsScore}%` : 'N/A'}
                </p>
                
                {typeof modalItem.analysis?.atsScore === 'number' && (
                  <div className="mt-6 h-3 w-64 bg-black/40 rounded-full mx-auto overflow-hidden border border-white/5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${modalItem.analysis?.atsScore}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className={`h-full rounded-full ${
                        modalItem.analysis.atsScore >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                        modalItem.analysis.atsScore >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
                        'bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      }`} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Contact info */}
            <Section title="Contact Information" icon={DocumentTextIcon}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard label="Email Address" value={modalItem.contactInformation?.email} />
                <InfoCard label="Phone Number" value={modalItem.contactInformation?.phone} />
                <InfoCard label="Location" value={modalItem.contactInformation?.location} className="sm:col-span-2" />
              </div>
            </Section>

            {/* Skills */}
            <Section title="Extracted Skills" icon={SparklesIcon}>
              {modalItem.skills?.technical?.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {modalItem.skills.technical.map((s, i) => <Tag key={i} variant="primary">{s}</Tag>)}
                  </div>
                </div>
              )}
              {modalItem.skills?.soft?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Soft Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {modalItem.skills.soft.map((s, i) => <Tag key={i} variant="secondary">{s}</Tag>)}
                  </div>
                </div>
              )}
              {(!modalItem.skills?.technical?.length && !modalItem.skills?.soft?.length) && (
                <p className="text-sm text-zinc-500 italic bg-white/5 p-4 rounded-xl border border-white/5">No skills extracted from this resume.</p>
              )}
            </Section>
            
            {/* Missing Keywords Preview */}
            {modalItem.analysis?.missingKeywords?.length > 0 && (
              <Section title="Suggested Keywords to Add" icon={SparklesIcon}>
                <div className="flex flex-wrap gap-2">
                  {modalItem.analysis.missingKeywords.slice(0, 5).map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium rounded-md">
                      + {kw}
                    </span>
                  ))}
                  {modalItem.analysis.missingKeywords.length > 5 && (
                    <span className="px-3 py-1.5 bg-white/5 border border-white/5 text-zinc-400 text-xs font-medium rounded-md">
                      +{modalItem.analysis.missingKeywords.length - 5} more
                    </span>
                  )}
                </div>
              </Section>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2 font-display uppercase tracking-wide">
        <Icon className="h-4 w-4 text-violet-400" />
        {title}
      </h4>
      {children}
    </div>
  );
}

function InfoCard({ label, value, className = "" }) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl p-4 ${className}`}>
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-semibold text-zinc-200 truncate">{value || <span className="text-zinc-600 italic">Not specified</span>}</p>
    </div>
  );
}

function Tag({ children, variant = 'primary' }) {
  const styles = {
    primary: "bg-violet-500/10 border-violet-500/20 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.1)]",
    secondary: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
  };
  
  return (
    <span className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}
