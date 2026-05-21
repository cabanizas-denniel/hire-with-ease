import { useEffect, useMemo, useRef, useState } from 'react';
import {
  HiOutlineCalendarDays,
  HiOutlineCamera,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlinePaperAirplane,
} from 'react-icons/hi2';
import TrustBadge from '../TrustBadge.jsx';
import { shouldShowClientTrustBadge } from '../../lib/employerTrust.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  HOMEOWNER_CHAT_SUGGESTIONS,
  shouldShowHomeownerSuggestions,
} from '../../lib/matching/chatSuggestions.js';
import {
  formatNegotiationCountdown,
  isNegotiationExpired,
} from '../../lib/matching/negotiation.js';
import { useMessages, useThread } from '../../lib/matching/hooks.js';
import {
  buildThreadId,
  ensureThread,
  sendMessage,
} from '../../lib/matching/threads.js';
import ReportFlagDialog from './ReportFlagDialog.jsx';
import ScheduleAgreementModal from './ScheduleAgreementModal.jsx';

const DEFAULT_HEIGHT = 'min-h-[200px] max-h-[min(320px,45vh)]';

function ChatPanel({
  jobId,
  jobTitle,
  clientId,
  clientName,
  clientEmail = null,
  clientMobile = null,
  clientTrustTier = null,
  workerId,
  workerName,
  role,
  jobBudget = '',
  className = '',
  compact = true,
}) {
  const { user } = useAuth();
  const threadId = buildThreadId(jobId, workerId);
  const { data: messages, loading } = useMessages(threadId);
  const { data: thread } = useThread(threadId);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const scrollerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [proofMode, setProofMode] = useState(null);

  const resolvedClientEmail = thread?.clientEmail || clientEmail || null;
  const resolvedClientMobile = thread?.clientMobile || clientMobile || null;
  const homeownerContactEmail =
    role === 'client' ? user?.email || clientEmail : resolvedClientEmail;
  const homeownerContactMobile =
    role === 'client' ? clientMobile : resolvedClientMobile;

  const expired = isNegotiationExpired(thread);
  const countdown = formatNegotiationCountdown(thread);
  const schedule = thread?.scheduleAgreement;

  const showSuggestions = useMemo(
    () =>
      shouldShowHomeownerSuggestions({
        role,
        messages: messages || [],
        clientUid: clientId || user?.uid,
        suggestionsDismissed: thread?.suggestionsDismissed,
      }),
    [role, messages, clientId, user?.uid, thread?.suggestionsDismissed],
  );

  const reportedUserId = role === 'client' ? workerId : clientId;
  const reportedLabel = role === 'client' ? workerName : clientName;

  useEffect(() => {
    if (!threadId) return;
    ensureThread({
      jobId,
      workerId,
      clientId,
      clientName,
      jobTitle,
      clientEmail: role === 'client' ? user?.email || clientEmail : clientEmail,
      clientMobile: role === 'client' ? clientMobile : clientMobile,
    }).catch((err) => {
      console.warn('Could not ensure thread', err);
    });
  }, [
    threadId,
    jobId,
    workerId,
    clientId,
    clientName,
    jobTitle,
    role,
    user?.email,
    clientEmail,
    clientMobile,
  ]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages?.length]);

  const postMessage = async (text, { dismissSuggestions = false, messageType = 'text', imageUrl = null } = {}) => {
    if (!user?.uid || expired) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage({
        jobId,
        workerId,
        clientId,
        jobTitle,
        authorId: user.uid,
        authorName: user.fullName,
        authorRole: role,
        text,
        messageType,
        imageUrl,
        dismissSuggestions: dismissSuggestions || role === 'client',
      });
      if (messageType === 'text') setDraft('');
    } catch (err) {
      setError(err.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    await postMessage(draft.trim());
  };

  const handleSuggestion = async (suggestion) => {
    await postMessage(suggestion.text, { dismissSuggestions: true });
  };

  const handleProofFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !proofMode) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose a photo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== 'string') return;
      await postMessage(
        proofMode === 'check_in' ? 'Arrived — check-in proof' : 'Finished on-site — check-out proof',
        { messageType: proofMode, imageUrl: dataUrl },
      );
      setProofMode(null);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const heightClass = compact ? DEFAULT_HEIGHT : 'min-h-[280px]';

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white ${className}`}
    >
      <header className="flex shrink-0 items-start justify-between gap-2 border-b border-gray-100 px-3 py-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Chat
          </p>
          <h3 className="truncate text-sm font-semibold text-[#1F4E79]">
            {role === 'client'
              ? workerName || 'Worker'
              : clientName || 'Homeowner'}
          </h3>
          {countdown && !expired ? (
            <p className="text-[10px] text-amber-700">{countdown}</p>
          ) : null}
          {expired ? (
            <p className="text-[10px] font-medium text-red-600">
              Negotiation closed — chat locked. History kept for admin review.
            </p>
          ) : null}
          {schedule ? (
            <p className="mt-0.5 text-[10px] text-emerald-800">
              Agreed: {schedule.startDate} → {schedule.endDate} · {schedule.price}
            </p>
          ) : null}
          {role === 'worker' && shouldShowClientTrustBadge(clientTrustTier) ? (
            <div className="mt-1">
              <TrustBadge tier={clientTrustTier} role="client" size="sm" />
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          {role === 'client' && !expired ? (
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#1F4E79]/30 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-[#1F4E79] hover:bg-blue-100"
              title="Set agreed dates and price"
            >
              <HiOutlineCalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Schedule
            </button>
          ) : null}
          {user?.uid ? (
            <ReportFlagDialog
              jobId={jobId}
              threadId={threadId}
              reporterId={user.uid}
              reporterRole={role}
              reportedUserId={reportedUserId}
              reportedLabel={reportedLabel}
            />
          ) : null}
        </div>
      </header>

      {role === 'worker' ? (
        <div className="shrink-0 border-b border-gray-50 px-3 py-1">
          <button
            type="button"
            onClick={() => setContactOpen((o) => !o)}
            className="flex w-full items-center justify-between text-[10px] font-medium text-gray-500"
          >
            Contact details
            {contactOpen ? (
              <HiOutlineChevronUp className="h-3.5 w-3.5" />
            ) : (
              <HiOutlineChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {contactOpen ? (
            <ClientContactDetails
              email={homeownerContactEmail}
              mobile={homeownerContactMobile}
              compact
            />
          ) : null}
        </div>
      ) : null}

      <div
        ref={scrollerRef}
        className={`flex-1 overflow-y-auto px-3 py-2 ${heightClass}`}
      >
        {loading ? (
          <p className="text-center text-[11px] text-gray-500">Loading…</p>
        ) : (messages?.length ?? 0) === 0 ? (
          <p className="text-center text-[11px] text-gray-500">
            {role === 'client'
              ? 'Use a suggested message below or type your own.'
              : 'Send a message to start negotiating.'}
          </p>
        ) : (
          <ul className="space-y-1.5">
            {messages.map((m) => {
              const mine = m.authorId === user?.uid;
              const isProof =
                m.messageType === 'check_in' || m.messageType === 'check_out';
              return (
                <li
                  key={m.id}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-xs shadow-sm ${
                      mine
                        ? 'bg-[#1F4E79] text-white'
                        : 'bg-gray-100 text-gray-800'
                    } ${isProof ? 'ring-1 ring-amber-300' : ''}`}
                  >
                    {isProof ? (
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-amber-600">
                        {m.messageType === 'check_in' ? 'Check-in proof' : 'Check-out proof'}
                      </p>
                    ) : null}
                    {m.imageUrl ? (
                      <img
                        src={m.imageUrl}
                        alt=""
                        className="mb-1 max-h-32 rounded-lg object-cover"
                      />
                    ) : null}
                    {m.text ? (
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showSuggestions ? (
        <div className="shrink-0 border-t border-blue-100 bg-blue-50/80 px-2 py-1.5">
          <p className="mb-1 text-[10px] font-medium text-[#1F4E79]">Suggested</p>
          <div className="flex flex-wrap gap-1">
            {HOMEOWNER_CHAT_SUGGESTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={sending || expired}
                onClick={() => handleSuggestion(s)}
                className="rounded-full border border-[#1F4E79]/30 bg-white px-2.5 py-1 text-[11px] font-medium text-[#1F4E79] hover:bg-blue-100 disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="shrink-0 border-t border-red-100 bg-red-50 px-2 py-1 text-[10px] text-red-700">
          {error}
        </p>
      ) : null}

      {role === 'worker' && !expired ? (
        <div className="flex shrink-0 gap-1 border-t border-amber-100 bg-amber-50/50 px-2 py-1">
          <button
            type="button"
            disabled={sending}
            onClick={() => {
              setProofMode('check_in');
              fileInputRef.current?.click();
            }}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-amber-200 px-2 py-1 text-[10px] font-semibold text-amber-900"
          >
            <HiOutlineCamera className="h-3.5 w-3.5" aria-hidden="true" />
            Check-in photo
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={() => {
              setProofMode('check_out');
              fileInputRef.current?.click();
            }}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-amber-200 px-2 py-1 text-[10px] font-semibold text-amber-900"
          >
            <HiOutlineCamera className="h-3.5 w-3.5" aria-hidden="true" />
            Check-out photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleProofFile}
          />
        </div>
      ) : null}

      <form
        onSubmit={handleSend}
        className="flex shrink-0 items-center gap-1.5 border-t border-gray-100 p-2"
      >
        <input
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={expired ? 'Chat closed' : 'Message…'}
          disabled={sending || expired}
        />
        <button
          type="submit"
          disabled={sending || expired || !draft.trim()}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#1F4E79] p-2 text-white disabled:opacity-50"
          aria-label="Send"
        >
          <HiOutlinePaperAirplane className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      {role === 'client' ? (
        <ScheduleAgreementModal
          isOpen={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          jobId={jobId}
          workerId={workerId}
          initialPrice={schedule?.price || jobBudget}
        />
      ) : null}
    </div>
  );
}

function ClientContactDetails({ email, mobile, compact = false }) {
  const hasEmail = Boolean(email?.trim());
  const hasMobile = Boolean(mobile?.trim());
  if (!hasEmail && !hasMobile) {
    return (
      <p className={`text-gray-500 ${compact ? 'py-1 text-[10px]' : 'mt-2 text-xs'}`}>
        Contact not on file.
      </p>
    );
  }
  return (
    <dl className={`space-y-0.5 text-[10px] ${compact ? 'pb-1' : 'mt-2 rounded-lg border bg-gray-50/80 px-3 py-2'}`}>
      {hasEmail ? (
        <div>
          <a href={`mailto:${email}`} className="text-[#2E75B6] hover:underline">
            {email}
          </a>
        </div>
      ) : null}
      {hasMobile ? (
        <div>
          <a href={`tel:${mobile.replace(/\s/g, '')}`} className="text-[#2E75B6] hover:underline">
            {mobile}
          </a>
        </div>
      ) : null}
    </dl>
  );
}

export default ChatPanel;
