import apiClient from "@/lib/apiClient";

// ── Signed Cloudinary direct upload ─────────────────────────────────────────
//
// `GET /api/v1/uploads/signature?kind=<kind>` returns a short-lived signed
// payload; the browser then POSTs each file straight to Cloudinary (never
// through our API). The backend signs `folder` + `timestamp`, so the multipart
// form must echo exactly those fields alongside `file`, `api_key` and
// `signature`. One signature can cover a whole upload batch — fetch it per
// batch, not once at app start.

interface SignedUpload {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  folder: string;
  signature: string;
  upload_url: string;
}

/**
 * Cloudinary folder selector. `handover` → handover photos (#1),
 * `shift` → shift-brief attachments (#5). Anything unknown lands in a default
 * folder on the backend.
 */
export type UploadKind = "handover" | "shift" | "hospital_logo" | "worker_avatar";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** Cloudinary's `image` resource type also accepts PDFs. */
const ATTACHMENT_TYPES = ["image/", "application/pdf"];

async function fetchSignature(kind: UploadKind): Promise<SignedUpload> {
  const { data } = await apiClient.get<SignedUpload>(
    "/api/v1/uploads/signature",
    { params: { kind } },
  );
  return data;
}

async function postToCloudinary(file: File, sig: SignedUpload): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.api_key);
  form.append("timestamp", String(sig.timestamp));
  form.append("folder", sig.folder);
  form.append("signature", sig.signature);

  const res = await fetch(sig.upload_url, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}).`);
  }
  const body = (await res.json()) as { secure_url?: string };
  if (!body.secure_url) {
    throw new Error("Upload succeeded but returned no URL.");
  }
  return body.secure_url;
}

/** Upload one image file to Cloudinary and resolve to its `secure_url`. */
export async function uploadImage(
  file: File,
  kind: UploadKind = "handover",
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is larger than 10 MB.");
  }
  return postToCloudinary(file, await fetchSignature(kind));
}

/** Upload several images under one signature; rejects if any one fails. */
export async function uploadImages(
  files: File[],
  kind: UploadKind = "handover",
): Promise<string[]> {
  if (files.length === 0) return [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files can be uploaded.");
    }
    if (file.size > MAX_BYTES) {
      throw new Error(`"${file.name}" is larger than 10 MB.`);
    }
  }
  const sig = await fetchSignature(kind);
  return Promise.all(files.map((f) => postToCloudinary(f, sig)));
}

/** Upload one attachment (image or PDF) and resolve to its `secure_url`. */
export async function uploadFile(
  file: File,
  kind: UploadKind = "shift",
): Promise<string> {
  if (!ATTACHMENT_TYPES.some((t) => file.type.startsWith(t))) {
    throw new Error("Only image or PDF files can be attached.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File is larger than 10 MB.");
  }
  return postToCloudinary(file, await fetchSignature(kind));
}

/** Upload several attachments under one signature; rejects if any one fails. */
export async function uploadFiles(
  files: File[],
  kind: UploadKind = "shift",
): Promise<string[]> {
  if (files.length === 0) return [];
  for (const file of files) {
    if (!ATTACHMENT_TYPES.some((t) => file.type.startsWith(t))) {
      throw new Error(`"${file.name}" isn't an image or PDF.`);
    }
    if (file.size > MAX_BYTES) {
      throw new Error(`"${file.name}" is larger than 10 MB.`);
    }
  }
  const sig = await fetchSignature(kind);
  return Promise.all(files.map((f) => postToCloudinary(f, sig)));
}
