import { Link } from 'react-router-dom';

/**
 * Public privacy / data-use summary for defense and registration consent.
 * Does not claim full DPA compliance.
 */
function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f0f3f7]">
      <header className="border-b border-[#1F4E79]/15 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-lg font-bold text-[#1F4E79]">
            Hire With Ease
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-[#1F4E79] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-[#1F4E79]">Privacy & data use</h1>
        <p className="mt-2 text-sm text-gray-600">
          How Hire With Ease handles account and job data for this Olongapo prototype.
          This page describes the current design; it is <span className="font-semibold">not</span>{' '}
          a claim of full Data Privacy Act / NPC compliance.
        </p>

        <section className="mt-8 space-y-4 text-sm text-gray-700">
          <div className="rounded-xl border border-[#1F4E79]/20 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[#1F4E79]">What we collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Account details (name, email, role) via Firebase Authentication</li>
              <li>Profile fields (skills, home map pin / barangay)</li>
              <li>ID / selfie materials used for PESO verification (stored under user docs)</li>
              <li>Job requests, applications, chat messages, check-in/out photos</li>
              <li>Agreed price notes and off-platform payment acknowledgments (not card/wallet secrets)</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#1F4E79]/20 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[#1F4E79]">How data is used</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium">Matching:</span> rule-based scoring runs in the
                browser to shortlist workers (skills, location, category, reputation).
              </li>
              <li>
                <span className="font-medium">Coordination:</span> after a match or application,
                contact details may be shared with the counterpart so you can coordinate the job.
              </li>
              <li>
                <span className="font-medium">Admin / PESO:</span> verification, dispute review,
                and aggregate dashboards (e.g. demand heatmap density — not labeled personal pins).
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#1F4E79]/20 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[#1F4E79]">Access controls</h2>
            <p className="mt-2">
              Access is gated by Firebase Auth (including email verification where required) and
              Firestore security rules. You should only see jobs, chats, and profiles appropriate
              to your role.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-semibold text-amber-950">Limitations</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-950">
              <li>Matching runs client-side; counterpart contact is visible for coordination.</li>
              <li>Photo proofs and map pins are operational, not forensic or anonymized ML features.</li>
              <li>Payment is off-platform; the app does not process or escrow money.</li>
              <li>Do not upload unnecessary sensitive documents beyond what verification requires.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#1F4E79]/20 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[#1F4E79]">Relationships & matching responsibility</h2>
            <p className="mt-2">
              A homeowner may post many jobs over time (one active at a time). Each job may have
              many shortlisted matches/applications, but only <span className="font-medium">one</span>{' '}
              confirmed worker after mutual agreement. Workers may apply to many jobs. The system
              shortlists; homeowners and workers decide; PESO does not pick the hire.
            </p>
          </div>
        </section>

        <p className="mt-8 text-xs text-gray-500">
          See also <code className="rounded bg-white px-1">SCOPE_AND_LIMITATIONS.md</code> in the
          project repository for thesis scope wording.
        </p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-[#2E75B6] hover:underline">
          ← Back to home
        </Link>
      </main>
    </div>
  );
}

export default PrivacyPage;
