/**
 * Demo verification provider (mock-disabled).
 *
 * `VerificationContext` imports `buildDemoVerificationRecord(email)` from this file.
 * When mock data is disabled, return null so no demo records are auto-seeded.
 */

export function buildDemoVerificationRecord(_email) {
  return null;
}

// const PESO_REVIEWER = 'Maria Cruz (PESO)';

// function s1Done(email, otpAt) {
//   return { mobile: null, email: email || null, otpVerifiedAt: otpAt };
// }

// function s1Empty() {
//   return { mobile: null, email: null, otpVerifiedAt: null };
// }

// function s2Reviewed(idAt, selfieAt, reviewedAt, note) {
//   return {
//     idSubmittedAt: idAt,
//     selfieSubmittedAt: selfieAt,
//     reviewStatus: 'reviewed',
//     reviewedBy: PESO_REVIEWER,
//     reviewedAt,
//     reviewNote: note,
//   };
// }

// function s2Pending(idAt, selfieAt) {
//   return {
//     idSubmittedAt: idAt,
//     selfieSubmittedAt: selfieAt,
//     reviewStatus: 'pending',
//     reviewedBy: null,
//     reviewedAt: null,
//     reviewNote: '',
//   };
// }

// function s2Empty() {
//   return {
//     idSubmittedAt: null,
//     selfieSubmittedAt: null,
//     reviewStatus: 'not-started',
//     reviewedBy: null,
//     reviewedAt: null,
//     reviewNote: '',
//   };
// }

// function s3Empty() {
//   return { documents: [], documentBacked: false };
// }

// function s4Active(activatedAt) {
//   return { activatedAt, activatedBy: PESO_REVIEWER };
// }

// function s4Empty() {
//   return { activatedAt: null, activatedBy: null };
// }

// /**
//  * Builds a "fully verified" record at Tier 4. Includes one reviewed
//  * supporting doc tailored to the role (TESDA cert for workers,
//  * proof-of-address for homeowners) so Stage 3 also reads as complete.
//  */
// function buildFullRecord(role, { email, fullName }) {
//   const isWorker = role === 'service-provider';
//   const documents = [
//     isWorker
//       ? {
//           type: 'tesda',
//           label: 'TESDA NC II Certification',
//           submittedAt: '2025-09-02T08:00:00.000Z',
//           reviewed: true,
//           note: 'Certification valid; name matches ID.',
//         }
//       : {
//           type: 'utility',
//           label: 'Utility Bill (Proof of Address)',
//           submittedAt: '2025-09-02T08:00:00.000Z',
//           reviewed: true,
//           note: 'Address matches profile.',
//         },
//   ];

//   return {
//     role,
//     fullName: fullName || null,
//     stage1: s1Done(email, '2025-09-01T08:00:00.000Z'),
//     stage2: s2Reviewed(
//       '2025-09-01T09:00:00.000Z',
//       '2025-09-01T09:01:00.000Z',
//       '2025-09-02T11:00:00.000Z',
//       'ID and selfie match. Clear photos.'
//     ),
//     stage3: { documents, documentBacked: true },
//     stage4: s4Active('2025-09-03T09:00:00.000Z'),
//   };
// }

// /**
//  * Builds a "partially verified" record. Email is verified and the ID +
//  * selfie have been submitted but are still PENDING admin review. This
//  * deliberately surfaces in the admin pending-review queue so the demo
//  * can walk through the moderation flow end-to-end.
//  */
// function buildPartialRecord(role, { email, fullName }) {
//   return {
//     role,
//     fullName: fullName || null,
//     stage1: s1Done(email, '2026-04-15T10:00:00.000Z'),
//     stage2: s2Pending('2026-04-15T11:00:00.000Z', '2026-04-15T11:01:00.000Z'),
//     stage3: s3Empty(),
//     stage4: s4Empty(),
//   };
// }

// /**
//  * Builds a "not verified" record (Tier 0). Same shape as a brand-new
//  * account — every stage is empty.
//  */
// function buildEmptyRecord(role, { fullName }) {
//   return {
//     role,
//     fullName: fullName || null,
//     stage1: s1Empty(),
//     stage2: s2Empty(),
//     stage3: s3Empty(),
//     stage4: s4Empty(),
//   };
// }

// const BUILDERS = {
//   full: buildFullRecord,
//   partial: buildPartialRecord,
//   none: buildEmptyRecord,
// };

// /**
//  * Demo email -> { level, role } map.
//  *
//  * `role` here uses the verification-system vocabulary
//  * ('service-provider' / 'client'), not the auth-system one
//  * ('informal_worker' / 'homeowner').
//  */
// export const DEMO_VERIFICATION_BY_EMAIL = {
//   // Informal workers
//   'rafael.worker@hwe.test': {
//     level: 'full',
//     role: 'service-provider',
//     fullName: 'Rafael Santos',
//   },
//   'jessa.worker@hwe.test': {
//     level: 'partial',
//     role: 'service-provider',
//     fullName: 'Jessa Villanueva',
//   },
//   'mark.worker@hwe.test': {
//     level: 'none',
//     role: 'service-provider',
//     fullName: 'Mark Dela Cruz',
//   },
//   // Homeowners
//   'maria.home@hwe.test': {
//     level: 'full',
//     role: 'client',
//     fullName: 'Maria Santos',
//   },
//   'jr.home@hwe.test': {
//     level: 'partial',
//     role: 'client',
//     fullName: 'JR Properties',
//   },
//   'greenville.home@hwe.test': {
//     level: 'none',
//     role: 'client',
//     fullName: 'GreenVille HOA',
//   },
// };

// /**
//  * Look up the demo configuration for an email. Returns
//  * { level, role, fullName } or null if the email is not a demo account.
//  */
// export function getDemoConfigForEmail(email) {
//   if (!email) return null;
//   return DEMO_VERIFICATION_BY_EMAIL[email.toLowerCase()] || null;
// }

// /**
//  * Build the seed verification record for a demo email. Returns null if
//  * the email isn't a demo account.
//  */
// export function buildDemoVerificationRecord(email) {
//   const config = getDemoConfigForEmail(email);
//   if (!config) return null;
//   const builder = BUILDERS[config.level];
//   if (!builder) return null;
//   return builder(config.role, { email, fullName: config.fullName });
// }
