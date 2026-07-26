import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/config";

export async function uploadFile(path: string, file: File): Promise<string> {
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}

export function uploadProfilePhoto(uid: string, file: File) {
  const ext = file.name.split(".").pop() || "jpg";
  return uploadFile(`profile-photos/${uid}.${ext}`, file);
}

export function uploadGalleryImage(file: File) {
  const key = `${Date.now()}-${file.name}`;
  return uploadFile(`gallery/${key}`, file);
}