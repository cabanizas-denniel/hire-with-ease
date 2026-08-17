// Seed script for thesis simulation data.
//
// Run with:   npm run seed
// (which expands to:  node --env-file=.env scripts/seedTestAccounts.mjs)
//
// What this seeds:
//   1. /users           - 1 admin, 3 informal workers, 3 homeowners
//   2. /worker_profiles - the 3 demo workers (keyed by auth uid)
//   3. /jobs            - sample requests (Maria plumbing, JR electrical)
//
// Idempotent: re-running updates seed profiles and demo jobs still in Matching.

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
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        uid = cred.user.uid;
        console.log(`  = Auth exists    -> ${email}`);
      } catch (signInErr) {
        const adminAuth = getAdminAuthIfAvailable();
        if (adminAuth) {
          try {
            const record = await adminAuth.getUserByEmail(email);
            uid = record.uid;
            console.log(`  = Auth exists (admin lookup) -> ${email}`);
            console.warn(
              `    Password in seed file did not match. Using existing uid; sign in with the password you already set.`
            );
          } catch (lookupErr) {
            console.error(
              `  ! Auth exists but lookup failed -> ${email}: ${lookupErr.message || lookupErr}`
            );
            return null;
          }
        } else {
          console.error(
            `  ! Auth exists but password mismatch for ${email}. ` +
              `Update the seed password or provide Admin credentials so we can look up the uid.`
          );
          return null;
        }
      }
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
  const point = resolveLocation(location);
  const locationRecord = point
    ? {
        lat: point.lat,
        lng: point.lng,
        barangay: point.barangay,
        label: location,
      }
    : null;
  const payload = {
    uid,
    email,
    fullName,
    role,
    location: locationRecord || location || null,
    coords: point ? { lat: point.lat, lng: point.lng } : null,
    barangay: point ? point.barangay : null,
    locationDetails: location || null,
    verificationLevel: verificationLevel || 'none',
    verification: buildVerification({ role, email, verificationLevel }),
    isSeed: true,
  };
  if (snap.exists()) {
    await setDoc(ref, payload, { merge: true });
    console.log(`  = Profile updated -> ${email} (role=${role})`);
  } else {
    await setDoc(ref, {
      ...payload,
      createdAt: serverTimestamp(),
    });
    console.log(
      `  + Profile wrote  -> ${email} (role=${role}, verification=${verificationLevel || 'none'})`
    );
  }

  try {
    await signOut(auth);
  } catch {
    /* no client session if we used admin lookup */
  }
  return uid;
}

const WORKER_PROFILES_BY_EMAIL = {
  'rafael.worker@hwe.test': {
    skills: ['Plumbing', 'Pipe Fitting', 'Safety Compliance'],
    certifications: [{ label: 'TESDA NC II - Plumbing', type: 'tesda' }],
    availability: ['Mon-AM', 'Tue-AM', 'Wed-AM', 'Thu-AM', 'Fri-AM'],
    preferredCategories: ['Plumbing', 'General Maintenance'],
    experienceLevel: 'Senior',
    yearsExperience: 6,
    rating: 4.8,
    jobsCompleted: 47,
    completionRate: 96,
    verified: true,
  },
  'jessa.worker@hwe.test': {
    skills: ['Electrical', 'HVAC', 'Safety Compliance'],
    certifications: [{ label: 'TESDA NC II - Electrical Installation', type: 'tesda' }],
    availability: ['Mon-PM', 'Tue-PM', 'Wed-PM', 'Thu-PM', 'Sat-AM'],
    preferredCategories: ['Electrical Work', 'HVAC & Cooling'],
    experienceLevel: 'Mid',
    yearsExperience: 4,
    rating: 4.6,
    jobsCompleted: 31,
    completionRate: 94,
    verified: false,
  },
  'mark.worker@hwe.test': {
    skills: ['Welding', 'Metal Fabrication', 'General Labor'],
    certifications: [{ label: 'TESDA SMAW NC II', type: 'tesda' }],
    availability: ['Tue-AM', 'Wed-AM', 'Thu-AM', 'Fri-AM', 'Sat-AM'],
    preferredCategories: ['Welding & Fabrication', 'General Maintenance'],
    experienceLevel: 'Mid',
    yearsExperience: 3,
    rating: 4.5,
    jobsCompleted: 22,
    completionRate: 91,
    verified: false,
  },
};

