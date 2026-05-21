import { useEffect, useMemo, useRef, useState } from 'react';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext.jsx';
import { useMessages, useThread } from '../../lib/matching/hooks.js';
import {
  buildThreadId,
  ensureThread,
  sendMessage,
} from '../../lib/matching/threads.js';

/**
 * Chat thread between a homeowner and a single applicant. Both sides
 * see the same messages because the thread id is deterministic
 * (`${jobId}__${workerId}`).
 */
function ChatPanel({
  jobId,
  jobTitle,
  clientId,
  clientName,
  clientEmail = null,
  clientMobile = null,
  workerId,
  workerName,
  role,
  className = '',
}) {
  const { user } = useAuth();
  const threadId = buildThreadId(jobId, workerId);
  const { data: messages, loading } = useMessages(threadId);
  const { data: thread } = useThread(threadId);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollerRef = useRef(null);

  const resolvedClientEmail = thread?.clientEmail || clientEmail || null;
  const resolvedClientMobile = thread?.clientMobile || clientMobile || null;

  const homeownerContactEmail =
    role === 'client' ? user?.email || clientEmail : resolvedClientEmail;
  const homeownerContactMobile =
    role === 'client' ? clientMobile : resolvedClientMobile;

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

  const handleSend = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !user?.uid) return;
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
        text: draft,
      });
      setDraft('');
    } catch (err) {
      setError(err.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`flex h-full flex-col rounded-xl border border-gray-200 bg-white ${className}`}>
      <header className="border-b border-gray-100 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Negotiation
        </p>
        <h3 className="text-sm font-semibold text-[#1F4E79]">
          {role === 'client'
            ? `Chat with ${workerName || 'worker'}`
            : `Chat with ${clientName || 'homeowner'}`}
        </h3>
        {role === 'worker' ? (
          <ClientContactDetails
            email={homeownerContactEmail}
            mobile={homeownerContactMobile}
          />
        ) : null}
      </header>

      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{ minHeight: 240 }}
      >
        {loading ? (
          <p className="text-center text-xs text-gray-500">Loading messages…</p>
        ) : (messages?.length ?? 0) === 0 ? (
          <p className="text-center text-xs text-gray-500">
            No messages yet. Send the first message to start negotiating.
          </p>
        ) : (
          <ul className="space-y-2">
            {messages.map((m) => {
              const mine = m.authorId === user?.uid;
              return (
                <li
                  key={m.id}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      mine
                        ? 'bg-[#1F4E79] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {!mine ? (
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        {m.authorName || 'User'}
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error ? (
        <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-gray-100 p-2"
      >
        <input
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#1F4E79] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <HiOutlinePaperAirplane className="h-4 w-4" aria-hidden="true" />
          Send
        </button>
      </form>
    </div>
  );
}

function ClientContactDetails({ email, mobile }) {
  const hasEmail = Boolean(email?.trim());
  const hasMobile = Boolean(mobile?.trim());

  if (!hasEmail && !hasMobile) {
    return (
      <p className="mt-2 text-xs text-gray-500">
        Homeowner contact details are not on file yet.
      </p>
    );
  }

  return (
    <dl className="mt-2 space-y-1 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-xs">
      <p className="font-semibold text-[#1F4E79]">Homeowner contact</p>
      {hasEmail ? (
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="font-medium text-gray-600">Email</dt>
          <dd>
            <a href={`mailto:${email}`} className="text-[#2E75B6] hover:underline">
              {email}
            </a>
          </dd>
        </div>
      ) : null}
      {hasMobile ? (
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="font-medium text-gray-600">Phone</dt>
          <dd>
            <a href={`tel:${mobile.replace(/\s/g, '')}`} className="text-[#2E75B6] hover:underline">
              {mobile}
            </a>
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

export default ChatPanel;
