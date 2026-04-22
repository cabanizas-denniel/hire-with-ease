/**
 * Seed verification records for every worker (src/data/applicants.js)
 * and every client (src/data/clients.js).
 *
 * Record shape:
 * {
 *   role: 'service-provider' | 'client',
 *   stage1: {                       // Account creation + OTP
 *     mobile, email, otpVerifiedAt,
 *   },
 *   stage2: {                       // Identity submission + admin review
 *     idSubmittedAt, selfieSubmittedAt,
 *     reviewStatus: 'not-started' | 'pending' | 'reviewed' | 'rejected',
 *     reviewedBy, reviewedAt, reviewNote,
 *   },
 *   stage3: {                       // Supporting documents
 *     documents: [{ type, label, submittedAt, reviewed, note }],
 *     documentBacked: boolean,
 *   },
 *   stage4: {                       // Admin activation (providers) / trust bump (clients)
 *     activatedAt, activatedBy,
 *   },
 * }
 *
 * NOTE (prototype): ID/selfie/document "uploads" here are seeded as
 * timestamp-only placeholders. When we wire the real upload UI in M4 we will
 * store base64 data URIs for the currently-logged-in user in localStorage.
 * TODO: migrate those base64 blobs to real backend file storage before prod.
 */

const PESO = 'Maria Cruz (PESO)';

const s1 = (mobile, email, otpAt) => ({
  mobile,
  email: email || null,
  otpVerifiedAt: otpAt,
});

const s2Reviewed = (idAt, selfieAt, reviewedAt, note, reviewer = PESO) => ({
  idSubmittedAt: idAt,
  selfieSubmittedAt: selfieAt,
  reviewStatus: 'reviewed',
  reviewedBy: reviewer,
  reviewedAt,
  reviewNote: note,
});

const s2Pending = (idAt, selfieAt) => ({
  idSubmittedAt: idAt,
  selfieSubmittedAt: selfieAt,
  reviewStatus: 'pending',
  reviewedBy: null,
  reviewedAt: null,
  reviewNote: '',
});

const s2Rejected = (idAt, selfieAt, reviewedAt, note, reviewer = PESO) => ({
  idSubmittedAt: idAt,
  selfieSubmittedAt: selfieAt,
  reviewStatus: 'rejected',
  reviewedBy: reviewer,
  reviewedAt,
  reviewNote: note,
});

const s2Empty = () => ({
  idSubmittedAt: null,
  selfieSubmittedAt: null,
  reviewStatus: 'not-started',
  reviewedBy: null,
  reviewedAt: null,
  reviewNote: '',
});

const s3WithDocs = (documents, documentBacked = true) => ({
  documents,
  documentBacked,
});

const s3Empty = () => ({ documents: [], documentBacked: false });

const doc = (type, label, submittedAt, reviewed = true, note = '') => ({
  type,
  label,
  submittedAt,
  reviewed,
  note,
});

const s4Active = (at, by = PESO) => ({ activatedAt: at, activatedBy: by });
const s4Pending = () => ({ activatedAt: null, activatedBy: null });

/* -------------------------------------------------------------------------- */
/*  Service Providers (40)                                                     */
/* -------------------------------------------------------------------------- */

