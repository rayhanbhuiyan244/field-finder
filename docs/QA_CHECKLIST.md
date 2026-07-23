# Manual QA checklist

The automated suite (`npm test`) covers every pure business rule: slot-lock
determinism, conflict prevention, cancellation refund logic, maintenance
block overlap, pricing, date/slot parsing, validators, and the role-escalation
fix — all with Firestore mocked out, so they run without a real project.

What's below needs an actual Firebase project (or the Emulator Suite, if you
have network access to it — this sandbox didn't). Run through this once
against a real `.env` before considering a phase "stable," and again before
any production deploy.

## Setup
- [ ] `.env` filled with real Firebase config, `npm run dev` boots without console errors
- [ ] `firestore.rules` deployed with your real email in `ownerEmails()`
- [ ] Owner account provisioned per `docs/OWNER_SETUP.md`, confirm login routes to `/admin`

## Authentication
- [ ] Register a new customer → lands on `/dashboard`, `users/{uid}` doc has `role: "customer"`
- [ ] Register with an email that's already in use → clear error, not a raw Firebase error string
- [ ] Log out, log back in → session persists across a page refresh
- [ ] Log in with wrong password → clear error
- [ ] **Security check:** with the Firebase Admin SDK or console, try setting a fresh account's `role` to `"owner"` via a client call (e.g. browser console) using an email NOT in `ownerEmails()` — should be rejected. This is the regression case `authService.test.ts` guards at the code level; this step confirms the *rules* actually enforce it live.

## Booking — happy path
- [ ] Browse `/booking` while logged out → slots render, no console permission errors (confirms the public `slotLocks` read rule works)
- [ ] Select a slot while logged out → prompted to log in, not a silent failure
- [ ] Log in, book a slot → booking appears in `/dashboard` as **pending**
- [ ] Owner sees it in `/admin` → Bookings, gets an in-app notification
- [ ] Owner clicks **Confirm** → customer's copy updates to **confirmed**, customer gets notified
- [ ] Owner clicks **Complete** → status becomes **completed**, payment becomes **paid**
- [ ] Customer sees **Leave a review** appear only after completion, submits one → appears on the homepage, average rating updates
- [ ] Try to review the same booking twice → second attempt is blocked (button disappears; if forced via console, the deterministic `reviews/{bookingId}` doc + Security Rule should reject it)

## Booking — the one that matters most: conflict prevention
- [ ] Open the same slot in two browser tabs (two different logged-in accounts), click Confirm Booking in both within a couple seconds of each other → **exactly one** succeeds, the other sees "This slot was just booked by someone else" and the grid refreshes
- [ ] Confirm only one `bookings` doc and one `slotLocks` doc exist for that slot afterward
- [ ] Cancel that booking → the slot becomes bookable again immediately (the `slotLocks` doc for it is gone)

## Cancellation
- [ ] Customer cancels a booking that starts >6h from now → succeeds, slot reopens
- [ ] Customer tries to cancel a booking starting <6h from now → button shows "Too close to start" instead of a cancel option
- [ ] Owner cancels any booking (any time window) → succeeds regardless of the 6h window
- [ ] Cancel a `paid` booking → paymentStatus becomes `refunded`; cancel a `pending`-payment booking → stays `pending` (not falsely marked refunded)

## Owner tools
- [ ] Pricing: add a rule, edit a rule's price, delete a rule — public `/pricing` page reflects it
- [ ] Time slots: add a new slot label, remove one — `/booking` grid reflects it immediately
- [ ] Maintenance: block a slot on the Calendar tab → same slot shows "Maintenance" (not "Booked") on `/booking` and `/availability`, and can't be selected; reopen it → bookable again
- [ ] Gallery: upload a photo → appears on public `/gallery`; delete it → gone from both Firestore and Storage (check the Storage console, not just the UI)

## Unauthorized access (security rules)
- [ ] Log in as a customer, try to open `/admin` directly by URL → redirected, not a blank/broken page
- [ ] As a customer, attempt (via browser console + the Firebase SDK already loaded on the page) to `get()` another user's `bookings` doc by ID → permission denied
- [ ] As a customer, attempt to `update` someone else's booking → permission denied
- [ ] As a customer, attempt to write to `pricing` or `timeslots` → permission denied

## Edge cases
- [ ] Airplane mode mid-booking → clear "offline" state, not a silent hang or a false "success"
- [ ] Submit the booking form with a slot that got deleted by the owner moments earlier → clear error, not a crash
- [ ] Empty states: brand-new account with zero bookings on `/dashboard`, zero results on owner `/admin` search — both show a real empty state, not a blank table
- [ ] Very long customer name / review comment → UI doesn't overflow or break layout

## Regression watch (things this pass specifically fixed — re-check after future changes)
- [ ] Registration never offers an "Owner" account type option
- [ ] New bookings always start `pending`, never auto-`confirmed`
- [ ] Public `/booking` and `/availability` never expose another customer's name/phone (check Network tab — those pages should only ever query `slotLocks`, never `bookings`, while logged out)
