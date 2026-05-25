import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { deleteUser } from 'firebase/auth';
import axios from 'axios';
import { 
  CheckCircleIcon, UserCircleIcon, LinkIcon, BriefcaseIcon, 
  ShieldCheckIcon, IdentificationIcon, CameraIcon, TrashIcon 
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardProfileEdit() {
  const { currentUser, setCurrentUser, updateProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    occupation: '',
    graduationYear: '',
    linkedin: '',
    github: '',
    website: '',
    bio: '',
    avatarUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [toastMessage, setToastMessage] = useState('');
  
  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.name || '',
        email: currentUser.email || '',
        mobileNumber: currentUser.phone || '',
        occupation: currentUser.occupation || '',
        graduationYear: currentUser.graduationYear || '',
        linkedin: currentUser.linkedin || '',
        github: currentUser.github || '',
        website: currentUser.website || '',
        bio: currentUser.bio || '',
        avatarUrl: currentUser.avatarUrl || ''
      });
    }
  }, [currentUser]);

  const isValidPhone = (value) => /^\+?\d*$/.test(value);
  const isValidUrl = (value) => {
    if (!value) return true;
    try { new URL(value); return true; } catch { return false; }
  };
  const isValidGradYear = (value) => /^[\d\syearsxperience\/]*$/i.test(value);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobileNumber' && !isValidPhone(value)) return;
    if (name === 'graduationYear' && !isValidGradYear(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setAvatarUploading(true);
    setError('');
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);

      const response = await axios.post('/api/profile/avatar', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setFormData(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));
        if (setCurrentUser) {
          setCurrentUser(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));
        }
        showToast('Avatar updated successfully!');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // The backend now securely deletes both MongoDB data and the Firebase user
      await axios.delete('/api/profile');
      logout();
    } catch (err) {
      console.error(err);
      setError('Failed to delete account completely. Please contact support.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:bg-white/10 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all duration-300 backdrop-blur-sm";
  const labelClass = "block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider";

  return (
    <div className="space-y-8 relative z-10 w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 font-display tracking-tight">Profile Settings</h1>
          <p className="text-base text-zinc-400 mt-2 font-light">Manage your personal information, career details, and web links</p>
        </div>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-medium text-red-400 backdrop-blur-md mb-6">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {submitSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="px-8 py-6 bg-[#1a1a24] border border-emerald-500/30 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.2)] flex flex-col items-center gap-3"
            >
              <div className="h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mb-2">
                <CheckCircleIcon className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-display tracking-tight">Profile Updated</h3>
              <p className="text-sm text-zinc-400">Your changes have been saved successfully.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: 50, x: '-50%' }} 
            className="fixed bottom-10 left-1/2 z-50 px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-full shadow-2xl text-sm font-medium text-white backdrop-blur-md"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form */}
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative w-full"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* --- GENERAL SECTION --- */}
        <div className="p-6 sm:p-10 relative z-10 border-b border-white/5">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
            <IdentificationIcon className="h-6 w-6 text-violet-400" />
            <h3 className="text-xl font-bold text-zinc-100 font-display">General Information</h3>
          </div>

          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
            <div className="relative group shrink-0">
              <div className="h-24 w-24 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex items-center justify-center">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircleIcon className="h-16 w-16 text-zinc-500" />
                )}
              </div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer disabled:opacity-100"
              >
                {avatarUploading ? (
                  <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CameraIcon className="h-6 w-6 text-white mb-1" />
                    <span className="text-[10px] text-white font-medium uppercase tracking-wider">Change</span>
                  </>
                )}
              </button>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200 mb-1">Profile Photo</h4>
              <p className="text-xs text-zinc-500 mb-3 max-w-sm">We recommend an image of at least 300x300. Max size 2MB.</p>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={avatarUploading}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 disabled:opacity-50"
              >
                {avatarUploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="fullName" className={labelClass}>Full Name</label>
              <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} onBlur={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value.trim() }))} className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} className={`${inputClass} text-zinc-500 cursor-not-allowed bg-black/20`} disabled />
            </div>
            <div>
              <label htmlFor="mobileNumber" className={labelClass}>Phone Number</label>
              <input type="text" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={inputClass} placeholder="+1 (123) 456-7890" />
            </div>
          </div>
        </div>

        {/* --- PROFESSIONAL SECTION --- */}
        <div className="p-6 sm:p-10 relative z-10 border-b border-white/5">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
            <BriefcaseIcon className="h-6 w-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-zinc-100 font-display">Professional Background</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="occupation" className={labelClass}>Current Role / Occupation</label>
              <input type="text" id="occupation" name="occupation" value={formData.occupation} onChange={handleInputChange} onBlur={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value.trim() }))} className={inputClass} placeholder="e.g. Senior Software Engineer" />
            </div>
            <div>
              <label htmlFor="graduationYear" className={labelClass}>Experience / Graduation</label>
              <input type="text" id="graduationYear" name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} onBlur={e => { if (!isValidGradYear(e.target.value)) setError('Invalid format'); else setError(''); }} className={inputClass} placeholder="e.g. 5 years OR 2022" />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6 pt-6 border-t border-white/5">
            <LinkIcon className="h-5 w-5 text-emerald-400" />
            <h4 className="text-lg font-bold text-zinc-100 font-display">Web Links</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div>
              <label htmlFor="linkedin" className={labelClass}>LinkedIn</label>
              <input type="url" id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleInputChange} onBlur={e => { if (!isValidUrl(e.target.value)) setError('Invalid LinkedIn URL'); else setError(''); }} className={inputClass} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label htmlFor="github" className={labelClass}>GitHub</label>
              <input type="url" id="github" name="github" value={formData.github} onChange={handleInputChange} onBlur={e => { if (!isValidUrl(e.target.value)) setError('Invalid GitHub URL'); else setError(''); }} className={inputClass} placeholder="https://github.com/..." />
            </div>
            <div>
              <label htmlFor="website" className={labelClass}>Portfolio / Website</label>
              <input type="url" id="website" name="website" value={formData.website} onChange={handleInputChange} onBlur={e => { if (!isValidUrl(e.target.value)) setError('Invalid URL'); else setError(''); }} className={inputClass} placeholder="https://yourwebsite.com" />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <label htmlFor="bio" className={labelClass}>Professional Bio</label>
            <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} onBlur={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value.trim() }))} rows="4" className={`${inputClass} resize-y min-h-[100px]`} placeholder="Tell us a little bit about yourself and your career goals..." />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-black/20 flex items-center justify-end gap-4 relative z-10">
          <button type="button" className="text-sm font-semibold text-zinc-400 hover:text-white px-5 py-2.5 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white text-sm font-bold px-8 py-3 rounded-xl shadow-glow-primary disabled:shadow-none transition-all duration-300 flex items-center justify-center min-w-[140px]"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </motion.form>

      {/* --- SECURITY & DANGER ZONE SECTION --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-[#131318]/80 backdrop-blur-xl border border-red-500/20 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-10 relative w-full mt-8"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheckIcon className="h-6 w-6 text-red-500" />
            <h3 className="text-xl font-bold text-red-500 font-display">Danger Zone</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-red-500/10">
            <div>
              <h4 className="text-base font-semibold text-red-400">Delete Account</h4>
              <p className="text-sm text-zinc-400 mt-2 max-w-xl leading-relaxed">Once you delete your account, there is no going back. All your data, uploaded resumes, and saved analysis information will be permanently removed.</p>
            </div>
            <button 
              type="button" 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="shrink-0 flex items-center gap-2 text-sm font-bold text-white transition-colors px-6 py-3 rounded-xl border border-red-500/30 bg-red-500/20 hover:bg-red-500/40 disabled:opacity-50 mt-4 sm:mt-0"
            >
              {isDeleting ? (
                 <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                 <TrashIcon className="h-5 w-5" />
              )}
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>

      {/* Gen Z Sad Delete Modal */}
      {createPortal(
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                className="px-8 py-8 bg-[#1a1a24] border border-red-500/30 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.2)] max-w-sm w-full flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
                
                <img 
                  src="https://media.giphy.com/media/L95W4wv8ncl9K/giphy.gif" 
                  alt="Sad cat" 
                  className="w-32 h-32 rounded-2xl object-cover mb-6 border-2 border-white/10 shadow-lg"
                />
                
                <h3 className="text-2xl font-black text-white font-display tracking-tight mb-2 uppercase">No cap?</h3>
                <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                  You're really gonna delete all your hard work? We'll miss you fr fr. 🥺 All your resumes and ATS scores will be gone forever into the void.
                </p>
                
                <div className="flex flex-col w-full gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    Nvm, I'm staying
                  </button>
                  <button 
                    type="button"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="w-full py-3.5 rounded-xl font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                  >
                    {isDeleting ? (
                      <div className="h-5 w-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                      'Yeah, delete it'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}