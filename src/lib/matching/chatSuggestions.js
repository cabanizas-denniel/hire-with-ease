/** Homeowner quick-reply prompts (spec step 4b). */
export const HOMEOWNER_CHAT_SUGGESTIONS = Object.freeze([
  {
    id: 'how-much',
    label: 'How Much?',
    text: 'How much would you charge for this job?',
  },
  {
    id: 'price-range',
    label: 'Price Range?',
    text: 'What price range works for you given the scope?',
  },
  {
    id: 'duration',
    label: 'Time Duration?',
    text: 'How long do you expect this work to take?',
  },
]);

export function shouldShowHomeownerSuggestions({
  role,
  messages = [],
  clientUid,
  suggestionsDismissed,
}) {
  if (role !== 'client' || suggestionsDismissed) return false;
  const hasClientMessage = messages.some((m) => m.authorId === clientUid);
  return !hasClientMessage;
}
