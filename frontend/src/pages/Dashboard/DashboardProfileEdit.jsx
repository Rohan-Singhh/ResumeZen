import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  CheckCircleIcon, UserCircleIcon, LinkIcon, BriefcaseIcon,
  ShieldCheckIcon, IdentificationIcon, CameraIcon, TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

// Form shape derived from the user record — also what Cancel resets to
const toForm = (user) => ({
  fullName: user?.name || '',
  email: user?.email || '',
  mobileNumber: user?.phone || '',
  occupation: user?.occupation || '',
  graduationYear: user?.graduationYear || '',
  linkedin: user?.linkedin || '',
  github: user?.github || '',
  website: user?.website || '',
  bio: user?.bio || '',
  avatarUrl: user?.avatarUrl || ''
});

export default function DashboardProfileEdit() {
  const { currentUser, setCurrentUser, updateProfile, logout } = useAuth();
  const [formData, setFormData] = useState(() => toForm(currentUser));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const [toastMessage, setToastMessage] = useState('');

  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (currentUser) setFormData(toForm(currentUser));
  }, [currentUser]);

  const savedForm = useMemo(() => toForm(currentUser), [currentUser]);
  const isDirty = JSON.stringify(formData) !== JSON.stringify(savedForm);

  // The Cancel button used to do nothing at all
  const handleCancel = () => {
    setFormData(savedForm);
    setError('');
  };

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

  const inputClass = "w-full bg-white/5 border border-line rounded-lg px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:bg-white/10 focus:ring-2 focus:ring-primary/20 outline-none transition-colors";
  const labelClass = "block text-xs font-medium text-ink-muted mb-2 uppercase tracking-wider";

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Profile</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Manage your personal information, career details, and web links.</p>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-400">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 24, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 24, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-50 rounded-full border border-line bg-surface-raised px-6 py-3 text-sm font-medium text-ink shadow-2xl"
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
        className="bg-surface border border-line rounded-xl overflow-hidden relative w-full"
      >

        {/* --- GENERAL SECTION --- */}
        <div className="p-6 sm:p-10 relative z-10 border-b border-white/5">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
            <IdentificationIcon className="h-5 w-5 text-ink-muted" />
            <h3 className="font-display text-lg font-semibold text-ink">General information</h3>
          </div>

          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
            <div className="relative group shrink-0">
              <div className="h-24 w-24 rounded-full bg-surface-raised border border-line overflow-hidden flex items-center justify-center">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircleIcon className="h-16 w-16 text-ink-faint" />
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
              <h4 className="text-sm font-semibold text-ink mb-1">Profile photo</h4>
              <p className="text-xs text-ink-faint mb-3 max-w-sm">We recommend an image of at least 300x300. Max size 2MB.</p>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={avatarUploading}
                className="text-xs font-semibold text-primary hover:text-primary-light transition-colors px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 disabled:opacity-50"
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
              <input type="email" id="email" name="email" value={formData.email} className={`${inputClass} text-ink-faint cursor-not-allowed bg-black/20`} disabled />
            </div>
            <div>
              <label htmlFor="mobileNumber" className={labelClass}>Phone Number</label>
              <input type="text" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={inputClass} placeholder="+91 98765 43210" />
            </div>
          </div>
        </div>

        {/* --- PROFESSIONAL SECTION --- */}
        <div className="p-6 sm:p-10 relative z-10 border-b border-white/5">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
            <BriefcaseIcon className="h-5 w-5 text-ink-muted" />
            <h3 className="font-display text-lg font-semibold text-ink">Professional background</h3>
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
            <LinkIcon className="h-5 w-5 text-ink-muted" />
            <h4 className="font-display text-base font-semibold text-ink">Web links</h4>
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
        <div className="flex items-center justify-end gap-3 border-t border-line bg-black/20 p-5">
          {/* Inline confirmation instead of the old full-screen overlay */}
          <AnimatePresence>
            {submitSuccess && (
              <motion.span
                role="status"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="mr-auto flex items-center gap-1.5 text-sm font-medium text-emerald-400"
              >
                <CheckCircleIcon className="h-4 w-4" /> Changes saved
              </motion.span>
            )}
          </AnimatePresence>
          <Button type="button" variant="ghost" onClick={handleCancel} disabled={!isDirty || isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isDirty || isSubmitting} className="min-w-[130px]">
            {isSubmitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </motion.form>

      {/* --- SECURITY & DANGER ZONE SECTION --- */}
      <section className="w-full rounded-xl border border-red-500/20 bg-surface p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <ShieldCheckIcon className="h-5 w-5 text-red-400" />
          <h3 className="font-display text-lg font-semibold text-ink">Danger zone</h3>
        </div>

        <div className="flex flex-col items-start justify-between gap-5 border-t border-line pt-5 sm:flex-row sm:items-center">
          <div>
            <h4 className="text-sm font-semibold text-red-400">Delete account</h4>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-muted">
              Permanently removes your account, uploaded resumes and every analysis. This can't be undone.
            </p>
          </div>
          <Button variant="danger" onClick={handleDeleteAccount} disabled={isDeleting} className="flex-shrink-0">
            <TrashIcon className="h-4 w-4" />
            Delete account
          </Button>
        </div>
      </section>

      {/* Delete account confirmation */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        dismissible={!isDeleting}
        labelledBy="delete-account-title"
        maxWidth="max-w-sm"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          </span>
          <h3 id="delete-account-title" className="font-display text-lg font-semibold text-ink">Delete account?</h3>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-ink-muted">
          This permanently deletes your account, resumes, and analysis history. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isDeleting} className="flex-1">
            {isDeleting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-red-500/30 border-t-red-500" />
            ) : (
              'Delete account'
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}