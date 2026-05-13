// Seed script for thesis simulation data.
//
// Run with:   npm run seed
// (which expands to:  node --env-file=.env scripts/seedTestAccounts.mjs)
//
// What this seeds:
//   1. /users           - 1 admin, 3 informal workers, 3 homeowners
//   2. /jobs            - sample job postings whose `postedBy` is a real seed homeowner uid
//   3. /worker_profiles - the 3 seed workers (keyed by their auth uid) plus
//                         a deeper pool of cold-start workers (keyed by wrk-XXX)
//   4. /applications    - real worker uid -> real homeowner job id, so the
//                         end-to-end matching/chat flow works on first login
//
// Idempotent: re-running skips existing auth users and existing docs.

import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  initializeApp as initializeAdminApp,
  applicationDefault,
  cert,
  getApps,
} from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import fs from 'node:fs';
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { resolveLocation } from '../src/lib/olongapoBarangays.js';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

let _adminAuth = null;
function getAdminAuthIfAvailable() {
  if (_adminAuth) return _adminAuth;

  const serviceJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const servicePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  try {
    const existing = getApps();
    const app =
      existing.length > 0
        ? existing[0]
        : serviceJson && serviceJson.trim()
          ? initializeAdminApp({ credential: cert(JSON.parse(serviceJson)) })
          : servicePath && servicePath.trim()
            ? initializeAdminApp({
                credential: cert(JSON.parse(fs.readFileSync(servicePath, 'utf8'))),
              })
            : initializeAdminApp({ credential: applicationDefault() });
    _adminAuth = getAdminAuth(app);
    return _adminAuth;
  } catch {
    // If admin credentials are not available (or ADC cannot be resolved),
    // seeding can still proceed; we just won't auto-mark Auth emails verified.
    return null;
  }
}

function buildVerification({ role, email, verificationLevel }) {
  const base = {
    role: role === 'homeowner' ? 'client' : 'service-provider',
    stage1: { mobile: null, email: email || null, otpVerifiedAt: null },
    stage2: {
      idSubmittedAt: null,
      selfieSubmittedAt: null,
      reviewStatus: 'not-started',
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: '',
      idImage: null,
      selfieImage: null,
    },
    stage3: { documents: [], documentBacked: false },
    stage4: { activatedAt: null, activatedBy: null },
  };

  const level = (verificationLevel || 'none').toLowerCase();

  // Homeowner trust tiers:
  // - partial: identity verified => "Trusted"
  // - full: identity + supporting docs => "Fully Trusted"
  if (role === 'homeowner') {
    if (level === 'partial' || level === 'full') {
      base.stage2.reviewStatus = 'reviewed';
      base.stage2.reviewedAt = serverTimestamp();
      base.stage2.reviewNote = 'Seeded verification';
    }
    if (level === 'full') {
      base.stage3.documentBacked = true;
      base.stage3.documents = [{ kind: 'seed', submittedAt: null, status: 'accepted' }];
    }
    return base;
  }

  // Worker access is enforced by Firestore rules (workerIsActivated()).
  // Only "full" should be activated by default.
  if (role === 'informal_worker') {
    if (level === 'partial' || level === 'full') {
      base.stage2.idSubmittedAt = serverTimestamp();
      base.stage2.selfieSubmittedAt = serverTimestamp();
      base.stage2.reviewStatus = level === 'full' ? 'reviewed' : 'pending';
      if (level === 'full') {
        base.stage2.reviewedAt = serverTimestamp();
        base.stage2.reviewNote = 'Seeded verification';
      }
    }
    if (level === 'full') {
      base.stage3.documentBacked = true;
      base.stage3.documents = [{ kind: 'seed', submittedAt: null, status: 'accepted' }];
      base.stage4.activatedAt = serverTimestamp();
      base.stage4.activatedBy = 'seed';
    }
  }

  return base;
}

