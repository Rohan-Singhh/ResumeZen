import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CameraIcon,
  TrashIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import Modal, { ModalHeader } from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import PageHeader from '../../components/ui/PageHeader';
import Field, { Input, Textarea } from '../../components/ui/Field';
import { useToast } from '../../components/ui/Toast';
import { ease, springSoft, duration } from '../../utils/motion';

// Form shape derived from the user record — also what Discard resets to
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

const isValidPhone = (value) => /^\+?\d*$/.test(value);
const isValidUrl = (value) => {
  if (!value) return true;
  try { new URL(value); return true; } catch { return false; }
};
const isValidGradYear = (value) => /^[\d\syearsxperience/]*$/i.test(value);

const URL_FIELDS = ['linkedin', 'github', 'website'];

/**
 * One settings group: what it is on the left, the controls on the right.
 * Stacks on narrow screens.
 */
function Group({ title, description, children }) {
  return (
    <section className="grid grid-cols-1 gap-x-12 gap-y-5 border-t border-line py-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <div>
        <h2 className="t-title">{title}</h2>
        {description && <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-faint">{description}</p>}
      </div>
      <div className="min-w-0 max-w-2xl">{children}</div>
    </section>
  );
}

export default function DashboardProfileEdit() {
  const { currentUser, setCurrentUser, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState(() => toForm(currentUser));
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (currentUser) setFormData(toForm(currentUser));
  }, [currentUser]);

  const savedForm = useMemo(() => toForm(currentUser), [currentUser]);
  const isDirty = JSON.stringify(formData) !== JSON.stringify(savedForm);
  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);

  const handleDiscard = () => {
    setFormData(savedForm);
    setFieldErrors({});
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Characters that can never be valid are simply not accepted
    if (name === 'mobileNumber' && !isValidPhone(value)) return;
    if (name === 'graduationYear' && !isValidGradYear(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear a field's error as soon as the user edits it again
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const trimOnBlur = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.trim() }));
  };

  const validateUrlOnBlur = (e) => {
    const { name, value } = e.target;
    setFieldErrors(prev => ({
      ...prev,
      [name]: isValidUrl(value) ? '' : 'Enter a full address, starting with https://',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Re-check the links: a field can be submitted without ever being blurred
    const urlErrors = Object.fromEntries(
      URL_FIELDS.map((name) => [name, isValidUrl(formData[name]) ? '' : 'Enter a full address, starting with https://'])
    );
    if (Object.values(urlErrors).some(Boolean)) {
      setFieldErrors(prev => ({ ...prev, ...urlErrors }));
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setJustSaved(true);
        toast('Changes saved');
        setTimeout(() => setJustSaved(false), 1600);
      } else {
        setError(result.error || "Your changes weren't saved. Please try again.");
      }
    } catch {
      setError("Your changes weren't saved. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('That image is over 2 MB. Choose a smaller one.');
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
        toast('Photo updated');
      }
    } catch (err) {
      console.error(err);
      setError("The photo didn't upload. Please try again.");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } catch {
      setIsLoggingOut(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // The backend deletes both the MongoDB data and the Firebase user
      await axios.delete('/api/profile');
      logout();
    } catch (err) {
      console.error(err);
      setError("Your account couldn't be deleted completely. Please contact support.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const bind = (name) => ({ name, value: formData[name], onChange: handleInputChange });

  return (
    <div>
      <PageHeader title="Profile" description="Your details, links and account." />

      <AnimatePresence>
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: ease.out }}
            className="overflow-hidden"
          >
            <div className="mb-6 flex items-start gap-2.5 rounded-md border border-bad/25 bg-bad/10 px-4 py-3">
              <ExclamationCircleIcon className="mt-px h-5 w-5 flex-shrink-0 text-bad" />
              <p className="text-sm leading-relaxed text-bad">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} noValidate>
        <Group title="Photo" description="Shown in the sidebar. A square image of at least 300 px works best.">
          <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              aria-label="Change profile photo"
              className="group relative flex-shrink-0 rounded-full"
            >
              <Avatar user={{ name: formData.fullName, avatarUrl: formData.avatarUrl }} size="h-20 w-20" text="text-2xl" />
              <span className={`absolute inset-0 flex items-center justify-center rounded-full bg-surface-sunken/75 text-ink transition-opacity duration-base ${avatarUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}>
                {avatarUploading ? <Spinner size={20} /> : <CameraIcon className="h-5 w-5" />}
              </span>
            </button>
            <div>
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} loading={avatarUploading}>
                Upload photo
              </Button>
              <p className="t-meta mt-2.5">PNG, JPG or WebP · up to 2 MB</p>
            </div>
          </div>
        </Group>

        <Group title="Personal" description="How you appear on your account.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Full name">
              {(p) => <Input {...p} {...bind('fullName')} type="text" autoComplete="name" onBlur={trimOnBlur} placeholder="Your name" />}
            </Field>
            <Field label="Phone">
              {(p) => <Input {...p} {...bind('mobileNumber')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+919876543210" />}
            </Field>
            <Field label="Email" hint="Comes from your Google account and can't be changed here." className="sm:col-span-2">
              {(p) => <Input {...p} type="email" value={formData.email} disabled readOnly />}
            </Field>
          </div>
        </Group>

        <Group title="Work" description="Used to greet you and to frame job matches.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Current role">
              {(p) => <Input {...p} {...bind('occupation')} type="text" autoComplete="organization-title" onBlur={trimOnBlur} placeholder="Backend Engineer" />}
            </Field>
            <Field label="Experience or graduation year" hint="For example “5 years” or “2022”.">
              {(p) => <Input {...p} {...bind('graduationYear')} type="text" placeholder="3 years" />}
            </Field>
          </div>
        </Group>

        <Group title="Links" description="Full addresses, starting with https://">
          <div className="grid gap-5">
            <Field label="LinkedIn" error={fieldErrors.linkedin}>
              {(p) => <Input {...p} {...bind('linkedin')} type="url" inputMode="url" onBlur={validateUrlOnBlur} placeholder="https://linkedin.com/in/you" />}
            </Field>
            <Field label="GitHub" error={fieldErrors.github}>
              {(p) => <Input {...p} {...bind('github')} type="url" inputMode="url" onBlur={validateUrlOnBlur} placeholder="https://github.com/you" />}
            </Field>
            <Field label="Portfolio or website" error={fieldErrors.website}>
              {(p) => <Input {...p} {...bind('website')} type="url" inputMode="url" onBlur={validateUrlOnBlur} placeholder="https://yoursite.com" />}
            </Field>
          </div>
        </Group>

        <Group title="About" description="A few lines on what you do and what you are looking for.">
          <Field label="Bio">
            {(p) => <Textarea {...p} {...bind('bio')} rows={4} onBlur={trimOnBlur} placeholder="Payments engineer, three years in. Looking for a platform role." />}
          </Field>
        </Group>

        {/* Save bar: only there when there is something to save, and it stays
            in reach however long the form is */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: springSoft }}
              exit={{ opacity: 0, y: 16, transition: { duration: duration.base, ease: ease.in } }}
              className="pointer-events-none sticky bottom-[5.25rem] z-20 flex justify-center pb-1 lg:bottom-6"
            >
              <div className="pointer-events-auto flex w-full max-w-xl items-center gap-3 rounded-lg border border-line-strong bg-surface-overlay py-2.5 pl-4 pr-2.5 shadow-e3">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warn" aria-hidden="true" />
                <p className="min-w-0 flex-1 truncate text-sm text-ink" role="status">
                  {hasFieldErrors ? 'Fix the highlighted fields to save' : 'Unsaved changes'}
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={handleDiscard} disabled={isSubmitting}>Discard</Button>
                <Button type="submit" size="sm" loading={isSubmitting} success={justSaved} disabled={hasFieldErrors}>Save changes</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <Group title="Account" description="You sign in with Google; there is no password to manage.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Signed in as</p>
            <p className="truncate text-[0.8125rem] text-ink-muted">{currentUser?.email}</p>
          </div>
          <Button variant="secondary" onClick={handleLogout} loading={isLoggingOut} className="flex-shrink-0 self-start sm:self-auto">
            <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </Group>

      <Group title="Delete account" description="This can't be undone.">
        <div className="flex flex-col gap-4 rounded-lg border border-bad/20 bg-bad/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-ink-muted">
            Permanently removes your account, every uploaded resume and every report.
          </p>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={isDeleting} className="flex-shrink-0 self-start sm:self-auto">
            <TrashIcon className="h-4 w-4" />
            Delete account
          </Button>
        </div>
      </Group>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        dismissible={!isDeleting}
        labelledBy="delete-account-title"
        maxWidth="max-w-sm"
      >
        <ModalHeader id="delete-account-title" icon={ExclamationTriangleIcon} tone="bad">
          Delete your account?
        </ModalHeader>
        <p className="t-body mb-6">
          Your account, resumes and reports will be deleted for good. This can&apos;t be undone.
        </p>
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="flex-1">
            Keep my account
          </Button>
          <Button variant="danger" onClick={confirmDelete} loading={isDeleting} className="flex-1">
            Delete account
          </Button>
        </div>
      </Modal>
    </div>
  );
}
