import { useState, useRef } from 'react';
import { XMarkIcon, CameraIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.username);
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({ name, photo });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-xl max-w-lg w-full overflow-hidden mx-4"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Profile Edit Form */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full overflow-hidden bg-primary relative">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                      {user.initials}
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CameraIcon className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                  </motion.div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
              </motion.div>
              <p className="text-sm text-gray-600 text-center">
                Click to upload a new profile photo
              </p>
            </div>

            {/* Name Edit Section */}
            <div className="space-y-2 w-full">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <motion.div
                initial={false}
                animate={{ scale: name !== user.username ? 1.02 : 1 }}
                className="relative"
              >
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white shadow-sm"
                  placeholder="Enter your name"
                />
                {name !== user.username && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <CheckIcon className="w-5 h-5 text-green-500" />
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 sm:p-6 border-t bg-gray-50 flex justify-end gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#2563eb' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
            >
              Save Changes
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 