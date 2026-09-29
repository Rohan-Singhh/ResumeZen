import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { useAuth, beginInteractiveLogin, endInteractiveLogin } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../App';
import { tapPress } from '../../utils/motion';

// Firebase error codes → messages a user can act on. Codes not listed here
// fall back to a generic message rather than leaking raw Firebase strings.
const FIREBASE_ERRORS = {
  'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups for this site and try again.',
  'auth/account-exists-with-different-credential': 'An account with this email already exists with a different sign-in method.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/unauthorized-domain': "Sign-in isn't enabled on this web address. Please use the main ResumeZen site.",
  'auth/too-many-requests': 'Too many attempts. Please wait a minute and try again.',
  'auth/internal-error': 'Google sign-in hit an internal error. Please try again.',
};

// The user dismissed the popup themselves — not an error worth shouting about
const SILENT_ERRORS = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

/**
 * Google sign-in button. Errors are reported through `onError` only, so the
 * Login page owns the single error banner (this component used to render its
 * own copy too, showing every message twice).
 */
export default function LoginOptions({ onError, onSuccessNavigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const { setLoading } = useLoading();
  const { login, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setLoading(true);
      onError?.('');

      // This path owns the backend handshake; tell AuthContext to stand down so
      // its onAuthStateChanged listener doesn't fire a duplicate exchange.
      beginInteractiveLogin();

      // Account-selection prompt is configured on the provider (see firebase.js)
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Optimistic UI: show the dashboard immediately while the backend syncs.
      setCurrentUser({
        name: user.displayName || 'User',
        email: user.email,
        _isOptimistic: true
      });

      if (onSuccessNavigation) {
        onSuccessNavigation();
      } else {
        navigate('/dashboard', { replace: true });
      }

      // Backend handshake in the background
      user.getIdToken().then(idToken => {
        return axios.post('/api/auth/google', { idToken });
      }).then(response => {
        login(response.data.user, response.data.token);
      }).catch(err => {
        console.error('Background backend sync failed:', err);
        // Any failure — not just 401/403 — leaves an optimistic user with no
        // backend token, so every dashboard request would fail silently. Roll
        // the session back and say why on the login page.
        const status = err.response?.status;
        const message = status === 401 || status === 403
          ? "We couldn't verify your Google account. Please try again."
          : "You're signed in with Google, but we couldn't reach our servers. Please try again in a moment.";
        setCurrentUser(null);
        navigate('/login', { replace: true, state: { authError: message } });
        auth.signOut().catch(() => {});
      }).finally(() => {
        endInteractiveLogin();
        setIsLoading(false);
        setLoading(false);
      });

    } catch (err) {
      endInteractiveLogin();
      setLoading(false);
      setIsLoading(false);

      if (SILENT_ERRORS.has(err.code)) return;

      console.error('Google sign in error:', err);
      onError?.(FIREBASE_ERRORS[err.code] || 'Sign-in failed. Please try again.');
    }
  }, [isLoading, navigate, login, setCurrentUser, onSuccessNavigation, onError, setLoading]);

  return (
    <div className="space-y-4">
      {/* The one action on the page, so it gets the one high-contrast surface
          (Google's light button style) instead of blending into the dark UI */}
      <motion.button
        whileTap={isLoading ? undefined : tapPress}
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white px-4 text-[15px] font-semibold text-zinc-900 shadow-[0_10px_30px_-12px_rgba(124,108,246,0.55)] transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-void disabled:cursor-wait disabled:opacity-70"
      >
        {isLoading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" aria-hidden="true" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{isLoading ? 'Signing in…' : 'Continue with Google'}</span>
      </motion.button>

      <p className="text-center text-xs leading-relaxed text-ink-faint">
        New here? Signing in creates your account. We only use your Google name, email and photo.
      </p>
    </div>
  );
}
