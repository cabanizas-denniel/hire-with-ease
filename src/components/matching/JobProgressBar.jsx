import NumberedStepRail from '../NumberedStepRail.jsx';
import { JOB_STATUS, APPLICATION_STATUS } from '../../lib/matching/statuses.js';

const STEPS = [
  { id: 'applied', label: 'Applied' },
  { id: 'agreed', label: 'Agreed' },
  { id: 'working', label: 'In progress' },
  { id: 'done', label: 'Done' },
];

export function workProgressIndex({ applicationStatus, jobStatus }) {
  if (
    jobStatus === JOB_STATUS.COMPLETED ||
    applicationStatus === APPLICATION_STATUS.COMPLETED
  ) {
    return 3;
  }
  if (jobStatus === JOB_STATUS.IN_PROGRESS) return 2;
  if (
    jobStatus === JOB_STATUS.CONFIRMED ||
    applicationStatus === APPLICATION_STATUS.CONFIRMED
  ) {
    return 1;
  }
  if (applicationStatus) return 0;
  return -1;
}

function JobProgressBar({ applicationStatus, jobStatus }) {
  const current = workProgressIndex({ applicationStatus, jobStatus });
  if (current < 0) return null;

  return (
    <NumberedStepRail steps={STEPS} currentStep={current} ariaLabel="Job progress" />
  );
}

export default JobProgressBar;
