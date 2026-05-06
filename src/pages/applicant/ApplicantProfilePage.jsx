import { useEffect, useMemo, useState } from 'react';
import AvailabilityPicker from '../../components/AvailabilityPicker.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import VerificationCenter from '../../components/verification/VerificationCenter.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import skills from '../../data/skills.js';
import { useWorkerProfile } from '../../lib/matching/hooks.js';
import { saveWorkerProfile } from '../../lib/matching/workerProfile.js';
import { resolveLocation } from '../../lib/olongapoBarangays.js';

const SERVICE_RADIUS_OPTIONS = [
  'Within 5 km',
  'Within 10 km',
  'Within 15 km',
  'Anywhere in Olongapo',
];

function isImageDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:image');
}

function isPdfDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:application/pdf');
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}

function ApplicantProfilePage() {
  const auth = useAuth();
  const workerUid = auth?.user?.uid || null;
  const { data: profile, loading } = useWorkerProfile(workerUid);

  const [form, setForm] = useState({
    fullName: '',
    locationLabel: '',
    serviceRadius: 'Within 15 km',
    yearsExperience: 0,
    certifications: [],
    selectedSkills: [],
    availability: [],
  });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  // Hydrate from Firestore once the profile lands.
  useEffect(() => {
    if (!profile) return;
    const certs = Array.isArray(profile.certifications) ? profile.certifications : [];
    setForm({
      fullName: profile.name || auth?.user?.fullName || '',
      locationLabel: profile.location?.label || profile.location?.barangay || '',
      serviceRadius: profile.serviceRadius || 'Within 15 km',
      yearsExperience: profile.yearsExperience ?? 0,
      certifications: certs.map((c) =>
        typeof c === 'string'
          ? { label: c, fileData: null, uploadedAt: null }
          : {
              label: c?.label || c?.name || 'Certification',
              fileData: c?.fileData ?? null,
              uploadedAt: c?.uploadedAt ?? null,
            }
      ),
      selectedSkills: profile.skills || [],
      availability: profile.availability || [],
    });
  }, [profile, auth?.user?.fullName]);

  const sortedSkills = useMemo(() => [...skills].sort((a, b) => a.localeCompare(b)), []);

  const toggleSkill = (skill) => {
    const selected = new Set(form.selectedSkills);
    if (selected.has(skill)) {
      selected.delete(skill);
    } else {
      selected.add(skill);
    }
    setForm((prev) => ({ ...prev, selectedSkills: Array.from(selected) }));
  };

  const handleAddCertifications = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setStatus(null);
    try {
      const entries = await Promise.all(
        files.map(async (file) => {
          const dataUrl = await readAsDataUrl(file);
          return {
            label: file.name || 'Certification',
            fileData: dataUrl,
            uploadedAt: new Date().toISOString(),
          };
        })
      );
      setForm((prev) => ({ ...prev, certifications: [...prev.certifications, ...entries] }));
      event.target.value = '';
    } catch (err) {
      setStatus({ kind: 'error', text: err.message || 'Could not attach certification.' });
    }
  };

  const removeCertificationAt = (index) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!workerUid) return;
    setBusy(true);
    setStatus(null);
    try {
      const point = resolveLocation(form.locationLabel) || null;
      await saveWorkerProfile(workerUid, {
        name: form.fullName,
        skills: form.selectedSkills,
        availability: form.availability,
        certifications: (form.certifications || []).map((c) => ({
          label: c?.label || 'Certification',
          fileData: c?.fileData ?? null,
          uploadedAt: c?.uploadedAt ?? null,
        })),
        yearsExperience: Number(form.yearsExperience) || 0,
        serviceRadius: form.serviceRadius,
        location: {
          lat: point?.lat ?? null,
          lng: point?.lng ?? null,
          barangay: point?.barangay ?? null,
          label: form.locationLabel || null,
        },
      });
      setStatus({ kind: 'ok', text: 'Profile saved.' });
    } catch (err) {
      setStatus({ kind: 'error', text: err.message || 'Could not save profile.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Service Profile"
        subtitle="Your profile powers the matching engine. The more complete it is, the better your matches."
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
        <p className="font-medium">Why this matters</p>
        <p className="mt-1 text-gray-600">
          Clients never browse worker lists. The system reads your skills, availability, and location to push
          relevant jobs to you automatically. Incomplete profiles get fewer matches.
        </p>
      </div>

      {workerUid ? (
        <VerificationCenter
          userId={workerUid}
          role="service-provider"
          className="mt-5"
        />
      ) : null}

      {loading ? (
        <p className="mt-5 rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Loading your profile…
        </p>
      ) : null}

      <form onSubmit={handleSave} className="mt-5 space-y-5 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Availability</h2>
          <p className="mb-3 text-xs text-gray-500">
            This is the most important part. Jobs are matched against your open time slots first.
          </p>
          <AvailabilityPicker
            value={form.availability}
            onChange={(availability) => setForm((prev) => ({ ...prev, availability }))}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Skills</h2>
          <p className="mb-3 text-xs text-gray-500">
            Select every skill you can perform.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {sortedSkills.map((skill) => {
              const active = form.selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition ${
                    active ? 'bg-[#1F4E79] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Personal Details</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Account email</label>
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800">
                {auth?.user?.email || '—'}
              </p>
              <p className="mt-1 text-[11px] text-gray-500">
                Use <strong>Verification</strong> above to confirm this email. It is the address you signed up with.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Full Name</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Location / barangay</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                value={form.locationLabel}
                placeholder="e.g. Mabayuan"
                onChange={(e) => setForm((prev) => ({ ...prev, locationLabel: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Service Radius</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                value={form.serviceRadius}
                onChange={(e) => setForm((prev) => ({ ...prev, serviceRadius: e.target.value }))}
              >
                {SERVICE_RADIUS_OPTIONS.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Years of experience</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                value={form.yearsExperience}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, yearsExperience: e.target.value }))
                }
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1F4E79]">Certifications</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Upload certifications (image or PDF)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleAddCertifications}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Upload the actual certificate file (TESDA, barangay clearance, etc.). Text-only entries are not accepted.
              </p>
            </div>

            {form.certifications?.length ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Attached certifications
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {form.certifications.map((cert, index) => (
                    <div
                      key={`${cert?.label || 'cert'}-${index}`}
                      className="rounded-xl border border-gray-200 bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#1F4E79]">
                            {cert?.label || 'Certification'}
                          </p>
                          <p className="mt-0.5 text-[11px] text-gray-500">
                            {cert?.fileData
                              ? isPdfDataUrl(cert.fileData)
                                ? 'PDF'
                                : isImageDataUrl(cert.fileData)
                                  ? 'Image'
                                  : 'File'
                              : 'No file attached'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCertificationAt(index)}
                          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Remove
                        </button>
                      </div>

                      {cert?.fileData && isImageDataUrl(cert.fileData) ? (
                        <div className="mt-2 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                          <img
                            src={cert.fileData}
                            alt={cert?.label || 'Certification'}
                            className="max-h-44 w-full object-contain"
                          />
                        </div>
                      ) : null}

                      {cert?.fileData && isPdfDataUrl(cert.fileData) ? (
                        <a
                          href={cert.fileData}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-xs font-semibold text-[#2E75B6] underline"
                        >
                          Open PDF
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                No certifications uploaded yet.
              </p>
            )}
          </div>
        </section>

        {status ? (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              status.kind === 'error'
                ? 'border border-red-200 bg-red-50 text-red-700'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {status.text}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[#1F4E79] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

export default ApplicantProfilePage;
