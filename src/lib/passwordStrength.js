/**
 * Simple password strength for UI feedback (not a security audit).
 */
export function getPasswordStrength(password) {
  const value = password || '';
  if (!value.length) {
    return { score: 0, label: '', percent: 0, barClass: 'bg-gray-200' };
  }

  let score = 0;
  if (value.length >= 6) score += 1;
  if (value.length >= 10) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;

  const tiers = [
    { label: 'Weak', percent: 25, barClass: 'bg-red-500' },
    { label: 'Fair', percent: 50, barClass: 'bg-amber-400' },
    { label: 'Good', percent: 75, barClass: 'bg-teal-500' },
    { label: 'Strong', percent: 100, barClass: 'bg-emerald-500' },
  ];

  const tierIndex = score <= 0 ? 0 : Math.min(score, tiers.length) - 1;
  return { score, ...tiers[tierIndex] };
}
