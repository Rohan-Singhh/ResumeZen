import React from 'react';
import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

/**
 * UploadZone — pick or drop a PDF. The actual upload + analysis runs in
 * ResumeAnalysisModal, so this card only has two states: idle dropzone and a
 * selected file waiting for confirmation.
 */
export default function UploadZone({
  selectedFile,
  onClearFile,
  errorMessage,
  isDragging,
  setIsDragging,
  onFileSelect,
  onAnalyze,
  fileInputRef,
  onFileChange,
}) {
  return (
    <Card className="h-full flex flex-col justify-center">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-primary/10">
          <ArrowUpTrayIcon className="h-4 w-4 text-primary" />
        </span>
        <h3 className="font-display text-base font-semibold text-ink">Upload resume</h3>
      </div>

      {errorMessage && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-300">Can't use this file</p>
            <p className="text-xs text-red-400/90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Idle dropzone */}
      {!selectedFile && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload a PDF resume"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
          className={`group flex flex-1 min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
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
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,application/pdf" onChange={onFileChange} />
        </div>
      )}

      {/* Selected, awaiting confirmation */}
      {selectedFile && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.03] px-4 py-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <DocumentTextIcon className="h-5 w-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{selectedFile.name}</p>
              <p className="text-[11px] text-ink-faint">{Math.round(selectedFile.size / 1024)} KB</p>
            </div>
            <button onClick={onClearFile} className="rounded-md px-2 py-1 text-[11px] font-semibold text-ink-faint transition-colors hover:bg-red-500/10 hover:text-red-400">
              Remove
            </button>
          </div>
          <Button onClick={onAnalyze} className="w-full">
            Analyze this resume
          </Button>
        </div>
      )}
    </Card>
  );
}
