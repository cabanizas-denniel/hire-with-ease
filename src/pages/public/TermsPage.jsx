import LegalDocumentLayout, {
  LegalSection,
} from '../../components/legal/LegalDocumentLayout.jsx';

/**
 * Terms & Conditions for Hire With Ease (prototype / thesis defense).
 */
function TermsPage() {
  return (
    <LegalDocumentLayout
      title="Terms & Conditions"
      updatedLabel="Last updated · November 2026 · Hire With Ease (Olongapo prototype)"
    >
      <p className="rounded-xl border border-[#1F4E79]/15 bg-white p-5 text-gray-600 shadow-sm">
        These Terms & Conditions govern use of the Hire With Ease platform. By registering or
        signing in, you agree to these terms. The service is an academic / PESO-oriented prototype
        for matching homeowners with informal skilled workers in Olongapo.
      </p>

      <LegalSection title="1. Acceptance of terms">
        <p>
          You must be able to form a binding agreement and provide accurate registration details.
          If you do not agree to these Terms or the Privacy Policy, do not create an account or use
          the platform.
        </p>
      </LegalSection>

      <LegalSection title="2. Roles on the platform">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <span className="font-medium text-gray-900">Homeowners (clients)</span> post service
            requests, review matched workers, and confirm a hire.
          </li>
          <li>
            <span className="font-medium text-gray-900">Workers</span> maintain skills and
            location, receive matches, and may accept one active job at a time after PESO
            activation.
          </li>
          <li>
            <span className="font-medium text-gray-900">PESO / admin</span> reviews verification and
            may handle disputes and platform oversight.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Matching and hiring">
        <p>
          Hire With Ease shortlists candidates using rule-based scoring. The system does{' '}
          <span className="font-medium text-gray-900">not</span> choose the final hire for you.
          Homeowners and workers decide whether to accept, decline, propose schedules, or cancel
          before confirmation. Only one worker may be confirmed per job after mutual agreement.
        </p>
      </LegalSection>

      <LegalSection title="4. Verification">
        <p>
          Workers must complete email verification, identity submission, and required supporting
          documents for PESO review before accepting jobs. Misrepresentation, forged documents, or
          misuse of another person&apos;s identity may result in rejection or account restriction.
        </p>
      </LegalSection>

      <LegalSection title="5. Conduct and safety">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Use the platform only for lawful home / informal service requests.</li>
          <li>Treat counterparts respectfully in chat and on site.</li>
          <li>Do not harass, spam, or attempt to bypass security or verification controls.</li>
          <li>
            Check-in / check-out photos and chat records support coordination and dispute review;
            do not upload unrelated private content.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Payments">
        <p>
          Payment for work is arranged <span className="font-medium text-gray-900">off-platform</span>{' '}
          between homeowner and worker. Hire With Ease does not process, escrow, guarantee, or
          refund money. In-app payment acknowledgments are records of confirmation only.
        </p>
      </LegalSection>

      <LegalSection title="7. Cancellations">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Homeowners may cancel matching while a request is still in Matching or Matched status.
          </li>
          <li>
            Workers may decline matches or withdraw from an accepted job subject to the in-app
            rules (including unlock of a confirmed hire when applicable).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Disclaimers">
        <p>
          The platform is provided as a prototype for academic demonstration. Matching quality,
          availability of workers, and outcomes of off-platform work are not guaranteed. To the
          extent permitted by law, Hire With Ease and affiliated academic / PESO parties are not
          liable for disputes, property damage, injury, or payment disagreements arising from jobs
          arranged through the prototype.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          These terms may be updated as the prototype evolves. Continued use after changes are
          posted on this page constitutes acceptance of the revised terms for new activity on the
          platform.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          For questions about these terms, use the contact details on the Hire With Ease landing
          page or reach your local PESO Olongapo channel associated with this project.
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  );
}

export default TermsPage;
