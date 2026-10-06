/**
 * Worker-selectable skills — kept in sync with job matching
 * (see CATEGORY_REQUIRED_SKILLS in jobs.js).
 *
 * Structure for each worker:
 *   primarySkill: exactly 1
 *   secondarySkills: 0–3 (must not include primary)
 *   skills: derived flat list [primary, ...secondary] for legacy readers
 */
import { CATEGORY_REQUIRED_SKILLS } from './jobs.js';

export const MAX_SECONDARY_SKILLS = 3;

/** Canonical skill catalog shown in the worker profile wizard. */
export const WORKER_SKILLS = [
  'Carpentry',
  'Electrical',
  'General Labor',
  'HVAC',
  'Machine Operation',
  'Masonry',
  'Metal Fabrication',
  'Painting',
  'Pipe Fitting',
  'Plumbing',
  'Roofing',
  'Safety Compliance',
  'Solar Panel Installation',
  'Tile Setting',
  'Welding',
];

/** Ensure catalog stays aligned with job category → skill map. */
const fromCategories = [
  ...new Set(Object.values(CATEGORY_REQUIRED_SKILLS).flat()),
].sort((a, b) => a.localeCompare(b));

const skills = [
  ...new Set([...WORKER_SKILLS, ...fromCategories]),
].sort((a, b) => a.localeCompare(b));

/**
 * Normalize legacy `skills: string[]` profiles into primary + secondary.
 * Existing data is preserved; primary defaults to skills[0].
 */
export function normalizeWorkerSkills(profileOrSkills) {
  const source = Array.isArray(profileOrSkills)
    ? { skills: profileOrSkills }
    : profileOrSkills || {};

  let primary =
    typeof source.primarySkill === 'string' && source.primarySkill.trim()
      ? source.primarySkill.trim()
      : null;

  let secondary = Array.isArray(source.secondarySkills)
    ? source.secondarySkills
        .filter((s) => typeof s === 'string' && s.trim())
        .map((s) => s.trim())
    : null;

  const legacy = Array.isArray(source.skills)
    ? source.skills.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())
    : [];

  if (!primary && legacy.length) {
    primary = legacy[0];
  }

  if (!secondary) {
    secondary = primary
      ? legacy.filter((s) => s !== primary).slice(0, MAX_SECONDARY_SKILLS)
      : legacy.slice(0, MAX_SECONDARY_SKILLS);
  } else if (primary) {
    secondary = secondary.filter((s) => s !== primary).slice(0, MAX_SECONDARY_SKILLS);
  } else {
    secondary = secondary.slice(0, MAX_SECONDARY_SKILLS);
  }

  // Deduplicate secondary while preserving order
  const seen = new Set();
  secondary = secondary.filter((s) => {
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  });

  const flat = primary ? [primary, ...secondary] : [...secondary];

  return {
    primarySkill: primary,
    secondarySkills: secondary,
    skills: flat,
  };
}

/** Flat skill list used for eligibility checks (primary + secondary). */
export function getWorkerSkillList(profile) {
  return normalizeWorkerSkills(profile).skills;
}

/**
 * Build the Firestore payload for skills fields.
 * Always writes primarySkill, secondarySkills, and derived `skills`.
 */
export function buildSkillsPayload(primarySkill, secondarySkills = []) {
  const normalized = normalizeWorkerSkills({
    primarySkill: primarySkill || null,
    secondarySkills: secondarySkills || [],
    skills: [],
  });
  return {
    primarySkill: normalized.primarySkill,
    secondarySkills: normalized.secondarySkills,
    skills: normalized.skills,
  };
}

export default skills;
