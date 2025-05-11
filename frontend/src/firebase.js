// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Check for development mode
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_REACT_APP_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use Firebase Auth Emulator for local development
if (isDevelopment) {
  // Connect to Auth Emulator
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  console.log("Using Firebase Auth Emulator");
  
  // When using emulator, disable app verification
  auth.settings.appVerificationDisabledForTesting = true;
  console.log("App verification disabled for testing in emulator mode");
}

// Set custom reCAPTCHA parameters if a key is provided
const recaptchaKey = import.meta.env.VITE_REACT_APP_RECAPTCHA_KEY;

// Handle reCAPTCHA configuration
if (!isDevelopment && recaptchaKey) {
  // In production, use reCAPTCHA key if provided
  console.log('Using custom reCAPTCHA key in production');
  
  // Configure reCAPTCHA parameters
  window.recaptchaParams = {
    size: 'invisible',
    badge: 'bottomright',
    sitekey: recaptchaKey
  };
}

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
// Configure Google provider to select account (shows account chooser every time)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize analytics in production only to avoid dev console errors
let analytics = null;
if (!isDevelopment) {
  analytics = getAnalytics(app);
}

export { auth, googleProvider };