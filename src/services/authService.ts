import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/firebase/config";
import { createUserProfile, getUserProfile } from "./userService";

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export async function register(input: RegisterInput) {
  const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
  await updateProfile(cred.user, { displayName: input.fullName });
  await createUserProfile(cred.user.uid, {
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    // Public sign-up can only ever create customers. The single owner
    // account for this turf is provisioned manually (see deployment notes) —
    // never through this form. Security Rules enforce this server-side too.
    role: "customer",
  });
  return cred.user;
}

export async function login(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // Ensure a profile document exists (in case created outside our flow).
  const existing = await getUserProfile(cred.user.uid);
  if (!existing) {
    await createUserProfile(cred.user.uid, {
      fullName: cred.user.displayName ?? email.split("@")[0],
      email,
      phone: "",
      role: "customer",
    });
  }
  return cred.user;
}

export function logout() {
  return signOut(auth);
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export function subscribeToAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}
