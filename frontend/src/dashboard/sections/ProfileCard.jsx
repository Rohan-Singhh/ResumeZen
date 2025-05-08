import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilSquareIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export default function ProfileCard({ user, onEdit }) {
  const { updateProfile } = useAuth();
  
  // Extract first name from the full name
  const firstName = user.name ? user.name.split(' ')[0] : 'User';
  
  // State for profile photo
  const [profilePhoto, setProfilePhoto] = useState(user.profilePicture || null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const fileInputRef = useRef(null);
  
  // Determine plan name for display
  const getPlanDisplayName = (userData) => {
    // Check for various plan name fields and handle them
    const plan = userData.plan || userData.currentPlan || 'No Plan';
    
    // Handle specific cases
    if (!plan || plan.toLowerCase() === 'no plan') {
      return 'No Plan';
    }
    
    // Format plan name to be more readable
    // - First letter capitalized, rest lowercase
    // - Remove special characters and underscores
    return plan
      .replace(/[-_]/g, ' ')
      .replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
  };
  
  // Handle photo upload
  const handlePhotoUpload = async (e) => {
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
      
      try {
        setIsUploading(true);
        
        // If valid, set the profile photo
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageData = e.target.result;
          setProfilePhoto(imageData);
          
          // TODO: In a real application, you would upload this file to a server
          // and get back a URL to store. For now, we'll just pretend we updated it.
          try {
            await updateProfile({ profilePicture: imageData });
          } catch (error) {
            console.error('Error updating profile picture:', error);
            setPhotoError('Failed to update profile picture');
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error handling file upload:', error);
        setPhotoError('Error processing image');
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return 'Not provided';
    
    // Simple US phone formatting
    if (phone.startsWith('+1') && phone.length === 12) {
      return `(${phone.substring(2, 5)}) ${phone.substring(5, 8)}-${phone.substring(8)}`;
    }
    
    return phone;
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
              {isUploading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <CameraIcon className="w-6 h-6 text-white" />
              )}
            </motion.div>
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".jpg,.jpeg,.png"
              onChange={handlePhotoUpload}
              disabled={isUploading}
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
        
        <motion.button 
          onClick={onEdit} 
          className="flex items-center gap-2 text-primary hover:text-primary-dark whitespace-nowrap flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PencilSquareIcon className="w-5 h-5" />
          <span>Edit Profile</span>
        </motion.button>
      </div>
      
      <div className="space-y-4 w-full">
        <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
          <p className="text-gray-600">Email</p>
          <p className="font-medium truncate">{user.email || 'Not provided'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
          <p className="text-gray-600">Phone</p>
          <p className="font-medium truncate">{formatPhone(user.phone)}</p>
        </div>
        <div className="bg-primary/5 rounded-lg p-4 overflow-hidden">
          <p className="text-primary font-semibold">Current Plan</p>
          <p className="text-lg font-bold truncate capitalize">
            {getPlanDisplayName(user)}
          </p>
          {((user.plan && user.plan !== 'no plan') || (user.currentPlan && user.currentPlan !== 'no plan')) && 
           !user.hasUnlimitedChecks && 
           user.remainingChecks !== undefined && (
            <p className="text-sm text-gray-600 mt-1">
              {user.remainingChecks} checks remaining
            </p>
          )}
          {user.hasUnlimitedChecks && (
            <p className="text-sm text-primary font-medium mt-1">
              Unlimited checks
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 