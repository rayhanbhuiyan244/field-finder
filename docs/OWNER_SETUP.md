# Provisioning the Owner Account

This app has exactly one owner. Public registration (`/register`) can only ever
create `role: "customer"` accounts — that's enforced both in `authService.ts`
and, more importantly, in `firestore.rules`, so it can't be bypassed by
calling Firestore directly either.

There is deliberately no in-app UI to grant the owner role. Do this once, manually:

1. **Security rules are already set up** with the owner email
   `rayhan.bhuiyan8330@gmail.com` in `firestore.rules` → `ownerEmails()`.
   Deploy them: `firebase deploy --only firestore:rules`

2. **Register normally** through the app's `/register` page using
   `rayhan.bhuiyan8330@gmail.com`. This creates a `role: "customer"` document
   as usual.

3. **Re-create the profile doc as owner.** Because `role` is immutable once
   set (rules block changing it via update), you have two options:
   - **Easiest:** open Firebase Console → Firestore → `users/{that uid}` →
     manually edit the `role` field to `"owner"`. Console writes go through
     the Admin SDK, which bypasses Security Rules entirely, so this is safe
     and doesn't need the allowlist at all.
   - **Rules-only path (no console editing):** delete the `users/{uid}`
     document via console, then have that account "register" again — since
     its email is now in `ownerEmails()`, the create rule will accept
     `role: "owner"` this time. (This only works if you build a small
     one-off script or temporarily re-add a role selector; the public form
     no longer sends `role` at all. The Console edit above is simpler.)

4. **Log in.** On first login as owner, the app auto-seeds `timeslots`,
   `pricing`, `gallery`, and `settings/business` with starter data if those
   collections are empty (see `seedService.ts` — gated to owner-only so
   anonymous visitors never need write access to them).

If you ever bring on a second staff/admin account, this is also where a
future multi-owner allowlist (`ownerEmails()` returning more than one
address) would slot in without any other architectural change.
