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
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import jobsSeed from '../src/data/jobs.js';
import workersSeed from '../src/data/applicants.js';
import { resolveLocation, OLONGAPO_CENTER } from '../src/lib/olongapoBarangays.js';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

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
 * Map a /data/jobs.js record into a Firestore /jobs document.
 * Sets postedBy / postedByName so the homeowner UI can filter by uid.
 */
function buildJobDoc(seed, postedByUid, postedByName) {
  const point = resolveLocation(seed.location) || {
    ...OLONGAPO_CENTER,
    barangay: null,
  };
  return {
    id: seed.id,
    title: seed.title,
    category: seed.category,
    description: seed.description,
    requiredSkills: seed.requiredSkills || [],
    status: seed.status,
    urgency: seed.urgency || 'Normal',
    type: seed.type || 'Scheduled',
    budget: seed.budget || null,
    schedule: seed.schedule || null,
    clientName: seed.clientName || postedByName || null,
    matchedWorkers: seed.matchedWorkers ?? 0,
    postedAt: seed.postedAt || null,
    location: {
      lat: point.lat,
      lng: point.lng,
      barangay: point.barangay,
      label: seed.location || null,
    },
    postedBy: postedByUid || null,
    postedByName: postedByName || seed.clientName || null,
    confirmedWorkerId: null,
    confirmedWorkerName: null,
    agreement: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isSeed: true,
  };
}

/**
 * Map a /data/applicants.js record into a Firestore /worker_profiles document.
 * `docId` lets callers override the document id (we key the 3 logged-in
 * seed workers by their actual auth uid so the app can find their profile).
 */
