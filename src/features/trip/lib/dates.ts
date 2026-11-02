import { formatRelativeTime } from "@/lib/format";

const MONTH = 30 * 86_400_000;

/** "3d ago" while a notice is fresh; a real date once it is older than a month,
 *  because "523d ago" tells a traveller nothing. */
export function formatNoticeDate(iso: string, now = Date.now()): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "";
  if (now - time <= MONTH) return formatRelativeTime(iso);
  return new Date(time).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
