type ChangeFileNameInput = {
  groupNumber: string | number;
  deliverableName: string;
  version: string | number;
  mime: string; // e.g. "application/pdf"
};

const MIME_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-excel": "xls",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "text/plain": "txt",
  "application/zip": "zip",
};

function sanitizePart(v: string) {
  return v
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/_+/g, "_");
}

/** Builds: groupNumber_deliverableName_version.<ext from mime> */
export function changeFileName({
  groupNumber,
  deliverableName,
  version,
  mime,
}: ChangeFileNameInput): string {
  const g = "G" + sanitizePart(String(groupNumber));
  const d = sanitizePart(String(deliverableName));
  const v = "V" + sanitizePart(String(version));
  if (!g || !d || !v) throw new Error("groupNumber, deliverableName, and version are required.");

  const ext = MIME_EXT[mime] ?? "bin";
  return `${g}_${d}_${v}.${ext}`;
}

export function changeFeedbackFileName({
  username,
  groupNumber,
  deliverableName,
  version,
  mime,
}: ChangeFileNameInput & { username: string }): string {
  const u = sanitizePart(username);
  const g = "G" + sanitizePart(String(groupNumber));
  const d = sanitizePart(String(deliverableName));
  const v = "V" + sanitizePart(String(version));
  if (!u || !g || !d || !v) throw new Error("username, groupNumber, deliverableName, and version are required.");

  const ext = MIME_EXT[mime] ?? "bin";
  return `${u}_${g}_${d}_${v}.${ext}`;
}