// All dates are plain "YYYY-MM-DD" strings in Toronto local time.
export const TIME_ZONE = "America/Toronto";
export const MAX_RANGE_DAYS = 31;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value + "T00:00:00Z"));
}

export function todayLocal(timeZone = TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function localDateOf(isoTimestamp: string, timeZone = TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoTimestamp));
}

export function localTimeOf(isoTimestamp: string, timeZone = TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(isoTimestamp));
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h === "24" ? "00" : h}:${m}:00`;
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, matching day_of_week in the database. */
export function dayOfWeek(date: string): number {
  return new Date(date + "T00:00:00Z").getUTCDay();
}

export function datesBetween(from: string, to: string): string[] {
  const out: string[] = [];
  let d = from;
  while (d <= to && out.length < MAX_RANGE_DAYS) {
    out.push(d);
    d = addDays(d, 1);
  }
  return out;
}

export function formatLongDate(date: string): { weekday: string; rest: string } {
  const d = new Date(date + "T00:00:00Z");
  return {
    weekday: d.toLocaleDateString("en-CA", { timeZone: "UTC", weekday: "long" }),
    rest: d.toLocaleDateString("en-CA", { timeZone: "UTC", month: "long", day: "numeric" }),
  };
}

export function formatShortDate(date: string): string {
  return new Date(date + "T00:00:00Z").toLocaleDateString("en-CA", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "16:00:00" → "4 pm", "16:30:00" → "4:30 pm", "23:59:00" → "close". */
export function formatTime(time: string | null): string | null {
  if (!time) return null;
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (h === 23 && m === 59) return "close";
  if (h === 0 && m === 0) return "midnight";
  if (h === 12 && m === 0) return "noon";
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatTimeRange(start: string | null, end: string | null): string | null {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) return `${s} to ${e}`;
  if (s) return `from ${s}`;
  if (e) return `until ${e}`;
  return null;
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