const workerVerification = {
  'wrk-201': {
    role: 'service-provider',
    stage1: s1('+63 917 201 1101', 'rafael.santos@example.com', '2025-04-02T08:12:00.000Z'),
    stage2: s2Reviewed(
      '2025-04-02T08:45:00.000Z',
      '2025-04-02T08:46:00.000Z',
      '2025-04-03T10:20:00.000Z',
      'ID and selfie match. Clear photos.'
    ),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Plumbing', '2025-04-02T09:00:00.000Z', true, 'Certification valid; name matches ID.'),
      doc('barangay', 'Barangay Clearance - Asinan', '2025-04-05T10:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-04-04T09:00:00.000Z'),
  },
  'wrk-202': {
    role: 'service-provider',
    stage1: s1('+63 917 202 2112', 'jessa.villanueva@example.com', '2025-05-12T13:00:00.000Z'),
    stage2: s2Reviewed('2025-05-12T13:30:00.000Z', '2025-05-12T13:31:00.000Z', '2025-05-13T14:10:00.000Z', 'Verified. TESDA cert visible on ID.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Electrical Installation', '2025-05-12T13:40:00.000Z', true),
    ]),
    stage4: s4Active('2025-05-14T09:00:00.000Z'),
  },
  'wrk-203': {
    role: 'service-provider',
    stage1: s1('+63 917 203 3245', null, '2025-06-18T09:00:00.000Z'),
    stage2: s2Reviewed('2025-06-18T09:30:00.000Z', '2025-06-18T09:31:00.000Z', '2025-06-20T11:15:00.000Z', 'Clear match.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA SMAW NC II', '2025-06-19T10:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-06-21T09:00:00.000Z'),
  },
  'wrk-204': {
    role: 'service-provider',
    stage1: s1('+63 917 204 4377', 'alyssa.reyes@example.com', '2026-04-10T11:00:00.000Z'),
    stage2: s2Pending('2026-04-11T13:20:00.000Z', '2026-04-11T13:22:00.000Z'),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'wrk-205': {
    role: 'service-provider',
    stage1: s1('+63 917 205 5490', 'noel.garcia@example.com', '2025-02-08T07:40:00.000Z'),
    stage2: s2Reviewed('2025-02-08T08:00:00.000Z', '2025-02-08T08:01:00.000Z', '2025-02-09T09:30:00.000Z', 'Two TESDA certs cross-checked. Excellent record.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Masonry', '2025-02-09T10:00:00.000Z', true),
      doc('tesda', 'TESDA NC II - Carpentry', '2025-02-09T10:05:00.000Z', true),
      doc('barangay', 'Barangay Clearance - East Tapinac', '2025-02-10T10:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-02-10T10:30:00.000Z'),
  },
  'wrk-206': {
    role: 'service-provider',
    stage1: s1('+63 917 206 6602', 'kevin.mendoza@example.com', '2025-07-25T14:00:00.000Z'),
    stage2: s2Reviewed('2025-07-25T14:20:00.000Z', '2025-07-25T14:21:00.000Z', '2025-07-27T10:00:00.000Z', 'ID verified.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - RAC Servicing', '2025-07-26T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-07-28T09:00:00.000Z'),
  },
  'wrk-207': {
    role: 'service-provider',
    stage1: s1('+63 917 207 7718', null, '2026-03-12T16:45:00.000Z'),
    stage2: s2Empty(),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'wrk-208': {
    role: 'service-provider',
    stage1: s1('+63 917 208 8831', 'benjie.torres@example.com', '2025-09-04T10:00:00.000Z'),
    stage2: s2Reviewed('2025-09-04T10:30:00.000Z', '2025-09-04T10:31:00.000Z', '2025-09-06T11:20:00.000Z', 'Match confirmed.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Electrical Installation', '2025-09-05T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-09-07T09:00:00.000Z'),
  },
  'wrk-209': {
    role: 'service-provider',
    stage1: s1('+63 917 209 9944', 'rhoda.ignacio@example.com', '2025-03-18T12:00:00.000Z'),
    stage2: s2Reviewed('2025-03-18T12:20:00.000Z', '2025-03-18T12:21:00.000Z', '2025-03-20T10:00:00.000Z', 'Clear match. Previous completed jobs logged.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Plumbing', '2025-03-19T09:00:00.000Z', true),
      doc('dole', 'DOLE Safety Officer 1', '2025-03-19T09:05:00.000Z', true),
    ]),
    stage4: s4Active('2025-03-21T09:00:00.000Z'),
  },
  'wrk-210': {
    role: 'service-provider',
    stage1: s1('+63 917 210 1057', null, '2025-07-05T08:30:00.000Z'),
    stage2: s2Reviewed('2025-07-05T08:45:00.000Z', '2025-07-05T08:46:00.000Z', '2025-07-07T10:00:00.000Z', 'Verified.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA SMAW NC II', '2025-07-06T09:00:00.000Z', true),
      doc('tesda', 'TESDA GTAW NC II', '2025-07-06T09:02:00.000Z', true),
    ]),
    stage4: s4Active('2025-07-08T09:00:00.000Z'),
  },
  'wrk-211': {
    role: 'service-provider',
    stage1: s1('+63 917 211 1168', 'liza.aquino@example.com', '2025-10-22T11:00:00.000Z'),
    stage2: s2Reviewed('2025-10-22T11:20:00.000Z', '2025-10-22T11:21:00.000Z', '2025-10-24T10:00:00.000Z', 'ID reviewed. Flagged later for delayed job completions.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Electrical Installation', '2025-10-23T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-10-25T09:00:00.000Z'),
  },
  'wrk-212': {
    role: 'service-provider',
    stage1: s1('+63 917 212 1275', null, '2025-08-14T09:00:00.000Z'),
    stage2: s2Reviewed('2025-08-14T09:20:00.000Z', '2025-08-14T09:21:00.000Z', '2025-08-16T10:00:00.000Z', 'Match confirmed.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Carpentry', '2025-08-15T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-08-17T09:00:00.000Z'),
  },
  'wrk-213': {
    role: 'service-provider',
    stage1: s1('+63 917 213 1386', 'angelica.domingo@example.com', '2025-11-02T13:00:00.000Z'),
    stage2: s2Reviewed('2025-11-02T13:20:00.000Z', '2025-11-02T13:21:00.000Z', '2025-11-04T10:00:00.000Z', 'Verified.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Painting', '2025-11-03T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-11-05T09:00:00.000Z'),
  },
  'wrk-214': {
    role: 'service-provider',
    stage1: s1('+63 917 214 1492', 'bernard.castillo@example.com', '2025-01-15T07:00:00.000Z'),
    stage2: s2Reviewed('2025-01-15T07:20:00.000Z', '2025-01-15T07:21:00.000Z', '2025-01-17T10:00:00.000Z', 'Senior technician. All creds in order.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - RAC Servicing', '2025-01-16T09:00:00.000Z', true),
      doc('dole', 'DOLE Safety Officer 2', '2025-01-16T09:05:00.000Z', true),
    ]),
    stage4: s4Active('2025-01-18T09:00:00.000Z'),
  },
  'wrk-215': {
    role: 'service-provider',
    stage1: s1('+63 917 215 1509', null, '2026-04-13T08:15:00.000Z'),
    stage2: s2Pending('2026-04-14T10:30:00.000Z', '2026-04-14T10:32:00.000Z'),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'wrk-216': {
    role: 'service-provider',
    stage1: s1('+63 917 216 1618', 'ferdinand.cruz@example.com', '2025-10-11T10:00:00.000Z'),
    stage2: s2Reviewed('2025-10-11T10:20:00.000Z', '2025-10-11T10:21:00.000Z', '2025-10-13T10:00:00.000Z', 'Verified.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Electrical Installation', '2025-10-12T09:00:00.000Z', true),
      doc('doe', 'DOE Solar PV Installer', '2025-10-12T09:05:00.000Z', true),
    ]),
    stage4: s4Active('2025-10-14T09:00:00.000Z'),
  },
  'wrk-217': {
    role: 'service-provider',
    stage1: s1('+63 917 217 1725', null, '2026-02-20T14:00:00.000Z'),
    stage2: s2Empty(),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'wrk-218': {
    role: 'service-provider',
    stage1: s1('+63 917 218 1833', 'edgar.ocampo@example.com', '2026-04-05T11:00:00.000Z'),
    stage2: s2Reviewed('2026-04-05T11:20:00.000Z', '2026-04-05T11:21:00.000Z', '2026-04-07T10:00:00.000Z', 'Identity confirmed.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Automotive Servicing', '2026-04-06T09:00:00.000Z', true, 'Cert valid and on file.'),
    ]),
    // Edgar has passed all reviews but admin hasn't yet flipped the activation switch.
    stage4: s4Pending(),
  },
  'wrk-219': {
    role: 'service-provider',
    stage1: s1('+63 917 219 1947', 'michelle.tan@example.com', '2026-03-28T09:00:00.000Z'),
    stage2: s2Reviewed('2026-03-28T09:20:00.000Z', '2026-03-28T09:21:00.000Z', '2026-03-30T10:00:00.000Z', 'Identity confirmed.'),
    stage3: s3WithDocs(
      [
        // Docs uploaded but admin has not yet reviewed -> shows up in Document Review queue.
        doc('barangay', 'Barangay Clearance - New Kalalake', '2026-04-10T09:00:00.000Z', false),
        doc('nbi', 'NBI Clearance', '2026-04-10T09:05:00.000Z', false),
      ],
      false
    ),
    stage4: s4Pending(),
  },
  'wrk-220': {
    role: 'service-provider',
    stage1: s1('+63 917 220 2056', 'roderick.flores@example.com', '2024-11-05T08:00:00.000Z'),
    stage2: s2Reviewed('2024-11-05T08:20:00.000Z', '2024-11-05T08:21:00.000Z', '2024-11-07T10:00:00.000Z', 'Verified pre-ban. Activation later revoked via moderation.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Heavy Equipment Operation (Backhoe Loader)', '2024-11-06T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2024-11-08T09:00:00.000Z'),
  },
  'wrk-221': {
    role: 'service-provider',
    stage1: s1('+63 917 221 2168', 'shirley.mercado@example.com', '2025-09-19T10:00:00.000Z'),
    stage2: s2Reviewed('2025-09-19T10:20:00.000Z', '2025-09-19T10:21:00.000Z', '2025-09-21T10:00:00.000Z', 'Verified.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Plumbing', '2025-09-20T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-09-22T09:00:00.000Z'),
  },
  'wrk-222': {
    role: 'service-provider',
    stage1: s1('+63 917 222 2279', 'jonathan.ramos@example.com', '2025-05-03T08:30:00.000Z'),
    stage2: s2Reviewed('2025-05-03T08:50:00.000Z', '2025-05-03T08:51:00.000Z', '2025-05-05T10:00:00.000Z', 'Cross-referenced with DOE solar installer registry.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Electrical Installation', '2025-05-04T09:00:00.000Z', true),
      doc('doe', 'DOE Solar PV Installer', '2025-05-04T09:05:00.000Z', true),
    ]),
    stage4: s4Active('2025-05-06T09:00:00.000Z'),
  },
  'wrk-223': {
    role: 'service-provider',
    stage1: s1('+63 917 223 2384', 'patricia.yap@example.com', '2025-08-01T12:00:00.000Z'),
    stage2: s2Reviewed('2025-08-01T12:20:00.000Z', '2025-08-01T12:21:00.000Z', '2025-08-03T10:00:00.000Z', 'Verified.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Painting', '2025-08-02T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-08-04T09:00:00.000Z'),
  },
  'wrk-224': {
    role: 'service-provider',
    stage1: s1('+63 917 224 2497', null, '2026-02-14T09:00:00.000Z'),
    stage2: s2Rejected(
      '2026-02-15T10:00:00.000Z',
      '2026-02-15T10:02:00.000Z',
      '2026-02-17T11:30:00.000Z',
      'ID photo appears altered. Selfie does not match ID. Applicant banned after additional complaints.'
    ),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'wrk-225': {
    role: 'service-provider',
    stage1: s1('+63 917 225 2501', 'melissa.cabrera@example.com', '2025-09-30T11:00:00.000Z'),
    stage2: s2Reviewed('2025-09-30T11:20:00.000Z', '2025-09-30T11:21:00.000Z', '2025-10-02T10:00:00.000Z', 'Verified.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - RAC Servicing', '2025-10-01T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-10-03T09:00:00.000Z'),
  },
  'wrk-226': {
    role: 'service-provider',
    stage1: s1('+63 917 226 2612', 'archie.lagman@example.com', '2025-02-25T08:00:00.000Z'),
    stage2: s2Reviewed('2025-02-25T08:20:00.000Z', '2025-02-25T08:21:00.000Z', '2025-02-27T10:00:00.000Z', 'Dual TESDA certs confirmed.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Carpentry', '2025-02-26T09:00:00.000Z', true),
      doc('tesda', 'TESDA NC II - Masonry', '2025-02-26T09:05:00.000Z', true),
    ]),
    stage4: s4Active('2025-02-28T09:00:00.000Z'),
  },
  'wrk-227': {
    role: 'service-provider',
    stage1: s1('+63 917 227 2725', 'jasmine.uy@example.com', '2026-03-10T14:00:00.000Z'),
    stage2: s2Reviewed('2026-03-10T14:20:00.000Z', '2026-03-10T14:21:00.000Z', '2026-03-12T10:00:00.000Z', 'Identity confirmed.'),
    stage3: s3WithDocs(
      [
        doc('tesda', 'TESDA NC II - Tile Setting', '2026-04-12T09:00:00.000Z', false),
      ],
      false
    ),
    stage4: s4Pending(),
  },
  'wrk-228': {
    role: 'service-provider',
    stage1: s1('+63 917 228 2837', 'crisanto.buenviaje@example.com', '2025-06-11T08:00:00.000Z'),
    stage2: s2Reviewed('2025-06-11T08:20:00.000Z', '2025-06-11T08:21:00.000Z', '2025-06-13T10:00:00.000Z', 'Verified.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Carpentry', '2025-06-12T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-06-14T09:00:00.000Z'),
  },
  'wrk-229': {
    role: 'service-provider',
    stage1: s1('+63 917 229 2948', 'lorna.padilla@example.com', '2025-04-18T10:00:00.000Z'),
    stage2: s2Reviewed('2025-04-18T10:20:00.000Z', '2025-04-18T10:21:00.000Z', '2025-04-20T10:00:00.000Z', 'Solar installer creds cross-checked.'),
    stage3: s3WithDocs([
      doc('doe', 'DOE Solar PV Installer', '2025-04-19T09:00:00.000Z', true),
      doc('dole', 'DOLE Safety Officer 1', '2025-04-19T09:05:00.000Z', true),
    ]),
    stage4: s4Active('2025-04-21T09:00:00.000Z'),
  },
  'wrk-230': {
    role: 'service-provider',
    stage1: s1('+63 917 230 3051', 'renato.agustin@example.com', '2025-12-02T11:00:00.000Z'),
    stage2: s2Reviewed('2025-12-02T11:20:00.000Z', '2025-12-02T11:21:00.000Z', '2025-12-04T10:00:00.000Z', 'Verified. Flagged later for two late no-shows.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Plumbing', '2025-12-03T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-12-05T09:00:00.000Z'),
  },
  'wrk-231': {
    role: 'service-provider',
    stage1: s1('+63 917 231 3164', null, null),
    stage2: s2Empty(),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'wrk-232': {
    role: 'service-provider',
    stage1: s1('+63 917 232 3277', 'armando.dizon@example.com', '2024-08-14T09:00:00.000Z'),
    stage2: s2Reviewed('2024-08-14T09:20:00.000Z', '2024-08-14T09:21:00.000Z', '2024-08-16T10:00:00.000Z', 'Long-standing tradesman, two TESDA certs on file.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Masonry', '2024-08-15T09:00:00.000Z', true),
      doc('tesda', 'TESDA NC II - Tile Setting', '2024-08-15T09:05:00.000Z', true),
    ]),
    stage4: s4Active('2024-08-17T09:00:00.000Z'),
  },
  'wrk-233': {
    role: 'service-provider',
    stage1: s1('+63 917 233 3381', 'bella.morales@example.com', '2025-11-15T11:00:00.000Z'),
    stage2: s2Reviewed('2025-11-15T11:20:00.000Z', '2025-11-15T11:21:00.000Z', '2025-11-17T10:00:00.000Z', 'Verified.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Painting', '2025-11-16T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-11-18T09:00:00.000Z'),
  },
  'wrk-234': {
    role: 'service-provider',
    stage1: s1('+63 917 234 3492', 'dennis.escobar@example.com', '2025-10-05T10:00:00.000Z'),
    stage2: s2Reviewed('2025-10-05T10:20:00.000Z', '2025-10-05T10:21:00.000Z', '2025-10-07T10:00:00.000Z', 'Verified. Flagged later after quality complaint.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA SMAW NC II', '2025-10-06T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-10-08T09:00:00.000Z'),
  },
  'wrk-235': {
    role: 'service-provider',
    stage1: s1('+63 917 235 3505', 'yolanda.gabriel@example.com', '2024-12-11T08:00:00.000Z'),
    stage2: s2Reviewed('2024-12-11T08:20:00.000Z', '2024-12-11T08:21:00.000Z', '2024-12-13T10:00:00.000Z', 'DOLE safety credentials on file.'),
    stage3: s3WithDocs([
      doc('dole', 'DOLE Safety Officer 2', '2024-12-12T09:00:00.000Z', true),
      doc('dole', 'DOLE Construction Safety', '2024-12-12T09:05:00.000Z', true),
    ]),
    stage4: s4Active('2024-12-14T09:00:00.000Z'),
  },
  'wrk-236': {
    role: 'service-provider',
    stage1: s1('+63 917 236 3618', null, '2026-01-30T09:00:00.000Z'),
    stage2: s2Rejected(
      '2026-01-31T10:00:00.000Z',
      '2026-01-31T10:02:00.000Z',
      '2026-02-02T11:30:00.000Z',
      'Selfie blurred, ID unreadable. Asked to resubmit; multiple no-shows recorded afterwards.'
    ),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'wrk-237': {
    role: 'service-provider',
    stage1: s1('+63 917 237 3729', 'arnel.cabuhat@example.com', '2025-03-05T10:00:00.000Z'),
    stage2: s2Reviewed('2025-03-05T10:20:00.000Z', '2025-03-05T10:21:00.000Z', '2025-03-07T10:00:00.000Z', 'Triple-certified technician. All creds verified.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Electrical Installation', '2025-03-06T09:00:00.000Z', true),
      doc('tesda', 'TESDA NC II - RAC Servicing', '2025-03-06T09:05:00.000Z', true),
      doc('doe', 'DOE Solar PV Installer', '2025-03-06T09:10:00.000Z', true),
    ]),
    stage4: s4Active('2025-03-08T09:00:00.000Z'),
  },
  'wrk-238': {
    role: 'service-provider',
    stage1: s1('+63 917 238 3830', null, '2026-04-09T15:00:00.000Z'),
    stage2: s2Pending('2026-04-11T16:00:00.000Z', '2026-04-11T16:02:00.000Z'),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'wrk-239': {
    role: 'service-provider',
    stage1: s1('+63 917 239 3941', 'wilfredo.bartolome@example.com', '2024-06-10T08:00:00.000Z'),
    stage2: s2Reviewed('2024-06-10T08:20:00.000Z', '2024-06-10T08:21:00.000Z', '2024-06-12T10:00:00.000Z', 'Master welder. Multiple TESDA certs including NC III.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA SMAW NC II', '2024-06-11T09:00:00.000Z', true),
      doc('tesda', 'TESDA GTAW NC II', '2024-06-11T09:05:00.000Z', true),
      doc('tesda', 'TESDA NC III - Welding', '2024-06-11T09:10:00.000Z', true),
    ]),
    stage4: s4Active('2024-06-13T09:00:00.000Z'),
  },
  'wrk-240': {
    role: 'service-provider',
    stage1: s1('+63 917 240 4052', 'isabel.vasquez@example.com', '2025-11-28T10:00:00.000Z'),
    stage2: s2Reviewed('2025-11-28T10:20:00.000Z', '2025-11-28T10:21:00.000Z', '2025-11-30T10:00:00.000Z', 'Verified. Flagged later after payment dispute.'),
    stage3: s3WithDocs([
      doc('tesda', 'TESDA NC II - Plumbing', '2025-11-29T09:00:00.000Z', true),
    ]),
    stage4: s4Active('2025-12-01T09:00:00.000Z'),
  },
};

