import LegalDocumentLayout, {
  LegalSection,
} from '../../components/legal/LegalDocumentLayout.jsx';

/**
 * Privacy Policy for Hire With Ease (prototype / thesis defense).
 * Describes current data handling; not a claim of full DPA/NPC certification.
 */
function PrivacyPage() {
  return (
    <LegalDocumentLayout
      title="Privacy Policy"
      updatedLabel="Last updated · November 2026 · Hire With Ease (Olongapo prototype)"
    >
      <p className="rounded-xl border border-[#1F4E79]/15 bg-white p-5 text-gray-600 shadow-sm">
        This Privacy Policy explains what personal information Hire With Ease collects, how it is
        used, who can access it, and the safeguards built into the system. By creating an account
        you acknowledge this policy. This document describes the current design of the prototype
        and is <span className="font-semibold text-gray-800">not</span> a claim of full Philippine
        Data Privacy Act / NPC certification.
      </p>

      <LegalSection title="1. Information we collect">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <span className="font-medium text-gray-900">Account data:</span> full name, email
            address, role (worker or homeowner), and authentication credentials via Firebase Auth.
          </li>
          <li>
            <span className="font-medium text-gray-900">Profile data:</span> skills, certifications,
            home map pin / barangay, and related matching fields.
          </li>
          <li>
            <span className="font-medium text-gray-900">Verification materials:</span> government ID
            images, selfie with ID, and supporting documents (e.g. Barangay clearance, TESDA)
            submitted for PESO review.
          </li>
          <li>
            <span className="font-medium text-gray-900">Job activity:</span> job requests, match
            results, applications, chat messages, check-in/out photos, and status history.
          </li>
          <li>
            <span className="font-medium text-gray-900">Payment acknowledgments:</span> notes that
            off-platform payment was agreed or confirmed — not card, bank, or wallet secrets. Hire
            With Ease does not process or refund money; refunds after cancellation are arranged
            between the parties outside the app (see Terms).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How we use your information">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <span className="font-medium text-gray-900">Matching:</span> rule-based scoring
            (skills, location, category, reputation) to shortlist workers for homeowners.
          </li>
          <li>
            <span className="font-medium text-gray-900">Coordination:</span> after a match or
            acceptance, limited contact details may be shared with the other party so you can
            arrange the job.
          </li>
          <li>
            <span className="font-medium text-gray-900">PESO / admin:</span> identity and document
            review, dispute handling, and aggregate dashboards (e.g. demand heatmaps without
            labeled personal pins).
          </li>
          <li>
            <span className="font-medium text-gray-900">Account security:</span> email verification,
            role-based access, and session authentication.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Security measures">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Firebase Authentication with verified email required for signed-in use.</li>
          <li>
            Firestore security rules that restrict reads and writes by role (worker, homeowner,
            admin).
          </li>
          <li>
            Workers must complete PESO identity and supporting-document review before accepting
            jobs.
          </li>
          <li>
            Sensitive verification uploads are stored under the user&apos;s account and intended
            only for authorized PESO / admin review.
          </li>
          <li>
            Registration uses bot-friction (captcha) and requires explicit privacy and terms
            consent.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Sharing and disclosure">
        <p>
          We do not sell personal data. Information may be shared with the matched counterpart for
          job coordination, with PESO officers for verification and disputes, and with Firebase /
          Google infrastructure that hosts Auth and Firestore. Aggregate statistics may be shown to
          admins without exposing unnecessary personal detail.
        </p>
      </LegalSection>

      <LegalSection title="5. Retention and your choices">
        <p>
          Account and job records remain while the prototype is in use for matching and audit.
          You may request correction of profile information through your Profile screens. For
          account deletion or data concerns related to this thesis prototype, contact the project
          team / PESO Olongapo channel listed on the landing page.
        </p>
      </LegalSection>

      <LegalSection title="6. Limitations of this prototype">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Matching logic runs in the client; treat shortlists as decision support, not guarantees.</li>
          <li>Counterpart contact becomes visible for coordination after engagement.</li>
          <li>Photo proofs and map pins are operational tools, not forensic evidence systems.</li>
          <li>Do not upload documents beyond what verification requires.</li>
        </ul>
      </LegalSection>
    </LegalDocumentLayout>
  );
}

export default PrivacyPage;
