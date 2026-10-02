# Scope and limitations — Hire With Ease

Thesis / defense reference for the Olongapo informal-services matching prototype.

## In scope

- **Geography:** Olongapo City informal home services (plumbing, electrical, carpentry, etc.).
- **Homeowner (client):** Post one service request at a time; review shortlisted workers; chat; agree on price/schedule/scope; confirm hire; check-in/out photo proofs; mark complete after mutual off-platform payment acknowledgment; rate workers.
- **Worker (applicant):** Profile with skills and location; receive matched jobs; accept/decline; apply; chat; confirm schedule; check-in/out photos; acknowledge payment received.
- **PESO admin:** Worker verification, dispute/report review, labor-market dashboards (live Firestore aggregates + density heatmap) — **not** selecting the hire.
- **Matching:** Browser-side rule-based scoring (weighted skills / location / category / reputation), greedy candidate pool, A* shortlist of **1–5** workers per job.
- **Coordination:** In-app chat; final start date/time, agreed price, and scope (included / not included) recorded for records; contact may be shared with the matched counterpart for job coordination.
- **Payment model:** **Cash / off-platform only** (cash on site, GCash, bank transfer outside the app). Platform stores agreed price and mutual “paid / received” acknowledgments — **no** payment gateway, escrow, or money movement.

## Cardinality (relationships)

| Relationship | Meaning |
|--------------|---------|
| Homeowner **1 → many** Jobs | Over time; **one active** job at a time |
| Job **1 → many** Matches / Applications | Engine shortlist 1–5 + applicants who apply |
| Job **many → 1** Confirmed worker | After mutual agreement, one `confirmedWorkerId` |
| Worker **1 → many** Applications | Can apply to multiple jobs |

Negotiation can be multi-party; **hire lock is 1:1** (not a free many-to-many hire).

## Responsibility of matching

- **System:** Scores and shortlists (max 5).
- **Homeowner:** Reviews and picks whom to chat / confirm.
- **Worker:** Accept/decline matches; apply; confirm agreement; check-in/out; ack payment.
- **PESO admin:** Verification, disputes, dashboards — not picking the hire.

## Predictive analysis?

The system is **recommendation / rule-based scoring**, not machine-learning prediction of future demand. Admin “request trend” charts are **descriptive** historical counts, not forecasts.

## Out of scope / limitations

- No escrow, e-wallet API, or payment gateway (GCash/PayMongo integration not implemented).
- Not a multi-city product; map bounds and demo pins target Olongapo (demo pin available when testing physically outside the city, e.g. Hermosa).
- Matching runs **client-side** with rule-based weights — not trained ML models.
- One active job per homeowner at a time.
- Check-in/out photos are operational proofs, not forensic evidence.
- Privacy: Auth + email verification + Firestore rules; contact shared with matched counterpart; admin heatmap is aggregate density. **No claim of full DPA / NPC compliance** — see in-app Privacy page for stated limitations.
- Some negotiation auto-release / SLA behaviors may remain partial in this prototype.

## Related app surfaces

- Privacy / data use: `/privacy`
- Payment acknowledgment UI after work (homeowner “I paid” / worker “I received”)
- Admin analytics: `/admin/dashboard` (live Firestore)
