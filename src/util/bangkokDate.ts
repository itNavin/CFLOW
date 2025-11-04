export function isoToBangkokInput(iso?: string | null): string {
  if (!iso) return "";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  const msBangkok = ms + 7 * 3600 * 1000; // UTC -> BKK
  const d = new Date(msBangkok);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function bangkokInputToIso(val?: string | null): string | null {
  if (!val) return null;
  // datetime-local format: "YYYY-MM-DDTHH:MM" or date-only "YYYY-MM-DD"
  if (val.includes("T")) {
    const [datePart, timePart] = val.split("T");
    const [y, m, d] = datePart.split("-").map((s) => parseInt(s, 10));
    const [hh = 0, mm = 0] = (timePart || "").split(":").map((s) => parseInt(s, 10));
    // The input is Bangkok local -> compute UTC ms by subtracting 7 hours
    const utcMs = Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0) - 7 * 3600 * 1000;
    return new Date(utcMs).toISOString();
  }
  // date-only: treat as end of day Bangkok local
  const [y, m, d] = val.split("-").map((s) => parseInt(s, 10));
  const utcMs = Date.UTC(y, (m || 1) - 1, d || 1, 23, 59, 59, 999) - 7 * 3600 * 1000;
  return new Date(utcMs).toISOString();
}