import React, { useEffect, useState } from 'react';
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import ReportView from '../../components/report/ReportView';
import { buttonClasses } from '../../components/ui/Button';
import { timeAgo } from '../../utils/timeAgo';

export default function ResumeDetailModal({ modalItem, onClose }) {
  // Keep the last item so the exit animation still has content to render
  // after the parent clears `modalItem`.
  const [lastItem, setLastItem] = useState(modalItem);
  useEffect(() => {
    if (modalItem) setLastItem(modalItem);
  }, [modalItem]);

  // `modalItem` is already canonical — see utils/analysisSchema.js
  const data = modalItem || lastItem;

  return (
    <Modal
      open={Boolean(modalItem)}
      onClose={onClose}
      labelledBy="report-title"
      maxWidth="max-w-3xl"
      padded={false}
      zIndex="z-[100]"
      className="flex max-h-[92dvh] flex-col overflow-hidden sm:max-h-[88vh]"
    >
      {data && (
        <>
          <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-line px-5 pb-4 pt-6 sm:px-8 sm:pt-5">
            <div className="min-w-0">
              <p className="t-label mb-2">Resume report</p>
              <h3 id="report-title" className="t-h3 truncate">
                {data.contactInformation.name || 'Unnamed resume'}
              </h3>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <span className="t-meta hidden sm:block">{timeAgo(data.createdAt)}</span>
              {data.resumeUrl && (
                <a
                  href={data.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClasses({ variant: 'ghost', size: 'sm' })}
                >
                  PDF <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close report"
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-ink/[0.06] hover:text-ink"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-7 sm:px-8 sm:pb-8">
            {/* Keyed so a different report replays its own score sweep */}
            <ReportView key={data.id} data={data} />
          </div>
        </>
      )}
    </Modal>
  );
}
