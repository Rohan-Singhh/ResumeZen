import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function VlogModal({ vlog, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">{vlog.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Video Section */}
          <div className="aspect-video bg-black">
            <iframe
              src={vlog.video_embed_url}
              className="w-full h-full"
              allowFullScreen
              title={vlog.title}
            />
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                👁️ {vlog.views} views
              </span>
              <span>📅 {vlog.upload_date}</span>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">About this Video</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{vlog.full_description}</p>
            </div>

            {vlog.key_points && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Key Points</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {vlog.key_points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 