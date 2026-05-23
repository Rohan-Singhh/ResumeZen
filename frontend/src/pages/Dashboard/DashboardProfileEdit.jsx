import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircleIcon, UserCircleIcon, LinkIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function DashboardProfileEdit() {
  const { currentUser, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    occupation: '',
    graduationYear: '',
    linkedin: '',
    github: '',
    website: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

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
        bio: currentUser.bio || ''
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

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:bg-white/10 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all duration-300 backdrop-blur-sm";
  const labelClass = "block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider";

  return (
    <div className="space-y-8 relative z-10 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-zinc-100 font-display tracking-tight">Profile Settings</h1>
        <p className="text-base text-zinc-400 mt-2 font-light">Manage your personal information and professional links</p>
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

      {/* Form */}
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Personal Info */}
          <div className="p-8 border-b border-white/5 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                <UserCircleIcon className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 font-display">Personal Information</h3>
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

          {/* Professional */}
          <div className="p-8 border-b border-white/5 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <BriefcaseIcon className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 font-display">Professional Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="occupation" className={labelClass}>Current Role / Occupation</label>
                <input type="text" id="occupation" name="occupation" value={formData.occupation} onChange={handleInputChange} onBlur={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value.trim() }))} className={inputClass} placeholder="e.g. Senior Software Engineer" />
              </div>
              <div>
                <label htmlFor="graduationYear" className={labelClass}>Experience / Graduation</label>
                <input type="text" id="graduationYear" name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} onBlur={e => { if (!isValidGradYear(e.target.value)) setError('Invalid format'); else setError(''); }} className={inputClass} placeholder="e.g. 5 years OR 2022" />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="p-8 border-b border-white/5 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <LinkIcon className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 font-display">Web Links</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          </div>

          {/* Bio */}
          <div className="p-8 relative z-10">
            <label htmlFor="bio" className={labelClass}>Professional Bio</label>
            <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} onBlur={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value.trim() }))} rows="4" className={`${inputClass} resize-y min-h-[100px]`} placeholder="Tell us a little bit about yourself and your career goals..." />
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-black/20 border-t border-white/5 flex items-center justify-end gap-4 relative z-10">
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

        </div>
      </motion.form>
    </div>
  );
}

// Needed for AnimatePresence
import { AnimatePresence } from 'framer-motion';