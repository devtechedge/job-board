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

export function functionLabel(value: string | null | undefined): string {
  const key = (value ?? "").toLowerCase();
  const map: Record<string, string> = {
    backend: "Backend",
    frontend: "Frontend",
    fullstack: "Full-stack",
    mobile: "Mobile",
    data: "Data",
    ml: "Machine learning",
    design: "Design",
    product: "Product",
    security: "Security",
    infra: "Infrastructure",
    research: "Research",
    engineering: "Engineering",
  };
  return map[key] || value || "Unclassified";
}

export function editionDateLabel(isoDate = new Date().toISOString()): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
