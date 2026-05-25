import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import axios from 'axios';
import { 
  CheckCircleIcon, UserCircleIcon, LinkIcon, BriefcaseIcon, 
  ShieldCheckIcon, IdentificationIcon, CameraIcon, KeyIcon, TrashIcon 
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardProfileEdit() {
  const { currentUser, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
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
  
  // New refs and states for DB connection
  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load current user data
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

  // --- New Handlers for Real Features ---
  
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (e.g. 2MB max)
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
        showToast('Avatar updated successfully!');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setAvatarUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) return;
    try {
      await sendPasswordResetEmail(auth, formData.email);
      showToast(`Password reset link sent to ${formData.email}`);
    } catch (err) {
      console.error(err);
      setError('Failed to send password reset email.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      // 1. Delete from Firebase
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
      
      // 2. Delete from Backend DB
      await axios.delete('/api/profile');
      
      // 3. Logout client
      logout();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Please log out and log back in to verify your identity before deleting your account.');
      } else {
        setError('Failed to delete account. Please try again or contact support.');
      }
      setIsDeleting(false);
    }
  };

  // ----------------------------------------

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:bg-white/10 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all duration-300 backdrop-blur-sm";
  const labelClass = "block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider";

  const tabs = [
    { id: 'general', name: 'General', icon: IdentificationIcon },
    { id: 'professional', name: 'Professional', icon: BriefcaseIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  return (
    <div className="space-y-8 relative z-10 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 font-display tracking-tight">Profile Settings</h1>
          <p className="text-base text-zinc-400 mt-2 font-light">Manage your account details and preferences</p>
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

      {/* Toast */}
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="md:col-span-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-violet-400' : 'text-zinc-500'}`} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="md:col-span-9">
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            key={activeTab}
            className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative min-h-[400px]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* --- GENERAL TAB --- */}
            {activeTab === 'general' && (
              <div className="p-8 relative z-10 h-full">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                  <IdentificationIcon className="h-6 w-6 text-violet-400" />
                  <h3 className="text-xl font-bold text-zinc-100 font-display">General Information</h3>
                </div>

                {/* Avatar Section */}
                <div className="mb-10 flex items-center gap-6">
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
                  <div className="relative group">
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
                    <p className="text-xs text-zinc-500 mb-3 max-w-xs">We recommend an image of at least 300x300. Max size 2MB.</p>
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className={labelClass}>Full Name</label>
                    <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} onBlur={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value.trim() }))} className={inputClass} placeholder="John Doe" />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} className={`${inputClass} text-zinc-500 cursor-not-allowed bg-black/20`} disabled />
                    <p className="mt-2 text-[11px] text-zinc-500 font-medium">Email cannot be changed</p>
                  </div>
                  <div>
                    <label htmlFor="mobileNumber" className={labelClass}>Phone Number</label>
                    <input type="text" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={inputClass} placeholder="+1 (123) 456-7890" />
                  </div>
                </div>
              </div>
            )}

            {/* --- PROFESSIONAL TAB --- */}
            {activeTab === 'professional' && (
              <div className="p-8 relative z-10 h-full">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label htmlFor="linkedin" className={labelClass}>LinkedIn URL</label>
                    <input type="url" id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleInputChange} onBlur={e => { if (!isValidUrl(e.target.value)) setError('Invalid LinkedIn URL'); else setError(''); }} className={inputClass} placeholder="https://linkedin.com/in/username" />
                  </div>
                  <div>
                    <label htmlFor="github" className={labelClass}>GitHub URL</label>
                    <input type="url" id="github" name="github" value={formData.github} onChange={handleInputChange} onBlur={e => { if (!isValidUrl(e.target.value)) setError('Invalid GitHub URL'); else setError(''); }} className={inputClass} placeholder="https://github.com/username" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="website" className={labelClass}>Personal Portfolio / Website</label>
                    <input type="url" id="website" name="website" value={formData.website} onChange={handleInputChange} onBlur={e => { if (!isValidUrl(e.target.value)) setError('Invalid URL'); else setError(''); }} className={inputClass} placeholder="https://yourwebsite.com" />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <label htmlFor="bio" className={labelClass}>Professional Bio</label>
                  <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} onBlur={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value.trim() }))} rows="4" className={`${inputClass} resize-y min-h-[100px]`} placeholder="Tell us a little bit about yourself and your career goals..." />
                </div>
              </div>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === 'security' && (
              <div className="p-8 relative z-10 h-full">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                  <ShieldCheckIcon className="h-6 w-6 text-rose-400" />
                  <h3 className="text-xl font-bold text-zinc-100 font-display">Security & Account</h3>
                </div>

                {/* Password Section */}
                <div className="mb-10 pb-10 border-b border-white/5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                      <KeyIcon className="h-6 w-6 text-zinc-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-zinc-200">Change Password</h4>
                      <p className="text-sm text-zinc-500 mt-1 mb-4 max-w-md">We will send a password reset link to your registered email address. Follow the link to create a new secure password.</p>
                      <button 
                        type="button" 
                        onClick={handlePasswordReset}
                        className="text-sm font-semibold text-zinc-200 hover:text-white transition-colors px-5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                      >
                        Send Reset Link
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div>
                  <h4 className="text-base font-bold text-red-500 mb-4 uppercase tracking-wider text-xs">Danger Zone</h4>
                  <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-base font-semibold text-red-400">Delete Account</h4>
                      <p className="text-sm text-red-400/70 mt-1 max-w-md">Once you delete your account, there is no going back. All your data, resumes, and saved information will be permanently removed.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="shrink-0 flex items-center gap-2 text-sm font-bold text-white transition-colors px-6 py-3 rounded-xl border border-red-500/30 bg-red-500/20 hover:bg-red-500/40 disabled:opacity-50"
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
              </div>
            )}

            {/* Footer Actions - Only show if not on Security tab */}
            {activeTab !== 'security' && (
              <div className="p-6 bg-black/20 border-t border-white/5 flex items-center justify-end gap-4 relative z-10 mt-auto">
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
                    'Save Changes'
                  )}
                </button>
              </div>
            )}
          </motion.form>
        </div>
      </div>
    </div>
  );
}