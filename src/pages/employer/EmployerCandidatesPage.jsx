import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ApplicantCard from '../../components/ApplicantCard.jsx';
import Modal from '../../components/Modal.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import applicants from '../../data/applicants.js';
import jobs from '../../data/jobs.js';

function EmployerCandidatesPage() {
  const { jobId } = useParams();
  const [selected, setSelected] = useState(null);

  const job = useMemo(() => jobs.find((item) => item.id === jobId), [jobId]);

  const rankedCandidates = useMemo(() => {
    if (!job) {
      return [];
    }

    return applicants
      .map((applicant) => {
        const matchedSkills = applicant.skills.filter((skill) => job.requiredSkills.includes(skill));
        return { ...applicant, matchedSkills, matchCount: matchedSkills.length };
      })
      .filter((item) => item.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);
  }, [job]);

  return (
    <div>
      <PageHeader
        title="Ranked Candidates"
        subtitle={job ? `Matched applicants for ${job.title}` : 'Job not found.'}
      />

      <div className="grid gap-3">
        {rankedCandidates.map((candidate) => (
          <ApplicantCard
            key={candidate.id}
            applicant={candidate}
            matchedSkills={candidate.matchedSkills}
            onViewProfile={setSelected}
            onHire={setSelected}
          />
        ))}
      </div>

      <Modal
        isOpen={Boolean(selected)}
        title={selected ? selected.name : ''}
        onClose={() => setSelected(null)}
        onConfirm={() => setSelected(null)}
        confirmText="Close"
      >
        {selected ? `Experience level: ${selected.experienceLevel}. Skills matched for this job are highlighted in blue.` : ''}
      </Modal>
    </div>
  );
}

export default EmployerCandidatesPage;
