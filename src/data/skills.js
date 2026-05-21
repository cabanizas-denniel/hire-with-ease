/**
 * Worker-selectable skills — kept in sync with job matching
 * (see CATEGORY_REQUIRED_SKILLS in jobs.js).
 */
import { CATEGORY_REQUIRED_SKILLS } from './jobs.js';

const skills = [
  ...new Set(Object.values(CATEGORY_REQUIRED_SKILLS).flat()),
].sort((a, b) => a.localeCompare(b));

export default skills;
