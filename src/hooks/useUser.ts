import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/services/userService";
import { uploadProfilePhoto } from "@/services/storageService";

export function useUser() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProfile = useCallback(
    async (updates: { fullName?: string; phone?: string; photoURL?: string }) => {
      if (!user) throw new Error("Not authenticated");
      setSaving(true);
      setError(null);
      try {
        await updateUserProfile(user.uid, updates);
        await refreshProfile();
      } catch (e) {
        const err = e instanceof Error ? e : new Error("Failed to update profile");
        setError(err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [user, refreshProfile],
  );

  const uploadPhoto = useCallback(
    async (file: File) => {
      if (!user) throw new Error("Not authenticated");
      const url = await uploadProfilePhoto(user.uid, file);
      await updateProfile({ photoURL: url });
      return url;
    },
    [user, updateProfile],
  );

  return { user, profile, loading, saving, error, updateProfile, uploadPhoto, refreshProfile };
}