function buildWorkerProfileDoc(seed, { docId, uid, email, verificationLevel } = {}) {
  const point = resolveLocation(seed.location) || {
    ...OLONGAPO_CENTER,
    barangay: null,
  };
  // For demo seed accounts, the level overrides the cold-start `verified`
  // flag so the homeowner-side ApplicantCard mirrors the trust tier.
  const verified =
    verificationLevel != null ? verificationLevel === 'full' : !!seed.verified;
  return {
    docId: docId || seed.id,
    payload: {
      id: docId || seed.id,
      uid: uid || null,
      email: email || null,
      name: seed.name,
      experienceLevel: seed.experienceLevel,
      yearsExperience: seed.yearsExperience,
      skills: seed.skills || [],
      certifications: seed.certifications || [],
      availability: seed.availability || [],
      preferredCategories: seed.preferredCategories || [],
      rating: seed.rating ?? null,
      jobsCompleted: seed.jobsCompleted ?? 0,
      completionRate: seed.completionRate ?? 0,
      verified,
      verificationLevel: verificationLevel || (seed.verified ? 'full' : 'none'),
      moderationStatus: seed.moderationStatus || 'active',
      location: {
        lat: point.lat,
        lng: point.lng,
        barangay: point.barangay,
        label: seed.location || null,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isSeed: true,
    },
  };
}

async function seedDocs(db, name, items) {
  console.log(`\nSeeding /${name} (${items.length} documents)`);
  const colRef = collection(db, name);
  const existing = await getDocs(colRef);
  const existingIds = new Set(existing.docs.map((d) => d.id));

  let created = 0;
  let skipped = 0;
  for (const { docId, payload } of items) {
    if (existingIds.has(docId)) {
      skipped += 1;
      continue;
    }
     
    await setDoc(doc(db, name, docId), payload);
    created += 1;
  }
  console.log(`  = existing: ${skipped}    + created: ${created}`);
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

  // Sign in as admin once and seed all non-user collections.
  // Admin is allowed to write to /jobs, /worker_profiles, and /applications
  // by Firestore rules, which keeps seeding simple.
  const adminCred = await signInWithEmailAndPassword(auth, 'admin@hwe.test', 'Admin123!');
  const adminUid = adminCred.user.uid;

  // Build clientName -> uid lookup so we can wire seed jobs to real
  // homeowner accounts where their names match.
  const homeownerUidByName = {};
  for (const acc of ACCOUNTS) {
    if (acc.role === 'homeowner' && uidByEmail[acc.email]) {
      homeownerUidByName[acc.fullName] = uidByEmail[acc.email];
    }
  }

  // 2. Jobs — assign each job to the matching homeowner uid when we can,
  // fall back to admin so the cold-start pool stays browseable.
  const jobItems = jobsSeed.map((j) => {
    const ownerUid = homeownerUidByName[j.clientName] || adminUid;
    const ownerName = j.clientName || (ownerUid === adminUid ? 'PESO Olongapo' : null);
    return {
      docId: j.id,
      payload: buildJobDoc(j, ownerUid, ownerName),
    };
  });
  await seedDocs(db, 'jobs', jobItems);

  // 3. Worker profiles — three are keyed by real auth uids so the worker
  // dashboard finds them; the rest live under their wrk-XXX seed ids
  // purely so the admin heatmap / candidates pool stays populated.
  const seedWorkerByEmail = {
    'rafael.worker@hwe.test': 'wrk-201',
    'jessa.worker@hwe.test': 'wrk-202',
    'mark.worker@hwe.test': 'wrk-203',
  };

  const profileItems = [];
  const usedSeedIds = new Set();
  const accountByEmail = Object.fromEntries(ACCOUNTS.map((a) => [a.email, a]));
  for (const [email, seedId] of Object.entries(seedWorkerByEmail)) {
    const uid = uidByEmail[email];
    const seed = workersSeed.find((w) => w.id === seedId);
    if (!uid || !seed) continue;
    const level = accountByEmail[email]?.verificationLevel || 'none';
    profileItems.push(
      buildWorkerProfileDoc(seed, {
        docId: uid,
        uid,
        email,
        verificationLevel: level,
      })
    );
    usedSeedIds.add(seedId);
  }
  // Cold-start pool — extra mock workers visible to homeowners but not
  // tied to a real auth account.
  for (const seed of workersSeed) {
    if (usedSeedIds.has(seed.id)) continue;
    profileItems.push(buildWorkerProfileDoc(seed));
  }
  await seedDocs(db, 'worker_profiles', profileItems);

  // Re-runnable demo-tier sync: even when /users and /worker_profiles
  // already exist from a previous seed, force the demo accounts'
  // verificationLevel / verified flags to match the latest ACCOUNTS
  // table. Uses merge:true so unrelated fields the dev edited stay.
  console.log('\nSyncing demo verification levels (merge):');
  for (const account of ACCOUNTS) {
    const uid = uidByEmail[account.email];
    if (!uid) continue;
    const level = account.verificationLevel || 'none';
    await setDoc(
      doc(db, 'users', uid),
      { verificationLevel: level, updatedAt: serverTimestamp() },
      { merge: true }
    );
    if (account.role === 'informal_worker') {
      await setDoc(
        doc(db, 'worker_profiles', uid),
        {
          verified: level === 'full',
          verificationLevel: level,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
    console.log(`  = ${account.email.padEnd(30)} -> ${level}`);
  }

  // 4. Applications — pair each logged-in worker with the matching
  // homeowner's open job so the e2e flow has data on first login.
  const sampleApplications = [
    {
      email: 'rafael.worker@hwe.test',
      jobId: 'job-101', // Maria's Plumbing
    },
    {
      email: 'jessa.worker@hwe.test',
      jobId: 'job-102', // JR's Electrical
    },
    {
      email: 'mark.worker@hwe.test',
      jobId: 'job-103', // GreenVille's Welding
    },
  ].filter((s) => uidByEmail[s.email]);

  const appItems = [];
  for (const sample of sampleApplications) {
    const workerUid = uidByEmail[sample.email];
    const job = jobsSeed.find((j) => j.id === sample.jobId);
    if (!workerUid || !job) continue;
    const seedWorkerId = seedWorkerByEmail[sample.email];
    const seedWorker = workersSeed.find((w) => w.id === seedWorkerId);
    const clientUid = homeownerUidByName[job.clientName] || adminUid;
    const id = `app-${job.id}-${workerUid}`;
    appItems.push({
      docId: id,
      payload: {
        id,
        jobId: job.id,
        workerId: workerUid,
        workerName: seedWorker?.name || sample.email,
        workerSkills: seedWorker?.skills || [],
        clientId: clientUid,
        clientName: job.clientName || null,
        jobTitle: job.title,
        status: 'pending',
        message: null,
        proposedAgreement: null,
        proposedBy: null,
        confirmedByClient: false,
        confirmedByWorker: false,
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isSeed: true,
      },
    });
  }
  await seedDocs(db, 'applications', appItems);

  await signOut(auth);

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