async function seedWorkerProfiles(auth, db, uidByEmail) {
  console.log('\nSeeding worker profiles:');
  for (const account of ACCOUNTS.filter((a) => a.role === 'informal_worker')) {
    const uid = uidByEmail[account.email];
    const extras = WORKER_PROFILES_BY_EMAIL[account.email];
    if (!uid || !extras) continue;
    try {
      await signInWithEmailAndPassword(auth, account.email, account.password);
    } catch {
      console.warn(`  ! Skip ${account.email} (could not sign in to write profile)`);
      continue;
    }
    const point = resolveLocation(account.location);
    const ref = doc(db, 'worker_profiles', uid);
    await setDoc(
      ref,
      {
        id: uid,
        uid,
        email: account.email,
        name: account.fullName,
        location: point
          ? {
              lat: point.lat,
              lng: point.lng,
              barangay: point.barangay,
              label: account.location,
            }
          : { lat: null, lng: null, barangay: account.location, label: account.location },
        ...extras,
        moderationStatus: 'active',
        isSeed: true,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`  + ${account.fullName} (${account.email})`);
    try {
      await signOut(auth);
    } catch {
      /* ignore */
    }
  }
}

async function seedDemoJobs(auth, db, uidByEmail) {
  console.log('\nSeeding demo jobs:');
  const start = new Date();
  start.setDate(start.getDate() + ((4 - start.getDay() + 7) % 7 || 7));
  start.setHours(9, 0, 0, 0);
  const scheduleLabel = start.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const specs = [
    {
      accountEmail: 'maria.home@hwe.test',
      password: 'Home123!',
      job: {
        id: 'job-demo-kitchen-leak',
        title: 'Kitchen Sink Pipe Leak Repair',
        category: 'Plumbing',
        description:
          'Kitchen sink pipe is leaking under the cabinet. Need a plumber to replace the trap and check the joint.',
        requiredSkills: ['Plumbing', 'Pipe Fitting'],
        budget: 'PHP 500 - 1,000',
        postedByName: 'Maria Santos',
        postedByEmail: 'maria.home@hwe.test',
        postedByTrustTier: 4,
        barangay: 'Mabayuan',
      },
    },
    {
      accountEmail: 'jr.home@hwe.test',
      password: 'Home123!',
      job: {
        id: 'job-demo-outlet-rewire',
        title: 'Living room outlet not working',
        category: 'Electrical Work',
        description:
          'Two outlets on the living room wall stopped working. Need a licensed electrician to inspect and repair.',
        requiredSkills: ['Electrical', 'Safety Compliance'],
        budget: 'PHP 1,000 - 2,000',
        postedByName: 'JR Properties',
        postedByEmail: 'jr.home@hwe.test',
        postedByTrustTier: 2,
        barangay: 'New Cabalan',
      },
    },
  ];

  for (const spec of specs) {
    const uid = uidByEmail[spec.accountEmail];
    if (!uid) continue;
    try {
      await signInWithEmailAndPassword(auth, spec.accountEmail, spec.password);
    } catch {
      console.warn(`  ! Skip ${spec.job.id} (could not sign in as ${spec.accountEmail})`);
      continue;
    }
    const point = resolveLocation(spec.job.barangay);
    const ref = doc(db, 'jobs', spec.job.id);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.status && snap.data().status !== 'Matching') {
      console.log(`  = ${spec.job.id} exists (status=${snap.data().status}) — left as-is`);
      try {
        await signOut(auth);
      } catch {
        /* ignore */
      }
      continue;
    }
    const { barangay, ...jobFields } = spec.job;
    await setDoc(
      ref,
      {
        ...jobFields,
        postedBy: uid,
        status: 'Matching',
        type: 'Scheduled',
        urgency: 'Normal',
        schedule: scheduleLabel,
        scheduledStartAt: start.toISOString(),
        clientName: spec.job.postedByName,
        matchedWorkers: 0,
        engineMatches: [],
        engineMatchedWorkerIds: [],
        engineRanAt: null,
        photo: null,
        media: null,
        postedByMobile: null,
        confirmedWorkerId: null,
        confirmedWorkerName: null,
        agreement: null,
        isSeed: true,
        location: {
          lat: point.lat,
          lng: point.lng,
          barangay: point.barangay,
          label: `${barangay}, Olongapo City`,
        },
        postedAt: new Date().toISOString().slice(0, 10),
        updatedAt: serverTimestamp(),
        createdAt: snap.exists() ? snap.data().createdAt || serverTimestamp() : serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`  + ${spec.job.title}`);
    try {
      await signOut(auth);
    } catch {
      /* ignore */
    }
  }
}

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

  await seedWorkerProfiles(auth, db, uidByEmail);
  await seedDemoJobs(auth, db, uidByEmail);

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
