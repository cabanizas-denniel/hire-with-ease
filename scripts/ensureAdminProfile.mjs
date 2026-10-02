/**
 * Finish admin setup for a real Gmail after Auth user already exists.
 *
 * Prerequisites:
 *   1. Auth user exists (seed already created cabanizasdenniel@gmail.com)
 *   2. In Firebase Console → Authentication → Users → open that user
 *      → set "Email verified" to true (checkbox / edit)
 *
 * Then run:
 *   node --env-file=.env scripts/ensureAdminProfile.mjs
 */
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const email = process.env.ADMIN_EMAIL || 'cabanizasdenniel@gmail.com';
const password = process.env.ADMIN_PASSWORD || 'Admin123!';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  console.log(`Signing in as ${email}…`);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  if (!user.emailVerified) {
    console.error(
      '\nEmail is NOT verified yet.\n' +
        'Firebase Console → Authentication → Users → ' +
        `${email} → set Email verified = true\n` +
        'Then run this script again.\n',
    );
    await signOut(auth);
    process.exit(1);
  }

  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const payload = {
    uid: user.uid,
    email,
    fullName: 'PESO Olongapo Admin',
    role: 'admin',
    verificationLevel: 'full',
    updatedAt: serverTimestamp(),
  };

  if (snap.exists()) {
    await setDoc(ref, payload, { merge: true });
    console.log(`Updated Firestore users/${user.uid} with role=admin`);
  } else {
    await setDoc(ref, { ...payload, createdAt: serverTimestamp() });
    console.log(`Created Firestore users/${user.uid} with role=admin`);
  }

  await signOut(auth);
  console.log('\nDone. Sign in on the app with:');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
}

main().catch((err) => {
  console.error('Failed:', err.code || err.message || err);
  process.exit(1);
});
