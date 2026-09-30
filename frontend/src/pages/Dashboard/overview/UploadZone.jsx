import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import PaperGlyph from '../../../components/graphics/PaperGlyph';
import { ease, spring } from '../../../utils/motion';

const formatSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * UploadZone — pick or drop a PDF. The actual upload + analysis runs in
 * ResumeAnalysisModal, so this card only has two states: an empty tray and a
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
    <Card padded={false} className="flex h-full flex-col p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="t-title">New analysis</h3>
        <span className="t-meta">1 credit</span>
      </div>

      <AnimatePresence initial={false}>
        {errorMessage && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: ease.out }}
            className="overflow-hidden"
          >
            <div className="mb-4 flex items-start gap-2.5 rounded-md border border-bad/25 bg-bad/10 px-3.5 py-3">
              <ExclamationCircleIcon className="mt-px h-5 w-5 flex-shrink-0 text-bad" />
              <div className="min-w-0 text-[0.8125rem] leading-snug">
                <p className="font-medium text-bad">Can&apos;t use this file</p>
                <p className="mt-0.5 text-bad/85">{errorMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The input stays mounted in both states so the picker ref is stable */}
      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,application/pdf" onChange={onFileChange} />

      {!selectedFile ? (
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
          className={`group flex min-h-[14rem] flex-1 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-6 py-8 text-center ${
            isDragging
              ? 'border-primary bg-primary/[0.07]'
              : 'border-line-strong bg-surface-sunken hover:border-ink/40'
          }`}
        >
          {/* The sheet lifts off the desk as a file comes near */}
          <motion.div
            animate={isDragging ? { y: -8, rotate: 3, scale: 1.06 } : { y: 0, rotate: -4, scale: 1 }}
            whileHover={isDragging ? undefined : { y: -3 }}
            transition={spring}
            className="mb-5"
          >
            <PaperGlyph size={50} mark={isDragging ? 'tick' : 'line'} />
          </motion.div>
          <p className="t-title">{isDragging ? 'Let go to add it' : 'Drop your resume here'}</p>
          <p className="mt-1.5 text-[0.8125rem] text-ink-muted">
            or <span className="font-medium text-ink underline decoration-ink/30 underline-offset-[3px] group-hover:decoration-ink">choose a file</span>
          </p>
          <p className="t-meta mt-5">PDF · up to 5 MB</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: ease.out }}
          className="flex flex-1 flex-col justify-center gap-4"
        >
          <div className="flex items-center gap-3.5 rounded-md border border-line bg-surface-sunken p-3.5">
            <PaperGlyph size={30} mark="none" className="flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{selectedFile.name}</p>
              <p className="t-meta mt-0.5">{formatSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={onClearFile}
              aria-label="Remove file"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-ink-faint hover:bg-ink/[0.06] hover:text-ink"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <Button size="lg" onClick={onAnalyze} className="w-full">Analyze this resume</Button>
        </motion.div>
      )}
    </Card>
  );
}
