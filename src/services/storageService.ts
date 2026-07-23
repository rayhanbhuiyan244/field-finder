import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/firebase/config";

export async function uploadFile(path: string, file: File): Promise<string> {
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}

/**
 * Deletes a file by its storage path (not its download URL — see
 * GalleryImage.storagePath). Swallows "already gone" errors so a double
 * cleanup attempt (e.g. a retried delete) doesn't surface as a failure.
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    await deleteObject(ref(storage, path));
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code !== "storage/object-not-found") throw err;
  }
}

export function uploadProfilePhoto(uid: string, file: File) {
  const ext = file.name.split(".").pop() || "jpg";
  return uploadFile(`profile-photos/${uid}.${ext}`, file);
}

export function uploadGalleryImage(file: File) {
  const key = `${Date.now()}-${file.name}`;
  const path = `gallery/${key}`;
  return uploadFile(path, file).then((url) => ({ url, path }));
}

export function deleteGalleryImage(path: string) {
  return deleteFile(path);
}
