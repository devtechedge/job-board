import { formatDistanceToNowStrict } from "date-fns";

export function ago(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function workplaceLabel(value: string): string {
  if (value === "remote") return "Remote";
  if (value === "hybrid") return "Hybrid";
  if (value === "onsite") return "On-site";
  return "Unknown";
}

export function atsLabel(value: string): string {
  if (value === "greenhouse") return "Greenhouse";
  if (value === "ashby") return "Ashby";
  if (value === "lever") return "Lever";
  if (value === "workable") return "Workable";
  return value;
}
