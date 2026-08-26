import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

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
  onFileSelect,
  onUpload,
  onProceed,
  fileInputRef,
  onFileChange,
}) {
  const headerText = uploadSuccess ? 'Upload complete' : isUploading ? 'Uploading' : 'Upload resume';

  return (
    <Card className="h-full flex flex-col justify-center">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-primary/10">
          {uploadSuccess ? (
            <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
          ) : (
            <ArrowUpTrayIcon className="h-4 w-4 text-primary" />
          )}
        </span>
        <h3 className="font-display text-base font-semibold text-ink">{headerText}</h3>
      </div>

      {errorMessage && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-300">Something went wrong</p>
            <p className="text-xs text-red-400/90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Idle dropzone */}
      {!uploadSuccess && !isUploading && !selectedFile && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
          className={`group flex flex-1 min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-line bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04]'
          }`}
        >
          <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${
            isDragging ? 'border-primary/30 bg-primary/15 text-primary' : 'border-line bg-white/[0.03] text-ink-faint group-hover:text-primary'
          }`}>
            <ArrowUpTrayIcon className="h-7 w-7" />
          </span>
          <p className="mb-1 font-display text-base font-semibold text-ink">Click to upload or drag &amp; drop</p>
          <p className="text-sm text-ink-faint">PDF only (Max 5MB)</p>
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={onFileChange} />
        </div>
      )}

      {/* Selected, awaiting analyze */}
      {selectedFile && !isUploading && !uploadSuccess && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.03] px-4 py-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <DocumentTextIcon className="h-5 w-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{selectedFile.name}</p>
              <p className="text-[11px] text-ink-faint">{Math.round(selectedFile.size / 1024)} KB</p>
            </div>
            <button onClick={() => setSelectedFile(null)} className="rounded-md px-2 py-1 text-[11px] font-semibold text-ink-faint transition-colors hover:bg-red-500/10 hover:text-red-400">
              Remove
            </button>
          </div>
          <Button onClick={onUpload} disabled={!hasCredits} className="w-full">
            Analyze this resume
          </Button>
        </div>
      )}

      {/* Uploading */}
      {isUploading && (
        <div className="flex flex-col items-center py-4">
          <div className="relative mb-4 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-[3px] border-white/[0.06]" />
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${uploadProgress * 1.76} ${176 - uploadProgress * 1.76}`}
                className="text-primary transition-all duration-300 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-sm font-semibold tabular-nums text-ink">{Math.round(uploadProgress)}%</span>
            </div>
          </div>
          <p className="text-sm text-ink-muted">
            {uploadStep >= 2 ? 'Processing' : uploadStep >= 1 ? 'Uploading' : 'Preparing file'}…
          </p>
        </div>
      )}

      {/* Success */}
      {uploadSuccess && (
        <div className="space-y-4 py-3 text-center">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10"
          >
            <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
          </motion.span>
          <div>
            <h3 className="font-display text-base font-semibold text-ink">Upload successful</h3>
            <p className="text-sm text-ink-muted">{uploadedFile?.originalName || 'Resume'} is ready for analysis.</p>
          </div>
          <Button onClick={onProceed} disabled={isProcessing || !hasCredits} className="w-full">
            <ChartBarIcon className="h-4 w-4" />
            Generate ATS report
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </Card>
  );
}