// `verificationLevel` controls the demo trust-tier behaviour for each
// seed account. Mirrored client-side in src/data/demoVerification.js,
// which writes a matching local-storage record on first login so the
// VerificationCenter / TrustBadge / admin queues all reflect the level.
//   full     - Tier 4, fully verified (badge shows up).
//   partial  - Phone verified + ID submitted, awaiting admin review.
//   none     - Tier 0, brand-new account, nothing started.
const ACCOUNTS = [
  {
    email: 'admin@hwe.test',
    password: 'Admin123!',
    role: 'admin',
    fullName: 'PESO Olongapo Admin',
    location: 'East Bajac-bajac',
    verificationLevel: 'full',
  },
  // Informal workers — these uids back the worker side of the demo
  // (applying to jobs, chatting, agreeing). Their /worker_profiles
  // doc id == their auth uid so the matching engine can find them.
  {
    email: 'rafael.worker@hwe.test',
    password: 'Worker123!',
    role: 'informal_worker',
    fullName: 'Rafael Santos',
    location: 'Asinan',
    workerSeedId: 'wrk-201',
    verificationLevel: 'full',
  },
  {
    email: 'jessa.worker@hwe.test',
    password: 'Worker123!',
    role: 'informal_worker',
    fullName: 'Jessa Villanueva',
    location: 'Banicain',
    workerSeedId: 'wrk-202',
    verificationLevel: 'partial',
  },
  {
    email: 'mark.worker@hwe.test',
    password: 'Worker123!',
    role: 'informal_worker',
    fullName: 'Mark Dela Cruz',
    location: 'Barretto',
    workerSeedId: 'wrk-203',
    verificationLevel: 'none',
  },
  // Homeowners — these uids back jobs.postedBy. Each `clientName` in the
  // jobs.js seed that matches one of these gets its postedBy set to the
  // matching uid; everything else gets left as admin so the admin user
  // can demo the full job board if needed.
  {
    email: 'maria.home@hwe.test',
    password: 'Home123!',
    role: 'homeowner',
    fullName: 'Maria Santos',
    location: 'Mabayuan',
    verificationLevel: 'full',
  },
  {
    email: 'jr.home@hwe.test',
    password: 'Home123!',
    role: 'homeowner',
    fullName: 'JR Properties',
    location: 'New Cabalan',
    verificationLevel: 'partial',
  },
  {
    email: 'greenville.home@hwe.test',
    password: 'Home123!',
    role: 'homeowner',
    fullName: 'GreenVille HOA',
    location: 'Old Cabalan',
    verificationLevel: 'none',
  },
];

function assertEnv() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.error('Missing Firebase env vars:', missing.join(', '));
    console.error('Fill .env (use .env.example as a template) and try again.');
    process.exit(1);
  }
}

async function ensureAccount(auth, db, account) {
  const { email, password, role, fullName, location, verificationLevel } = account;

  let uid = null;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    uid = cred.user.uid;
    console.log(`  + Auth created   -> ${email}`);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      uid = cred.user.uid;
      console.log(`  = Auth exists    -> ${email}`);
    } else {
      console.error(`  ! Auth failed    -> ${email}: ${err.code || err.message}`);
      return null;
    }
  }

  // Mark seeded accounts as email-verified so they pass Firestore Rules immediately.
  const adminAuth = getAdminAuthIfAvailable();
  if (adminAuth) {
    try {
      await adminAuth.updateUser(uid, { emailVerified: true });
      console.log(`  + Email verified  -> ${email}`);
    } catch (err) {
      console.warn(
        `  ! Could not set emailVerified for ${email}: ${err?.message || err}. ` +
          `Check FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.`
      );
    }
  } else {
    console.warn(
      `  ! Could not set emailVerified for ${email}. ` +
        `Provide Admin credentials (FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH, or GOOGLE_APPLICATION_CREDENTIALS).`
    );
  }

  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    console.log(`  = Profile exists -> ${email} (role=${snap.data().role})`);
  } else {
    const point = resolveLocation(location);
    await setDoc(ref, {
      uid,
      email,
      fullName,
      role,
      location: location || null,
      coords: point ? { lat: point.lat, lng: point.lng } : null,
      barangay: point ? point.barangay : null,
      verificationLevel: verificationLevel || 'none',
      // Verification state now lives in /users.verification and is enforced by rules.
      verification: buildVerification({ role, email, verificationLevel }),
      createdAt: serverTimestamp(),
      isSeed: true,
    });
    console.log(
      `  + Profile wrote  -> ${email} (role=${role}, verification=${verificationLevel || 'none'})`
    );
  }

  await signOut(auth);
  return uid;
}

/**
 * Minimal seed mode: accounts only (no jobs/worker_profiles/applications).
 */

async function main() {
  assertEnv();

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`Project: ${firebaseConfig.projectId}\n`);

  // 1. Users (auth + /users profile)
  console.log(`Seeding ${ACCOUNTS.length} accounts:`);
  const uidByEmail = {};
  for (const account of ACCOUNTS) {
    console.log(`-> ${account.role.padEnd(16)} ${account.email}`);
     
    const uid = await ensureAccount(auth, db, account);
    if (uid) uidByEmail[account.email] = uid;
  }

  console.log('\nSeed complete.\n');
  console.log('Login credentials:');
  for (const a of ACCOUNTS) {
    console.log(`  ${a.role.padEnd(16)} ${a.email.padEnd(32)} ${a.password}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
