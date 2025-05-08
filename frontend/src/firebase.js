// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpUQXpKiouAGyLRSGN0iBm5VMhSy9ycWE",
  authDomain: "resumezen-7d5f2.firebaseapp.com",
  projectId: "resumezen-7d5f2",
  storageBucket: "resumezen-7d5f2.firebasestorage.app",
  messagingSenderId: "364411806872",
  appId: "1:364411806872:web:c83f6cb3f7c18aea109ced",
  measurementId: "G-WZVGPJ3F0V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
// Configure Google provider to select account (shows account chooser every time)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Use Firebase Auth Emulator for local development
// This will bypass the reCAPTCHA verification while testing
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  // Connect to Auth Emulator
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  console.log("Using Firebase Auth Emulator");
}

const analytics = getAnalytics(app);

export { auth, googleProvider };