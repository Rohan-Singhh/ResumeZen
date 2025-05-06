import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentTextIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const FILE_TYPE_NAMES = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

export default function UploadBox({ onFileSelect, onConfirm, selectedFile }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return 'Please select a file';
    if (!ALLOWED_TYPES.includes(file.type)) return 'Only PDF and DOCX files are allowed';
    if (file.size > MAX_FILE_SIZE) return 'File size must be less than 5MB';
    return '';
  };

  const handleFile = (file) => {
    const err = validateFile(file);
    setError(err);
    if (!err) onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const removeFile = () => {
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onFileSelect(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <h2 className="text-xl font-semibold mb-6">Upload Resume</h2>
      <div className="space-y-4">
        <motion.div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-colors w-full ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
          } ${error ? 'border-red-500 bg-red-50' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          animate={{ scale: isDragging ? 1.02 : 1 }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".pdf,.docx"
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            {!selectedFile ? (
              <>
                <motion.div
                  animate={{
                    scale: isDragging ? 1.1 : 1,
                    rotate: isDragging ? 5 : 0,
                  }}
                  className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
                >
                  <DocumentTextIcon className="w-8 h-8 text-primary" />
                </motion.div>
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">
                    {isDragging ? 'Drop your file here' : 'Drag and drop your resume'}
                  </p>
                  <p className="text-gray-500">or</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Browse Files
                  </motion.button>
                </div>
                <p className="text-sm text-gray-500">Supported formats: PDF, DOCX (Max 5MB)</p>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <div className="bg-primary/5 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB • {FILE_TYPE_NAMES[selectedFile.type]}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm font-medium w-full text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Confirmation button */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <span>Process Resume</span>
                <ArrowRightIcon className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
} 