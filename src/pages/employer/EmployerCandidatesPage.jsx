import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import WorkerCard from '../../components/ApplicantCard.jsx';
import Modal from '../../components/Modal.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import workers from '../../data/applicants.js';
import jobs from '../../data/jobs.js';

function EmployerCandidatesPage() {
  const { jobId } = useParams();
  const [selected, setSelected] = useState(null);

  const job = useMemo(() => jobs.find((item) => item.id === jobId), [jobId]);

  const rankedWorkers = useMemo(() => {
    if (!job) return [];

    return workers
      .map((worker) => {
        const matchedSkills = worker.skills.filter((s) => job.requiredSkills.includes(s));
        return { ...worker, matchedSkills, matchCount: matchedSkills.length };
      })
      .filter((w) => w.matchCount > 0)
      .sort((a, b) => {
        if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [job]);

  return (
    <div>
      <PageHeader
        title="Matched Workers"
        subtitle={job ? `System-ranked workers for "${job.title}"` : 'Job not found.'}
      />

      {job ? (
        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
          <p className="font-medium">These workers were matched automatically</p>
          <p className="mt-1 text-gray-600">
            Ranked by skill overlap, availability, reliability score, and proximity to {job.location}.
            Matched skills are highlighted in navy on each card.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3">
        {rankedWorkers.map((worker) => (
          <WorkerCard
            key={worker.id}
            applicant={worker}
            matchedSkills={worker.matchedSkills}
            onViewProfile={setSelected}
            onSelect={setSelected}
          />
        ))}
        {rankedWorkers.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            No workers matched yet. The system is still searching — check back shortly.
          </p>
        ) : null}
      </div>

      <Modal
        isOpen={Boolean(selected)}
        title={selected ? `Select ${selected.name}?` : ''}
        onClose={() => setSelected(null)}
        onConfirm={() => setSelected(null)}
        confirmText="Confirm Selection"
      >
        {selected
          ? `${selected.name} will be notified and the job will move to "In Progress." Rating: ${selected.rating || 'N/A'} · ${selected.jobsCompleted} jobs completed · ${selected.completionRate}% completion rate.`
          : ''}
      </Modal>
    </div>
  );
}

export default EmployerCandidatesPage;
