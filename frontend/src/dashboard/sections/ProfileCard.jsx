import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilSquareIcon, CameraIcon } from '@heroicons/react/24/outline';

export default function ProfileCard({ user, onEdit }) {
  // Extract first name from the full name
  const firstName = user.name.split(' ')[0];
  
  // State for profile photo
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const fileInputRef = useRef(null);
  
  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    
    // Reset error state
    setPhotoError(null);
    
    // Validate file
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setPhotoError('Please upload JPG or PNG files only');
        return;
      }
      
      // Check file size (1MB = 1048576 bytes)
      if (file.size > 1048576) {
        setPhotoError('Image size should be less than 1MB');
        return;
      }
      
      // If valid, set the profile photo
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="relative group">
            {profilePhoto ? (
              <img 
                src={profilePhoto} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-semibold flex-shrink-0">
                {user.initials}
              </div>
            )}
            
            {/* Hover overlay for photo upload */}
            <motion.div 
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CameraIcon className="w-6 h-6 text-white" />
            </motion.div>
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".jpg,.jpeg,.png"
              onChange={handlePhotoUpload}
            />
          </div>
          
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{firstName}</h2>
            
            {/* Photo upload error message */}
            <AnimatePresence>
              {photoError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {photoError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <button onClick={onEdit} className="flex items-center gap-2 text-primary hover:text-secondary whitespace-nowrap flex-shrink-0">
          <PencilSquareIcon className="w-5 h-5" />
          <span>Edit Profile</span>
        </button>
      </div>
      
      <div className="space-y-4 w-full">
        <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
          <p className="text-gray-600">Email</p>
          <p className="font-medium truncate">{user.email}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
          <p className="text-gray-600">Phone</p>
          <p className="font-medium truncate">{user.phone}</p>
        </div>
        <div className="bg-primary/5 rounded-lg p-4 overflow-hidden">
          <p className="text-primary font-semibold">Current Plan</p>
          <p className="text-lg font-bold truncate">{user.plan}</p>
        </div>
      </div>
    </div>
  );
} 