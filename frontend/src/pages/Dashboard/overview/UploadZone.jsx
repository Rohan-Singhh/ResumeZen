import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  ServerIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import sadRobotError from '../../../assets/sad_robot_error.png';

export default function UploadZone({
  selectedFile,
  setSelectedFile,
  isUploading,
  uploadProgress,
  uploadStep,
  uploadSuccess,
  uploadedFile,
  errorMessage,
  isDragging,
  setIsDragging,
  hasCredits,
  isProcessing,
  fileSizeError,
  onFileSelect,
  onUpload,
  onProceed,
  fileInputRef,
  onFileChange,
}) {
  return (
    <div className="bg-[#0d0d12]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 relative overflow-hidden h-full flex flex-col justify-center shadow-xl">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-violet-500/[0.05] blur-[60px] pointer-events-none" />

      <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-violet-500/10 rounded-xl border border-violet-500/20">
          <ArrowUpTrayIcon className="h-5 w-5 text-violet-400" />
        </div>
        <h3 className="text-xl font-bold text-zinc-100 font-display">Upload Resume</h3>
      </div>

      {errorMessage && (
        <div className="mb-5 px-4 py-3 bg-red-950/40 border border-red-500/20 rounded-xl text-red-400 backdrop-blur-sm relative z-10 flex items-start gap-3 shadow-xl">
          <img src={sadRobotError} alt="Error" className="w-12 h-12 rounded-lg object-cover shadow-[0_0_15px_rgba(239,68,68,0.2)] border border-red-500/30 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-300 mb-0.5 font-display">Yikes! Something broke 💔</h4>
            <p className="text-xs font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {!uploadSuccess && !isUploading && !selectedFile && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 relative z-10 group flex-1 flex flex-col items-center justify-center min-h-[220px] ${isDragging
            ? 'border-violet-500 bg-violet-500/10 scale-[1.02] shadow-[0_0_30px_rgba(139,92,246,0.15)]'
            : 'border-white/[0.08] bg-white/[0.02] hover:border-violet-500/40 hover:bg-white/[0.04]'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-violet-500/20 text-violet-400' : 'bg-white/[0.04] text-zinc-500 group-hover:bg-violet-500/10 group-hover:text-violet-400'}`}>
            <ArrowUpTrayIcon className="h-8 w-8" />
          </div>
          <p className="text-base font-semibold text-zinc-200 mb-1 font-display">Click to upload or drag & drop</p>
          <p className="text-sm text-zinc-500 font-medium">PDF only (Max 1MB)</p>
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={onFileChange} />
        </div>
      )}

      {selectedFile && !isUploading && !uploadSuccess && (
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <div className="h-9 w-9 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
              <DocumentTextIcon className="h-5 w-5 text-violet-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-200 truncate">{selectedFile.name}</p>
              <p className="text-[11px] text-zinc-500">{Math.round(selectedFile.size / 1024)} KB</p>
            </div>
            <button onClick={() => setSelectedFile(null)} className="text-[11px] font-semibold text-zinc-600 hover:text-red-400 transition-colors px-2 py-1 bg-white/[0.03] rounded-md hover:bg-red-500/10">
              Remove
            </button>
          </div>
          <button
            onClick={onUpload}
            disabled={!hasCredits}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.25)] disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2 text-sm"
          >
            <SparklesIcon className="h-4 w-4" />
            Analyze this resume
          </button>
        </div>
      )}

      {isUploading && (
        <div className="py-4 relative z-10 overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-violet-500/10 rounded-full blur-[50px] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            {/* Progress Ring */}
            <div className="relative h-16 w-16 mb-4 flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-[3px] border-white/[0.04]" />
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="url(#uploadGrad2)" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${uploadProgress * 1.76} ${176 - uploadProgress * 1.76}`}
                  className="transition-all duration-300 ease-out" />
                <defs>
                  <linearGradient id="uploadGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-extrabold text-white font-display tabular-nums leading-none">{Math.round(uploadProgress)}%</span>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-1 w-full max-w-[240px]">
              {[
                { label: 'Preparing file', icon: DocumentTextIcon },
                { label: 'Encrypting data', icon: ShieldCheckIcon },
                { label: 'Uploading to cloud', icon: CloudArrowUpIcon },
                { label: 'Stored securely', icon: ServerIcon },
              ].map((step, i) => {
                const isDone = i < uploadStep;
                const isActive = i === uploadStep;
                return (
                  <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-500 ${isActive ? 'bg-white/[0.04] border border-white/[0.08]' : isDone ? 'opacity-50' : 'opacity-25'}`}>
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${isDone ? 'bg-emerald-500/20 border border-emerald-500/30' : isActive ? 'bg-white/[0.06] border border-white/[0.1]' : 'bg-white/[0.03] border border-white/[0.04]'}`}>
                      {isDone ? <CheckCircleIcon className="h-3 w-3 text-emerald-400" /> : <step.icon className={`h-3 w-3 ${isActive ? 'text-violet-400' : 'text-zinc-700'}`} />}
                    </div>
                    <span className={`text-[11px] font-semibold truncate ${isActive ? 'text-zinc-300' : isDone ? 'text-zinc-500 line-through' : 'text-zinc-700'}`}>{step.label}</span>
                    {isDone && <span className="ml-auto text-[8px] font-bold text-emerald-400 uppercase tracking-wider flex-shrink-0">Done</span>}
                    {isActive && <motion.div className="ml-auto h-1 w-3 rounded-full bg-violet-500 opacity-60 flex-shrink-0" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className="space-y-4 py-3 relative z-10 text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-emerald-500/15 rounded-full animate-ping opacity-20" />
            <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-1">Upload Successful!</h3>
            <p className="text-xs text-zinc-400">"{uploadedFile?.originalName || 'Resume'}" is ready.</p>
          </div>
          <button
            onClick={onProceed}
            disabled={isProcessing || !hasCredits}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2 text-sm"
          >
            <ChartBarIcon className="h-4 w-4" />
            Generate ATS Report
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