/* -------------------------------------------------------------------------- */
/*  Clients (23)                                                               */
/* -------------------------------------------------------------------------- */

const bizDocs = () => [
  doc('business', 'DTI / SEC Registration', '2025-05-21T09:00:00.000Z', true),
  doc('tax', 'BIR Certificate of Registration', '2025-05-21T09:05:00.000Z', true),
];

const BUSINESS_VERIFIED_NOTE =
  'Business registration / SEC / BIR cross-checked. Legitimate entity.';
const ID_MATCH_NOTE = 'ID reviewed and matches contact name.';

const clientVerification = {
  // ---- Tier 4 (full business trust) --------------------------------------
  'clt-005': {
    role: 'client',
    stage1: s1('+63 918 110 4475', 'contact+clt-005@example.com', '2025-05-21T09:00:00.000Z'),
    stage2: s2Reviewed('2025-05-21T09:30:00.000Z', '2025-05-21T09:31:00.000Z', '2025-05-23T10:00:00.000Z', BUSINESS_VERIFIED_NOTE),
    stage3: s3WithDocs(bizDocs()),
    stage4: s4Active('2025-05-24T10:00:00.000Z'),
  },
  'clt-013': {
    role: 'client',
    stage1: s1('+63 918 334 9920', 'contact+clt-013@example.com', '2025-04-17T09:00:00.000Z'),
    stage2: s2Reviewed('2025-04-17T09:30:00.000Z', '2025-04-17T09:31:00.000Z', '2025-04-19T10:00:00.000Z', BUSINESS_VERIFIED_NOTE),
    stage3: s3WithDocs([
      doc('business', 'SEC Registration - FreshLink Foods Inc.', '2025-04-18T09:00:00.000Z', true),
      doc('tax', 'BIR Certificate of Registration', '2025-04-18T09:05:00.000Z', true),
    ]),
    stage4: s4Active('2025-04-20T10:00:00.000Z'),
  },
  'clt-018': {
    role: 'client',
    stage1: s1('+63 917 441 0092', 'contact+clt-018@example.com', '2025-03-12T09:00:00.000Z'),
    stage2: s2Reviewed('2025-03-12T09:30:00.000Z', '2025-03-12T09:31:00.000Z', '2025-03-14T10:00:00.000Z', 'Hospital facilities office verified.'),
    stage3: s3WithDocs([
      doc('organization', 'Hospital Accreditation Certificate', '2025-03-13T09:00:00.000Z', true),
      doc('tax', 'BIR Certificate of Registration', '2025-03-13T09:05:00.000Z', true),
    ]),
    stage4: s4Active('2025-03-15T10:00:00.000Z'),
  },
  'clt-021': {
    role: 'client',
    stage1: s1('+63 918 770 9911', 'contact+clt-021@example.com', '2025-04-02T09:00:00.000Z'),
    stage2: s2Reviewed('2025-04-02T09:30:00.000Z', '2025-04-02T09:31:00.000Z', '2025-04-04T10:00:00.000Z', BUSINESS_VERIFIED_NOTE),
    stage3: s3WithDocs([
      doc('business', 'SEC Registration - Northbay BPO', '2025-04-03T09:00:00.000Z', true),
      doc('tax', 'BIR Certificate of Registration', '2025-04-03T09:05:00.000Z', true),
    ]),
    stage4: s4Active('2025-04-05T10:00:00.000Z'),
  },

  // ---- Tier 2 (ID reviewed, no docs) -------------------------------------
  'clt-002': {
    role: 'client',
    stage1: s1('+63 917 220 5591', 'contact+clt-002@example.com', '2025-06-04T10:00:00.000Z'),
    stage2: s2Reviewed('2025-06-04T10:30:00.000Z', '2025-06-04T10:31:00.000Z', '2025-06-06T10:00:00.000Z', ID_MATCH_NOTE),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-003': {
    role: 'client',
    stage1: s1('+63 918 441 7823', 'contact+clt-003@example.com', '2025-08-18T10:00:00.000Z'),
    stage2: s2Reviewed('2025-08-18T10:30:00.000Z', '2025-08-18T10:31:00.000Z', '2025-08-20T10:00:00.000Z', ID_MATCH_NOTE),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-004': {
    role: 'client',
    stage1: s1('+63 917 556 2201', 'contact+clt-004@example.com', '2025-11-03T10:00:00.000Z'),
    stage2: s2Reviewed('2025-11-03T10:30:00.000Z', '2025-11-03T10:31:00.000Z', '2025-11-05T10:00:00.000Z', ID_MATCH_NOTE),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-006': {
    role: 'client',
    stage1: s1('+63 917 889 6610', 'contact+clt-006@example.com', '2025-09-09T10:00:00.000Z'),
    stage2: s2Reviewed('2025-09-09T10:30:00.000Z', '2025-09-09T10:31:00.000Z', '2025-09-11T10:00:00.000Z', ID_MATCH_NOTE),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-007': {
    role: 'client',
    stage1: s1('+63 918 303 7756', 'contact+clt-007@example.com', '2025-07-15T10:00:00.000Z'),
    stage2: s2Reviewed('2025-07-15T10:30:00.000Z', '2025-07-15T10:31:00.000Z', '2025-07-17T10:00:00.000Z', ID_MATCH_NOTE),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-011': {
    role: 'client',
    stage1: s1('+63 917 218 9930', 'contact+clt-011@example.com', '2025-06-28T10:00:00.000Z'),
    stage2: s2Reviewed('2025-06-28T10:30:00.000Z', '2025-06-28T10:31:00.000Z', '2025-06-30T10:00:00.000Z', 'DepEd school ID verified.'),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-014': {
    role: 'client',
    stage1: s1('+63 917 775 3301', 'contact+clt-014@example.com', '2025-08-30T10:00:00.000Z'),
    stage2: s2Reviewed('2025-08-30T10:30:00.000Z', '2025-08-30T10:31:00.000Z', '2025-09-01T10:00:00.000Z', 'Parish letterhead + contact confirmed.'),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-017': {
    role: 'client',
    stage1: s1('+63 918 990 2217', 'contact+clt-017@example.com', '2025-05-08T10:00:00.000Z'),
    stage2: s2Reviewed('2025-05-08T10:30:00.000Z', '2025-05-08T10:31:00.000Z', '2025-05-10T10:00:00.000Z', 'HOA officer ID verified.'),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },

  // ---- Tier 1 (phone only) -----------------------------------------------
  'clt-001': {
    role: 'client',
    stage1: s1('+63 917 812 4412', null, '2025-10-12T11:00:00.000Z'),
    stage2: s2Empty(),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-008': {
    role: 'client',
    stage1: s1('+63 917 001 3388', null, '2026-01-22T11:00:00.000Z'),
    stage2: s2Empty(),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-009': {
    role: 'client',
    stage1: s1('+63 917 445 1122', null, '2025-12-01T11:00:00.000Z'),
    stage2: s2Empty(),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-010': {
    role: 'client',
    stage1: s1('+63 918 770 2041', null, '2026-03-14T11:00:00.000Z'),
    stage2: s2Empty(),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-012': {
    role: 'client',
    stage1: s1('+63 917 665 1187', null, '2026-02-09T11:00:00.000Z'),
    stage2: s2Empty(),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-015': {
    role: 'client',
    stage1: s1('+63 918 112 8845', null, '2025-11-26T11:00:00.000Z'),
    stage2: s2Empty(),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-016': {
    role: 'client',
    stage1: s1('+63 917 300 4418', null, '2026-03-28T11:00:00.000Z'),
    stage2: s2Empty(),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-019': {
    role: 'client',
    stage1: s1('+63 918 227 3380', null, '2025-07-02T11:00:00.000Z'),
    stage2: s2Empty(),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-022': {
    role: 'client',
    stage1: s1('+63 917 112 6688', null, '2025-09-14T11:00:00.000Z'),
    stage2: s2Empty(),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },

  // ---- Pending Stage 2 review (shows up in Admin Identity Review queue) --
  'clt-020': {
    role: 'client',
    stage1: s1('+63 917 558 7720', 'contact+clt-020@example.com', '2026-04-02T09:00:00.000Z'),
    stage2: s2Pending('2026-04-15T10:00:00.000Z', '2026-04-15T10:02:00.000Z'),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
  'clt-023': {
    role: 'client',
    stage1: s1('+63 918 443 9012', 'contact+clt-023@example.com', '2026-04-14T09:00:00.000Z'),
    stage2: s2Pending('2026-04-17T10:00:00.000Z', '2026-04-17T10:02:00.000Z'),
    stage3: s3Empty(),
    stage4: s4Pending(),
  },
};

const verificationRecords = {
  ...workerVerification,
  ...clientVerification,
};

export default verificationRecords;
