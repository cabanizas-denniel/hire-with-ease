/**
 * Jobs seed provider (mock-disabled).
 *
 * Some code imports named exports `JOB_CATEGORIES` and `CATEGORY_REQUIRED_SKILLS`.
 * Keep those exports so the app can render forms/matching logic without crashing.
 */

export const JOB_CATEGORIES = [
  'Plumbing',
  'Electrical Work',
  'Painting & Finishing',
  'Welding & Fabrication',
  'Masonry & Tile',
  'HVAC & Cooling',
  'Roofing',
  'Carpentry',
  'Solar & Renewables',
  'General Maintenance',
];

/** Skills used for worker matching when homeowners pick only a category. */
export const CATEGORY_REQUIRED_SKILLS = {
  Plumbing: ['Plumbing', 'Pipe Fitting'],
  'Electrical Work': ['Electrical', 'Safety Compliance'],
  'Painting & Finishing': ['Painting', 'Safety Compliance'],
  'Welding & Fabrication': ['Welding', 'Metal Fabrication'],
  'Masonry & Tile': ['Masonry', 'Tile Setting'],
  'HVAC & Cooling': ['HVAC', 'Electrical'],
  Roofing: ['Roofing', 'General Labor'],
  Carpentry: ['Carpentry'],
  'Solar & Renewables': ['Solar Panel Installation', 'Electrical', 'Safety Compliance'],
  'General Maintenance': ['General Labor', 'Machine Operation'],
};

const jobs = [];

export default jobs;
