import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';

// NEXT_PUBLIC_* values are public identifiers (not secrets). Security = Firestore rules + login.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'rizq-dcc33.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'rizq-dcc33',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'rizq-dcc33.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Users sign up with just a username + password. Firebase Auth needs an email-shaped id,
// so the username is mapped to a private placeholder address (no real mailbox involved).
const toEmail = (username: string) => `${username.trim().toLowerCase()}@users.rizq.app`;

function friendly(e: any): string {
  switch (e?.code) {
    case 'auth/email-already-in-use':
      return 'That username is already taken. Try another one.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Wrong username or password.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a minute and try again.';
    case 'auth/network-request-failed':
      return 'No internet connection. Check your network and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase yet (Authentication → Sign-in method).';
    case 'auth/invalid-email':
      return 'That username has characters that are not allowed.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function initCloud() {
  const w = window as any;
  if (w.RizqCloud) return;
  if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
    window.dispatchEvent(new Event('rizq-cloud-off'));
    return;
  }
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    w.RizqCloud = {
      signUp: async (username: string, password: string) => {
        try {
          await createUserWithEmailAndPassword(auth, toEmail(username), password);
          return { ok: true };
        } catch (e) {
          return { error: friendly(e) };
        }
      },
      logIn: async (username: string, password: string) => {
        try {
          await signInWithEmailAndPassword(auth, toEmail(username), password);
          return { ok: true };
        } catch (e) {
          return { error: friendly(e) };
        }
      },
      signOut: () => signOut(auth),
      onUser: (cb: (u: User | null) => void) => onAuthStateChanged(auth, cb),
      subscribe: (u: User, cb: (state: unknown) => void) =>
        onSnapshot(
          doc(db, 'users', u.uid),
          (snap) => {
            try {
              cb(snap.exists() ? JSON.parse(snap.data().state) : null);
            } catch (e) {
              console.warn(e);
              cb(null);
            }
          },
          (e) => console.warn(e),
        ),
      save: (u: User, state: { updated?: number }) =>
        setDoc(doc(db, 'users', u.uid), {
          state: JSON.stringify(state),
          updated: state.updated || Date.now(),
          username: (u.email || '').split('@')[0],
        }),
    };
    window.dispatchEvent(new Event('rizq-cloud'));
  } catch (e) {
    console.warn('Firebase failed to start', e);
    window.dispatchEvent(new Event('rizq-cloud-off'));
  }
}
